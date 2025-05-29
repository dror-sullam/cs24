import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';

// Flag to prevent multiple signOut calls across the app
let hasCleanedOtherSessions = false;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        // SECURITY: One-time cleanup on app load - kill other sessions if we have one
        // Only do this once per app session to prevent repeated calls
        if (session && !hasCleanedOtherSessions) {
          hasCleanedOtherSessions = true;
          supabase.auth.signOut({ scope: 'others' }).catch(console.error);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes - simple, no automatic cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        // Reset flag when user signs out so it can clean again on next login
        if (event === 'SIGNED_OUT') {
          hasCleanedOtherSessions = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showNotification('התנתקת בהצלחה', 'success');
    } catch (error) {
      showNotification('התנתקות נכשלה. אנא נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};

export default useAuth; 