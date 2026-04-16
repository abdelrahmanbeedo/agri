import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price_per_unit: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  total_value: {
    type: Number,
    required: true
  },
  delivery_date: {
    type: Date,
    required: true
  },
  delivery_address: {
    type: String,
    default: ''
  },
  payment_terms: {
    type: String,
    enum: ['cash', 'credit', 'escrow'],
    default: 'cash'
  },
  payment_window_days: {
    type: Number,
    default: 7
  },
  special_conditions: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
});

const negotiationSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  farmer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trader_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'active'
  },
  current_round: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  max_rounds: {
    type: Number,
    default: 3
  },
  current_turn: {
    type: String,
    enum: ['trader', 'farmer'],
    default: 'trader'
  },
  farmer_ask_price: {
    type: Number,
    required: true
  },
  farmer_ask_quantity: {
    type: Number,
    required: true
  },
  accepted_quantity: {
    type: Number,
    default: null
  },
  accepted_price: {
    type: Number,
    default: null
  },
  accepted_total: {
    type: Number,
    default: null
  },
  accepted_delivery_date: {
    type: Date,
    default: null
  },
  accepted_payment_terms: {
    type: String,
    default: null
  },
  offers: [offerSchema],
  deal_id: {
    type: String,
    default: null
  },
  closed_at: {
    type: Date,
    default: null
  },
  closed_reason: {
    type: String,
    enum: ['accepted', 'rejected', 'expired', 'cancelled', null],
    default: null
  },
  early_agreement_bonus: {
    type: Boolean,
    default: false
  },
  last_activity: {
    type: Date,
    default: Date.now
  },
  is_paused: {
    type: Boolean,
    default: false
  },
  paused_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

negotiationSchema.index({ farmer_id: 1, trader_id: 1 });
negotiationSchema.index({ product_id: 1 });
negotiationSchema.index({ status: 1 });

negotiationSchema.methods.generateDealId = function() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DEAL-${timestamp}-${random}`;
};

const Negotiation = mongoose.model('Negotiation', negotiationSchema);
export default Negotiation;
