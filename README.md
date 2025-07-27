# 🌿 ShambaConnect - MERN Agritech Platform

🔗 **Live Demo**: [https://elaborate-biscotti-95f37f.netlify.app/]

ShambaConnect is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to connect farmers and buyers in a digital marketplace. It features user authentication, product listings, profile creation, real-time chat, and role-based access for Farmers and Buyers.

---

## ✨ Features

- 👥 Role-based Registration/Login for Farmers and Buyers
- 📦 Product Listings with Image Upload
- 🧑‍🌾 Farmer and Buyer Profile Creation
- 💬 Real-time Chat between Farmers and Buyers using Socket.IO
- 🔐 Protected Routes and JWT Authentication
- 🔎 Product Filtering & Searching (Planned)
- 📈 Dashboard for Buyers with Chat Interface
- 📁 Clean and Modular Code Structure

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript (Vite)
- Tailwind CSS
- Axios
- React Router
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (Image Uploads)
- JWT (Authentication)
- Socket.IO (WebSockets)

---

## 📁 Project Structure
ShambaConnect/
├── client/ # React Frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── Auth/
│ │ │ ├── Chat/
│ │ │ ├── Dashboard/
│ │ │ ├── Home/
│ │ │ ├── Layout/
│ │ │ ├── Products/
│ │ │ └── Profile/
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── services/
│ │ │ └── api.ts
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ ├── index.css
│ │ └── index.html
│ └── ...
│
├── server/ # Express Backend
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ │ ├── auth.js
│ │ ├── buyers.js
│ │ ├── farmers.js
│ │ ├── products.js
│ │ └── chat.js
│ ├── .env
│ ├── server.js
│ └── package.json
│
├── README.md
└── .gitignore



---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### 🖥️ Backend Setup

```bash
cd server
npm install
npm run dev


🌐 Frontend Setup
cd client
npm install
npm run dev


To build frontend for production:
npm run build


🧪 API Testing
You can test API routes using:

Postman

Thunder Client (VS Code extension)

Ensure your backend is running on http://localhost:5000 and frontend on http://localhost:5173.

💬 Real-Time Chat
ShambaConnect uses Socket.IO for chat between farmers and buyers:

The backend emits/receives messages via /chat route

The frontend includes chat logic in BuyerDashboard.tsx and ChatWindow components

Make sure both client and server are running for full chat functionality.

🔐 Authentication
JWT tokens are issued on login

Protected routes use middleware (auth.js)

User roles are enforced for access control
