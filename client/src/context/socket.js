import React from 'react';

import {io} from 'socket.io-client';

export const socket =  io('/',{
    reconnection: true,
    cors: {
        origin: '*'
    }
});

export const SocketContext = React.createContext();