// src/renderer/api/core/player.ts
import type { BaseResponse } from './common';

export interface PlayerState {
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  currentType: 'stream' | 'vod' | null;
  currentId: string | null;
  quality: string;
}

export interface PlayerLoaded {
  type: 'stream' | 'vod';
  id: string;
}

export interface PlayerError {
  error: string;
}

export interface PlayerQualityChange {
  quality: string;
}

export interface LoadStreamOptions {
  autoplay?: boolean;
  quality?: string;
  timestamp?: number;
}

export interface LoadVodOptions {
  autoplay?: boolean;
  quality?: string;
  timestamp?: number;
}

class PlayerAPI {
  async loadStream(channelName: string, options: LoadStreamOptions = {}): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({
      method: 'loadStream',
      params: { channelName, options }
    });
  }

  async loadVod(vodId: string, options: LoadVodOptions = {}): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({
      method: 'loadVod',
      params: { vodId, options }
    });
  }

  async play(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({ method: 'play' });
  }

  async pause(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({ method: 'pause' });
  }

  async setVolume(level: number): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({
      method: 'setVolume',
      params: { level }
    });
  }

  async toggleMute(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({ method: 'toggleMute' });
  }

  async setQuality(quality: string): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({
      method: 'setQuality',
      params: { quality }
    });
  }

  async fullscreen(): Promise<BaseResponse<boolean>> {
    return window.backendAPI.player({ method: 'fullscreen' });
  }

  async close(): Promise<void> {
    return window.backendAPI.player({ method: 'close' });
  }
}

export const playerAPI = new PlayerAPI();