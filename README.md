# 🎬 VideoTweet — Full-Stack Video & Social Media Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://video-tweet.vercel.app/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A modern, full-featured video sharing and microblogging platform inspired by YouTube and Twitter. Built with a robust **Node.js/Express** backend and a sleek, fast **React 19 + Tailwind CSS** frontend.

---

## 🌐 Live Link

- **Website**: [https://video-tweet.vercel.app/](https://video-tweet.vercel.app/)

---

## ✨ Features

### 🔐 Authentication & Security
- Secure JWT-based authentication with dual **Access & Refresh Tokens**.
- HTTP-only, `SameSite=None`, `Secure` cross-domain cookies.
- Password hashing with `bcrypt`.
- Protected routes and persistent session management.

### 🎥 Video Management & Streaming
- Video upload with thumbnail support via **Cloudinary & Multer**.
- Integrated video player with controls (`React Player`).
- View counts, duration tracking, publish/unpublish toggle.
- Edit and delete video capabilities with permission checks.

### 🐦 Tweets & Community Feed
- Create, view, update, and delete short-form tweets.
- Like and interact with tweets from creators you follow.

### 💬 Social Interactions & Engagement
- **Likes & Comments**: Like videos, tweets, and comments; nested commenting workflow.
- **Subscriptions**: Subscribe/unsubscribe to channels with live subscriber counts.
- **Playlists**: Create custom playlists, add/remove videos, and share collections.
- **Watch History & Liked Videos**: Track personal watch history and viewed content.

### 📊 Creator Dashboard & Profile
- Channel analytics: total views, subscriber count, total likes, video count.
- Profile customizer: update avatar, cover image, and user information.

---

## 🛠️ Tech Stack

### **Frontend**
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS, CSS Custom Properties
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios (with credentials)
- **Routing**: React Router DOM (v7)
- **Notifications**: React Hot Toast

### **Backend**
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Pagination**: Mongoose Aggregate Paginate v2
- **File Storage**: Cloudinary SDK & Multer
- **Security**: JWT (`jsonwebtoken`), CORS, Cookie Parser, Bcrypt

### **Deployment & DevOps**
- **Frontend**: Vercel (with SPA routing via `vercel.json`)
- **Backend**: Render (Web Service with automated CI/CD)
- **Database**: MongoDB Atlas

---

## 📁 Repository Structure

```text
videoTweet/
├── Backend/                    # Express.js REST API
│   ├── src/
│   │   ├── controllers/        # Request handlers (User, Video, Tweet, etc.)
│   │   ├── db/                 # MongoDB connection logic
│   │   ├── middlewares/        # Auth, Multer upload middlewares
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # ApiError, ApiResponse, asyncHandler, Cloudinary
│   │   ├── app.js              # Express app configuration & CORS
│   │   ├── constants.js        # Global constants
│   │   └── index.js            # Server entry point
│   ├── .env                    # Environment variables (Backend)
│   └── package.json
│
├── Frontend/                   # React + Vite Client
│   ├── public/                 # Static assets (logos, icons)
│   ├── src/
│   │   ├── api/                # Axios instance configuration
│   │   ├── assets/             # Images and styles
│   │   ├── components/         # Reusable UI components & modals
│   │   ├── context/            # Global Auth and Theme state
│   │   ├── pages/              # Route pages (Home, Tweets, VideoDetail, etc.)
│   │   ├── App.jsx             # Router and layout configuration
│   │   └── main.jsx            # Application root
│   ├── vercel.json             # Vercel SPA rewrite rules
│   ├── vite.config.js          # Vite bundler config
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Aryan-artist/videoTweet.git
cd videoTweet
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend/` directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend/` directory:
```env
VITE_BACKEND_URL=
```

Start the frontend development server:
```bash
npm run dev
```


## 📄 License
This project is open source and available under the [ISC License](LICENSE).
