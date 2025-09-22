<div align="center">

# 🏗️ Project Management  

**_Team. Track. Triumph._**  

<img src="https://img.shields.io/badge/React-18-blue?logo=react" />
<img src="https://img.shields.io/badge/Vite-4-purple?logo=vite" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss" />
<img src="https://img.shields.io/badge/Node.js-18-339933?logo=node.js" />
<img src="https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb" />

</div>

---

> **Project Management** is a sleek, full-stack app to **create, join, and oversee projects** with secure authentication and real-time collaboration.  
> Built with **React + Vite** on the frontend and **Node/Express + MongoDB** on the backend.

---

## ✨ Key Highlights
- 🔑 **Auth System** – Register, login, and protect routes with JWT  
- 🏗️ **Project Hub** – Create or join projects and track everything in one place  
- 📊 **Dashboard** – At-a-glance view of all your active projects  
- 👤 **Profile Center** – Edit personal details and manage credentials  
- 📱 **Fully Responsive** – Clean UI that adapts to any device  

---

## 🛠️ Tech Stack
| Layer      | Technologies                                   |
|------------|------------------------------------------------|
| **Frontend** | React 18 • Vite • Tailwind CSS               |
| **Routing**  | React Router • Context API                   |
| **Backend**  | Node.js • Express                            |
| **Database** | MongoDB (Mongoose)                           |
| **Security** | JWT Authentication                           |

---

## 🚦 Quick Start

### 1️⃣ Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB connection string

### 2️⃣ Installation
```bash
git clone https://github.com/<your-username>/project-management.git
cd project-management

# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```
3️⃣ Environment Variables
```
Create a server/.env file:
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret
PORT=5000
```

4️⃣ Run Development Servers
```
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client
npm run dev
```

## 🌐 Local Development URLs
> 🖥️ **Frontend** → [http://localhost:5173](http://localhost:5173)  
> ⚙️ **Backend**  → [http://localhost:5000](http://localhost:5000)
<br>

🗂️ Project Layout
```
PROJECTMANAGEMENT/
├── client/
│   └── src/
│       ├── components/   # Sidebar, Modals, ProtectedRoute, etc.
│       ├── contexts/     # AuthContext, ProjectContext
│       ├── pages/        # Dashboard, Login, Profile, Project, Register
│       ├── App.jsx
│       └── main.jsx
│
├── server/               # Express routes, models, controllers
│
└── README.md
```

## 🎨 Design Principles
> **💡 Minimal & Modern**  
> _Tailwind CSS ensures a crisp, utility-first design that adapts beautifully across devices._

> **🔒 Privacy First**  
> _JWT-secured API endpoints guarantee strong protection of user data._

> **⚡ Performance**  
> _Vite’s lightning-fast HMR and optimized builds keep development and production blazing quick._

> **🔧 Maintainable**  
> _React Context API enables predictable state management for effortless scaling._




