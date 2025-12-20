import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
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
  
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  
  unit_price: {
    type: Number,
    required: true,
    min: 0,
  },
  
  total_price: {
    type: Number,
    required: true,
    min: 0,
  },
  
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  
  // Delivery/Shipping info
  delivery_address: {
    type: String,
    default: "",
  },
  
  delivery_date: {
    type: Date,
    default: null,
  },
  
  // Notes from buyer
  buyer_notes: {
    type: String,
    default: "",
  },
  
  // Notes from seller
  seller_notes: {
    type: String,
    default: "",
  },
  
  // Transaction reference
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
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

// Indexes for faster queries
orderSchema.index({ buyer_id: 1, created_at: -1 });
orderSchema.index({ seller_id: 1, created_at: -1 });
orderSchema.index({ product_id: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model("Order", orderSchema);

