const Negotiation = require('../models/Negotiation');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { getMarketData, calculateOfferAnalysis } = require('../utils/marketPrices');

const BENCHMARK_THRESHOLD = 0.4;

exports.createNegotiation = async (req, res) => {
  try {
    const { product_id, ask_price, ask_quantity } = req.body;
    const trader_id = req.user.id;

    const product = await Product.findById(product_id).populate('farmer_id');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmer_id._id.toString() === trader_id) {
      return res.status(400).json({ error: 'Cannot negotiate on your own product' });
    }

    const existingNegotiation = await Negotiation.findOne({
      product_id,
      trader_id,
      status: 'active'
    });

    if (existingNegotiation) {
      return res.status(400).json({ error: 'Active negotiation already exists for this product' });
    }

    const marketData = getMarketData(product.category, product.title);

    if (ask_price < marketData.min) {
      return res.status(400).json({ 
        error: 'Asking price is below market benchmark',
        warning: true,
        marketData
      });
    }

    const negotiation = new Negotiation({
      product_id,
      farmer_id: product.farmer_id._id,
      trader_id,
      farmer_ask_price: ask_price || product.price_per_unit,
      farmer_ask_quantity: ask_quantity || product.quantity,
      current_round: 0,
      current_turn: 'trader',
      last_activity: new Date()
    });

    await negotiation.save();

    const populatedNegotiation = await Negotiation.findById(negotiation._id)
      .populate('farmer_id', 'name email')
      .populate('trader_id', 'name email')
      .populate('product_id');

    const farmerProfile = await User.findById(product.farmer_id._id);
    const traderProfile = await User.findById(trader_id);

    const sessionData = {
      negotiation: populatedNegotiation,
      marketData,
      farmerProfile: {
        name: farmerProfile.name,
        email: farmerProfile.email,
        rating: farmerProfile.rating || 4.5,
        totalDeals: farmerProfile.totalDeals || 0,
        verified: farmerProfile.role === 'farmer'
      },
      traderProfile: {
        name: traderProfile.name,
        email: traderProfile.email,
        rating: traderProfile.rating || 4.0,
        totalDeals: traderProfile.totalDeals || 0,
        verified: traderProfile.role === 'trader'
      }
    };

    res.status(201).json({
      success: true,
      session_id: negotiation._id,
      session: sessionData,
      event: 'session_open'
    });
  } catch (error) {
    console.error('Create negotiation error:', error);
    res.status(500).json({ error: 'Failed to create negotiation session' });
  }
};

exports.getNegotiation = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const userId = req.user.id;

    const negotiation = await Negotiation.findById(negotiationId)
      .populate('farmer_id', 'name email')
      .populate('trader_id', 'name email')
      .populate('product_id');

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    if (negotiation.farmer_id._id.toString() !== userId && 
        negotiation.trader_id._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const product = await Product.findById(negotiation.product_id._id);
    const marketData = getMarketData(product.category, product.title);

    let lastOffer = null;
    if (negotiation.offers.length > 0) {
      lastOffer = negotiation.offers[negotiation.offers.length - 1];
      lastOffer.analysis = calculateOfferAnalysis(
        lastOffer.price_per_unit,
        negotiation.farmer_ask_price,
        marketData.avg,
        lastOffer.quantity
      );
    }

    res.json({
      negotiation,
      marketData,
      lastOffer,
      rounds_remaining: negotiation.max_rounds - negotiation.current_round,
      current_turn: negotiation.current_turn,
      user_role: negotiation.farmer_id._id.toString() === userId ? 'farmer' : 'trader'
    });
  } catch (error) {
    console.error('Get negotiation error:', error);
    res.status(500).json({ error: 'Failed to get negotiation' });
  }
};

exports.submitOffer = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { 
      price_per_unit, 
      quantity, 
      delivery_date,
      delivery_address,
      payment_terms,
      payment_window_days,
      special_conditions,
      notes
    } = req.body;
    const userId = req.user.id;

    const negotiation = await Negotiation.findById(negotiationId)
      .populate('product_id');

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is not active' });
    }

    const isTrader = negotiation.trader_id.toString() === userId;
    const isFarmer = negotiation.farmer_id.toString() === userId;

    if (!isTrader && !isFarmer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (negotiation.current_turn === 'trader' && !isTrader) {
      return res.status(400).json({ error: "Waiting for trader's offer" });
    }

    if (negotiation.current_turn === 'farmer' && !isFarmer) {
      return res.status(400).json({ error: "Waiting for farmer's response" });
    }

    const marketData = getMarketData(negotiation.product_id.category, negotiation.product_id.title);
    const offerAnalysis = calculateOfferAnalysis(
      price_per_unit,
      negotiation.farmer_ask_price,
      marketData.avg,
      quantity
    );

    if (offerAnalysis.isLowBall && isTrader) {
      return res.status(400).json({
        error: 'Offer flagged as significantly below market rates',
        flag: true,
        offerAnalysis,
        requireAcknowledgment: true,
        message: 'This offer is more than 40% below market benchmark. The farmer may reject it. Do you want to proceed anyway?'
      });
    }

    const offer = {
      party: userId,
      price_per_unit: Number(price_per_unit),
      quantity: Number(quantity),
      total_value: Number(price_per_unit) * Number(quantity),
      delivery_date: new Date(delivery_date),
      delivery_address: delivery_address || '',
      payment_terms: payment_terms || 'cash',
      payment_window_days: payment_window_days || 7,
      special_conditions: special_conditions || '',
      notes: notes || '',
      submitted_at: new Date()
    };

    negotiation.offers.push(offer);
    negotiation.last_activity = new Date();

    if (isTrader) {
      negotiation.current_round += 1;
      negotiation.current_turn = 'farmer';
    } else {
      negotiation.current_turn = 'trader';
    }

    await negotiation.save();

    res.json({
      success: true,
      offer: offer,
      analysis: offerAnalysis,
      rounds_remaining: negotiation.max_rounds - negotiation.current_round,
      current_round: negotiation.current_round,
      current_turn: negotiation.current_turn,
      event: 'offer_submitted'
    });
  } catch (error) {
    console.error('Submit offer error:', error);
    res.status(500).json({ error: 'Failed to submit offer' });
  }
};

exports.respondToOffer = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { action, counter_price, counter_quantity, counter_delivery_date, counter_payment_terms, message } = req.body;
    const userId = req.user.id;

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    if (negotiation.farmer_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the farmer can respond to offers' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is not active' });
    }

    if (negotiation.current_turn !== 'farmer') {
      return res.status(400).json({ error: 'Not your turn to respond' });
    }

    const lastOffer = negotiation.offers[negotiation.offers.length - 1];
    if (!lastOffer || lastOffer.party.toString() !== negotiation.trader_id.toString()) {
      return res.status(400).json({ error: 'No trader offer to respond to' });
    }

    if (action === 'accept') {
      negotiation.status = 'accepted';
      negotiation.accepted_price = lastOffer.price_per_unit;
      negotiation.accepted_quantity = lastOffer.quantity;
      negotiation.accepted_total = lastOffer.total_value;
      negotiation.accepted_delivery_date = lastOffer.delivery_date;
      negotiation.accepted_payment_terms = lastOffer.payment_terms;
      negotiation.closed_at = new Date();
      negotiation.closed_reason = 'accepted';
      negotiation.early_agreement_bonus = negotiation.current_round <= 2;
      negotiation.deal_id = negotiation.generateDealId();

      await negotiation.updateProductQuantity(lastOffer.quantity);

      await negotiation.save();

      await this.createOrderFromNegotiation(negotiation, lastOffer);

      return res.json({
        success: true,
        event: 'deal_confirmed',
        deal_id: negotiation.deal_id,
        final_terms: {
          price: negotiation.accepted_price,
          quantity: negotiation.accepted_quantity,
          total: negotiation.accepted_total,
          delivery_date: negotiation.accepted_delivery_date,
          payment_terms: negotiation.accepted_payment_terms
        },
        early_bonus: negotiation.early_agreement_bonus,
        message: negotiation.early_agreement_bonus 
          ? 'Early Agreement Bonus: Both parties earn +5 reputation points!'
          : 'Deal confirmed successfully.'
      });
    }

    if (action === 'reject') {
      negotiation.status = 'rejected';
      negotiation.closed_at = new Date();
      negotiation.closed_reason = 'rejected';
      await negotiation.save();

      return res.json({
        success: true,
        event: 'session_closed',
        reason: 'rejected',
        message: 'Offer declined. The session has been closed.'
      });
    }

    if (action === 'counter') {
      const counterOffer = {
        party: userId,
        price_per_unit: Number(counter_price),
        quantity: Number(counter_quantity) || lastOffer.quantity,
        total_value: Number(counter_price) * (Number(counter_quantity) || lastOffer.quantity),
        delivery_date: new Date(counter_delivery_date || lastOffer.delivery_date),
        delivery_address: lastOffer.delivery_address,
        payment_terms: counter_payment_terms || lastOffer.payment_terms,
        notes: message || '',
        submitted_at: new Date()
      };

      negotiation.offers.push(counterOffer);
      negotiation.current_turn = 'trader';
      negotiation.last_activity = new Date();
      await negotiation.save();

      const marketData = getMarketData();
      const analysis = calculateOfferAnalysis(
        counter_price,
        negotiation.farmer_ask_price,
        marketData.avg,
        counterOffer.quantity
      );

      const closeThreshold = 0.05;
      const diffPercent = Math.abs(counter_price - lastOffer.price_per_unit) / lastOffer.price_per_unit;
      const nudge = diffPercent <= closeThreshold 
        ? { type: 'close_to_deal', message: "You're very close — consider accepting." }
        : null;

      return res.json({
        success: true,
        counter_offer: counterOffer,
        analysis,
        nudge,
        rounds_remaining: negotiation.max_rounds - negotiation.current_round,
        current_round: negotiation.current_round,
        current_turn: 'trader',
        event: 'counter_submitted'
      });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Respond to offer error:', error);
    res.status(500).json({ error: 'Failed to respond to offer' });
  }
};

exports.createOrderFromNegotiation = async (negotiation, finalOffer) => {
  try {
    const order = new Order({
      product_id: negotiation.product_id,
      buyer_id: negotiation.trader_id,
      seller_id: negotiation.farmer_id,
      quantity: finalOffer.quantity,
      unit_price: finalOffer.price_per_unit,
      total_price: finalOffer.total_value,
      status: 'accepted',
      delivery_address: finalOffer.delivery_address || '',
      buyer_notes: `Negotiation Deal ID: ${negotiation.deal_id}`
    });

    await order.save();
    return order;
  } catch (error) {
    console.error('Create order from negotiation error:', error);
    throw error;
  }
};

exports.getUserNegotiations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, role } = req.query;

    const query = {
      $or: [
        { farmer_id: userId },
        { trader_id: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    let negotiations = await Negotiation.find(query)
      .populate('farmer_id', 'name email')
      .populate('trader_id', 'name email')
      .populate('product_id', 'title images category price_per_unit')
      .sort({ last_activity: -1 });

    if (role === 'farmer') {
      negotiations = negotiations.filter(n => n.farmer_id._id.toString() === userId);
    } else if (role === 'trader') {
      negotiations = negotiations.filter(n => n.trader_id._id.toString() === userId);
    }

    const formattedNegotiations = negotiations.map(n => ({
      _id: n._id,
      product: n.product_id,
      farmer: n.farmer_id,
      trader: n.trader_id,
      status: n.status,
      current_round: n.current_round,
      max_rounds: n.max_rounds,
      farmer_ask_price: n.farmer_ask_price,
      last_offer: n.offers.length > 0 ? n.offers[n.offers.length - 1] : null,
      deal_id: n.deal_id,
      early_agreement_bonus: n.early_agreement_bonus,
      last_activity: n.last_activity,
      createdAt: n.createdAt,
      user_role: n.farmer_id._id.toString() === userId ? 'farmer' : 'trader'
    }));

    res.json(formattedNegotiations);
  } catch (error) {
    console.error('Get user negotiations error:', error);
    res.status(500).json({ error: 'Failed to get negotiations' });
  }
};

exports.closeNegotiation = async (req, res) => {
  try {
    const { negotiationId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    if (negotiation.farmer_id.toString() !== userId && negotiation.trader_id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is already closed' });
    }

    negotiation.status = reason === 'cancelled' ? 'cancelled' : 'expired';
    negotiation.closed_at = new Date();
    negotiation.closed_reason = reason || 'expired';

    await negotiation.save();

    res.json({
      success: true,
      event: 'session_closed',
      reason: negotiation.closed_reason,
      offer_history: negotiation.offers,
      message: 'Session closed successfully.'
    });
  } catch (error) {
    console.error('Close negotiation error:', error);
    res.status(500).json({ error: 'Failed to close negotiation' });
  }
};

Negotiation.prototype.updateProductQuantity = async function(orderedQuantity) {
  const product = await Product.findById(this.product_id);
  if (product) {
    product.quantity -= orderedQuantity;
    if (product.quantity <= 0) {
      product.status = 'sold';
      product.quantity = 0;
    }
    await product.save();
  }
};
