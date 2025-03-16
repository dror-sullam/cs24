import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';

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
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
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