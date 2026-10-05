# 💬 iMessage Web — Real-Time Chat & Messaging Application

A full-stack real-time messaging application built with **React 19, Vite, Express.js 5, MongoDB, Socket.io, and Clerk**.

The application supports real-time messaging, media sharing, read receipts, typing indicators, voice notes, multiple themes, and Docker-based deployment.

## ✨ Features

* 🔐 **Authentication** — Clerk authentication with webhook-based user synchronization
* ⚡ **Real-time Messaging** — Instant messaging using Socket.io
* ✅ **Read Receipts** — Sent, delivered, and seen message states
* ⌨️ **Typing Indicators** — Real-time typing status
* 📸 **Media Sharing** — Images, videos, and audio messages
* 🎙️ **Voice Notes** — Record and play audio messages
* 😃 **Emoji & Reactions** — Emoji picker and message reactions
* 🎨 **Theme Support** — WhatsApp, iMessage, Dark, Light, and Glassmorphic themes
* 📱 **Responsive UI** — Optimized for desktop and mobile
* 🐳 **Docker Ready** — Multi-stage production Docker setup

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS v4
* HeroUI
* Zustand
* Socket.io Client
* Lucide React
* React Hot Toast
* Clerk React

### Backend

* Node.js
* Express.js 5
* Socket.io
* MongoDB
* Mongoose
* Clerk Express
* Multer
* ImageKit

## 📁 Project Structure

```text
IMESSAGE/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeds/
│   │   ├── webhooks/
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── Dockerfile
└── package.json
```

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm
* MongoDB or MongoDB Atlas
* Clerk account
* ImageKit account

### 1. Clone the repository

```bash
git clone https://github.com/chintan293/CHConnect.git
cd IMESSAGE
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001
```

> Never commit real secrets or `.env` files to GitHub.

### 4. Run the application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| GET    | `/api/auth/me` | Get authenticated user |

### Messages

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/api/messages/conversations` | Get conversations       |
| GET    | `/api/messages/:id`           | Get chat history        |
| POST   | `/api/messages/send/:id`      | Send text/media message |
| PUT    | `/api/messages/read/:id`      | Mark messages as read   |

### Webhooks

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| POST   | `/api/webhooks/clerk` | Synchronize Clerk users |

## 🔌 Socket.io Events

| Event            | Direction       | Purpose                      |
| ---------------- | --------------- | ---------------------------- |
| `getOnlineUsers` | Server → Client | Get online users             |
| `newMessage`     | Server → Client | Receive new message          |
| `typing`         | Client ↔ Server | Typing indicator             |
| `stopTyping`     | Client ↔ Server | Stop typing indicator        |
| `markAsRead`     | Client → Server | Mark messages as read        |
| `messagesRead`   | Server → Client | Notify sender of read status |

## 🐳 Docker

Build the production image:

```bash
docker build -t imessage-app .
```

Run the container:

```bash
docker run -d \
  -p 3001:3001 \
  --env-file backend/.env \
  --name imessage-container \
  imessage-app
```

Then open:

```text
http://localhost:3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push your changes
5. Open a Pull Request

## 📄 License

This project is licensed under the **ISC License**.

## 👨‍💻 Author

**Chintan Hadiya**

[GitHub](https://github.com/chintan293)
