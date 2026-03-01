import { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getUploadDir,
  getMaxVideoSize,
  getMaxFileSize,
  isAllowedByExtension,
  isVideoByExtension,
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
  limits: { fileSize: getMaxVideoSize() }, // video dưới 5 phút
  fileFilter: (_req, file, cb) => {
    if (!isAllowedByExtension(file.originalname)) {
      return cb(new Error('Loại tệp không được phép. Cho phép: ảnh, video (dưới 5 phút), âm thanh, PDF, Excel, Word, PowerPoint, ZIP, v.v.'));
    }
    cb(null, true);
  },
});

function enforceNonVideoSize(req: Request, res: Response, next: () => void) {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) return next();
  if (isVideoByExtension(file.originalname)) return next();
  if (file.size <= getMaxFileSize()) return next();
  fs.unlink(path.join(getUploadDir(), file.filename), () => {});
  res.status(400).json({ error: 'Tệp không phải video vượt quá 25MB' });
}

const router = Router();

const MAX_FILES = 10;

router.post('/single', upload.single('file') as unknown as RequestHandler, enforceNonVideoSize, (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có tệp được gửi' });
  }
  const url = getPublicPath(req.file.filename);
  res.json({ url, name: req.file.originalname, filename: req.file.filename });
});

function enforceNonVideoSizeMulti(req: Request, res: Response, next: () => void) {
  const files = (req as Request & { files?: Express.Multer.File[] }).files;
  if (!files?.length) return next();
  const maxNonVideo = getMaxFileSize();
  for (const file of files) {
    if (!isVideoByExtension(file.originalname) && file.size > maxNonVideo) {
      files.forEach((f) => fs.unlink(path.join(getUploadDir(), f.filename), () => {}));
      return res.status(400).json({ error: 'Tệp không phải video vượt quá 25MB' });
    }
  }
  next();
}

router.post('/', upload.array('files', MAX_FILES) as unknown as RequestHandler, enforceNonVideoSizeMulti, (req: Request, res: Response) => {
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
