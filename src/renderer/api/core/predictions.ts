// src/renderer/api/core/predictions.ts
import type { BaseResponse } from './common';

export interface PredictionOutcome {
  id: string;
  title: string;
  users: number;
  channel_points: number;
  top_predictors?: any[];
}

export interface Prediction {
  id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  title: string;
  outcomes: PredictionOutcome[];
  prediction_window: number;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELED' | 'LOCKED';
  created_at: string;
  ended_at?: string;
}

class PredictionsAPI {
  async getActive(broadcasterId: string): Promise<BaseResponse<Prediction[]>> {
    return window.backendAPI.predictions({
      method: 'getActive',
      params: { broadcasterId }
    });
  }

  async create(broadcasterId: string, title: string, outcomes: string[], predictionWindowSeconds: number = 60): Promise<BaseResponse<Prediction>> {
    return window.backendAPI.predictions({
      method: 'create',
      params: { broadcasterId, title, outcomes, predictionWindowSeconds }
    });
  }

  async resolve(predictionId: string, winningOutcomeId: string): Promise<BaseResponse<Prediction>> {
    return window.backendAPI.predictions({
      method: 'resolve',
      params: { predictionId, winningOutcomeId }
    });
  }
}

export const predictionsAPI = new PredictionsAPI();