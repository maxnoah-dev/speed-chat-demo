import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getUploadDir,
  getMaxVideoSize,
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
  limits: { fileSize: getMaxVideoSize() }, // 50MB để cho phép video dưới 1 phút
  fileFilter: (_req, file, cb) => {
    if (!isAllowedMime(file.mimetype)) {
      return cb(new Error('Loại tệp không được phép'));
    }
    cb(null, true);
  },
});

const router = Router();

const MAX_FILES = 10;

router.post('/single', upload.single('file') as unknown as RequestHandler, (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có tệp được gửi' });
  }
  const url = getPublicPath(req.file.filename);
  res.json({ url, name: req.file.originalname, filename: req.file.filename });
});

router.post('/', upload.array('files', MAX_FILES) as unknown as RequestHandler, (req: Request, res: Response) => {
  const files = (req as Request & { files?: Express.Multer.File[] }).files;
  if (!files?.length) {
    return res.status(400).json({ error: 'Không có tệp được gửi' });
  }
  const items = files.map((f) => ({
    url: getPublicPath(f.filename),
    name: f.originalname,
    filename: f.filename,
  }));
  res.json({ items });
});

export default router;
