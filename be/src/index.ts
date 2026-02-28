import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ensureUploadDir } from './services/upload.service';
import apiRoutes from './routes';
import { registerChatHandler } from './socket/chat.handler';

ensureUploadDir();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.PORT || 3002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', apiRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms - ${req.ip}`);
  });
  next();
});

registerChatHandler(io);

server.listen(PORT, () => {
  console.log(`Server is running (HTTP+WebSocket) on port ${PORT}`);
});
