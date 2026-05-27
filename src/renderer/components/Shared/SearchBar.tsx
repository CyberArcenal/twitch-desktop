// src/components/Twitch/SearchBar.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Gamepad2, Tv, X } from "lucide-react";
import type { TwitchUser } from "../../api/core/user";
import type { Game, Stream } from "../../api/core/games";
import { searchAPI } from "../../api/core/search";

type SearchResult = {
  channels: TwitchUser[];
  streams: Stream[];
  games: Game[];
};

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults(null);
        setShowDropdown(false);
        return;
      }
      setLoading(true);
      try {
        const res = await searchAPI.searchAll(query, 5);
        if (res.status && res.data) {
          setResults(res.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (type: string, id: string, name?: string) => {
    setQuery("");
    setShowDropdown(false);
    if (type === "channel") {
      navigate(`/channel/${id}`);
    } else if (type === "game") {
      navigate(`/game/${id}`);
    } else if (type === "stream") {
      navigate(`/channel/${id}`);
    }
  };

  const renderResultItem = (type: string, item: any) => {
    if (type === "channel") {
      return (
        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-[var(--card-hover-bg)] rounded-lg cursor-pointer transition-colors"
             onClick={() => handleSelect("channel", item.id, item.display_name)}>
          <img src={item.profile_image_url} alt={item.display_name} className="w-8 h-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--sidebar-text)] truncate">{item.display_name}</div>
            <div className="text-xs text-[var(--text-tertiary)]">@{item.login}</div>
          </div>
          <Tv className="w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
      );
    } else if (type === "game") {
      return (
        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-[var(--card-hover-bg)] rounded-lg cursor-pointer transition-colors"
             onClick={() => handleSelect("game", item.id, item.name)}>
          <img src={item.box_art_url.replace("{width}x{height}", "32x42")} alt={item.name} className="w-8 h-10 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--sidebar-text)] truncate">{item.name}</div>
          </div>
          <Gamepad2 className="w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
      );
    } else if (type === "stream") {
      return (
        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-[var(--card-hover-bg)] rounded-lg cursor-pointer transition-colors"
             onClick={() => handleSelect("stream", item.user_id, item.user_name)}>
          <img src={item.thumbnail_url.replace("{width}x{height}", "40x22")} alt={item.title} className="w-10 h-6 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--sidebar-text)] truncate">{item.user_name}</div>
            <div className="text-xs text-[var(--text-tertiary)] truncate">{item.title}</div>
          </div>
          <div className="text-xs text-[var(--accent-red)] font-semibold">LIVE</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && results && setShowDropdown(true)}
          placeholder="Search channels, games, or streams..."
          className="w-full pl-9 pr-8 py-2 rounded-full bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--sidebar-text)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--card-hover-bg)]"
          >
            <X className="w-3 h-3 text-[var(--text-tertiary)]" />
          </button>
        )}
      </div>

      {showDropdown && (results || loading) && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-[var(--text-tertiary)]">
              Searching...
            </div>
          )}
          {!loading && results && (
            <div className="p-2 space-y-3">
              {results.channels.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Channels</div>
                  {results.channels.map((c) => renderResultItem("channel", c))}
                </div>
              )}
              {results.games.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Games</div>
                  {results.games.map((g) => renderResultItem("game", g))}
                </div>
              )}
              {results.streams.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Live Streams</div>
                  {results.streams.map((s) => renderResultItem("stream", s))}
                </div>
              )}
              {results.channels.length === 0 && results.games.length === 0 && results.streams.length === 0 && (
                <div className="p-4 text-center text-[var(--text-tertiary)]">No results found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;