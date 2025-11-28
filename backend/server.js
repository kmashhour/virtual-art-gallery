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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend API luistert op http://localhost:${PORT}`);
});

