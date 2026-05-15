import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  getAllOrders,
  updateOrderStatusAdmin,
  getAllNegotiations,
  getSystemLogs
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth, requireRole(['admin']));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.get('/products', getAllProducts);
router.delete('/products/:productId', deleteProductAdmin);
router.get('/orders', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatusAdmin);
router.get('/negotiations', getAllNegotiations);
router.get('/logs', getSystemLogs);

export default router;
