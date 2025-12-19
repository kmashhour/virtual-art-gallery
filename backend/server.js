const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());

// DB-pad: backend/data/gallery.db
const dbPath = path.join(__dirname, "data", "gallery.db");
console.log("Gebruik database:", dbPath);
const db = new Database(dbPath);

// GET /api/collections?published=true
app.get("/api/collections", (req, res) => {
  try {
    const { published } = req.query;

    let rows;
    if (published === "true") {
      // verwacht kolom is_published (0/1) in collections
      rows = db
        .prepare(
          `SELECT id, name, description, category, cover_image_url
           FROM collections
           WHERE is_published = 1
           ORDER BY id`
        )
        .all();
    } else {
      rows = db
        .prepare(
          `SELECT id, name, description, category, cover_image_url
           FROM collections
           ORDER BY id`
        )
        .all();
    }

    res.json(rows);
  } catch (err) {
    console.error("Fout bij ophalen collecties:", err);
    res.status(500).json({ error: "Kon collecties niet ophalen" });
  }
});

// GET /api/collections/:id/artworks
app.get("/api/collections/:id/artworks", (req, res) => {
  try {
    const collectionId = req.params.id;

    const collection = db
      .prepare(`SELECT id, name FROM collections WHERE id = ?`)
      .get(collectionId);

    if (!collection) {
      return res.status(404).json({ error: "Collectie niet gevonden" });
    }

    const rows = db
      .prepare(
        `SELECT met_object_id, sort_order
         FROM collection_artworks
         WHERE collection_id = ?
         ORDER BY sort_order`
      )
      .all(collectionId);

    const metObjectIds = rows.map((r) => r.met_object_id);

    res.json({
      collectionId: collection.id,
      collectionName: collection.name,
      metObjectIds,
    });
  } catch (err) {
    console.error("Fout bij ophalen artworks:", err);
    res
      .status(500)
      .json({ error: "Kon artworks voor deze collectie niet ophalen" });
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
app.get("/api/admin/collections", (req, res) => {
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
app.post("/api/admin/collections", (req, res) => {
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

