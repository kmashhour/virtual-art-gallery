# 🎨 Virtual Art Gallery — Project Setup Guide

This repository contains the starting files for the **Virtual Art Gallery** project.  
Before development can start, every team member must set up the project locally and connect it to the shared SQLite database.

---

## 🛠️ 1. Clone the Project

First, get the project code from GitHub.

```bash
git clone https://github.com/jhenze-fontys-dev/Project_ArtGallery.git
cd Project_ArtGallery
```

After this step, you have the project files on your computer, but **the database is still missing**.

---

## 📥 2. Download the Database from Teams

Because the MET dataset is very large, the database file is **not stored in GitHub**.

Download the following file from Microsoft Teams:

> **Teams location:**  
> Documents → General → REACT → **data**

### You need to download:
- **gallery.db** (SQLite database containing all MET objects + project tables)

### You do NOT need:
- **MetObjects.csv** (backup only, no longer used in the project)

Once downloaded, place `gallery.db` here:

```text
Project_ArtGallery/data/gallery.db
```

If the `data` folder already exists (it should), just put the file inside it.

---

## 📁 3. Project Folder Structure

After setup, your folder should look like this:

```text
Project_ArtGallery/
│
├── data/
│   ├── gallery.db       <-- you must add this manually
│   └── schema.sql       <-- already included
│
├── Backlog.md
├── .gitignore
└── README.md
```

---

## ✅ 4. Check That the Database Is Ignored by Git

We **never** want to push `gallery.db` to GitHub.

Run:

```bash
git status
```

You should **NOT** see `data/gallery.db` listed under “Changes to be committed” or “Untracked files”.

If you do see it, ask for help before committing or pushing.

The repository already contains a `.gitignore` file with these important rules:

```gitignore
# Ignore local SQLite databases
data/*.db

# Ignore CSV files
data/*.csv
```

These prevent:

- accidental uploads of 300MB+ files  
- failed pushes  
- a broken GitHub repository  

Do **not** remove these lines.

---

## 🧰 5. Viewing the Database with DB Browser for SQLite

To explore or inspect the database, you can use:

### 👉 DB Browser for SQLite  
Download: https://sqlitebrowser.org/

### How to open our database

1. Open **DB Browser for SQLite**  
2. Click **“Open Database”**  
3. Select:  
   ```text
   Project_ArtGallery/data/gallery.db
   ```
4. Use the tabs:
   - **Browse Data** → view tables and rows  
   - **Execute SQL** → run queries like:
     ```sql
     SELECT * FROM met_objects LIMIT 10;
     ```
   - **Database Structure** → view table and column structure  

You normally don’t need to change anything in the DB manually — but this tool is very useful to **see what’s inside** and understand how the data looks.

---

## 🎯 6. Quick Checklist for Team Members

Before you start coding, make sure you have:

- [x] Cloned the GitHub repo  
- [x] Downloaded `gallery.db` from Teams  
- [x] Placed `gallery.db` in `Project_ArtGallery/data/`  
- [x] Confirmed with `git status` that `gallery.db` is **not** tracked  
- [x] (Optional) Installed DB Browser for SQLite and opened `gallery.db`

Once all boxes are checked, you are ready to start working on the frontend and backend.

---

## 💬 Need Help?

If something does not work or you are unsure:
- Post a message in the Teams channel
