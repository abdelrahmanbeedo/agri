import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true }, // follow your schema field
  role: { type: String, enum: ["farmer","trader","admin"], required: true },
  wallet_address: { type: String, default: "" },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
