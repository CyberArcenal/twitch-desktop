// src/renderer/pages/settings/sections/SecuritySection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Power, Key, Shield, ExternalLink } from 'lucide-react';
import { authAPI } from '../../../api/core/auth';
import { userAPI, type TwitchUser } from '../../../api/core/user';
import Button from '../../../components/UI/Button';
import { dialogs } from '../../../utils/dialogs';
import { showSuccess, showError } from '../../../utils/notification';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const SecuritySection: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const res = await userAPI.getCurrentUser();
      if (res.status && res.data) {
        setUser(res.data);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Logout',
      message: 'Are you sure you want to log out from this device?',
    });
    if (!confirmed) return;
    await authAPI.logout();
    navigate('/login');
  };

  const handleRevokeAll = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Revoke All Tokens',
      message: 'This will log you out from all devices and applications. You will need to log in again everywhere. Continue?',
      confirmText: 'Yes, revoke all',
    });
    if (!confirmed) return;
    try {
      await authAPI.revokeAllTokens();
      showSuccess('Logged out from all devices');
      navigate('/login');
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleChangePassword = () => {
    window.backendAPI.openExternal('https://www.twitch.tv/settings/security');
  };

  if (loading) {
    return (
         <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-sm text-[#adadb8] mt-1">
          Manage your Twitch account security and sessions
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Card */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#9147ff]" />
            Connected Account
          </h2>
          {user && (
            <div className="flex items-center gap-4">
              <img
                src={user.profile_image_url}
                alt={user.display_name}
                className="w-16 h-16 rounded-full border-2 border-[#9147ff]"
              />
              <div>
                <p className="font-bold text-white text-lg">{user.display_name}</p>
                <p className="text-sm text-[#adadb8]">@{user.login}</p>
                <p className="text-xs text-[#adadb8]/60 mt-1">User ID: {user.id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Session Management */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Session Management</h2>
          <div className="space-y-3">
            <Button variant="secondary" onClick={handleLogout} icon={LogOut}>
              Logout from this device
            </Button>
            <Button variant="danger" onClick={handleRevokeAll} icon={Power}>
              Revoke all tokens (logout from all devices)
            </Button>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Security</h2>
          <div className="space-y-3">
            <Button variant="secondary" onClick={handleChangePassword} icon={Key}>
              Change Password <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#9147ff]" />
                <div>
                  <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-[#adadb8]">Manage 2FA settings on Twitch</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => window.backendAPI.openExternal('https://www.twitch.tv/settings/security')}
              >
                Manage
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0e10] rounded-lg p-4 text-sm text-[#adadb8]">
          <p className="font-medium mb-1">🔒 Security Tips</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication for extra security</li>
            <li>Regularly review connected apps and revoke unused ones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;