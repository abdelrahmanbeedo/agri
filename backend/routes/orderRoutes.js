import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  createTransaction,
  updateTransactionStatus,
  getTransactions,
} from "../controllers/orderController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Create a new order
router.post("/", createOrder);

// Get orders (with optional role filter: ?role=buyer or ?role=seller)
router.get("/", getOrders);

// Get single order
router.get("/:orderId", getOrder);

// Update order status
router.put("/:orderId/status", updateOrderStatus);

// Create transaction for an order
router.post("/:orderId/transaction", createTransaction);

// Get transactions
router.get("/transactions/all", getTransactions);

// Update transaction status
router.put("/transactions/:transactionId/status", updateTransactionStatus);

export default router;

