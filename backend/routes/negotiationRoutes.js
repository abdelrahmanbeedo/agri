import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createNegotiation,
  getNegotiation,
  submitOffer,
  respondToOffer,
  getUserNegotiations,
  closeNegotiation
} from '../controllers/negotiationController.js';

const router = express.Router();

router.post('/', requireAuth, createNegotiation);

router.get('/', requireAuth, getUserNegotiations);

router.get('/:negotiationId', requireAuth, getNegotiation);

router.post('/:negotiationId/offer', requireAuth, submitOffer);

router.post('/:negotiationId/respond', requireAuth, respondToOffer);

router.post('/:negotiationId/close', requireAuth, closeNegotiation);

export default router;
