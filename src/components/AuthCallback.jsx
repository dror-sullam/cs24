import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from './ui/notification';
import { supabase } from '../lib/supabase';
import Loader from './Loader';

const AuthCallback = () => {
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the authorization code and state from the URL
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        let accessToken = urlParams.get('access_token');
        let idToken = urlParams.get('id_token');

        // Check for direct token authentication (from Google OAuth implicit flow)
        if (idToken && accessToken) {
          try {
            // Try to sign in with the ID token directly
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: idToken,
              access_token: accessToken,
              nonce: sessionStorage.getItem('google_oauth_nonce') || undefined,
            });
            
            if (error) {
              throw error;
            }
            
            if (data.session) {
              // Session established successfully
              showNotification('התחברת בהצלחה!', 'success');
              sessionStorage.removeItem('redirectAfterLogin'); 
              navigate(redirectPath);
              return;
            }
          } catch (tokenError) {
            console.error('Error signing in with token:', tokenError);
          }
        }

        if (error) {
          throw new Error(`Authentication error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
        }
        if (!code && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token'))) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          idToken = hashParams.get('id_token');
        }
  
        if (!code && !accessToken && !idToken) {
          throw new Error('חסר קוד אימות או טוקנים בכתובת');
        }

        // Check if we're already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          sessionStorage.removeItem('redirectAfterLogin'); 
          navigate(redirectPath);
          return;
        }

        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify that we're now authenticated
          const { data: { session: newSession } } = await supabase.auth.getSession();
          
          if (newSession) {
            // Session established successfully
            
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
            
            showNotification('התחברת בהצלחה!', 'success');
            
            // Navigate to home page
            sessionStorage.removeItem('redirectAfterLogin'); 
            navigate(redirectPath);
          } else {
            // Try multiple times to get a session with increasing delays
            let attempts = 0;
            const maxAttempts = 3;
            const checkSession = async () => {
              attempts++;
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                showNotification('התחברת בהצלחה!', 'success');
                sessionStorage.removeItem('redirectAfterLogin'); 
                navigate(redirectPath);
              } else if (attempts < maxAttempts) {
                setTimeout(checkSession, 1000 * attempts); // Increasing delay
              } else {
                setError('לא ניתן לאמת את ההרשאות לאחר מספר ניסיונות');
                setTimeout(() => {
                  navigate(redirectPath);
                }, 2000);
              }
            };
            
            setTimeout(checkSession, 1000);
          }
        } catch (authError) {
          throw authError;
        }
      } catch (error) {
        // Provide a more user-friendly error message
        let errorMessage = 'שגיאה בהתחברות. אנא נסה שוב.';
        let errorDetails = '';
        
        if (error.message) {
          errorDetails = error.message;
          
          // If it's a state verification error, provide a more specific message
          if (error.message.includes('state parameter') || error.message.includes('state verification')) {
            errorMessage = 'שגיאה באימות הבקשה. אנא נסה להתחבר שוב.';
          } else if (error.message.includes('code verifier')) {
            errorMessage = 'שגיאה באימות הקוד. אנא נסה להתחבר שוב.';
          } else if (error.message.includes('token') || error.message.includes('client_secret')) {
            errorMessage = 'שגיאה בקבלת הרשאות. אנא נסה להתחבר שוב.';
          }
        }
        
        setError(errorDetails);
        showNotification(errorMessage, 'error');
        
        // Redirect to home page after a delay
        setTimeout(() => {
          navigate(redirectPath);
        }, 3000);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">מתחבר</h1>
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
        <div className="flex justify-center">
          <Loader />
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 