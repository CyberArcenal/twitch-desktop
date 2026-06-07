const { AdBlockState } = require('./ad-block.state');
const { handleAdStart } = require('./handlers/ad-start.handler');
const { handleAdEnd } = require('./handlers/ad-end.handler');
const { getAdStatus } = require('./handlers/ad-status.handler');

class AdBlockService {
  constructor() {
    this.state = new AdBlockState();
  }

  onAdStart() {
    handleAdStart(this.state);
  }

  onAdEnd() {
    handleAdEnd(this.state);
  }

  isAdActive() {
    return getAdStatus(this.state);
  }
}

const adBlockService = new AdBlockService();
module.exports = { adBlockService, AdBlockService };