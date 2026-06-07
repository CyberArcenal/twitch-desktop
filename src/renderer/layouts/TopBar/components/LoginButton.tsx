// src/layouts/components/LoginButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { dialogs } from '../../../utils/dialogs';

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Login Required',
      message: 'You need to log in with Twitch to access this feature. Do you want to log in now?',
    });
    if (confirmed) navigate('/login');
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9146ff] to-[#772ce8] hover:opacity-90 text-white text-sm font-medium transition-all duration-200 shadow-md"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Login with Twitch</span>
    </button>
  );
};

export default LoginButton;