// src/renderer/pages/settings/sections/ChatFiltersSection.tsx
import React from 'react';
import { RefreshCw, MessageSquare } from 'lucide-react';
import Button from '../../../components/UI/Button';
import { useChatFilters } from '../chat/hooks/useChatFilters';
import AddFilterForm from '../chat/components/AddFilterForm';
import FilterWordList from '../chat/components/FilterWordList';
import ModerationToggles from '../chat/components/ModerationToggles';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const ChatFiltersSection: React.FC = () => {
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
       <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading stream data..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat & Filters</h1>
          <p className="text-sm text-[#adadb8] mt-1">
            Manage blocked words and chat moderation settings
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} icon={RefreshCw} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="space-y-8">
        {/* Blocked words section */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#9147ff]" />
            <h2 className="text-lg font-semibold text-white">Blocked Words</h2>
          </div>
          <p className="text-sm text-[#adadb8] mb-4">
            Messages containing these words (case‑insensitive) will be hidden from chat.
          </p>
          <AddFilterForm onAdd={addFilterWord} />
          <div className="mt-4">
            <FilterWordList words={filterWords} onRemove={removeFilterWord} />
          </div>
        </div>

        {/* Moderation toggles section */}
        <div className="bg-[#1f1f23] border border-[#2a2a2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chat Moderation</h2>
          <ModerationToggles
            settings={chatSettings}
            saving={saving}
            onToggle={updateModerationSetting}
          />
        </div>

        {/* Info note */}
        <div className="bg-[#0e0e10] rounded-lg p-4 text-sm text-[#adadb8]">
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

export default ChatFiltersSection;