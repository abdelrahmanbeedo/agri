import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { product_id, quantity, delivery_address, buyer_notes } = req.body;
    const buyerId = req.user.id;

    // Validation
    if (!product_id || !quantity) {
      return res.status(400).json({ msg: "Product ID and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ msg: "Quantity must be greater than 0" });
    }

    // Get product
    const product = await Product.findById(product_id)
      .populate("farmer_id", "name email");
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (product.status !== "active") {
      return res.status(400).json({ msg: "Product is not available for purchase" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ 
        msg: `Insufficient quantity. Available: ${product.quantity} ${product.unit}` 
      });
    }

    // Check if buyer is not the seller
    if (product.farmer_id._id.toString() === buyerId) {
      return res.status(400).json({ msg: "Cannot order your own product" });
    }

    // Calculate prices
    const unitPrice = product.price_per_unit;
    const totalPrice = unitPrice * quantity;

    // Create order
    const order = new Order({
      buyer_id: buyerId,
      seller_id: product.farmer_id._id,
      product_id: product_id,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      delivery_address: delivery_address || "",
      buyer_notes: buyer_notes || "",
      status: "pending",
    });

    await order.save();
    await order.populate("buyer_id", "name email");
    await order.populate("seller_id", "name email");
    await order.populate("product_id");

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get orders for current user (as buyer or seller)
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // 'buyer' or 'seller'

    let query = {};
    if (role === "buyer") {
      query.buyer_id = userId;
    } else if (role === "seller") {
      query.seller_id = userId;
    } else {
      // Get all orders where user is buyer or seller
      query.$or = [
        { buyer_id: userId },
        { seller_id: userId }
      ];
    }

    const orders = await Order.find(query)
      .populate("buyer_id", "name email")
      .populate("seller_id", "name email")
      .populate("product_id", "title price_per_unit unit images")
      .populate("transaction_id")
      .sort({ created_at: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate("buyer_id", "name email")
      .populate("seller_id", "name email")
      .populate("product_id")
      .populate("transaction_id");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Verify user is buyer or seller
    if (order.buyer_id._id.toString() !== userId && 
        order.seller_id._id.toString() !== userId) {
      return res.status(403).json({ msg: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Update order status (seller can accept/reject, buyer can cancel)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, seller_notes } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const order = await Order.findById(orderId)
      .populate("product_id");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Authorization checks
    const isSeller = order.seller_id.toString() === userId;
    const isBuyer = order.buyer_id.toString() === userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ msg: "Not authorized to update this order" });
    }

    // Status transition rules
    if (status === "accepted" || status === "rejected") {
      if (!isSeller) {
        return res.status(403).json({ msg: "Only seller can accept or reject orders" });
      }
      if (order.status !== "pending") {
        return res.status(400).json({ msg: "Can only accept/reject pending orders" });
      }
    }

    if (status === "cancelled") {
      if (!isBuyer) {
        return res.status(403).json({ msg: "Only buyer can cancel orders" });
      }
      if (order.status === "completed") {
        return res.status(400).json({ msg: "Cannot cancel completed orders" });
      }
    }

    if (status === "completed") {
      if (!isSeller) {
        return res.status(403).json({ msg: "Only seller can mark orders as completed" });
      }
      if (order.status !== "accepted") {
        return res.status(400).json({ msg: "Can only complete accepted orders" });
      }
    }

    // Update order
    order.status = status;
    order.updated_at = new Date();
    
    if (seller_notes && isSeller) {
      order.seller_notes = seller_notes;
    }

    // If accepted, reduce product quantity
    if (status === "accepted" && order.product_id) {
      const product = await Product.findById(order.product_id._id);
      if (product.quantity < order.quantity) {
        return res.status(400).json({ msg: "Insufficient product quantity" });
      }
      product.quantity -= order.quantity;
      if (product.quantity === 0) {
        product.status = "sold";
      }
      await product.save();
    }

    await order.save();
    await order.populate("buyer_id", "name email");
    await order.populate("seller_id", "name email");
    await order.populate("product_id");

    res.json(order);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Create transaction for an order
export const createTransaction = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_method, payment_reference, metadata } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Only buyer can create transaction
    if (order.buyer_id.toString() !== userId) {
      return res.status(403).json({ msg: "Only buyer can create transaction" });
    }

    // Order must be accepted
    if (order.status !== "accepted") {
      return res.status(400).json({ msg: "Order must be accepted before creating transaction" });
    }

    // Check if transaction already exists
    if (order.transaction_id) {
      return res.status(400).json({ msg: "Transaction already exists for this order" });
    }

    // Create transaction
    const transaction = new Transaction({
      order_id: orderId,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      amount: order.total_price,
      payment_method: payment_method || "cash",
      payment_reference: payment_reference || "",
      metadata: metadata || {},
      status: "pending",
    });

    await transaction.save();

    // Link transaction to order
    order.transaction_id = transaction._id;
    await order.save();

    await transaction.populate("order_id");
    await transaction.populate("buyer_id", "name email");
    await transaction.populate("seller_id", "name email");

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Create transaction error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const validStatuses = ["pending", "processing", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate("order_id");

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    // Only buyer or seller can update
    const isBuyer = transaction.buyer_id.toString() === userId;
    const isSeller = transaction.seller_id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ msg: "Not authorized to update this transaction" });
    }

    transaction.status = status;
    transaction.updated_at = new Date();

    if (status === "completed") {
      transaction.completed_at = new Date();
    }

    await transaction.save();
    await transaction.populate("buyer_id", "name email");
    await transaction.populate("seller_id", "name email");

    res.json(transaction);
  } catch (err) {
    console.error("Update transaction error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get transactions for current user
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [
        { buyer_id: userId },
        { seller_id: userId }
      ]
    })
      .populate("order_id")
      .populate("buyer_id", "name email")
      .populate("seller_id", "name email")
      .sort({ created_at: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

