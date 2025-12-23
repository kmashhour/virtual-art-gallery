const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "data", "gallery.db");
const db = new Database(dbPath);

async function main() {
  const username = "admin";
  const email = "admin@example.com";
  const password = "admin123"; // demo wachtwoord
  const hash = await bcrypt.hash(password, 10);

  db.prepare(
    `INSERT OR IGNORE INTO users (username, email, password_hash, is_admin)
     VALUES (?, ?, ?, 1)`
  ).run(username, email, hash);

  console.log("✅ Admin user klaar:", { username, password });
}

main();
