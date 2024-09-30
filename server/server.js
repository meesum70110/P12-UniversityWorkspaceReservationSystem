// // import cors from 'cors'
// // app.use(cors());

// require('dotenv').config();
// const express = require('express');
// const app = express();

// // Moongoose allows for schema creation. MongoDB alone is schema less.
// const mongoose = require('mongoose');

// // Middleware to add request body to response object to access in a function
// app.use(express.json({limit : '50mb'}));


// const loginRoutes = require('./routes/login.js');
// const signupRoute = require('./routes/signup.js');
// const courseRoutes = require('./routes/courses.js');
// const faqRoutes = require('./routes/faqs.js');
// const leaveRoutes = require('./routes/leave.js');
// const accountRoutes = require('./routes/account.js');

// // Middleware to log API route and method
// app.use((req,res,next) => {
//     console.log(req.path, req.method);
//     next();
// })

// // Middleware to use API routes
// app.use('/api/login', loginRoutes);
// app.use('/api/signup', signupRoute);
// app.use('/api/courses', courseRoutes);
// app.use('/api/faqs', faqRoutes);
// app.use('/api/leave', leaveRoutes);
// app.use('/api/account', accountRoutes);


// mongoose.connect(process.env.MONG_URI)
// .then(()=>{
//     app.listen(process.env.PORT, ()=>{
//     console.log(`listening on port ${process.env.PORT}`);
//     console.log("Connected to Database");
// })})
// .catch((error)=>{
//     console.log(error)
// })


/****************************************************Using WebSocket.io***********************************************/

// import cors from 'cors'
// app.use(cors());

require('dotenv').config();
const express = require('express');
const app = express();

// Moongoose allows for schema creation. MongoDB alone is schema less.
const mongoose = require('mongoose');

// Middleware to add request body to response object to access in a function
app.use(express.json({limit : '50mb'}));

// Adding socket.io configuration
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

const loginRoutes = require('./routes/login.js');
const signupRoute = require('./routes/signup.js');
const courseRoutes = require('./routes/courses.js');
const faqRoutes = require('./routes/faqs.js');
const accountRoutes = require('./routes/account.js');
const surveyRoutes = require('./routes/workspace.js');

// Middleware to log API route and method
app.use((req,res,next) => {
    console.log(req.path, req.method);
    next();
})

// Middleware to use API routes
app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoute);
app.use('/api/courses', courseRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/workspace', surveyRoutes);

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on('courses', (id)=>{
        console.log('A user joined Courses: ', id);
    })
    socket.on('faqs', (id)=>{
        console.log('A user joined Faqs: ', id);
    })
    socket.on('surveys', (id)=>{
        console.log('A user joined Surveys: ', id);
    })
})

exports.io = io

mongoose.connect(process.env.MONG_URI)
.then(()=>{
    server.listen(process.env.PORT, ()=>{
    console.log(`listening on port ${process.env.PORT}`);
    console.log("Connected to Database");
})})
.catch((error)=>{
    console.log(error)
})

