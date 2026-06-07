const { logger } = require('../../utils/logger');
const NodeCache = require('node-cache');

class ThirdPartyEmoteService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
  }

  async getChannelEmotes(channelName) {
    const cacheKey = `channel:${channelName}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const emotes = { bttv: [], ffz: [], sevenTv: [] };

    // 1. BTTV (global + channel)
    try {
      const globalBttv = await fetch('https://api.betterttv.net/3/cached/emotes/global').then(r => r.json());
      const channelBttv = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelName}`).then(r => r.json());
      const combined = [...(globalBttv || []), ...(channelBttv?.channelEmotes || []), ...(channelBttv?.sharedEmotes || [])];
      emotes.bttv = combined.map(e => ({ code: e.code, id: e.id, type: 'bttv', imageType: e.imageType }));
    } catch (err) { logger.warn('[ThirdParty] BTTV fetch failed:', err.message); }

    // 2. FFZ (global + channel)
    try {
      const globalFfz = await fetch('https://api.frankerfacez.com/v1/set/global').then(r => r.json());
      const channelFfz = await fetch(`https://api.frankerfacez.com/v1/room/${channelName}`).then(r => r.json());
      const allEmotes = [...(globalFfz?.sets?.global?.emoticons || []), ...(channelFfz?.sets?.[channelFfz.room?.set]?.emoticons || [])];
      emotes.ffz = allEmotes.map(e => ({ code: e.name, id: e.id, type: 'ffz' }));
    } catch (err) { logger.warn('[ThirdParty] FFZ fetch failed:', err.message); }

    // 3. 7TV (optional – you can add later)
    // ...

    this.cache.set(cacheKey, emotes);
    return emotes;
  }

  getImageUrl(emote) {
    if (emote.type === 'bttv') {
      return `https://cdn.betterttv.net/emote/${emote.id}/2x`;
    } else if (emote.type === 'ffz') {
      return `https://cdn.frankerfacez.com/emote/${emote.id}/2`;
    }
    return null;
  }
}

module.exports = new ThirdPartyEmoteService();