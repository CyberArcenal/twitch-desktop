import type { Game, Stream } from "../../api/core/games";
import type { HistoryEntry } from "../../api/core/history";


export interface DiscoveryData {
  topStreams: Stream[];
  categories: Game[];
  watchHistory: HistoryEntry[];
  isLoggedIn: boolean;
  loading: {
    streams: boolean;
    categories: boolean;
    history: boolean;
  };
  error: {
    streams?: string;
    categories?: string;
    history?: string;
  };
}