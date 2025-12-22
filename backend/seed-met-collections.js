const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "data", "gallery.db");
const db = new Database(dbPath);

async function metSearch({ q, hasImages = true }) {
  const url = new URL("https://collectionapi.metmuseum.org/public/collection/v1/search");
  url.searchParams.set("q", q);
  url.searchParams.set("hasImages", hasImages ? "true" : "false");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`MET search failed: ${res.status}`);
  const data = await res.json();
  return data.objectIDs || [];
}

function upsertCollection({ name, description, category, cover_image_url, is_published }) {
  // Simpel: maak nieuw; als je al hebt, kun je eerst wissen of UPDATE doen.
  const stmt = db.prepare(`
    INSERT INTO collections (name, description, category, cover_image_url, is_published, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const result = stmt.run(name, description, category, cover_image_url, is_published ? 1 : 0);
  return result.lastInsertRowid;
}

function insertArtworkIds(collectionId, objectIds) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO collection_artworks (collection_id, met_object_id)
    VALUES (?, ?)
  `);

  const insertMany = db.transaction((ids) => {
    for (const id of ids) stmt.run(collectionId, String(id));
  });

  insertMany(objectIds);
}

async function main() {
  // (Optioneel) eerst leegmaken zodat je schoon begint:
  // db.prepare("DELETE FROM collection_artworks").run();
  // db.prepare("DELETE FROM collections").run();

  const configs = [
    {
      name: "Japanse prenten (Ukiyo-e)",
      description: "Een selectie Japanse houtdrukken met sterke compositie en kleur.",
      category: "Japan",
      cover_image_url: "", // mag leeg, frontend gebruikt fallback
      query: "ukiyo-e",
    },
    {
      name: "Impressionisme & Post-Impressionisme",
      description: "Licht, kleur en beweging uit de late 19e eeuw.",
      category: "Schilderkunst",
      cover_image_url: "",
      query: "impressionism",
    },
    {
      name: "17e-eeuwse Europese kunst",
      description: "Barokke en klassieke werken uit de 1600’s (Europa).",
      category: "Europa",
      cover_image_url: "",
      query: "17th century painting",
    },
  ];

  for (const c of configs) {
    const ids = await metSearch({ q: c.query, hasImages: true });
    const picked = ids.slice(0, 20); // neem 20 stuks

    const collectionId = upsertCollection({
      name: c.name,
      description: c.description,
      category: c.category,
      cover_image_url: c.cover_image_url,
      is_published: true,
    });

    insertArtworkIds(collectionId, picked);

    console.log(`✅ ${c.name}: ${picked.length} objectIDs gekoppeld (collection_id=${collectionId})`);
  }

  console.log("Klaar.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
