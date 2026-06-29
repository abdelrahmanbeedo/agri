import jwt from "jsonwebtoken";
import User from "../models/User.js";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({msg:"No token"});
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password_hash");
    if (!user) return res.status(401).json({ msg: "User not found" });
    req.user = { ...user.toObject(), id: user._id.toString() };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ msg: "Token expired" });
    if (err.name === "JsonWebTokenError") return res.status(401).json({ msg: "Invalid token" });
    res.status(401).json({ msg: "Authentication failed" });
  }
};

export const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({msg:"Not authenticated"});
  if (!roles.includes(req.user.role)) return res.status(403).json({msg:"Forbidden"});
  next();
};
