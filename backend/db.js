const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'database.sqlite');

const firstTime = !fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
});

function init() {
  // Create tables if they don't exist
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        createdAt TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        name TEXT,
        co2 REAL,
        date TEXT,
        createdAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        name TEXT,
        distance REAL,
        co2 REAL,
        date TEXT,
        createdAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);
  });
}

if (firstTime) {
  console.log('Initializing new SQLite database at', DB_PATH);
}

init();

module.exports = db;
