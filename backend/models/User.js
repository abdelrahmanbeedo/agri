import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["farmer","trader","admin"], required: true },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  avatar: { type: String, default: "" },
  wallet_address: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
