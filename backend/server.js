const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

/* ===================== MIDDLEWARE ===================== */
app.use(
cors({
origin: "*",
methods: ["GET", "POST", "PUT", "DELETE"],
allowedHeaders: ["Content-Type", "Authorization"],
})
);
app.use(express.json());

/* ===================== DATABASE ===================== */
const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
port: Number(process.env.DB_PORT || 3306),
waitForConnections: true,
connectionLimit: 10,
});

// Test DB connection
pool
.query("SELECT 1")
.then(() => console.log("✅ Database connected"))
.catch((err) => console.error("❌ Database connection failed:", err));

/* ===================== AUTH MIDDLEWARE ===================== */
const authMiddleware = (req, res, next) => {
try {
const token = req.headers.authorization?.split(" ")[1];
if (!token) return res.status(401).json({ message: "Authentication required" });

const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
next();
} catch (err) {
return res.status(401).json({ message: "Invalid or expired token" });
}
};

/* ===================== ROOT + TEST ROUTES ===================== */
app.get("/", (req, res) => {
res.send("HealthTrack backend is running ✅");
});

app.get("/api", (req, res) => {
res.json({
message: "HealthTrack API is running",
version: "1.0.0",
});
});

/* ===================== AUTH ROUTES ===================== */
app.post("/api/auth/signup", async (req, res) => {
try {
const { name, email, password } = req.body;

if (!name || !email || !password)
return res.status(400).json({ message: "All fields are required" });

if (password.length < 6)
return res.status(400).json({ message: "Password must be at least 6 characters" });

const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
if (exists.length)
return res.status(400).json({ message: "Email already registered" });

const hashed = await bcrypt.hash(password, 10);

const [result] = await pool.query(
"INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
[name, email, hashed]
);

if (!process.env.JWT_SECRET)
return res.status(500).json({ message: "JWT_SECRET is missing in environment variables" });

const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
expiresIn: "7d",
});

res.status(201).json({
message: "User created",
token,
user: {
id: result.insertId,
name,
email,
},
});
} catch (err) {
console.error(err);
res.status(500).json({ message: "Signup error" });
}
});

app.post("/api/auth/login", async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password)
return res.status(400).json({ message: "Email and password required" });

const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

if (!users.length) return res.status(401).json({ message: "Invalid credentials" });

const user = users[0];
const valid = await bcrypt.compare(password, user.password);

if (!valid) return res.status(401).json({ message: "Invalid credentials" });

if (!process.env.JWT_SECRET)
return res.status(500).json({ message: "JWT_SECRET is missing in environment variables" });

const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
expiresIn: "7d",
});

res.json({
message: "Login successful",
token,
user: {
id: user.id,
name: user.name,
email: user.email,
},
});
} catch (err) {
console.error(err);
res.status(500).json({ message: "Login error" });
}
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
try {
const [users] = await pool.query(
"SELECT id, name, email, created_at FROM users WHERE id = ?",
[req.userId]
);

if (!users.length) return res.status(404).json({ message: "User not found" });

res.json({ user: users[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Me route error" });
}
});

/* ===================== ACTIVITIES ===================== */
app.post("/api/activities", authMiddleware, async (req, res) => {
try {
const { type, name, duration = 0, calories, date } = req.body;

if (!type || !name || !calories || !date)
return res.status(400).json({ message: "Missing fields" });

if (!["exercise", "meal"].includes(type))
return res.status(400).json({ message: "Invalid type" });

const [result] = await pool.query(
"INSERT INTO activities (user_id, type, name, duration, calories, date) VALUES (?, ?, ?, ?, ?, ?)",
[req.userId, type, name, duration, calories, date]
);

const [activity] = await pool.query("SELECT * FROM activities WHERE id = ?", [
result.insertId,
]);

res.status(201).json({ activity: activity[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Create activity error" });
}
});

app.get("/api/activities", authMiddleware, async (req, res) => {
try {
const [activities] = await pool.query(
"SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC",
[req.userId]
);
res.json({ activities });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Fetch activities error" });
}
});

app.delete("/api/activities/:id", authMiddleware, async (req, res) => {
try {
const { id } = req.params;

const [exists] = await pool.query(
"SELECT id FROM activities WHERE id = ? AND user_id = ?",
[id, req.userId]
);

if (!exists.length) return res.status(404).json({ message: "Activity not found" });

await pool.query("DELETE FROM activities WHERE id = ?", [id]);
res.json({ message: "Activity deleted" });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Delete activity error" });
}
});

app.get("/api/activities/stats/summary", authMiddleware, async (req, res) => {
try {
const [stats] = await pool.query(
`SELECT
COUNT(*) AS total_activities,
SUM(calories) AS total_calories
FROM activities
WHERE user_id = ?`,
[req.userId]
);

res.json({ statistics: stats[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Stats error" });
}
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
console.log(`🚀 Server running on port ${PORT}`);
});
