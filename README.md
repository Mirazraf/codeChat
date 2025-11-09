# 💬 CodeChat - Real-time Collaboration Platform for Developers

<div align="center">

<img src="frontend/public/logo.svg" alt="CodeChat Logo" height="150">

**Code Together. Learn Together. Build Together.**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://codechat-wcxa.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19.x-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-8.x-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

CodeChat is a modern, real-time collaboration platform designed specifically for developers, students, and educators. Share code snippets with syntax highlighting, collaborate in dedicated rooms, and build a learning community—all in one beautiful, responsive interface.

### ✨ Key Highlights

- 🚀 **Real-time Communication** - Instant messaging powered by Socket.IO
- 💻 **Code Sharing** - Syntax highlighting for 100+ programming languages
- 🎨 **Modern UI/UX** - Beautiful dark/light theme support
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt encryption
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ☁️ **Cloud Storage** - Cloudinary integration for file uploads
- 🎯 **Role-based Access** - Student, Teacher, and Admin roles

---

## 🎯 Features

### 👥 User Management
- ✅ User registration and authentication
- ✅ JWT token-based sessions
- ✅ Profile customization with avatars
- ✅ Password change functionality
- ✅ Role-based access control (Student/Teacher/Admin)

### 💬 Real-time Chat
- ✅ Create and join chat rooms
- ✅ Real-time message delivery with Socket.IO
- ✅ Typing indicators
- ✅ Online user status
- ✅ Message reactions with emojis
- ✅ Reply to messages
- ✅ Edit and delete messages
- ✅ Read receipts

### 💻 Code Collaboration
- ✅ Share code snippets with syntax highlighting
- ✅ Support for 100+ programming languages
- ✅ Monaco Editor integration
- ✅ Copy code to clipboard
- ✅ Code language detection

### 📊 Dashboard & Analytics
- ✅ Personal dashboard with statistics
- ✅ Code snippets count and trends
- ✅ Active streak tracking
- ✅ Popular rooms leaderboard
- ✅ Recent activity timeline
- ✅ Connection tracking

### 🎨 UI/UX
- ✅ Dark/Light theme toggle
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations and transitions
- ✅ Toast notifications
- ✅ Modern gradient backgrounds
- ✅ Professional component library

---

## 🚀 Demo

### 🌐 Live Application
**URL:** [https://codechat-wcxa.onrender.com](https://codechat-wcxa.onrender.com)

### 🎥 Quick Tour
1. **Home Page** - Landing page with feature showcase
2. **Sign Up** - Create your account
3. **Dashboard** - View your stats and quick actions
4. **Chat** - Join rooms and start collaborating
5. **Profile** - Customize your profile

---

## 📸 Screenshots

<div align="center">

### 🏠 Home Page
![Home Page](docs/screenshots/home.png)

### 📊 Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### 💬 Chat Interface
![Chat](docs/screenshots/chat.png)

### 🎨 Dark Mode
![Dark Mode](docs/screenshots/dark-mode.png)

</div>

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.x
- **Routing:** React Router v7
- **State Management:** Zustand
- **Styling:** TailwindCSS
- **UI Components:** Lucide Icons, React Hot Toast
- **Code Editor:** Monaco Editor
- **Real-time:** Socket.IO Client
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express 5.x
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.IO
- **File Upload:** Multer + Cloudinary
- **Security:** Helmet, CORS
- **Validation:** Express Validator

### DevOps & Tools
- **Deployment:** Render.com
- **Process Manager:** PM2
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Development:** Nodemon, Concurrently

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Mirazraf/codeChat.git
cd codeChat
```

### 2️⃣ Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Install backend dependencies
cd ../backend
npm install
```

### 3️⃣ Environment Configuration

Create `.env` file in `backend` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/codechat
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/codechat

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

Create `.env` file in `frontend` directory:

```bash
# API URL (leave empty for development proxy)
VITE_API_URL=
```

### 4️⃣ Start Development Servers

```bash
# From root directory
npm run dev
```

This will start:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

---

## 🏗️ Project Structure

```bash
codeChat/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.IO handlers
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Entry point
│   ├── logs/                # PM2 logs
│   ├── .env                 # Environment variables
│   ├── ecosystem.config.js  # PM2 configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── .npmrc               # npm configuration
│   └── package.json
│
├── docs/                    # Documentation
├── .gitignore
├── package.json             # Root package.json
└── README.md
```

---

## 🔧 Available Scripts

### Root Directory
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build frontend for production
npm run render-build # Build for Render.com deployment
npm start            # Start production server
```

### Backend (`/backend`)
```bash
npm start            # Start production server
npm run dev          # Start with nodemon
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 process
npm run pm2:logs     # View PM2 logs
npm run pm2:status   # Check PM2 status
```

### Frontend (`/frontend`)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🚢 Deployment

### Deploy to Render.com

1. **Fork/Clone** this repository to your GitHub

2. **Create New Web Service** on Render.com

3. **Configure Build Settings:**
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_production_secret
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Deploy!** 🚀

### Deploy with PM2 (VPS/Server)

```bash
# Install PM2 globally
npm install -g pm2

# Build frontend
cd frontend
npm run build

# Start with PM2
cd ../backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ HTTP security headers (Helmet)
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Rate limiting (TODO)
- ✅ XSS protection
- ✅ MongoDB injection prevention

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Test on both light and dark themes

---

## 🐛 Known Issues & Roadmap

### 🐛 Known Issues
- [ ] Video/Voice chat not implemented yet
- [ ] File upload size limited to 5MB
- [ ] Message search functionality pending

### 🗺️ Roadmap
- [ ] Video/Voice calling integration
- [ ] Screen sharing feature
- [ ] Advanced code collaboration (live editing)
- [ ] AI-powered code suggestions
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] Rate limiting and DDoS protection
- [ ] Advanced analytics dashboard
- [ ] Custom room themes
- [ ] Markdown support in messages

---

## 📄 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### User Endpoints

```bash
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Room Endpoints

```bash
GET    /api/rooms
POST   /api/rooms
GET    /api/rooms/:id
PUT    /api/rooms/:id
DELETE /api/rooms/:id
POST   /api/rooms/:id/join
POST   /api/rooms/:id/leave
```

### Dashboard Endpoints

```bash
GET /api/dashboard/stats
GET /api/dashboard/recent-activity
GET /api/dashboard/popular-rooms
```

---

## 🧪 Testing

```bash
# Run backend tests (TODO)
cd backend
npm test

# Run frontend tests (TODO)
cd frontend
npm test
```

---

## 📊 Database Schema

### User Model
```bash
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (student/teacher/admin),
  avatar: String (Cloudinary URL),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model
```bash
{
  name: String (required),
  description: String,
  type: String (public/private),
  creator: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```bash
{
  room: ObjectId (ref: Room),
  sender: ObjectId (ref: User),
  content: String (required),
  type: String (text/code/file),
  codeLanguage: String,
  replyTo: ObjectId (ref: Message),
  reactions: [{ user, emoji }],
  readBy: [ObjectId] (ref: User),
  isEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Socket.IO](https://socket.io/) - Real-time engine
- [MongoDB](https://www.mongodb.com/) - Database
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Cloudinary](https://cloudinary.com/) - Media storage

---

## 📞 Contact & Support

- **Author:** Miraz Rafi
- **GitHub:** [@Mirazraf](https://github.com/Mirazraf)
- **Project Link:** [https://github.com/Mirazraf/codeChat](https://github.com/Mirazraf/codeChat)
- **Live Demo:** [https://codechat-wcxa.onrender.com](https://codechat-wcxa.onrender.com)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Star History

If you found this project helpful, please consider giving it a ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=Mirazraf/codeChat&type=Date)](https://star-history.com/#Mirazraf/codeChat&Date)

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⬆ Back to Top](#-codechat---real-time-collaboration-platform-for-developers)

</div>
