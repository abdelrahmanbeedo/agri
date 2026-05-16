import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import upload, { cloudinary } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.message?.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size must be under 5MB' });
      }
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'agrimarket',
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      res.json({ url: result.secure_url, filename: result.public_id });
    } catch (cloudErr) {
      console.error('Cloudinary upload error:', cloudErr);
      res.status(500).json({ error: 'Upload failed', detail: cloudErr.message });
    }
  });
});

export default router;
