const { logger } = require('../../../utils/logger');

function buildUrl(type, id, options = {}) {
  const base = 'https://player.twitch.tv';
  const params = new URLSearchParams({
    parent: 'localhost',
    autoplay: options.autoplay ? 'true' : 'false'
  });
  if (type === 'stream') params.set('channel', id);
  else if (type === 'vod') params.set('video', id);
  if (options.quality && options.quality !== 'auto') params.set('quality', options.quality);
  if (options.timestamp) params.set('timestamp', options.timestamp);
  const url = `${base}/?${params.toString()}`;
  logger.debug(`[Player] Built URL for ${type} ${id}: ${url}`);
  return url;
}

module.exports = { buildUrl };