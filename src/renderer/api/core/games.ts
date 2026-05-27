// src/renderer/api/core/games.ts
import type { BaseResponse } from './common';

export interface Game {
  id: string;
  name: string;
  box_art_url: string;
}

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination?: { cursor: string };
}

class GamesAPI {
  async getTopGames(first: number = 20): Promise<BaseResponse<PaginatedResult<Game>>> {
    return window.backendAPI.games({
      method: 'getTopGames',
      params: { first }
    });
  }

  async getGameInfo(gameId: string): Promise<BaseResponse<Game | null>> {
    return window.backendAPI.games({
      method: 'getGameInfo',
      params: { gameId }
    });
  }

  async getStreamsByGame(gameId: string, first: number = 20): Promise<BaseResponse<PaginatedResult<Stream>>> {
    return window.backendAPI.games({
      method: 'getStreamsByGame',
      params: { gameId, first }
    });
  }

  async getGameByName(name: string): Promise<BaseResponse<Game[]>> {
    return window.backendAPI.games({
      method: 'getGameByName',
      params: { name }
    });
  }
}

export const gamesAPI = new GamesAPI();