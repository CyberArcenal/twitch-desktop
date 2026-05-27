// src/renderer/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Tv, AlertCircle, Loader2 } from "lucide-react";
import { authAPI } from "../../../api/core/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const res = await authAPI.isLoggedIn();
      if (res.status && res.data) {
        navigate("/", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authAPI.login();
      if (result.status && result.data) {
        // Login successful, redirect to dashboard
        navigate("/", { replace: true });
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e0e10] to-[#1f1f2b] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1f1f2b] rounded-2xl shadow-2xl p-8 border border-[#2d2d3a]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#9146ff] to-[#772ce8] flex items-center justify-center shadow-lg mb-4">
            <Tv className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9146ff] to-[#a970ff] bg-clip-text text-transparent">
            Twitch Desktop
          </h1>
          <p className="text-sm text-[#adadb8] mt-1">Stream • Chat • Follow</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#9146ff] hover:bg-[#772ce8] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Login with Twitch
            </>
          )}
        </button>

        {/* Info text */}
        <p className="text-xs text-[#7a7a8c] text-center mt-6">
          By logging in, you agree to allow Twitch Desktop to access your Twitch account.<br />
          Your data is stored locally and never shared.
        </p>
      </div>
    </div>
  );
};

export default Login;