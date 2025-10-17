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

// Import auto-setup utilities
import { autoSetupDatabase } from './utils/autoSetup.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import matchingRoutes from './routes/matching.js';
import chatRoutes from './routes/chat.js';
import groupRoutes from './routes/group.js';
import gamificationRoutes from './routes/gamification.js';

// Import socket handlers
import { setupSocketHandlers } from './utils/socketHandlers.js';

// Import passport configuration
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

// 🛡️ Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Socket.IO
  })
);

// ⚙️ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
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

// 🧩 Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🗄️ MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
  autoSetupDatabase();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// 🍪 Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/studybuddy',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// 🔐 Passport
app.use(passport.initialize());
app.use(passport.session());

// 🧭 API Routes
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
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ⚡ Socket.IO setup
setupSocketHandlers(io);

// 🧱 Serve frontend
const frontendPath =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, './dist') // Render/Railway build
    : path.join(__dirname, './dist'); // Local dist (if testing)

app.use(express.static(frontendPath));

// Catch-all for React Router (non-API routes)
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
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend: http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('📦 Serving frontend from src/dist');
  }
});

export default app;
