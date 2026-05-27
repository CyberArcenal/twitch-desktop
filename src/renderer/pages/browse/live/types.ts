// src/renderer/pages/browse/live/types.ts
// src/renderer/pages/browse/live/types.ts
import type { Stream } from '../../../api/core/streams';
import type { Game } from '../../../api/core/games';

export interface FilterState {
  gameId: string;
  language: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}