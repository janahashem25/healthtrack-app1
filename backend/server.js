const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

// ===================== CONFIG =====================
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const PORT = process.env.PORT || 3001;

// ===================== DATABASE CONNECTION =====================
let pool;

if (process.env.DB_HOST) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  (async () => {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  })();
}

// ===================== IN-MEMORY STORAGE =====================
let users = [];
let activities = [];

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());

// ===================== HEALTH CHECK =====================
app.get("/", (req, res) => {
  res.json({ 
    message: "HealthTrack API is running!",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "HealthTrack API v1.0",
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
        verify: "GET /api/auth/verify",
        logout: "POST /api/auth/logout"
      },
      activities: {
        getAll: "GET /api/activities",
        create: "POST /api/activities",
        update: "PUT /api/activities/:id",
        delete: "DELETE /api/activities/:id",
        stats: "GET /api/activities/stats/summary"
      }
    }
  });
});

// ===================== AUTH MIDDLEWARE =====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ===================== AUTH ROUTES =====================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (pool) {
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
        [name, email, hashedPassword]
      );

      const userId = result.insertId;
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: userId, name, email }
      });
    } else {
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      };
      users.push(newUser);

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id: newUser.id, name, email }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (pool) {
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } else {
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/verify", authenticateToken, async (req, res) => {
  try {
    if (pool) {
      const [users] = await pool.query(
        'SELECT id, name, email FROM users WHERE id = ?',
        [req.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ valid: true, user: users[0] });
    } else {
      const user = users.find(u => u.id === req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        valid: true, 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== ACTIVITIES ROUTES =====================
app.get("/api/activities", authenticateToken, async (req, res) => {
  try {
    if (pool) {
      const [activities] = await pool.query(
        'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC',
        [req.userId]
      );
      res.json(activities);
    } else {
      const userActivities = activities.filter(a => a.userId === req.userId);
      res.json(userActivities);
    }
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/activities", authenticateToken, async (req, res) => {
  try {
    const { type, duration, distance, calories, date } = req.body;

    if (!type || !duration) {
      return res.status(400).json({ error: "Type and duration required" });
    }

    if (pool) {
      const [result] = await pool.query(
        `INSERT INTO activities (user_id, type, duration, distance, calories, date, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [req.userId, type, duration, distance || 0, calories || 0, date || new Date()]
      );

      const [newActivity] = await pool.query(
        'SELECT * FROM activities WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newActivity[0]);
    } else {
      const activity = {
        id: activities.length + 1,
        userId: req.userId,
        type,
        duration,
        distance: distance || 0,
        calories: calories || 0,
        date: date || new Date(),
        createdAt: new Date()
      };

      activities.push(activity);
      res.status(201).json(activity);
    }
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put("/api/activities/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, duration, distance, calories, date } = req.body;

    if (pool) {
      const [activities] = await pool.query(
        'SELECT * FROM activities WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (activities.length === 0) {
        return res.status(404).json({ error: "Activity not found" });
      }

      await pool.query(
        `UPDATE activities 
         SET type = ?, duration = ?, distance = ?, calories = ?, date = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [type, duration, distance || 0, calories || 0, date, id, req.userId]
      );

      const [updatedActivity] = await pool.query(
        'SELECT * FROM activities WHERE id = ?',
        [id]
      );

      res.json(updatedActivity[0]);
    } else {
      const activityIndex = activities.findIndex(a => a.id === id && a.userId === req.userId);

      if (activityIndex === -1) {
        return res.status(404).json({ error: "Activity not found" });
      }

      activities[activityIndex] = {
        ...activities[activityIndex],
        type,
        duration,
        distance: distance || 0,
        calories: calories || 0,
        date,
        updatedAt: new Date()
      };

      res.json(activities[activityIndex]);
    }
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete("/api/activities/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (pool) {
      const [result] = await pool.query(
        'DELETE FROM activities WHERE id = ? AND user_id = ?',
        [id, req.userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Activity not found" });
      }

      res.json({ message: "Deleted successfully" });
    } else {
      const activity = activities.find(a => a.id === id && a.userId === req.userId);

      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      activities = activities.filter(a => a.id !== id);
      res.json({ message: "Deleted successfully" });
    }
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/api/activities/stats/summary", authenticateToken, async (req, res) => {
  try {
    if (pool) {
      const [stats] = await pool.query(
        `SELECT 
          COUNT(*) as totalActivities,
          COALESCE(SUM(duration), 0) as totalDuration,
          COALESCE(SUM(distance), 0) as totalDistance,
          COALESCE(SUM(calories), 0) as totalCalories
         FROM activities 
         WHERE user_id = ?`,
        [req.userId]
      );

      const [byType] = await pool.query(
        `SELECT 
          type,
          COUNT(*) as count,
          COALESCE(SUM(duration), 0) as duration,
          COALESCE(SUM(distance), 0) as distance,
          COALESCE(SUM(calories), 0) as calories
         FROM activities 
         WHERE user_id = ?
         GROUP BY type`,
        [req.userId]
      );

      const byTypeObj = {};
      byType.forEach(item => {
        byTypeObj[item.type] = {
          count: parseInt(item.count),
          duration: parseFloat(item.duration),
          distance: parseFloat(item.distance),
          calories: parseInt(item.calories)
        };
      });

      res.json({
        totalActivities: parseInt(stats[0].totalActivities),
        totalDuration: parseFloat(stats[0].totalDuration),
        totalDistance: parseFloat(stats[0].totalDistance),
        totalCalories: parseInt(stats[0].totalCalories),
        byType: byTypeObj
      });
    } else {
      const userActivities = activities.filter(a => a.userId === req.userId);

      const stats = {
        totalActivities: userActivities.length,
        totalDuration: userActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
        totalDistance: userActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
        totalCalories: userActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
        byType: {}
      };

      userActivities.forEach(activity => {
        if (!stats.byType[activity.type]) {
          stats.byType[activity.type] = {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0
          };
        }
        stats.byType[activity.type].count++;
        stats.byType[activity.type].duration += activity.duration || 0;
        stats.byType[activity.type].distance += activity.distance || 0;
        stats.byType[activity.type].calories += activity.calories || 0;
      });

      res.json(stats);
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== ERROR HANDLING =====================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});