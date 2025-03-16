# Google OAuth Setup Guide with @react-oauth/google

This guide will walk you through the process of setting up Google OAuth for the CS24 application using the `@react-oauth/google` library, which provides a more customized and branded login experience.

## Prerequisites

1. A Google account with access to the [Google Cloud Console](https://console.cloud.google.com/)
2. A Supabase project
3. Your application deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter a name for your project (e.g., "CS24 Site")
5. Click "Create"

## Step 2: Configure the OAuth Consent Screen

1. In your new project, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required information:
   - App name: "CS24 Site"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Under "Scopes", add the following scopes:
   - `email`
   - `profile`
   - `openid`
7. Click "Save and Continue"
8. Add test users if you're in testing mode
9. Click "Save and Continue"
10. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Client ID

1. In your project, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "CS24 Web Client"
5. Add Authorized JavaScript origins:
   - For local development: `http://localhost:3000`
   - For production: Your production URL (e.g., `https://cs24.example.com`)
6. Add Authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: Your production redirect URL (e.g., `https://cs24.example.com/auth/callback`)
   - **Important**: Also add Supabase callback URLs:
     - `https://yourproject.supabase.co/auth/v1/callback`
7. Click "Create"
8. Note down the Client ID (you'll need it for your application)

## Step 4: Install Required Packages

1. Install the `@react-oauth/google` package:
   ```bash
   npm install @react-oauth/google
   ```

## Step 5: Configure Your Application

1. Open your `.env` file (or create one based on `.env.example`)
2. Set the `REACT_APP_GOOGLE_CLIENT_ID` to the Client ID you obtained in Step 3
3. Make sure your Supabase URL and anon key are also set correctly:
   ```
   REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

## Step 6: Set Up the Google OAuth Provider

1. In your main application file (e.g., `index.js` or `App.js`), wrap your application with the `GoogleOAuthProvider`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

## Step 7: Create a Google Login Button Component

Create a new component for the Google login button:

```jsx
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { supabase } from '../lib/supabase';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Try to sign in with Supabase using OAuth credentials
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            skipBrowserRedirect: true,
          }
        });
        
        if (error) {
          throw error;
        }
        
        // If we got a URL from Supabase, redirect to it
        if (data?.url) {
          // Store user info in session storage to retrieve after redirect
          sessionStorage.setItem('pendingUserInfo', JSON.stringify(userInfo));
          window.location.href = data.url;
          return;
        }
        
        if (onSuccess) onSuccess(data);
      } catch (error) {
        console.error('Error during authentication process:', error);
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login error:', errorResponse);
      if (onError) onError(errorResponse);
    },
    scope: 'email profile',
  });

  return (
    <button
      onClick={() => login()}
      disabled={isLoading}
      className="login-button"
    >
      {isLoading ? 'Loading...' : 'Sign in with Google'}
    </button>
  );
};

export default GoogleLoginButton;
```

## Step 8: Update Your Auth Callback Component

Make sure your auth callback component can handle the OAuth flow:

```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const [status, setStatus] = useState('Processing login...');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('Missing authorization code parameter');
        }

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          throw error;
        }
        
        // Verify that we're now authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Try to get the stored user info from the Google login
          const pendingUserInfo = sessionStorage.getItem('pendingUserInfo');
          if (pendingUserInfo) {
            try {
              const userInfo = JSON.parse(pendingUserInfo);
              sessionStorage.removeItem('pendingUserInfo');
            } catch (e) {
              console.error('Error parsing pending user info:', e);
            }
          }
          
          // Redirect to home page
          navigate('/');
        } else {
          throw new Error('No session after authentication');
        }
      } catch (error) {
        setStatus('Authentication error');
        setError(error.message);
        
        // Redirect to home page after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="auth-callback">
      <h1>Authentication</h1>
      <p>{status}</p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AuthCallback;
```

## Step 9: Test the Authentication

1. Start your application
2. Click on your login button
3. You should see the Google login popup with your application's branding
4. After granting permission, you should be redirected back to your application and logged in

## Troubleshooting

### Error: "popup_closed_by_user"

This error occurs when the user closes the Google login popup before completing the authentication.

**Solution:**
- This is a normal user behavior, but you can handle it gracefully in your application by showing a message like "Login canceled by user."

### Error: "redirect_uri_mismatch"

This error occurs when the redirect URI in your request doesn't match any of the authorized redirect URIs in your Google Cloud Console project.

**Solution:**
- Double-check that all necessary redirect URIs are added to your Google Cloud Console project.
- Remember that URIs are case-sensitive and must match exactly, including trailing slashes.

### Error: "invalid_grant"

This error can occur for several reasons:
- The authorization code has already been used
- The authorization code has expired

**Solution:**
- Try logging in again to get a fresh authorization code
- Ensure your clock is synchronized

## Additional Resources

- [@react-oauth/google Documentation](https://github.com/MomenSherif/react-oauth)
- [Google OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google) 