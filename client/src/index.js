import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {AuthorizationProvider} from  './context/authorization'
import {SocketContext, socket} from './context/socket';
const root = ReactDOM.createRoot(
  document.getElementById('root') 
);
root.render(
    <AuthorizationProvider>
      <SocketContext.Provider value={socket}>
        <App />
      </SocketContext.Provider>
    </AuthorizationProvider>
);

