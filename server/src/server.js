import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { autoSetupDatabase } from './utils/autoSetup.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import matchingRoutes from './routes/matching.js';
import chatRoutes from './routes/chat.js';
import groupRoutes from './routes/group.js';
import gamificationRoutes from './routes/gamification.js';
import { setupSocketHandlers } from './utils/socketHandlers.js';
import './config/passport.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
    credentials: true,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ Security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// ⚙️ Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// 🌐 CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
    credentials: true,
  })
);

// 🧩 Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🗄️ MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
  autoSetupDatabase();
});

// 🧠 TRUST PROXY — ⚠️ required for Render / HTTPS cookies
app.set('trust proxy', 1);

// 🍪 Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // ✅ cookies only over HTTPS
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ allow frontend/backend same domain
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// 🔐 Passport
app.use(passport.initialize());
app.use(passport.session());

// 🧭 Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gamification', gamificationRoutes);

// ❤️ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ⚡ Socket.IO
setupSocketHandlers(io);

// 🧱 Serve frontend
const frontendPath = path.join(__dirname, './dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// ❌ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Backend: ${process.env.CLIENT_URL}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('📦 Serving frontend from dist');
  }
});

export default app;
