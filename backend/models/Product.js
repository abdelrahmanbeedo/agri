import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String], // array of URLs
      default: [],
    },

    video: {
      type: String, // single video URL
      default: null,
    },

    ai_grade: {
      type: {
        grade: { type: String, enum: ["Grade A", "Grade C"] },
        fruit: String,
        confidence: Number,
      },
      default: null,
    },

    price_per_unit: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    unit: {
      type: String, // kg, ton, crate, piece...
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export default mongoose.model("Product", productSchema);
