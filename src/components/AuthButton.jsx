import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import JoinRequestModal from './JoinRequestModal';

const AuthButton = ({ courseType }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (!session) {
        throw new Error('לא מחובר למערכת');
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert('התנתקות נכשלה. אנא נסה שוב.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!session) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) {
        console.error('Error signing in:', error.message);
        alert('התחברות נכשלה. אנא נסה שוב.');
      }
    } else {
      setShowJoinModal(true);
    }
  };

  return (
    <div className="flex gap-2">
      {!session && (
        <Button
          onClick={() => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
          })}
          className={`flex items-center gap-2 ${
            courseType === 'cs' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          <LogIn className="h-4 w-4" />
          התחבר
        </Button>
      )}
      <Button
        onClick={handleJoinRequest}
        className={`flex items-center gap-2 ${
          courseType === 'cs' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
        } text-white`}
      >
        <UserPlus className="h-4 w-4" />
        {!session ? 'התחבר כדי להגיש בקשה' : 'בקשה להצטרפות'}
      </Button>

      {session && (
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? '...מתנתק' : 'התנתק'}
        </Button>
      )}

      <JoinRequestModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)}
        courseType={courseType}
        session={session}
      />
    </div>
  );
};

export default AuthButton; 