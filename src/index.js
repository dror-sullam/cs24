import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './Routes';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Get the Google Client ID from environment variables
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Make sure we have a client ID
if (!googleClientId) {
  console.error('Missing Google Client ID. Please check your environment variables.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={googleClientId}
      onScriptLoadError={() => {
        console.error('Failed to load Google OAuth script');
      }}
      onScriptLoadSuccess={() => {
        console.log('Google OAuth script loaded successfully');
      }}
    >
      <AppRoutes />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

