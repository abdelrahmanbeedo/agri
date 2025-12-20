import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    unique: true,
  },
  
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  
  payment_method: {
    type: String,
    enum: ["cash", "bank_transfer", "mobile_payment", "wallet", "other"],
    default: "cash",
  },
  
  payment_reference: {
    type: String,
    default: "",
  },
  
  // Transaction metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  completed_at: {
    type: Date,
    default: null,
  },
  
  created_at: {
    type: Date,
    default: Date.now,
  },
  
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
transactionSchema.index({ buyer_id: 1, created_at: -1 });
transactionSchema.index({ seller_id: 1, created_at: -1 });
transactionSchema.index({ status: 1 });

export default mongoose.model("Transaction", transactionSchema);

