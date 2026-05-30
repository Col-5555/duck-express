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

async function connectDB() {
  await client.connect();
  db = client.db(process.env.MONGODB_DB);
  console.log(`Connected to MongoDB database: ${process.env.MONGODB_DB}`);
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Quick health check that proves the DB connection is live
app.get('/db-health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ status: 'ok', database: process.env.MONGODB_DB });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Connect to the DB first, then start accepting requests
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
