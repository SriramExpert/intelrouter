import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase OAuth returns tokens in the URL hash fragment:
        // /auth/callback#access_token=...&refresh_token=...
        // We must explicitly call exchangeCodeForSession or setSession
        // to process the hash — onAuthStateChange alone is not reliable here.

        const hash = window.location.hash;

        if (hash && hash.includes('access_token')) {
          // Parse the hash fragment into key-value pairs
          const params = new URLSearchParams(hash.substring(1)); // strip leading '#'
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Manually set the session using the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error.message);
              navigate('/login?error=session_error', { replace: true });
              return;
            }

            if (data.session) {
              // Clear the hash from the URL for security
              window.history.replaceState(null, '', window.location.pathname);
              navigate('/', { replace: true });
              return;
            }
          }
        }

        // Fallback: check if there's already an active session
        // (e.g. user lands here after a page refresh)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/', { replace: true });
        } else {
          navigate('/login?error=no_session', { replace: true });
        }

      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login?error=unexpected', { replace: true });
      }
    };

    handleCallback();
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