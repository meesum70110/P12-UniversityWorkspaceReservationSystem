// Importing React for managing the application's UI and using Context API.
import React from 'react';

// Importing the 'io' function to establish a WebSocket connection.
import { io } from 'socket.io-client';

// Initializing a WebSocket connection to the backend server.
export const socket = io('https://workspacereservation-backend.onrender.com/', {
    reconnection: true, // Enabling automatic reconnection if the connection drops.
    cors: {
        origin: '*', // Allowing requests from all origins (cross-origin resource sharing).
    },
});

// Creating a React Context for sharing the WebSocket instance across components.
export const SocketContext = React.createContext();
