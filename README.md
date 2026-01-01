# HealthTrack - Fitness & Wellness Tracker

## 📝 Project Description
A comprehensive full-stack wellness tracking web application that helps users monitor their daily activities, meals, and exercise routines. Developed for **CSCI426: Advanced Web Programming** - Phase 1 & 2.

## 👥 Team Members
<<<<<<< HEAD
- **Jana Hashem** - Student ID: [52310156]
=======
- **Reine rifai** - Student ID: [92230103]
>>>>>>> ab91a94 (initial commit)

## ✨ Features

### Frontend (Phase 1)
- Responsive React.js application
- 5 pages: Home, Activity Tracker, About, Features, Contact
- Modern UI with inline CSS styling
- Mobile-friendly design
- Interactive components

### Backend (Phase 2)
- RESTful API built with Node.js & Express
- MySQL database integration
- User authentication (JWT)
- Complete CRUD operations for activities
- Secure password hashing (bcrypt)
- Activity statistics and analytics

## 🛠️ Technologies Used

### Frontend
- **Framework**: React.js
- **Styling**: Inline CSS (responsive)
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (via XAMPP)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors middleware

### Development Tools
- **Version Control**: Git & GitHub
- **Code Editor**: VS Code
- **Database Management**: phpMyAdmin (XAMPP)
- **API Testing**: Browser & Postman

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- XAMPP (for MySQL database)
- Git

### Backend Setup

1. **Install XAMPP and start MySQL:**
   - Download from: https://www.apachefriends.org
   - Start Apache and MySQL services

2. **Create database:**
```bash
   # Open MySQL command line
   cd C:\xampp\mysql\bin
   mysql -u root -p
   # Press Enter for password (leave blank)
```
```sql
   CREATE DATABASE healthtrack_db;
   USE healthtrack_db;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE activities (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       type ENUM('exercise', 'meal') NOT NULL,
       name VARCHAR(100) NOT NULL,
       duration INT DEFAULT 0,
       calories INT NOT NULL,
       date DATE NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );

   EXIT;
```

3. **Install backend dependencies:**
```bash
   cd backend
   npm install
```

4. **Configure environment variables:**
   - Create `.env` file in `backend/` folder (use `.env.example` as template)
```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=healthtrack_db
   JWT_SECRET=healthtrack_secret_key_2025_csci426
```

5. **Start backend server:**
```bash
   npm run dev
```
   Server will run on: http://localhost:5000

### Frontend Setup

1. **Install frontend dependencies:**
```bash
   cd ..
   npm install
   npm install lucide-react
```

2. **Start frontend application:**
```bash
   npm start
```
   Application will open on: http://localhost:3000

## 🚀 Running the Application

### Step-by-Step Guide:

1. **Start XAMPP:**
   - Open XAMPP Control Panel
   - Start Apache and MySQL (both should be green)

2. **Start Backend (Terminal 1):**
```bash
   cd backend
   npm run dev
```
   ✅ You should see: "Server running on port 5000"

3. **Start Frontend (Terminal 2):**
```bash
   npm start
```
   ✅ Browser will open automatically at http://localhost:3000

4. **Test the Application:**
   - Sign up with a new account
   - Log in with your credentials
   - Add activities (exercises and meals)
   - View your statistics on the home page

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Activities (All require authentication)
- `GET /api/activities` - Get all user activities
- `POST /api/activities` - Create new activity
- `GET /api/activities/:id` - Get single activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/stats/summary` - Get user statistics

## 🗄️ Database Schema

### Users Table
```sql
id (INT, PRIMARY KEY, AUTO_INCREMENT)
name (VARCHAR 100)
email (VARCHAR 100, UNIQUE)
password (VARCHAR 255, hashed)
created_at (TIMESTAMP)
```

### Activities Table
```sql
id (INT, PRIMARY KEY, AUTO_INCREMENT)
user_id (INT, FOREIGN KEY → users.id)
type (ENUM: 'exercise', 'meal')
name (VARCHAR 100)
duration (INT, default 0)
calories (INT)
date (DATE)
created_at (TIMESTAMP)
```

## 📸 Screenshots

### Login/Signup Page
![Login Page](screenshots/login.png)

### Home Dashboard
![Home Page](screenshots/home.png)

### Activity Tracker
![Tracker Page](screenshots/tracker.png)

### Features Page
![Features Page](screenshots/features.png)

## 🎯 Project Requirements Met

### Phase 1 (Frontend)
- ✅ React.js frontend framework
- ✅ 5+ pages implemented
- ✅ Responsive design (mobile & desktop)
- ✅ Modern UI/UX design
- ✅ Git version control
- ✅ GitHub repository

### Phase 2 (Backend)
- ✅ Node.js backend
- ✅ MySQL database integration
- ✅ Complete CRUD operations
- ✅ User authentication (Login/Signup)
- ✅ Two related entities (Users & Activities)
- ✅ Data validation & error handling
- ✅ RESTful API design
- ✅ Git commit history
- ✅ GitHub repository with documentation

## 🔒 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- SQL injection prevention (parameterized queries)
- CORS configuration

## 🐛 Troubleshooting

### Backend won't start
- Ensure XAMPP MySQL is running (green status)
- Check if port 5000 is available
- Verify `.env` file exists and is configured correctly
- Make sure database `healthtrack_db` exists

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure CORS is enabled in backend

### Database connection errors
- Verify MySQL credentials in `.env`
- Check if database and tables exist
- Restart MySQL in XAMPP

## 📚 Learning Outcomes
- Full-stack web development with React & Node.js
- RESTful API design and implementation
- Database design and SQL queries
- User authentication and authorization
- Frontend-backend integration
- Version control with Git
- Project documentation

## 🔮 Future Enhancements
- Deploy backend to cloud service (Render, Railway, Heroku)
- Add data visualization with charts
- Implement email notifications
- Add social sharing features
- Create admin dashboard
- Mobile app version

## 📞 Contact
<<<<<<< HEAD
- **Email**: janahashem.25@gmail.com
- **GitHub**: [@janahashem25](https://github.com/janahashem25)
=======
- **Email**: reinef143@icloud.com
- **GitHub**: [renerifai](https://github.com/reinerifai/healthtrack)
>>>>>>> ab91a94 (initial commit)

## 📄 License
This project was created for educational purposes as part of CSCI426 course at the Department of Computer Science and Information Technology.

---

**© 2025 HealthTrack - CSCI426 Advanced Web Programming Project**

**Built with ❤️ using React, Node.js, Express & MySQL**