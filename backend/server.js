require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Fail fast if critical secrets are missing rather than silently
// running with an insecure fallback.
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// ======================
// FRONTEND URLS
// ======================

const FRONTEND_URLS = [
  'http://localhost:5173',
  'https://hostelx-frontend.onrender.com',
  'https://hostelx-pi.vercel.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : [])
];

// ======================
// SOCKET.IO
// ======================

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ======================
// MIDDLEWARE
// ======================

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (no origin header) and configured origins only
    if (!origin || FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
// Workaround for express-mongo-sanitize on Express 5:
// express-mongo-sanitize middleware tries to reassign req.query, which
// throws a TypeError in Express 5. We sanitize in-place instead.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// General API rate limit — generous enough for normal browsing,
// tight enough to blunt brute force / scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Tighter limit specifically on auth to slow down credential/email guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ======================
// DATABASE CONNECTION
// ======================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Log MongoDB connection lifecycle events for diagnostics.
mongoose.connection.on('connected', () => {
  console.log(`[MongoDB] Connected (readyState: ${mongoose.connection.readyState})`);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`[MongoDB] Disconnected (readyState: ${mongoose.connection.readyState})`);
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err.message);
});

// ======================
// SOCKET CONNECTION
// ======================

io.on('connection', (socket) => {

  console.log('User Connected:', socket.id);

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
  });

  socket.on('new message', (newMessageReceived) => {

    const chat = newMessageReceived.chat;

    if (!chat.participants) return;

    chat.participants.forEach((user) => {

      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });
  socket.on('typing', (room) => {
    socket.in(room).emit('typing');
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing');
  });

  socket.on('messages read', ({ chatId, userId }) => {
    socket.in(chatId).emit('messages read', {
      chatId,
      userId,
    });
  });
  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
  });
});


const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);

// ======================
// TEST ROUTE
// ======================

app.get('/', (req, res) => {
  res.send('HostelX API is running...');
});

// ======================
// 404 + CENTRAL ERROR HANDLER
// ======================

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('========== CENTRAL ERROR HANDLER ==========');
  console.error(err.stack || err.message);
  console.error('=========================================');

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message, // Return the actual error temporarily
  });
});

// ======================
// START SERVER
// ======================
// Connect to MongoDB FIRST, then start the HTTP server.
// This prevents Mongoose operation-buffering timeouts (the
// "users.findOne() buffering timed out after 10000ms" error)
// that occur when requests arrive before the DB is ready.

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected Successfully');
    console.log(`[MongoDB] readyState: ${mongoose.connection.readyState}, host: ${mongoose.connection.host}, db: ${mongoose.connection.name}`);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

startServer();