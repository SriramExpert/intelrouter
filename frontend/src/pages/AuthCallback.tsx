import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state change — this fires automatically when
    // Supabase processes the OAuth tokens from the URL hash/fragment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Successfully signed in — go to home
        subscription.unsubscribe();
        navigate('/', { replace: true });
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        subscription.unsubscribe();
        navigate('/login?error=no_session', { replace: true });
      }
    });

    // Fallback: if onAuthStateChange doesn't fire within 5 seconds, check manually
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      subscription.unsubscribe();
      if (session) {
        navigate('/', { replace: true });
      } else {
        navigate('/login?error=no_session', { replace: true });
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;