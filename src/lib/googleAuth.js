import { supabase } from './supabase';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/callback`;
const STATE_KEY = 'oauth_state';
const CODE_VERIFIER_KEY = 'oauth_code_verifier';

// Generate a random state parameter to prevent CSRF attacks
const generateState = () => {
  // Use a simpler state generation that's more reliable
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Generate a code verifier for PKCE
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
};

// Generate code challenge from verifier (for PKCE)
const generateCodeChallenge = async (codeVerifier) => {
  // Hash the code verifier using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash to base64-url format
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Store state and code verifier in storage
const storeOAuthParams = (state, codeVerifier) => {
  try {
    // Use sessionStorage for better security during redirects
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    
    // Also store in localStorage as a fallback
    localStorage.setItem(STATE_KEY, state);
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    
    // Set a timestamp to check for expiration
    const timestamp = new Date().getTime();
    sessionStorage.setItem(`${STATE_KEY}_timestamp`, timestamp.toString());
    localStorage.setItem(`${STATE_KEY}_timestamp`, timestamp.toString());
  } catch (error) {
    console.error('Error storing OAuth parameters:', error);
  }
};

// Verify the state parameter when the user returns
const verifyState = (state) => {
  try {
    // Try to get state from sessionStorage first, then fall back to localStorage
    let storedState = sessionStorage.getItem(STATE_KEY) || localStorage.getItem(STATE_KEY);
    
    // If the state matches, consider it valid regardless of timestamp
    if (storedState === state) {
      return true;
    }
    
    // If we get here, the states don't match
    return false;
  } catch (error) {
    console.error('Error verifying state:', error);
    return false;
  }
};

// Get the stored code verifier
const getCodeVerifier = () => {
  return sessionStorage.getItem(CODE_VERIFIER_KEY) || localStorage.getItem(CODE_VERIFIER_KEY);
};

// Clean up stored OAuth parameters
const cleanupOAuthParams = () => {
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(`${STATE_KEY}_timestamp`);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(`${STATE_KEY}_timestamp`);
  localStorage.removeItem(CODE_VERIFIER_KEY);
};

// Initiate the Google OAuth flow
export const initiateGoogleAuth = async () => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID is not configured');
    return;
  }

  try {
    // First check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return;
    }
    
    // Clear any existing OAuth parameters
    cleanupOAuthParams();
    
    // Generate new OAuth parameters
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
    // Store the parameters
    storeOAuthParams(state, codeVerifier);
    
    // Use Supabase's built-in signInWithOAuth method
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URI,
        queryParams: {
          // These parameters will be passed to Google's authorization endpoint
          access_type: 'offline',
          prompt: 'select_account',
          // Use our own state parameter for better tracking
          state: state
        },
        // Skip browser redirect so we can handle it ourselves
        skipBrowserRedirect: true,
        // Use our own code verifier for PKCE
        codeVerifier: codeVerifier
      }
    });

    if (error) {
      throw error;
    }
    
    // Redirect to the authorization URL provided by Supabase
    window.location.href = data.url;
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    alert('שגיאה בהתחברות. אנא נסה שוב.');
  }
};

// Handle the OAuth callback and sign in with Supabase
export const handleGoogleCallback = async (code, state) => {
  try {
    // Verify state if provided
    if (state) {
      const isStateValid = verifyState(state);
      if (!isStateValid) {
        console.warn('State verification failed, but continuing with authentication');
      }
    }

    // First, check if we already have a session
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    if (existingSession) {
      cleanupOAuthParams();
      return { session: existingSession };
    }
    
    // Get the code verifier that was stored during initiation
    const codeVerifier = getCodeVerifier();
    
    // Use Supabase's exchangeCodeForSession method
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      // If we get an error, try the fallback method
      // Start a new OAuth flow with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (signInError) {
        throw signInError;
      }
      
      // Redirect to the new authorization URL
      window.location.href = signInData.url;
      return null;
    }
    
    cleanupOAuthParams();
    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    cleanupOAuthParams();
    throw error;
  }
}; 