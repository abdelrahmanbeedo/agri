import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createReview,
  getProductReviews,
  getFarmerReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/farmer/:farmerId', getFarmerReviews);
router.post('/', requireAuth, createReview);
router.delete('/:reviewId', requireAuth, deleteReview);

export default router;
