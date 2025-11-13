import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// example protected route
import { requireAuth, requireRole } from "./middleware/auth.js";
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agri";
mongoose.connect(MONGODB_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port", process.env.PORT || 5000);
  });
}).catch(err => console.error(err));
