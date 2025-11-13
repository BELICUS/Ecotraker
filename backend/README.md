# Carbono backend (Node + SQLite)

This is a minimal backend for the Carbono app. It provides simple REST endpoints and stores data in a local SQLite file.

How to run
1. Open a terminal and go to the `backend/` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on http://localhost:3000 by default.

Endpoints (summary)
- GET /health
- POST /auth/register { name, email, password }
- POST /auth/login { email, password }
- GET /users
- GET /meals?userId=
- POST /meals { userId, type, name, co2, date }
- DELETE /meals/:id
- GET /trips?userId=
- POST /trips { userId, type, name, distance, co2, date }
- DELETE /trips/:id
- POST /migrate { users, meals, trips }  // import from localStorage export

Notes:
- Passwords are stored in plaintext to keep the example simple. For production use, hash passwords and add authentication.
