import mongoose from "mongoose";

const aigradeSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  grade: { type: String, enum: ["Grade A", "Grade C"] },
  fruit: String,
  confidence: Number,
  grade_confidence: Object,
  full_response: Object,
}, { timestamps: true });

export default mongoose.model("Aigrade", aigradeSchema);
