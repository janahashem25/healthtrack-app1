const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Test Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HealthTrack API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (signup, login, me)',
      activities: '/api/activities (CRUD operations)'
    }
  });
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
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
      message: 'User created successfully',
      token,
      user: { 
        id: result.insertId, 
        name, 
        email 
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE - Add new activity
app.post('/api/activities', authMiddleware, async (req, res) => {
  try {
    const { type, name, duration, calories, date } = req.body;

    if (!type || !name || !calories || !date) {
      return res.status(400).json({ 
        message: 'Required fields: type, name, calories, date' 
      });
    }

    if (!['exercise', 'meal'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either "exercise" or "meal"' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO activities (user_id, type, name, duration, calories, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, type, name, duration || 0, calories, date]
    );

    const [newActivity] = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Activity created successfully',
      activity: newActivity[0]
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error creating activity' });
  }
});

// READ - Get all activities
app.get('/api/activities', authMiddleware, async (req, res) => {
  try {
    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [req.userId]
    );

    res.json({ 
      activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

// READ - Get single activity
app.get('/api/activities/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ activity: activities[0] });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

// UPDATE - Update activity
app.put('/api/activities/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, duration, calories, date } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM activities WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (type && !['exercise', 'meal'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either "exercise" or "meal"' 
      });
    }

    await pool.query(
      'UPDATE activities SET type = ?, name = ?, duration = ?, calories = ?, date = ? WHERE id = ?',
      [
        type || existing[0].type,
        name || existing[0].name,
        duration !== undefined ? duration : existing[0].duration,
        calories || existing[0].calories,
        date || existing[0].date,
        id
      ]
    );

    const [updated] = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Activity updated successfully',
      activity: updated[0]
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Server error updating activity' });
  }
});

// DELETE - Delete activity
app.delete('/api/activities/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM activities WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await pool.query('DELETE FROM activities WHERE id = ?', [id]);

    res.json({ 
      message: 'Activity deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error deleting activity' });
  }
});

// Get Statistics
app.get('/api/activities/stats/summary', authMiddleware, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        SUM(calories) as total_calories,
        SUM(CASE WHEN type = 'exercise' THEN duration ELSE 0 END) as total_exercise_time,
        COUNT(CASE WHEN type = 'exercise' THEN 1 END) as total_exercises,
        COUNT(CASE WHEN type = 'meal' THEN 1 END) as total_meals
       FROM activities 
       WHERE user_id = ?`,
      [req.userId]
    );

    res.json({ 
      statistics: {
        total_activities: parseInt(stats[0].total_activities) || 0,
        total_calories: parseInt(stats[0].total_calories) || 0,
        total_exercise_time: parseInt(stats[0].total_exercise_time) || 0,
        total_exercises: parseInt(stats[0].total_exercises) || 0,
        total_meals: parseInt(stats[0].total_meals) || 0
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection
pool.query('SELECT 1')
  .then(() => {
    console.log('  ✅ Database connection: SUCCESS');
  })
  .catch((err) => {
    console.error('  ❌ Database connection: FAILED');
    console.error('  Error:', err.message);
    console.error('  Code:', err.code);
  });

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 HealthTrack Backend Server
  ==========================================
  ✅ Server running on port ${PORT}
  📍 API URL: http://localhost:${PORT}
  📊 Database: ${process.env.DB_NAME}
  
  Available Endpoints:
  - POST   /api/auth/signup
  - POST   /api/auth/login
  - GET    /api/auth/me
  - GET    /api/activities
  - POST   /api/activities
  - GET    /api/activities/:id
  - PUT    /api/activities/:id
  - DELETE /api/activities/:id
  - GET    /api/activities/stats/summary
  ==========================================
  `);
});

// Keep server alive
server.on('close', () => {
  console.log('Server is shutting down...');
});