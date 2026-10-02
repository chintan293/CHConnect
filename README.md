# 💬 iMessage Web - Real-Time Chat & Messaging Application

A full-stack, real-time messaging application built with **React 19**, **Vite**, **Express.js (v5)**, **MongoDB**, **Socket.io**, and **Clerk Authentication**. Styled with modern **Tailwind CSS v4** and **HeroUI**, featuring multi-theme support (WhatsApp & iMessage aesthetics), rich media sharing (Photos, Videos, Audio Voice Notes), read receipts, typing indicators, and containerized deployment with Docker.

---

## 🌟 Key Features

- **🔐 Secure Authentication**: Multi-provider login powered by **Clerk** with automatic database synchronization via Webhooks.
- **⚡ Real-Time Messaging**: Instant bidirectional messaging powered by **Socket.io**.
- **✅ Read Receipts & Delivery Status**:
  - Single Grey Tick (`✓`) - Message Sent
  - Double Grey Tick (`✓✓`) - Message Delivered
  - Double Blue Tick (`✓✓`) - Message Read / Seen
- **📸 Rich Media Sharing**:
  - **Photos**: Upload and preview images in an interactive lightbox modal.
  - **Videos**: Stream and play videos using native custom player controls.
  - **Audio & Voice Notes**: Record audio clips directly from the composer or upload audio files with a custom playback controller (play/pause, duration, progress tracking).
  - Media storage powered by **ImageKit CDN**.
- **⌨️ Real-Time Typing Indicators**: See when the recipient is actively typing.
- **😃 Interactive Emoji Picker**: Integrated emoji selector and quick reaction bar.
- **🎨 Theme Engine**: Customizable UI themes including **WhatsApp Emerald**, **iMessage Blue**, Dark, Light, and Glassmorphic presets.
- **📱 Responsive & Modern UI**: Built with React 19, HeroUI, Lucide Icons, and React Hot Toast notifications.
- **🐳 Docker Ready**: Multi-stage production Dockerfile combining Vite static build and Express API service into a unified runner container.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [HeroUI](https://heroui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons & UI**: Lucide React, React Hot Toast
- **Auth**: [@clerk/react](https://clerk.com/)
- **Real-Time Client**: Socket.io-client

### Backend
- **Runtime & Server**: Node.js (ES Modules) + [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Real-Time Server**: [Socket.io](https://socket.io/)
- **Auth Middleware**: [@clerk/express](https://clerk.com/) & Webhook integration
- **Media CDN & Uploads**: Multer + [@imagekit/nodejs](https://imagekit.io/)
- **Background Tasks**: `cron` (Heartbeat / Keep-Alive)

---

## 📁 Project Structure

```
IMESSAGE/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, Message)
│   │   ├── lib/              # Utility configurations (MongoDB, Socket.io, ImageKit, Cron)
│   │   ├── middleware/       # Multer media upload & validation middleware
│   │   ├── models/           # Mongoose schemas (User, Message)
│   │   ├── routes/           # Express API route declarations
│   │   ├── seeds/            # Database seed script
│   │   ├── webhooks/         # Clerk Webhook handlers
│   │   └── index.js          # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components (Auth, Chat, Layout, Modals)
│   │   ├── data/             # Theme configuration presets
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # State management with Zustand
│   │   ├── styles/           # Global CSS & Tailwind stylesheets
│   │   ├── App.jsx           # Main Application Router
│   │   └── main.jsx          # Vite React entry point
│   └── package.json
│
├── Dockerfile                # Multi-stage production container script
└── package.json              # Monorepo root configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local environment:
- [Node.js](https://nodejs.org/) (v18+ recommended, v22 support)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Clerk Account](https://clerk.com/) (For Auth keys)
- [ImageKit Account](https://imagekit.io/) (For Media uploads)

---

### 🔑 Environment Variables Setup

#### 1. Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/imessage?retryWrites=true&w=majority
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
IMAGEKIT_PRIVATE_KEY=private_...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### 2. Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
```

---

### 💻 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/copy_imessage.git
   cd copy_imessage/IMESSAGE
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Seed Database (Optional)**:
   To populate test users into MongoDB, run from the `backend/` folder:
   ```bash
   npm run db:seed
   ```

5. **Run Development Servers**:

   - **Backend** (Starts Express API & Socket server on `http://localhost:3001`):
     ```bash
     cd backend
     npm run dev
     ```

   - **Frontend** (Starts Vite dev server on `http://localhost:5173`):
     ```bash
     cd frontend
     npm run dev
     ```

6. Open your browser and navigate to `http://localhost:5173`.

---

## 🐳 Docker Deployment

The application includes a production-ready multi-stage `Dockerfile` that packages both the Vite SPA frontend and Express backend into a single Node runtime image.

### Building & Running with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t imessage-app \
     --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_test_... \
     .
   ```

2. **Run the Container**:
   ```bash
   docker run -d \
     -p 3001:3001 \
     -e MONGO_URI="mongodb+srv://..." \
     -e CLERK_PUBLISHABLE_KEY="pk_test_..." \
     -e CLERK_SECRET_KEY="sk_test_..." \
     -e IMAGEKIT_PRIVATE_KEY="private_..." \
     --name imessage-container \
     imessage-app
   ```

3. Access the application at `http://localhost:3001`.

---

## 📡 API Endpoints Summary

### Auth Routes (`/api/auth`)
- `GET /api/auth/me` - Fetch authenticated user profile

### Message Routes (`/api/messages`)
- `GET /api/messages/conversations` - Fetch conversation list
- `GET /api/messages/:id` - Fetch chat history with a specific user
- `POST /api/messages/send/:id` - Send text or media message (Multer upload)
- `PUT /api/messages/read/:id` - Mark unread messages in conversation as read

### Webhooks (`/api/webhooks`)
- `POST /api/webhooks/clerk` - Clerk webhook sync endpoint for user creation/updates

---

## 🔌 Socket.io Real-Time Events

| Event Name | Direction | Description |
|---|---|---|
| `getOnlineUsers` | Server ➔ Client | Emits active user IDs online |
| `newMessage` | Server ➔ Client | Delivers new incoming message |
| `typing` | Client ⇄ Server | Notifies peer that user is typing |
| `stopTyping` | Client ⇄ Server | Notifies peer that user stopped typing |
| `markAsRead` | Client ➔ Server | Triggers read receipt update for conversation |
| `messagesRead` | Server ➔ Client | Notifies sender that messages were read |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:
1. Fork the Repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.
