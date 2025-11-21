PRAGMA foreign_keys = ON;

-- USERS
CREATE TABLE users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  username       TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  is_admin       INTEGER NOT NULL DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- COLLECTIONS
CREATE TABLE collections (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  description        TEXT,
  category           TEXT,
  cover_image_url    TEXT,
  is_published       INTEGER NOT NULL DEFAULT 0,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME,
  created_by_user_id INTEGER,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- MET OBJECTS (from CSV)
CREATE TABLE met_objects (
  ObjectNumber           TEXT,
  IsHighlight            TEXT,
  IsTimelineWork         TEXT,
  IsPublicDomain         TEXT,
  ObjectID               TEXT PRIMARY KEY,
  GalleryNumber          TEXT,
  Department             TEXT,
  AccessionYear          TEXT,
  ObjectName             TEXT,
  Title                  TEXT,
  Culture                TEXT,
  Period                 TEXT,
  Dynasty                TEXT,
  Reign                  TEXT,
  Portfolio              TEXT,
  ConstituentID          TEXT,
  ArtistRole             TEXT,
  ArtistPrefix           TEXT,
  ArtistDisplayName      TEXT,
  ArtistDisplayBio       TEXT,
  ArtistSuffix           TEXT,
  ArtistAlphaSort        TEXT,
  ArtistNationality      TEXT,
  ArtistBeginDate        TEXT,
  ArtistEndDate          TEXT,
  ArtistGender           TEXT,
  ArtistULANURL          TEXT,
  ArtistWikidataURL      TEXT,
  ObjectDate             TEXT,
  ObjectBeginDate        TEXT,
  ObjectEndDate          TEXT,
  Medium                 TEXT,
  Dimensions             TEXT,
  CreditLine             TEXT,
  GeographyType          TEXT,
  City                   TEXT,
  State                  TEXT,
  County                 TEXT,
  Country                TEXT,
  Region                 TEXT,
  Subregion              TEXT,
  Locale                 TEXT,
  Locus                  TEXT,
  Excavation             TEXT,
  River                  TEXT,
  Classification         TEXT,
  RightsAndReproduction  TEXT,
  LinkResource           TEXT,
  ObjectWikidataURL      TEXT,
  MetadataDate           TEXT,
  Repository             TEXT,
  Tags                   TEXT,
  TagsAATURL             TEXT,
  TagsWikidataURL        TEXT
);

-- COLLECTION ↔ ARTWORK LINK
CREATE TABLE collection_artworks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  met_object_id TEXT NOT NULL,
  sort_order    INTEGER,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (met_object_id) REFERENCES met_objects(ObjectID),
  UNIQUE (collection_id, met_object_id)
);

-- FAVORITES PER USER
CREATE TABLE favorites (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  met_object_id TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (met_object_id) REFERENCES met_objects(ObjectID),
  UNIQUE (user_id, met_object_id)
);

-- COMMENTS PER USER PER ARTWORK
CREATE TABLE comments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  met_object_id TEXT NOT NULL,
  comment_text  TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (met_object_id) REFERENCES met_objects(ObjectID)
);
