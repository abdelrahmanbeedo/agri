import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Negotiation from '../models/Negotiation.js';
import Message from '../models/Message.js';

export async function getDashboardStats(req, res) {
  try {
    const [
      totalUsers, farmers, traders, totalProducts,
      activeProducts, totalOrders, pendingOrders,
      completedOrders, totalNegotiations, activeNegotiations,
      totalMessages, unreadMessages, recentOrders, recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'trader' }),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'completed' }),
      Negotiation.countDocuments(),
      Negotiation.countDocuments({ status: 'active' }),
      Message.countDocuments(),
      Message.countDocuments({ is_read: false }),
      Order.find().sort({ created_at: -1 }).limit(5).populate('buyer_id', 'name email').populate('seller_id', 'name email').populate('product_id', 'title'),
      User.find().sort({ created_at: -1 }).limit(5).select('-password_hash')
    ]);

    res.json({
      users: { total: totalUsers, farmers, traders },
      products: { total: totalProducts, active: activeProducts },
      orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders },
      negotiations: { total: totalNegotiations, active: activeNegotiations },
      messages: { total: totalMessages, unread: unreadMessages },
      recentOrders,
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
}

export async function getAllUsers(req, res) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(query)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

export async function getAllProducts(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .populate('farmer_id', 'name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
}

export async function deleteProductAdmin(req, res) {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

export async function getAllOrders(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const orders = await Order.find(query)
      .populate('buyer_id', 'name email')
      .populate('seller_id', 'name email')
      .populate('product_id', 'title')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
}

export async function updateOrderStatusAdmin(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(orderId, { status, updated_at: new Date() }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

export async function getAllNegotiations(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const negotiations = await Negotiation.find(query)
      .populate('farmer_id', 'name email')
      .populate('trader_id', 'name email')
      .populate('product_id', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Negotiation.countDocuments(query);

    res.json({ negotiations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get negotiations error:', error);
    res.status(500).json({ error: 'Failed to get negotiations' });
  }
}

export async function getSystemLogs(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await Message.find()
      .populate('sender_id', 'name email')
      .populate('receiver_id', 'name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Message.countDocuments();
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
}
