import { supabase } from './supabase';

export const fetchAvatar = async () => {
  // Check if we have a session first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  // This is where the avatar is stored
  return user?.user_metadata?.avatar_url || null;
}; 