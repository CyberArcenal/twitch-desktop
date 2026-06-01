import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#9146ff]/20 to-[#772ce8]/20 rounded-2xl p-8 text-center border border-[#9146ff]/30">
      <h3 className="text-xl font-bold text-[var(--sidebar-text)] mb-2">
        Sign in to see your watch history
      </h3>
      <p className="text-[var(--text-secondary)] mb-4">
        Login with Twitch to track what you've watched and continue where you left off.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="px-6 py-2 bg-[#9146ff] text-white rounded-full hover:bg-[#772ce8] transition"
      >
        Login Now
      </button>
    </div>
  );
};

export default LoginPrompt;