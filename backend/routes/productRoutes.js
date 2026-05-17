import express from "express";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create product
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, price_per_unit, quantity, description, category, unit, images, video, ai_grade_id } = req.body;

    // Validation
    if (!title || !price_per_unit || !quantity || !category || !unit) {
      return res.status(400).json({ msg: "Missing required fields: title, price_per_unit, quantity, category, unit" });
    }

    // Ensure user is a farmer
    if (req.user.role !== "farmer") {
      return res.status(403).json({ msg: "Only farmers can create products" });
    }

    const product = new Product({
      farmer_id: req.user.id,
      title,
      price_per_unit: Number(price_per_unit),
      quantity: Number(quantity),
      description: description || "",
      category,
      unit,
      images: images || [],
      video: video || null,
      status: "active",
      ai_grade_id: ai_grade_id || null,
    });

    await product.save();
    await product.populate("farmer_id", "name email");
    if (product.ai_grade_id) {
      await product.populate("ai_grade_id");
    }

    res.status(201).json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get products for logged in farmer
router.get("/my-products", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ msg: "Only farmers can view their products" });
    }

    const products = await Product.find({ farmer_id: req.user.id })
      .populate("farmer_id", "name email")
      .populate("ai_grade_id")
      .sort({ created_at: -1 });
    
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get all active products (for traders)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
      .populate("farmer_id", "name email")
      .populate("ai_grade_id")
      .sort({ created_at: -1 });
    
    res.json(products);
  } catch (err) {
    console.error("Fetch all products error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmer_id", "name email")
      .populate("ai_grade_id");
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json(product);
  } catch (err) {
    console.error("Fetch product error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update product (only by owner)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if user owns the product
    if (product.farmer_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only update your own products" });
    }

    const { title, price_per_unit, quantity, description, category, unit, status } = req.body;
    
    if (title) product.title = title;
    if (price_per_unit !== undefined) product.price_per_unit = Number(price_per_unit);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (status) product.status = status;

    await product.save();
    await product.populate("farmer_id", "name email");

    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Delete product (only by owner)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if user owns the product
    if (product.farmer_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "You can only delete your own products" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
