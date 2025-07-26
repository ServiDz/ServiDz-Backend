require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./routes/auth');
const taskerRoutes = require('./routes/taskerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatSocket = require('./sockets/chatSocket');
const { setSocketIO } = require('./controllers/chatController'); // ✅ add this

const app = express();
const server = http.createServer(app); // ✅ HTTP server

// Connect to MongoDB
connectDB();

// Attach socket.io to the server
const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with actual domain in production
    methods: ["GET", "POST"]
  }
});

setSocketIO(io); // ✅ allow controller to emit socket events
chatSocket(io);  // ✅ setup socket event handlers

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/taskers', taskerRoutes);
app.use('/api/chat', chatRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
