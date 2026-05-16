import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createReview(req, res) {
  try {
    const { product_id, order_id, rating, comment } = req.body;

    if (!product_id || !order_id || !rating) {
      return res.status(400).json({ error: 'product_id, order_id, and rating are required' });
    }
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const order = await Order.findById(order_id).populate('product_id');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the buyer can review this order' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed orders' });
    }

    const existing = await Review.findOne({ order_id });
    if (existing) return res.status(400).json({ error: 'You have already reviewed this order' });

    const review = new Review({
      product_id,
      order_id,
      reviewer_id: req.user.id,
      farmer_id: order.seller_id,
      rating,
      comment: comment || ''
    });

    await review.save();
    await review.populate('reviewer_id', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
}

export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product_id: productId })
      .populate('reviewer_id', 'name avatar')
      .sort({ created_at: -1 });

    const stats = await Review.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      stats: stats[0] || { avgRating: 0, count: 0 }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
}

export async function getFarmerReviews(req, res) {
  try {
    const { farmerId } = req.params;
    const reviews = await Review.find({ farmer_id: farmerId })
      .populate('reviewer_id', 'name avatar')
      .populate('product_id', 'title')
      .sort({ created_at: -1 });

    const stats = await Review.aggregate([
      { $match: { farmer_id: new mongoose.Types.ObjectId(farmerId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      stats: stats[0] || { avgRating: 0, count: 0 }
    });
  } catch (error) {
    console.error('Get farmer reviews error:', error);
    res.status(500).json({ error: 'Failed to get farmer reviews' });
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.reviewer_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
}
