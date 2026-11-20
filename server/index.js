const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const aiRoutes = require('./routes/aiRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const server = http.createServer(app);

// 🎯 1. CLEAN SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set('io', io);

// 🎯 2. THE ONLY CORS BLOCK YOU NEED
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning", "x-requested-with"]
}));

// 🎯 3. TUNNEL & PREFLIGHT FIX
app.use((req, res, next) => {
  res.header("ngrok-skip-browser-warning", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 4. DB & ROUTES (Keep your existing connection and app.use routes here)
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('✅ ELITE-EVENTS: ACTIVE!');
});

app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('EliteEvents API is running smoothly! 🚀');
});

server.listen(5001, () => console.log(`🚀 Server on: http://localhost:5001`));