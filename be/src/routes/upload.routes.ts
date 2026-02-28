import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getUploadDir,
  getMaxFileSize,
  isAllowedMime,
  getPublicPath,
  ensureUploadDir,
} from '../services/upload.service';

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + ext;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: getMaxFileSize() },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedMime(file.mimetype)) {
      return cb(new Error('Loại tệp không được phép'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có tệp được gửi' });
  }
  const url = getPublicPath(req.file.filename);
  res.json({
    url,
    name: req.file.originalname,
    filename: req.file.filename,
  });
});

export default router;
