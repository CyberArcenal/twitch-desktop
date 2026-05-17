import React, { useState, useEffect } from "react";
import { MessageCircle, Plus, X, Loader2 } from "lucide-react";
import settingsAPI from "../../api/core/settings";

interface ChatFilter {
  id: string;
  word: string;
  action: "mute" | "block" | "flag";
}

const ChatFiltersSettings: React.FC = () => {
  const [filters, setFilters] = useState<ChatFilter[]>([]);
  const [newFilter, setNewFilter] = useState("");
  const [filterAction, setFilterAction] = useState<"mute" | "block" | "flag">(
    "mute"
  );
  const [slowMode, setSlowMode] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState(5);
  const [emoteOnlyMode, setEmoteOnlyMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsAPI.getSettings();
        if (settings.chatFilters) setFilters(settings.chatFilters);
        if (settings.slowMode !== undefined) setSlowMode(settings.slowMode);
        if (settings.slowModeSeconds)
          setSlowModeSeconds(settings.slowModeSeconds);
        if (settings.emoteOnlyMode !== undefined)
          setEmoteOnlyMode(settings.emoteOnlyMode);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleAddFilter = () => {
    if (!newFilter.trim()) return;

    const newFilterObj: ChatFilter = {
      id: Date.now().toString(),
      word: newFilter,
      action: filterAction,
    };

    setFilters((prev) => [...prev, newFilterObj]);
    setNewFilter("");
  };

  const handleRemoveFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateSettings({
        chatFilters: filters,
        slowMode,
        slowModeSeconds,
        emoteOnlyMode,
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-[var(--twitch-purple)]" />
        <h1 className="text-3xl font-bold text-white">Chat Filters</h1>
      </div>

      <div className="space-y-8">
        {/* Word Filters */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Blocked Words
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Add words or phrases to automatically filter from chat
          </p>

          {/* Add new filter */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFilter}
              onChange={(e) => setNewFilter(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddFilter();
              }}
              placeholder="Enter word or phrase..."
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent"
            />
            <select
              value={filterAction}
              onChange={(e) =>
                setFilterAction(e.target.value as "mute" | "block" | "flag")
              }
              className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--twitch-purple)] focus:border-transparent"
            >
              <option value="mute">Mute</option>
              <option value="block">Block</option>
              <option value="flag">Flag</option>
            </select>
            <button
              onClick={handleAddFilter}
              disabled={!newFilter.trim()}
              className="px-4 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Filter list */}
          <div className="space-y-2">
            {filters.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-sm py-4 text-center">
                No filters added yet
              </p>
            ) : (
              filters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-overlay)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[var(--text-primary)] font-medium">
                      {filter.word}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        filter.action === "mute"
                          ? "bg-[var(--twitch-purple-bg)] text-[var(--twitch-purple)]"
                          : filter.action === "block"
                            ? "bg-red-900 text-red-200"
                            : "bg-yellow-900 text-yellow-200"
                      }`}
                    >
                      {filter.action.charAt(0).toUpperCase() +
                        filter.action.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="p-2 hover:bg-[var(--bg-elevated)] rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Modes */}
        <div className="windows-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chat Modes</h2>

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors mb-3">
            <input
              type="checkbox"
              checked={slowMode}
              onChange={(e) => setSlowMode(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Slow Mode</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Limit chat messages to one per user per interval
              </p>
            </div>
          </label>

          {slowMode && (
            <div className="ml-7 mb-4 space-y-2">
              <label className="flex items-center gap-3">
                <span className="text-[var(--text-secondary)] text-sm min-w-fit">
                  Interval (seconds):
                </span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={slowModeSeconds}
                  onChange={(e) => setSlowModeSeconds(parseInt(e.target.value))}
                  className="w-20 px-3 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)]"
                />
              </label>
            </div>
          )}

          <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-overlay)] transition-colors">
            <input
              type="checkbox"
              checked={emoteOnlyMode}
              onChange={(e) => setEmoteOnlyMode(e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <span className="text-white">Emote Only Mode</span>
              <p className="text-sm text-[var(--text-secondary)]">
                Only allow emotes in chat
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--twitch-purple)] text-white rounded-lg hover:bg-[var(--twitch-purple-dark)] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatFiltersSettings;
