// src/renderer/pages/settings/sections/SecuritySection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Power, Key, Shield, ExternalLink, 
  Smartphone, Globe, AlertCircle, CheckCircle 
} from 'lucide-react';
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
  const [revoking, setRevoking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    setLoggingOut(true);
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (err) {
      showError('Failed to logout');
      setLoggingOut(false);
    }
  };

  const handleRevokeAll = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Revoke All Tokens',
      message: 'This will log you out from all devices and applications. You will need to log in again everywhere. Continue?',
      confirmText: 'Yes, revoke all',
    });
    if (!confirmed) return;
    setRevoking(true);
    try {
      await authAPI.revokeAllTokens();
      showSuccess('Logged out from all devices');
      navigate('/login');
    } catch (err: any) {
      showError(err.message || 'Failed to revoke tokens');
      setRevoking(false);
    }
  };

  const handleChangePassword = () => {
    window.backendAPI.openExternal('https://www.twitch.tv/settings/security');
  };

  const handleManage2FA = () => {
    window.backendAPI.openExternal('https://www.twitch.tv/settings/security');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="medium" text="Loading security settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#a970ff] bg-clip-text text-transparent">
          Security
        </h1>
        <p className="text-[#adadb8] mt-2 text-sm">
          Manage your Twitch account security, sessions, and connected devices
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Card - Enhanced */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-2xl overflow-hidden shadow-lg transition-all hover:border-[#3a3a4a]">
          <div className="px-6 py-4 border-b border-[#2a2a2e] bg-[#18181b]">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#9147ff]" />
              <h2 className="font-semibold text-white">Connected Account</h2>
            </div>
          </div>
          <div className="p-6">
            {user && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative">
                  <img
                    src={user.profile_image_url}
                    alt={user.display_name}
                    className="w-20 h-20 rounded-full border-3 border-[#9147ff] shadow-md object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-[#1f1f23]">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xl">{user.display_name}</p>
                  <p className="text-sm text-[#adadb8]">@{user.login}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-[#adadb8]/60 bg-[#0e0e10] px-2 py-0.5 rounded-full">
                      ID: {user.id}
                    </span>
                    {user.broadcaster_type === 'partner' && (
                      <span className="text-xs text-[#9147ff] bg-[#9147ff]/10 px-2 py-0.5 rounded-full">
                        Partner
                      </span>
                    )}
                    {user.broadcaster_type === 'affiliate' && (
                      <span className="text-xs text-[#00b5b8] bg-[#00b5b8]/10 px-2 py-0.5 rounded-full">
                        Affiliate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Session Management - Two column layout on desktop */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-[#2a2a2e] bg-[#18181b]">
            <h2 className="font-semibold text-white">Session Management</h2>
            <p className="text-xs text-[#adadb8] mt-1">
              Control your active sessions and devices
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0e0e10] rounded-xl p-4 border border-[#2a2a2e] transition-all hover:border-[#3a3a4a]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#1f1f23] rounded-lg">
                    <Smartphone className="w-5 h-5 text-[#adadb8]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm">This Device</h3>
                    <p className="text-xs text-[#adadb8] mt-0.5">
                      Log out only from this computer
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLogout}
                      icon={LogOut}
                      loading={loggingOut}
                      className="mt-3 w-full justify-center"
                    >
                      Logout this device
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e0e10] rounded-xl p-4 border border-[#2a2a2e] transition-all hover:border-[#3a3a4a]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#1f1f23] rounded-lg">
                    <Globe className="w-5 h-5 text-[#adadb8]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white text-sm">All Devices</h3>
                    <p className="text-xs text-[#adadb8] mt-0.5">
                      Log out from every device and application
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRevokeAll}
                      icon={Power}
                      loading={revoking}
                      className="mt-3 w-full justify-center"
                    >
                      Revoke all tokens
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security - Two column grid for actions */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-[#2a2a2e] bg-[#18181b]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#9147ff]" />
              <h2 className="font-semibold text-white">Account Security</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Change Password */}
              <div className="bg-[#0e0e10] rounded-xl p-4 border border-[#2a2a2e] transition-all hover:border-[#3a3a4a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#1f1f23] rounded-lg">
                    <Key className="w-5 h-5 text-[#ffb347]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Password</h3>
                    <p className="text-xs text-[#adadb8]">Change your Twitch password</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleChangePassword}
                  icon={ExternalLink}
                  iconPosition="right"
                  className="w-full justify-between"
                >
                  Change on Twitch
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-[#0e0e10] rounded-xl p-4 border border-[#2a2a2e] transition-all hover:border-[#3a3a4a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#1f1f23] rounded-lg">
                    <Shield className="w-5 h-5 text-[#00b5b8]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Two-Factor Authentication</h3>
                    <p className="text-xs text-[#adadb8]">Add an extra layer of security</p>
                  </div>
                </div>
                <Button
                  variant="purple"
                  size="sm"
                  onClick={handleManage2FA}
                  icon={ExternalLink}
                  iconPosition="right"
                  className="w-full justify-between"
                >
                  Manage 2FA
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Tips - Enhanced with icon and better styling */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0e0e10] border border-[#2a2a3a] rounded-2xl p-5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#9147ff]/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#9147ff]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm mb-2">Security Tips</h3>
              <ul className="space-y-1.5 text-sm text-[#adadb8]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9147ff]"></span>
                  Use a strong, unique password for your Twitch account
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9147ff]"></span>
                  Enable two-factor authentication for extra protection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9147ff]"></span>
                  Regularly review connected apps and revoke unused ones
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9147ff]"></span>
                  Never share your stream key or login credentials
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-[#5e5e6b] pt-2">
          <p>Changes made here affect your Twitch account directly.</p>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;