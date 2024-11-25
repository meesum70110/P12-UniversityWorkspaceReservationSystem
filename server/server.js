require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// CORS for Express
const corsOptions = {
  origin: 'https://workspacereservation-front.onrender.com', // Frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allowed HTTP methods
  credentials: true
};
app.use(cors(corsOptions));

// CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://workspacereservation-front.onrender.com', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});
// Exporting `io` so that it can be used in other files
module.exports = { io };

// API Routes
const loginRoutes = require('./routes/login.js');
const signupRoute = require('./routes/signup.js');
const faqRoutes = require('./routes/faqs.js');
const accountRoutes = require('./routes/account.js');
const surveyRoutes = require('./routes/workspace.js');

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoute);
app.use('/api/faqs', faqRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/survey', surveyRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  socket.on('courses', (id) => {
    console.log('A user joined Courses: ', id);
  });
  socket.on('faqs', (id) => {
    console.log('A user joined Faqs: ', id);
  });
  socket.on('surveys', (id) => {
    console.log('A user joined Surveys: ', id);
  });
});

// Database connection and server start
mongoose.connect(process.env.MONG_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
      console.log("Connected to Database");
    });
  })
  .catch((error) => {
    console.log(error);
  });


