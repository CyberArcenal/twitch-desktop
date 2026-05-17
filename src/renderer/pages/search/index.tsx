import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Search as SearchIcon, 
  X, 
  Loader2, 
  Tv, 
  User,
  ExternalLink
} from "lucide-react";
import type { SearchChannel } from "../../api/core/twitch";
import twitchAPI from "../../api/core/twitch";

const Search: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Extract query param from URL
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get("q") || "";

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await twitchAPI.searchChannels(searchQuery);
      setResults(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to search channels");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Update URL without reloading the page
      navigate(`/search?q=${encodeURIComponent(query.trim())}`, { replace: true });
      performSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
    navigate("/search", { replace: true });
  };

  const handleChannelClick = (channelLogin: string) => {
    navigate(`/stream/${channelLogin}`);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-[var(--twitch-purple)]" />
          Search Channels
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Find your favorite streamers
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by channel name..."
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent text-lg"
            autoFocus
          />
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-[var(--bg-overlay)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
          )}
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin w-12 h-12 text-[var(--twitch-purple)]" />
        </div>
      ) : error ? (
        <div className="text-center py-16 windows-card">
          <div className="text-red-500 mb-4">
            <SearchIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Search Failed</h3>
          <p className="text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={() => performSearch(query)}
            className="mt-4 px-4 py-2 bg-[var(--twitch-purple)] hover:bg-[var(--twitch-purple-dark)] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-16 windows-card">
          <SearchIcon className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No channels found</h3>
          <p className="text-[var(--text-secondary)]">
            We couldn't find any channels matching "{query}". Try a different search term.
          </p>
        </div>
      ) : hasSearched && results.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-[var(--text-secondary)]">
              Found {results.length} {results.length === 1 ? "channel" : "channels"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelClick(channel.login)}
                className="windows-card p-4 hover:border-[var(--twitch-purple)] transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--twitch-purple-bg)] flex-shrink-0">
                    {channel.profile_image_url ? (
                      <img
                        src={channel.profile_image_url}
                        alt={channel.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--twitch-purple)] text-2xl font-bold">
                        {getInitials(channel.display_name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white truncate">
                        {channel.display_name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[var(--text-tertiary)] truncate mb-2">
                      @{channel.login}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {channel.is_live ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-live)] bg-[var(--accent-live-bg)] px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-[var(--accent-live)] rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)] bg-[var(--bg-overlay)] px-2 py-0.5 rounded-full">
                          <Tv className="w-3 h-3" />
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Initial state (no search performed)
        <div className="text-center py-20 windows-card border-dashed border-2 border-[var(--border-default)]">
          <SearchIcon className="w-20 h-20 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">Search for channels</h3>
          <p className="text-[var(--text-secondary)]">
            Enter a channel name above to find streamers on Twitch.
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;