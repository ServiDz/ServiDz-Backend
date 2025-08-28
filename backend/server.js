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
const chatController = require('./controllers/chatController'); 
const profileRoutes = require('./routes/profile');
const bookingRoutes = require('./routes/bookingRoutes');
const taskerAuthRoutes = require('./routes/taskerAuth');
const taskerProfileRoutes = require("./routes/taskerProfileRoute");
const notificationRoutes = require('./routes/notificationRoutes');
const taskerMessagesRoutes = require('./routes/taskerMessages');
const settingsRoutes = require('./routes/settingsRoutes');
const earningRoutes = require('./routes/earningRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Import AI routes
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require('./routes/usersRoutes');
const analyticsRoute = require('./routes/analyticsRoute');
const activityRoute = require("./routes/activityRoute");





const app = express();
const server = http.createServer(app);

// ✅ Connect to MongoDB
connectDB();

// ✅ Attach socket.io to the server
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});

// ✅ Correct line
chatController.setSocketInstance(io); // pass io to controller for edit/delete events

// ✅ Attach socket handlers
chatSocket(io);

//  Middlewares
app.use(cors());
app.use(express.json());

//  Routes
app.use('/api/auth', authRoutes);
app.use('/api/taskers', taskerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tasker/auth', taskerAuthRoutes);
app.use("/api/tasker", taskerProfileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasker-messages', taskerMessagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/earnings', earningRoutes);
app.use("/api/ai", aiRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/users', userRoutes);

app.use("/api/analytics", analyticsRoute);
app.use("/api", activityRoute);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
