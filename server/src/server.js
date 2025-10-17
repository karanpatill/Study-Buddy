// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// --- Import routes ---
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import matchingRoutes from "./routes/matching.js";
import chatRoutes from "./routes/chat.js";
import groupRoutes from "./routes/group.js";
import gamificationRoutes from "./routes/gamification.js";
import notificationsRoutes from "./routes/notifications.js";
import aiRoutes from "./routes/ai.js";

// --- Import socket handlers ---
import { setupSocketHandlers } from "./utils/socketHandlers.js";

// --- Import passport configuration ---
import "./config/passport.js";

// Setup dirname/filename for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// --- Socket.io setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// --- Security middleware ---
app.use(
  helmet({
    contentSecurityPolicy: false, // Needed for Socket.IO in some cases
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// JSON + URL Encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --- Database & session setup ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ===================================================
// --- ROUTING ---
// ===================================================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 404 for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ===================================================
// --- SERVER INITIALIZATION ---
// ===================================================

// Socket.IO handlers
setupSocketHandlers(io);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err);
  res.status(500).json({
    message: "An internal server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
