import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

export default router;
