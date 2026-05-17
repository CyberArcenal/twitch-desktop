import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Calendar, 
  Eye, 
  Users, 
  LogOut, 
  ExternalLink, 
  Twitch,
  Edit3
} from "lucide-react";
import twitchAPI from "../../api/core/twitch";
import authAPI from "../../api/core/auth";

interface UserStats {
  followers: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({ followers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user info
      const userData = await authAPI.getCurrentUser();
      if (!userData) {
        throw new Error("No user logged in");
      }
      setUser(userData);

      // Fetch followers count (requires additional API)
      try {
        const followersData = await twitchAPI.getUserFollowers(userData.id);
        setStats({ followers: followersData.total });
      } catch (err) {
        console.warn("Could not fetch followers count:", err);
        setStats({ followers: 0 });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    // Open Twitch profile settings in external browser
    window.open(`https://www.twitch.tv/${user?.login}/profile`, "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--twitch-purple)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to Load Profile</h2>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={loadProfileData}
            className="px-4 py-2 bg-[var(--twitch-purple)] hover:bg-[var(--twitch-purple-dark)] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Not Logged In</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Please log in to view your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-[var(--twitch-purple)] hover:bg-[var(--twitch-purple-dark)] text-white rounded-lg transition-colors"
          >
            Login with Twitch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="windows-card overflow-hidden mb-6">
        <div className="relative h-32 bg-gradient-to-r from-[var(--twitch-purple)] to-[var(--twitch-purple-dark)]">
          <div className="absolute -bottom-12 left-6">
            <div className="w-28 h-28 rounded-full border-4 border-[var(--bg-elevated)] bg-[var(--bg-overlay)] overflow-hidden">
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--twitch-purple)]">
                  <Twitch className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user.display_name}
              </h1>
              <p className="text-[var(--text-secondary)]">@{user.login}</p>
              {user.description && (
                <p className="mt-2 text-[var(--text-primary)] max-w-xl">
                  {user.description}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEditProfile}
                className="windows-button-primary flex items-center gap-2 px-4 py-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="windows-button flex items-center gap-2 px-4 py-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="windows-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--twitch-purple)] mb-2">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.followers.toLocaleString()}
          </div>
          <div className="text-[var(--text-secondary)] text-sm">Followers</div>
        </div>

        <div className="windows-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--twitch-purple)] mb-2">
            <Eye className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-white">
            {user.view_count?.toLocaleString() || "0"}
          </div>
          <div className="text-[var(--text-secondary)] text-sm">Total Views</div>
        </div>

        <div className="windows-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--twitch-purple)] mb-2">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium text-white">
            {formatDate(user.created_at)}
          </div>
          <div className="text-[var(--text-secondary)] text-sm">Joined</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="windows-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Twitch className="w-5 h-5 text-[var(--twitch-purple)]" />
          Twitch Details
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[var(--text-secondary)] w-32">User ID:</span>
            <span className="text-[var(--text-primary)] font-mono text-sm">
              {user.id}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[var(--text-secondary)] w-32">Broadcaster Type:</span>
            <span className="text-[var(--text-primary)] capitalize">
              {user.broadcaster_type || "Standard"}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[var(--text-secondary)] w-32">User Type:</span>
            <span className="text-[var(--text-primary)] capitalize">
              {user.type || "Normal"}
            </span>
          </div>
          {user.email && (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[var(--text-secondary)] w-32">Email:</span>
              <span className="text-[var(--text-primary)]">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;