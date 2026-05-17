// src/layouts/TopBar.tsx
import React, { useState, useEffect } from "react";
import { Menu, Search, User, LogOut, Moon, Sun, Twitch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import settingsAPI from "../api/core/settings";
import authAPI from "../api/core/auth";


interface TopBarProps {
  toggleSidebar: () => void;
   onGoLive: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, onGoLive }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const loggedIn = await authAPI.isLoggedIn();
      if (loggedIn) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    };
    loadUser();

    settingsAPI.get('theme').then(t => setTheme(t as 'light' | 'dark')).catch(() => {});
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await settingsAPI.set('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-elevated)] border-b border-[var(--border-default)] px-4 py-2 flex items-center justify-between shadow-md">
      {/* Left: Menu button and logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* <div className="flex items-center gap-2">
          <Twitch className="w-6 h-6 text-[var(--twitch-purple)]" />
          <span className="text-lg font-bold text-white hidden sm:inline">Twitch Desktop</span>
        </div> */}
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent text-sm"
            />
          </div>
        </form>
      </div>

      {/* Right: Theme toggle, user menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors">
              {user.profile_image_url ? (
                <img src={user.profile_image_url} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--twitch-purple)] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-white hidden sm:inline">@{user.login}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={() => navigate("/profile")}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-t-lg"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] rounded-b-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-[var(--twitch-purple)] hover:bg-[var(--twitch-purple-dark)] text-white rounded-lg transition-colors text-sm font-medium"
          >
            Login with Twitch
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;