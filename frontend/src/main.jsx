import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from './authconfig';

// 1. Initialize MSAL first
msalInstance.initialize().then(() => {
  
  // 2. Once initialized, render the React app
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {/* 3. Wrap your App in the Provider */}
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );

});