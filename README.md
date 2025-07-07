# 💬 Real-Time Chat Application

A full-stack real-time chat application built with **MongoDB**, **Express.js**, **React (with Vite)**, and **Node.js**, using **Socket.IO** for real-time communication. Users can send messages, upload images/videos, set bios, and search for other users by their registered email addresses.

---
## Deployable url- https://chatapp-rho-brown.vercel.app

## 🚀 Features

- 🔒 **User Authentication** – Secure login/signup functionality
- 💬 **Real-Time Messaging** – Powered by Socket.IO
- 🖼️ **Image & Video Upload** – Send rich media in conversations
- 🧑 **User Bios** – Add or update personal bio
- 🔍 **User Search** – Search users by email ID (with MongoDB queries)
- 📦 **Modern Stack** – Built with MERN (MongoDB, Express, React + Vite, Node.js)

---

## 🛠️ Tech Stack

| Layer        | Technology              |
|--------------|--------------------------|
| Frontend     | React (with Vite), Tailwind CSS |
| Backend      | Node.js, Express.js      |
| Real-Time    | Socket.IO                |
| Database     | MongoDB + Mongoose       |
| Media Upload | Multer, Cloudinary (optional) |
| Auth         | JWT + bcrypt             |

---



## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
cd server
npm install
# Configure your .env with MONGODB_URI, JWT_SECRET, and other keys
npm run server
cd ../client
npm install
npm run dev
PORT=5000
Environment Variables (server/.env)- 
MONGODB_URI
PORT
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
Environment Variables (client/.env)- 
VITE_BACKEND_URL
