const crypto = require('crypto');
const { logger } = require('../../../utils/logger');

function generateCodeVerifier() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  logger.debug('[Auth] Generated code verifier');
  return verifier;
}

function generateCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  logger.debug('[Auth] Generated code challenge');
  return challenge;
}

module.exports = { generateCodeVerifier, generateCodeChallenge };