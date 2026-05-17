// src/pages/Browse/types.ts

import type { Stream } from "../../api/core/twitch";

export interface BrowseStream extends Stream {
  user_name: string;
  user_login: string;
}