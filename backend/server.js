const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");
const bcrypt = require("bcrypt");


const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // in productie true met https
    },
  })
);

// DB-pad: backend/data/gallery.db
const dbPath = path.join(__dirname, "data", "gallery.db");
console.log("Gebruik database:", dbPath);
const db = new Database(dbPath);

async function fetchMetImageSmall(objectId) {
  try {
    const res = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.primaryImageSmall || data.primaryImage || "";
  } catch {
    return "";
  }
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Niet ingelogd" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Geen adminrechten" });
  next();
}
// Helper: haal MET object op en zorg dat hij bestaat in met_objects
async function ensureMetObjectExists(db, metObjectId) {
  const idStr = String(metObjectId);

  // Bestaat al?
  const existing = db
    .prepare(`SELECT ObjectID FROM met_objects WHERE ObjectID = ?`)
    .get(idStr);
  if (existing) return true;

  // Haal op bij MET
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${idStr}`;
  const res = await fetch(url);

  // 404 of error -> niet toevoegen
  if (!res.ok) return false;

  const data = await res.json();

  // Minimale insert. Gebruik kolommen die in jouw met_objects table bestaan.
  // Als jouw met_objects anders is, roep even je schema erbij en ik pas dit 1:1 aan.
  // We proberen hier veilig: alleen velden die vaak bestaan.
  try {
    // Check welke kolommen er zijn
    const cols = db.prepare(`PRAGMA table_info(met_objects)`).all();
    const colNames = new Set(cols.map((c) => c.name));

    const insertParts = [];
    const values = [];

    // Altijd ObjectID (FK target)
    if (colNames.has("ObjectID")) {
      insertParts.push("ObjectID");
      values.push(String(data.objectID));
    }

    // Veelvoorkomende MET velden (alleen als kolom bestaat)
    const maybe = [
      ["Title", data.title],
      ["ArtistDisplayName", data.artistDisplayName],
      ["ObjectDate", data.objectDate],
      ["Medium", data.medium],
      ["PrimaryImage", data.primaryImage],
      ["PrimaryImageSmall", data.primaryImageSmall],
      ["ObjectURL", data.objectURL],
      ["Department", data.department],
      ["Classification", data.classification],
    ];

    for (const [col, val] of maybe) {
      if (colNames.has(col)) {
        insertParts.push(col);
        values.push(val ?? "");
      }
    }

    // Bouw INSERT dynamisch op basis van bestaande kolommen
    const placeholders = insertParts.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO met_objects (${insertParts.join(
      ", "
    )}) VALUES (${placeholders})`;

    db.prepare(sql).run(...values);
    return true;
  } catch (e) {
    console.error("ensureMetObjectExists insert error:", e);
    return false;
  }
}
async function getFirstArtworkImageForCollection(db, collectionId) {
  // pak eerste met_object_id uit collection_artworks
  const row = db
    .prepare(
      `
      SELECT met_object_id
      FROM collection_artworks
      WHERE collection_id = ?
      ORDER BY COALESCE(sort_order, 999999) ASC, id ASC
      LIMIT 1
    `
    )
    .get(collectionId);

  if (!row) return null;

  const objectId = String(row.met_object_id);

  // haal details uit MET
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  return data.primaryImageSmall || data.primaryImage || null;
}

/**
 * GET /api/admin/collections/:id/artworks
 * -> lijst met gekoppelde met_object_id's (en sort_order)
 */
app.get("/api/admin/collections/:id/artworks", requireAdmin, (req, res) => {
  try {
    const collectionId = req.params.id;

    const rows = db
      .prepare(
        `
        SELECT met_object_id, sort_order
        FROM collection_artworks
        WHERE collection_id = ?
        ORDER BY COALESCE(sort_order, 999999) ASC, id ASC
      `
      )
      .all(collectionId);

    res.json(rows);
  } catch (err) {
    console.error("Admin list artworks error:", err);
    res.status(500).json({ error: "Kon collectie-artworks niet ophalen" });
  }
});

/**
 * POST /api/admin/collections/:id/artworks
 * body: { met_object_id, sort_order? }
 * -> koppelt MET object aan collectie
 */
app.post("/api/admin/collections/:id/artworks", requireAdmin, async (req, res) => {
  try {
    const collectionId = req.params.id;
    const { met_object_id, sort_order } = req.body || {};

    const metId = String(met_object_id || "").trim();
    if (!metId) {
      return res.status(400).json({ error: "met_object_id is verplicht" });
    }

    // check collectie bestaat
    const col = db
      .prepare(`SELECT id FROM collections WHERE id = ?`)
      .get(collectionId);
    if (!col) return res.status(404).json({ error: "Collectie niet gevonden" });

    // Zorg dat met_objects record bestaat (voor FK)
    const ok = await ensureMetObjectExists(db, metId);
    if (!ok) {
      return res
        .status(400)
        .json({ error: "MET object niet gevonden of kan niet worden opgeslagen" });
    }

    // Insert link
    const stmt = db.prepare(
      `
      INSERT OR IGNORE INTO collection_artworks (collection_id, met_object_id, sort_order)
      VALUES (?, ?, ?)
    `
    );

    stmt.run(collectionId, metId, sort_order ?? null);

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Admin add artwork error:", err);
    // UNIQUE / FK errors netjes teruggeven
    const msg = String(err?.message || "");
    if (msg.includes("UNIQUE")) {
      return res.status(409).json({ error: "Deze MET ID zit al in de collectie" });
    }
    if (msg.includes("FOREIGN KEY")) {
      return res.status(400).json({ error: "FK faalt: met_object_id bestaat niet in met_objects" });
    }
    res.status(500).json({ error: "Toevoegen mislukt" });
  }
});

/**
 * DELETE /api/admin/collections/:id/artworks/:met_object_id
 * -> verwijdert koppeling
 */
app.delete(
  "/api/admin/collections/:id/artworks/:met_object_id",
  requireAdmin,
  (req, res) => {
    try {
      const collectionId = req.params.id;
      const metId = String(req.params.met_object_id || "").trim();

      const stmt = db.prepare(
        `
        DELETE FROM collection_artworks
        WHERE collection_id = ? AND met_object_id = ?
      `
      );

      const info = stmt.run(collectionId, metId);
      if (info.changes === 0) {
        return res.status(404).json({ error: "Koppeling niet gevonden" });
      }

      res.status(204).end();
    } catch (err) {
      console.error("Admin delete artwork error:", err);
      res.status(500).json({ error: "Verwijderen mislukt" });
    }
  }
);

// AUTH: login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username en password zijn verplicht" });
    }

    const user = db
      .prepare(`SELECT id, username, email, password_hash, is_admin FROM users WHERE username = ?`)
      .get(username);

    if (!user) return res.status(401).json({ error: "Ongeldige inloggegevens" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Ongeldige inloggegevens" });

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    };

    res.json({ id: user.id, username: user.username, email: user.email, is_admin: user.is_admin });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login mislukt" });
  }
});

// AUTH: current user
app.get("/api/auth/me", (req, res) => {
  res.json(req.session.user || null);
});

// AUTH: logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).end();
  });
});

// GET /api/collections?published=true
// PUBLIC: collections list
// GET /api/collections?published=true
app.get("/api/collections", async (req, res) => {
  try {
    const onlyPublished = String(req.query.published || "") === "true";

    const rows = onlyPublished
      ? db
          .prepare(
            `
            SELECT id, name, description, category, cover_image_url, is_published
            FROM collections
            WHERE is_published = 1
            ORDER BY id DESC
          `
          )
          .all()
      : db
          .prepare(
            `
            SELECT id, name, description, category, cover_image_url, is_published
            FROM collections
            ORDER BY id DESC
          `
          )
          .all();

    // vul cover_image_url als hij leeg is
    const result = [];
    for (const c of rows) {
      let cover = c.cover_image_url;

      if (!cover || String(cover).trim() === "") {
        cover = await getFirstArtworkImageForCollection(db, c.id);
      }

      result.push({
        ...c,
        cover_image_url: cover || null,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Public collections error:", err);
    res.status(500).json({ error: "Kon collecties niet ophalen" });
  }
});


// GET /api/collections/:id/artworks
// -> geeft collectionName + artworks (details) terug via MET API
app.get("/api/collections/:id/artworks", async (req, res) => {
  try {
    const collectionId = req.params.id;

    const collection = db
      .prepare(
        `SELECT id, name
         FROM collections
         WHERE id = ?`
      )
      .get(collectionId);

    if (!collection) {
      return res.status(404).json({ error: "Collectie niet gevonden" });
    }

    const rows = db
      .prepare(
        `SELECT met_object_id, sort_order
         FROM collection_artworks
         WHERE collection_id = ?
         ORDER BY COALESCE(sort_order, 999999) ASC, id ASC`
      )
      .all(collectionId);

    const metObjectIds = rows.map((r) => String(r.met_object_id));

    if (metObjectIds.length === 0) {
      return res.json({
        collectionId: collection.id,
        collectionName: collection.name,
        artworks: [],
      });
    }

    const FALLBACK_IMG = "https://www.bcinformatica.nl/a6bg8/artwork_fallback.png";

    const fetchOne = async (objectId) => {
      const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`;
      const r = await fetch(url);

      // 404 -> skip
      if (r.status === 404) return null;
      if (!r.ok) return null;

      const a = await r.json();

      return {
        met_object_id: String(a.objectID),
        title: a.title || `Kunstwerk #${objectId}`,
        artist: a.artistDisplayName || "Onbekende kunstenaar",
        year: a.objectDate || "",
        image: a.primaryImageSmall || a.primaryImage || FALLBACK_IMG,
      };
    };

    // concurrency limit (vriendelijk voor MET)
    const limit = 6;
    const results = [];
    for (let i = 0; i < metObjectIds.length; i += limit) {
      const chunk = metObjectIds.slice(i, i + limit);
      const chunkRes = await Promise.all(chunk.map(fetchOne));
      results.push(...chunkRes.filter(Boolean));
    }

    res.json({
      collectionId: collection.id,
      collectionName: collection.name,
      artworks: results,
    });
  } catch (err) {
    console.error("Fout bij ophalen collectie artworks:", err.message, err);
    res.status(500).json({ error: "Kon kunstwerken niet ophalen" });
  }
});
// PUBLIC: single collection (only if published)
app.get("/api/collections/:id", (req, res) => {
  try {
    const id = req.params.id;

    const c = db
      .prepare(
        `
        SELECT id, name, description, category, cover_image_url, is_published
        FROM collections
        WHERE id = ? AND is_published = 1
      `
      )
      .get(id);

    if (!c) return res.status(404).json({ error: "Collectie niet gevonden" });

    res.json(c);
  } catch (err) {
    console.error("Public collection by id error:", err);
    res.status(500).json({ error: "Kon collectie niet ophalen" });
  }
});

// FAVORIETEN (user_id = 1)
// GET /api/favorites - lijst favorieten
app.get("/api/favorites", (req, res) => {
  try {
    console.log("GET /api/favorites");

    const rows = db
      .prepare(
        `SELECT id, user_id, met_object_id, created_at
         FROM favorites
         WHERE user_id = 1
         ORDER BY created_at DESC`
      )
      .all();

    console.log("Favorieten uit DB:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Fout bij ophalen favorieten:", err.message, err);
    res.status(500).json({ error: "Kon favorieten niet ophalen" });
  }
});

// POST /api/favorites - favoriet toevoegen
app.post("/api/favorites", (req, res) => {
  try {
    console.log("POST /api/favorites, body =", req.body);

    const { metObjectId } = req.body;

    if (!metObjectId) {
      console.warn("Geen metObjectId in body");
      return res.status(400).json({ error: "metObjectId is verplicht" });
    }

    const stmt = db.prepare(
      `INSERT OR IGNORE INTO favorites (user_id, met_object_id)
       VALUES (1, ?)`
    );
    const result = stmt.run(String(metObjectId));

    console.log("Resultaat INSERT OR IGNORE:", result);

    res.status(201).json({ met_object_id: String(metObjectId) });
  } catch (err) {
    console.error("Fout bij toevoegen favoriet:", err.message, err);
    res.status(500).json({ error: "Kon favoriet niet toevoegen" });
  }
});

// DELETE /api/favorites/:metObjectId - favoriet verwijderen
app.delete("/api/favorites/:metObjectId", (req, res) => {
  try {
    const metObjectId = req.params.metObjectId;
    console.log("DELETE /api/favorites/", metObjectId);

    const stmt = db.prepare(
      `DELETE FROM favorites
       WHERE user_id = 1 AND met_object_id = ?`
    );
    const result = stmt.run(String(metObjectId));

    console.log("Resultaat DELETE:", result);
    res.status(204).end();
  } catch (err) {
    console.error("Fout bij verwijderen favoriet:", err.message, err);
    res.status(500).json({ error: "Kon favoriet niet verwijderen" });
  }
});

// COMMENTS (user_id = 1)
// GET /api/artworks/:id/comments
app.get("/api/artworks/:id/comments", (req, res) => {
  try {
    const metObjectId = req.params.id;
    console.log("GET /api/artworks/" + metObjectId + "/comments");

    const rows = db
      .prepare(
        `SELECT id, user_id, met_object_id, comment_text, created_at
         FROM comments
         WHERE user_id = 1 AND met_object_id = ?
         ORDER BY created_at DESC`
      )
      .all(String(metObjectId));

    res.json(rows);
  } catch (err) {
    console.error("Fout bij ophalen comments:", err.message, err);
    res.status(500).json({ error: "Kon comments niet ophalen" });
  }
});

// POST /api/artworks/:id/comments
app.post("/api/artworks/:id/comments", (req, res) => {
  try {
    const metObjectId = req.params.id;
    const { text } = req.body;
    console.log("POST /api/artworks/" + metObjectId + "/comments", req.body);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment-tekst is verplicht" });
    }

    const stmt = db.prepare(
      `INSERT INTO comments (user_id, met_object_id, comment_text)
       VALUES (1, ?, ?)`
    );
    const result = stmt.run(String(metObjectId), text.trim());

    const inserted = db
      .prepare(
        `SELECT id, user_id, met_object_id, comment_text, created_at
         FROM comments
         WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    res.status(201).json(inserted);
  } catch (err) {
    console.error("Fout bij toevoegen comment:", err.message, err);
    res.status(500).json({ error: "Kon comment niet toevoegen" });
  }
});

// =========================
// ADMIN: COLLECTIES
// =========================

// GET /api/admin/collections  -> alle collecties
app.get("/api/admin/collections", requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, name, description, category, cover_image_url, is_published, created_at, updated_at
      FROM collections
      ORDER BY id DESC
    `).all();
    res.json(rows);
  } catch (err) {
    console.error("Admin collections GET error:", err.message, err);
    res.status(500).json({ error: "Kon admin collecties niet ophalen" });
  }
});

// POST /api/admin/collections -> nieuwe collectie
app.post("/api/admin/collections", requireAdmin, (req, res) => {
  try {
    const { name, description, category, cover_image_url, is_published } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Naam is verplicht" });
    }

    const stmt = db.prepare(`
      INSERT INTO collections (name, description, category, cover_image_url, is_published, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      name.trim(),
      description ?? "",
      category ?? "",
      cover_image_url ?? "",
      is_published ? 1 : 0
    );

    const created = db.prepare(`
      SELECT id, name, description, category, cover_image_url, is_published, created_at, updated_at
      FROM collections
      WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    console.error("Admin collections POST error:", err.message, err);
    res.status(500).json({ error: "Kon collectie niet toevoegen" });
  }
});

// PUT /api/admin/collections/:id -> collectie updaten
app.put("/api/admin/collections/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, category, cover_image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Naam is verplicht" });
    }

    const stmt = db.prepare(`
      UPDATE collections
      SET name = ?,
          description = ?,
          category = ?,
          cover_image_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      description ?? "",
      category ?? "",
      cover_image_url ?? "",
      id
    );

    const updated = db.prepare(`
      SELECT id, name, description, category, cover_image_url, is_published, created_at, updated_at
      FROM collections
      WHERE id = ?
    `).get(id);

    res.json(updated);
  } catch (err) {
    console.error("Admin collections PUT error:", err.message, err);
    res.status(500).json({ error: "Kon collectie niet bijwerken" });
  }
});

// PATCH /api/admin/collections/:id/publish -> publish toggle
app.patch("/api/admin/collections/:id/publish", (req, res) => {
  try {
    const id = req.params.id;
    const { is_published } = req.body; // boolean of 0/1

    const stmt = db.prepare(`
      UPDATE collections
      SET is_published = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(is_published ? 1 : 0, id);

    const updated = db.prepare(`
      SELECT id, name, description, category, cover_image_url, is_published, created_at, updated_at
      FROM collections
      WHERE id = ?
    `).get(id);

    res.json(updated);
  } catch (err) {
    console.error("Admin publish PATCH error:", err.message, err);
    res.status(500).json({ error: "Kon publicatiestatus niet wijzigen" });
  }
});

// DELETE /api/admin/collections/:id -> verwijderen
app.delete("/api/admin/collections/:id", (req, res) => {
  try {
    const id = req.params.id;
    db.prepare(`DELETE FROM collections WHERE id = ?`).run(id);
    res.status(204).end();
  } catch (err) {
    console.error("Admin collections DELETE error:", err.message, err);
    res.status(500).json({ error: "Kon collectie niet verwijderen" });
  }
});

// GET /api/collections/:id/artworks
// Leest objectIDs uit DB en haalt details op bij The Met API
app.get("/api/collections/:id/artworks", async (req, res) => {
  try {
    const collectionId = req.params.id;

    const rows = db
      .prepare(
        `SELECT met_object_id, sort_order
         FROM collection_artworks
         WHERE collection_id = ?
         ORDER BY COALESCE(sort_order, 999999) ASC, id ASC`
      )
      .all(collectionId);

    const ids = rows.map((r) => r.met_object_id);

    if (ids.length === 0) {
      return res.json([]);
    }

    // MET details ophalen parallel met een limiet
    const fetchOne = async (id) => {
      const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const data = await r.json();

      // Filter: alleen items met afbeelding 
      const img = data.primaryImageSmall || data.primaryImage || "";
      if (!img) return null;

      return {
        met_object_id: String(data.objectID),
        title: data.title || `Kunstwerk #${id}`,
        artist: data.artistDisplayName || "Onbekende kunstenaar",
        year: data.objectDate || "",
        image: img,
      };
    };

    // Kleine  limiet zoodat  de MET API niet spamt
    const limit = 6;
    const results = [];
    for (let i = 0; i < ids.length; i += limit) {
      const chunk = ids.slice(i, i + limit);
      const chunkRes = await Promise.all(chunk.map(fetchOne));
      results.push(...chunkRes.filter(Boolean));
    }

    res.json(results);
  } catch (err) {
    console.error("Fout bij ophalen collection artworks:", err.message, err);
    res.status(500).json({ error: "Kon kunstwerken niet ophalen" });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend API luistert op http://localhost:${PORT}`);
});

