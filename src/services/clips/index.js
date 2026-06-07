const { getClips } = require('./handlers/get-clips.handler');
const { getClip } = require('./handlers/get-clip.handler');
const { getTopClips } = require('./handlers/get-top-clips.handler');

class ClipsService {
  async getClips(broadcasterId, first = 20) {
    return getClips(broadcasterId, first);
  }

  async getClip(clipId) {
    return getClip(clipId);
  }

  async getTopClips(gameId = null, broadcasterId = null, period = 'week', first = 20) {
    return getTopClips(gameId, broadcasterId, period, first);
  }
}

const clipsService = new ClipsService();
module.exports = { clipsService, ClipsService };