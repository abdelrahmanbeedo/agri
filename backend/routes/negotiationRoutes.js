const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createNegotiation,
  getNegotiation,
  submitOffer,
  respondToOffer,
  getUserNegotiations,
  closeNegotiation
} = require('../controllers/negotiationController');

router.post('/', protect, createNegotiation);

router.get('/', protect, getUserNegotiations);

router.get('/:negotiationId', protect, getNegotiation);

router.post('/:negotiationId/offer', protect, submitOffer);

router.post('/:negotiationId/respond', protect, respondToOffer);

router.post('/:negotiationId/close', protect, closeNegotiation);

module.exports = router;
