import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Twitch, Loader2, AlertCircle } from "lucide-react";
import authAPI from "../../../api/core/auth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await authAPI.isLoggedIn();
        if (loggedIn) {
          navigate("/following", { replace: true });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.login();
      if (result && result.accessToken) {
        // After successful login, navigate to following page
        navigate("/following", { replace: true });
      } else {
        throw new Error("Login failed: No access token received");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while checking authentication status
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--twitch-purple)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-elevated)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-elevated)] rounded-2xl shadow-2xl border border-[var(--border-default)] p-8">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[var(--twitch-purple)] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Twitch className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Twitch Desktop</h1>
          <p className="text-[var(--text-secondary)] text-center mt-2">
            Watch streams, chat with communities, and manage your Twitch experience
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-[var(--accent-red-light)] border border-[var(--accent-red)] rounded-lg flex items-center gap-2 text-[var(--accent-red)]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[var(--twitch-purple)] hover:bg-[var(--twitch-purple-dark)] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to Twitch...
            </>
          ) : (
            <>
              <Twitch className="w-5 h-5" />
              Login with Twitch
            </>
          )}
        </button>

        {/* Additional info */}
        <p className="text-xs text-[var(--text-tertiary)] text-center mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy.
          <br />
          This app uses OAuth – your password is never shared with us.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;