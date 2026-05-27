import React from 'react';
import { RefreshCw, MessageSquare } from 'lucide-react';
import { useChatFilters } from './hooks/useChatFilters';
import FilterWordList from './components/FilterWordList';
import AddFilterForm from './components/AddFilterForm';
import ModerationToggles from './components/ModerationToggles';
import Button from '../../../components/UI/Button';

const ChatSettingsPage: React.FC = () => {
  const {
    filterWords,
    chatSettings,
    loading,
    saving,
    addFilterWord,
    removeFilterWord,
    updateModerationSetting,
    refresh,
  } = useChatFilters();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sidebar-text)]">Chat & Filters</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage blocked words and chat moderation settings
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="space-y-8">
        {/* Blocked words section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">Blocked Words</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Messages containing these words (case‑insensitive) will be hidden from chat.
          </p>
          <AddFilterForm onAdd={addFilterWord} />
          <div className="mt-4">
            <FilterWordList words={filterWords} onRemove={removeFilterWord} />
          </div>
        </div>

        {/* Moderation toggles section */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)] mb-4">Chat Moderation</h2>
          <ModerationToggles
            settings={chatSettings}
            saving={saving}
            onToggle={updateModerationSetting}
          />
        </div>

        {/* Info note */}
        <div className="bg-[var(--card-secondary-bg)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
          <p className="font-medium mb-1">ℹ️ Note</p>
          <p>
            Slow mode and followers‑only mode are channel‑wide settings. Changes apply immediately.
            Blocked words are stored locally and only affect your own chat view.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsPage;