import React from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Power, Key, Shield, ExternalLink } from "lucide-react";
import { authAPI } from "../../../api/core/auth";
import { userAPI, type TwitchUser } from "../../../api/core/user";
import Button from "../../../components/UI/Button";
import { dialogs } from "../../../utils/dialogs";
import { showSuccess, showError } from "../../../utils/notification";

const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<TwitchUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
      title: "Logout",
      message: "Are you sure you want to log out from this device?",
    });
    if (!confirmed) return;
    await authAPI.logout();
    navigate("/login");
  };

  const handleRevokeAll = async () => {
    const confirmed = await dialogs.confirm({
      title: "Revoke All Tokens",
      message:
        "This will log you out from all devices and applications. You will need to log in again everywhere. Continue?",
      confirmText: "Yes, revoke all",
    });
    if (!confirmed) return;
    try {
      await authAPI.revokeAllTokens();
      showSuccess("Logged out from all devices");
      navigate("/login");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleChangePassword = () => {
    window.backendAPI.openExternal("https://www.twitch.tv/settings/security");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">
          Security
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your Twitch account security and sessions
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Account Info Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary-color)]" />
            Connected Account
          </h2>
          {user && (
            <div className="flex items-center gap-4">
              <img
                src={user.profile_image_url}
                alt={user.display_name}
                className="w-16 h-16 rounded-full border-2 border-[var(--primary-color)]"
              />
              <div>
                <p className="font-bold text-[var(--sidebar-text)] text-lg">
                  {user.display_name}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  @{user.login}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  User ID: {user.id}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Session Management */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">
            Session Management
          </h2>
          <div className="space-y-4">
            <Button
              className="block w-full"
              variant="secondary"
              onClick={handleLogout}
              icon={LogOut}
            >
              Logout from this device
            </Button>
            <Button
              className="block w-full"
              variant="danger"
              onClick={handleRevokeAll}
              icon={Power}
            >
              Revoke all tokens (logout from all devices)
            </Button>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">
            Account Security
          </h2>
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleChangePassword}
              icon={Key}
            >
              Change Password <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--primary-color)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--sidebar-text)]">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Manage 2FA settings on Twitch
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() =>
                  window.backendAPI.openExternal(
                    "https://www.twitch.tv/settings/security",
                  )
                }
              >
                Manage
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-secondary-bg)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
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

export default SecuritySettingsPage;
