// src/main/services/twitch-predictions.service.js
//@ts-check
// @ts-ignore
const { twitchApiService } = require('./twitch-api.service');
const { twitchAuthService } = require('./twitch-auth.service');

class TwitchPredictionsService {
  /**
   * @param {any} broadcasterId
   */
  async getActivePredictions(broadcasterId) {
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const { CLIENT_ID, API_BASE } = require('../shared/config');
    const url = `${API_BASE}/predictions?broadcaster_id=${broadcasterId}`;
    const response = await fetch(url, {
      // @ts-ignore
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }
    const data = await response.json();
    return data.data || [];
  }

  /**
   * @param {any} broadcasterId
   * @param {any} title
   * @param {any[]} outcomes
   */
  async createPrediction(broadcasterId, title, outcomes, predictionWindowSeconds = 60) {
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const { CLIENT_ID, API_BASE } = require('../shared/config');
    const url = `${API_BASE}/predictions`;
    const body = {
      broadcaster_id: broadcasterId,
      title,
      outcomes: outcomes.map((/** @type {any} */ o) => ({ title: o })),
      prediction_window: predictionWindowSeconds
    };
    const response = await fetch(url, {
      method: 'POST',
      // @ts-ignore
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Failed to create prediction');
    const data = await response.json();
    return data.data[0];
  }

  /**
   * @param {any} predictionId
   * @param {any} winningOutcomeId
   */
  async resolvePrediction(predictionId, winningOutcomeId) {
    const token = twitchAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const { CLIENT_ID, API_BASE } = require('../shared/config');
    const url = `${API_BASE}/predictions`;
    const body = {
      id: predictionId,
      status: 'RESOLVED',
      winning_outcome_id: winningOutcomeId
    };
    const response = await fetch(url, {
      method: 'PATCH',
      // @ts-ignore
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Failed to resolve prediction');
    const data = await response.json();
    return data.data[0];
  }
}

const predictionsService = new TwitchPredictionsService();
module.exports = { predictionsService, TwitchPredictionsService };