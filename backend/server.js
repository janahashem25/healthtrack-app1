const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(cors());
app.use(express.json());

/* ===================== DATABASE ===================== */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ===================== TEST DB ===================== */
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

/* ===================== AUTH MIDDLEWARE ===================== */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ===================== ROUTES ===================== */
app.get("/", (req, res) => {
  res.send("HealthTrack backend is running ✅");
});

app.get("/api", (req, res) => {
  res.json({ message: "HealthTrack API OK" });
});

/* ===================== AUTH ===================== */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (exists.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: { id: result.insertId, name, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

/* ===================== ACTIVITIES ===================== */
app.post("/api/activities", authMiddleware, async (req, res) => {
  try {
    const { type, name, duration = 0, calories, date } = req.body;

    const [result] = await pool.query(
      "INSERT INTO activities (user_id, type, name, duration, calories, date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.userId, type, name, duration, calories, date]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create activity error" });
  }
});

app.get("/api/activities", authMiddleware, async (req, res) => {
  try {
    const [activities] = await pool.query(
      "SELECT * FROM activities WHERE user_id = ?",
      [req.userId]
    );
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch activities error" });
  }
});

/* ===================== USERS ===================== */
app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.userId]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch user error" });
  }
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 3001;  // ← واحد فقط
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
