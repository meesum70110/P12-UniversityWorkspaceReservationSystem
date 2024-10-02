import React from 'react';

import {io} from 'socket.io-client';

export const socket =  io('https://workspacereservation-backend.onrender.com/',{
    reconnection: true,
    cors: {
        origin: '*'
    }
});

export const SocketContext = React.createContext();
