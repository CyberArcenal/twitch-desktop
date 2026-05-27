// src/renderer/pages/browse/clips/types.ts
// src/renderer/pages/browse/clips/types.ts
import type { Clip } from '../../../api/core/clips';

export type Period = 'day' | 'week' | 'month' | 'all';

export interface ClipWithPlaying extends Clip {
  isPlaying?: boolean;
}