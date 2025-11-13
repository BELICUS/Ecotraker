const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth: register
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare('INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, name || '', email, password, createdAt, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not create user' });
    }
    res.json({ id, name, email, createdAt });
  });
  stmt.finalize();
});

// Auth: login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(row);
  });
});

// List users
app.get('/users', (req, res) => {
  db.all('SELECT id, name, email, createdAt FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Meals
app.get('/meals', (req, res) => {
  const { userId } = req.query;
  const params = userId ? [userId] : [];
  const sql = userId ? 'SELECT * FROM meals WHERE userId = ? ORDER BY date DESC' : 'SELECT * FROM meals ORDER BY date DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.post('/meals', (req, res) => {
  const { userId, type, name, co2, date } = req.body;
  if (!userId || !type || !date) return res.status(400).json({ error: 'userId, type and date required' });

  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO meals (id, userId, type, name, co2, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, userId, type, name || '', co2 || 0, date, createdAt, function (err) {
    if (err) return res.status(500).json({ error: 'Could not create meal' });
    res.json({ id, userId, type, name, co2, date, createdAt });
  });
  stmt.finalize();
});

app.delete('/meals/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM meals WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ deleted: this.changes });
  });
});

// Trips
app.get('/trips', (req, res) => {
  const { userId } = req.query;
  const params = userId ? [userId] : [];
  const sql = userId ? 'SELECT * FROM trips WHERE userId = ? ORDER BY date DESC' : 'SELECT * FROM trips ORDER BY date DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.post('/trips', (req, res) => {
  const { userId, type, name, distance, co2, date } = req.body;
  if (!userId || !type || !date) return res.status(400).json({ error: 'userId, type and date required' });

  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO trips (id, userId, type, name, distance, co2, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, userId, type, name || '', distance || 0, co2 || 0, date, createdAt, function (err) {
    if (err) return res.status(500).json({ error: 'Could not create trip' });
    res.json({ id, userId, type, name, distance, co2, date, createdAt });
  });
  stmt.finalize();
});

app.delete('/trips/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM trips WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ deleted: this.changes });
  });
});

// Migration endpoint to import data exported from localStorage
app.post('/migrate', (req, res) => {
  const { users = [], meals = [], trips = [] } = req.body;
  db.serialize(() => {
    const userStmt = db.prepare('INSERT OR IGNORE INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)');
    users.forEach(u => userStmt.run(u.id, u.name || '', u.email || '', u.password || '', u.createdAt || new Date().toISOString()));
    userStmt.finalize();

    const mealStmt = db.prepare('INSERT OR IGNORE INTO meals (id, userId, type, name, co2, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    meals.forEach(m => mealStmt.run(m.id, m.userId, m.type, m.name, m.co2, m.date, m.createdAt || new Date().toISOString()));
    mealStmt.finalize();

    const tripStmt = db.prepare('INSERT OR IGNORE INTO trips (id, userId, type, name, distance, co2, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    trips.forEach(t => tripStmt.run(t.id, t.userId, t.type, t.name, t.distance, t.co2, t.date, t.createdAt || new Date().toISOString()));
    tripStmt.finalize();

    res.json({ migrated: { users: users.length, meals: meals.length, trips: trips.length } });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
