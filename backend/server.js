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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend API luistert op http://localhost:${PORT}`);
});

