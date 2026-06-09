const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

// Allow requests from your React frontend
app.use(cors());
app.use(express.json());

// Configure your PostgreSQL connection
const pool = new Pool({
  user: 'postgres',          // Your PostgreSQL username
  host: 'localhost',          // Your host
  database: 'hire_radar',    // Your database name
  password: 'postgres',  // Your database password
  port: 5432,                 // Default PostgreSQL port
});

// Create an API route to fetch data
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // Send the rows back as JSON data
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
