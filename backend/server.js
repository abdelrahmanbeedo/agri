import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import negotiationRoutes from "./routes/negotiationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5000,https://agrimarketeg.vercel.app').split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

function mongoSanitize(obj) {
  if (Array.isArray(obj)) {
    return obj.map(mongoSanitize);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = key.replace(/^\$/, '_').replace(/\./g, '_');
      sanitized[cleanKey] = mongoSanitize(value);
    }
    return sanitized;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) { Object.keys(req.query).forEach(k => { const v = req.query[k]; delete req.query[k]; req.query[k.replace(/^\$/, '_').replace(/\./g, '_')] = mongoSanitize(v); }); }
  if (req.params) { Object.keys(req.params).forEach(k => { const v = req.params[k]; delete req.params[k]; req.params[k.replace(/^\$/, '_').replace(/\./g, '_')] = mongoSanitize(v); }); }
  next();
});
app.use(express.json({ limit: '10kb' }));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/admin", adminRoutes);

import { requireAuth } from "./middleware/auth.js";
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agri";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Check your MONGODB_URI in .env file");
    console.error("   2. For local MongoDB: mongodb://localhost:27017/agri");
    console.error("   3. For MongoDB Atlas: Check your connection string and network access");
    console.error("   4. Ensure MongoDB is running (if using local)");
    process.exit(1);
  });
