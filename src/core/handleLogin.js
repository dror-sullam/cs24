import { supabase } from "../lib/supabase";
import { showNotification } from "../components/ui/notification";

const handleLogin = async ({ onError }) => {
  try {
    // Save current location securely
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterLogin', currentPath);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' }
        }
    });

    if (error) {
        throw error;
    }

    if (data?.url) {
        window.location.href = data.url;
    }
    } catch (error) {
    console.error('Authentication error:', error);
    showNotification(error.message || 'שגיאה בהתחברות. אנא נסה שוב.', 'error');
    if (onError) onError(error);
    }
};

export default handleLogin;