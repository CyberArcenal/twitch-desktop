// src/renderer/pages/history/types.ts
// src/renderer/pages/history/types.ts
import type { HistoryEntry } from '../../api/core/history';

export interface HistoryItem extends HistoryEntry {
  selected?: boolean;
}

export type SortField = 'watchedAt' | 'channelName' | 'title';
export type SortOrder = 'asc' | 'desc';