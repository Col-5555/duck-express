require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3005;

// --- MongoDB setup ---
// Fail fast with a clear message if required config is missing
if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) {
  console.error(
    'Missing required env vars. ' +
      `MONGODB_URI=${process.env.MONGODB_URI ? 'set' : 'MISSING'}, ` +
      `MONGODB_DB=${process.env.MONGODB_DB ? 'set' : 'MISSING'}`
  );
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
let db;
let dbError = null;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB);
    console.log(`Connected to MongoDB database: ${process.env.MONGODB_DB}`);
  } catch (err) {
    dbError = err.message;
    console.error('Failed to connect to MongoDB:', err.message);
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Quick health check that proves the DB connection is live
app.get('/db-health', async (req, res) => {
  if (!db) {
    return res
      .status(503)
      .json({ status: 'connecting', error: dbError });
  }
  try {
    await db.command({ ping: 1 });
    res.json({ status: 'ok', database: process.env.MONGODB_DB });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start the web server immediately so the app always responds,
// then connect to MongoDB in the background.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();
