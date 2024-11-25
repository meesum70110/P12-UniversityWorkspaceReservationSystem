// Importing the dotenv library to load environment variables from the .env file
require('dotenv').config();

// Importing the Express framework for building the server
const express = require('express');
const app = express();

// Importing CORS middleware to enable Cross-Origin Resource Sharing
const cors = require('cors');

// Importing Mongoose for database operations
const mongoose = require('mongoose');

// Importing the HTTP module to create a server instance
const http = require('http');
const server = http.createServer(app);

// Importing and setting up Socket.io for real-time communication
const { Server } = require('socket.io');

// Configuring CORS options for Express requests
const corsOptions = {
  origin: 'https://workspacereservation-front.onrender.com', // Allowed frontend URL
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Permitted HTTP methods
  credentials: true // Allows credentials to be sent with requests
};
app.use(cors(corsOptions)); // Applying CORS settings to Express

// Setting up CORS options for Socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://workspacereservation-front.onrender.com', // Allowed frontend URL for real-time communication
    methods: ['GET', 'POST'], // Permitted Socket.io methods
    credentials: true // Allows credentials with WebSocket requests
  }
});

// Exporting the Socket.io instance to use in other modules
module.exports = { io };

// Importing API route modules
const loginRoutes = require('./routes/login.js'); // Routes for login operations
const signupRoute = require('./routes/signup.js'); // Routes for user signup
const faqRoutes = require('./routes/faqs.js'); // Routes for FAQs management
const accountRoutes = require('./routes/account.js'); // Routes for account operations
const surveyRoutes = require('./routes/workspace.js'); // Routes for workspace surveys

// Applying middleware to parse incoming JSON requests with a size limit of 50MB
app.use(express.json({ limit: '50mb' }));

// Custom middleware to log incoming requests with their path and method
app.use((req, res, next) => {
  console.log(req.path, req.method); // Logs request details to the console
  next(); // Proceeds to the next middleware or route
});

// Applying API route modules to specific URL paths
app.use('/api/login', loginRoutes); // Routes for login requests
app.use('/api/signup', signupRoute); // Routes for signup requests
app.use('/api/faqs', faqRoutes); // Routes for FAQ-related requests
app.use('/api/account', accountRoutes); // Routes for account-related requests
app.use('/api/survey', surveyRoutes); // Routes for workspace survey operations

// Listening for real-time events using Socket.io
io.on('connection', (socket) => {
  console.log('A user connected', socket.id); // Logs when a user connects
  // Handling events for courses
  socket.on('courses', (id) => {
    console.log('A user joined Courses: ', id); // Logs course-related events
  });
  // Handling events for FAQs
  socket.on('faqs', (id) => {
    console.log('A user joined Faqs: ', id); // Logs FAQ-related events
  });
  // Handling events for surveys
  socket.on('surveys', (id) => {
    console.log('A user joined Surveys: ', id); // Logs survey-related events
  });
});

// Connecting to the MongoDB database and starting the server
mongoose.connect(process.env.MONG_URI) // Connecting to the database using the MONG_URI environment variable
  .then(() => {
    server.listen(process.env.PORT, () => { // Starting the server on the port specified in the environment variables
      console.log(`listening on port ${process.env.PORT}`); // Logs the port number
      console.log("Connected to Database"); // Logs successful database connection
    });
  })
  .catch((error) => {
    console.log(error); // Logs any database connection errors
  });
