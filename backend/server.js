const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

/* ===========================
   Middleware
=========================== */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* ===========================
   MySQL (Railway Compatible)
=========================== */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* ===========================
   Auth Middleware
=========================== */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/* ===========================
   Health Check (IMPORTANT)
=========================== */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'HealthTrack API is running',
    status: 'OK'
  });
});

/* ===========================
   AUTH ROUTES
=========================== */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const [users] = await pool.query(
    'SELECT id, name, email FROM users WHERE id = ?',
    [req.userId]
  );

  if (users.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(users[0]);
});

/* ===========================
   ACTIVITIES
=========================== */
app.post('/api/activities', authMiddleware, async (req, res) => {
  const { type, name, duration, calories, date } = req.body;

  if (!type || !name || !calories || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const [result] = await pool.query(
    `INSERT INTO activities 
     (user_id, type, name, duration, calories, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, type, name, duration || 0, calories, date]
  );

  res.status(201).json({ id: result.insertId });
});

app.get('/api/activities', authMiddleware, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC',
    [req.userId]
  );

  res.json(rows);
});

/* ===========================
   ERROR HANDLING
=========================== */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ===========================
   START SERVER (Railway)
=========================== */
// Load env vars (local only, safe on Railway)
require('dotenv').config();

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('===================================');
  console.log('🚀 HealthTrack Backend LIVE');
  console.log(`✅ Listening on port ${PORT}`);
  console.log('===================================');
});
