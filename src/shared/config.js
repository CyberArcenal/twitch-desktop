const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

let isPackaged = false;
try {
  const electron = require('electron');
  isPackaged = electron.app.isPackaged;
} catch (e) {
  isPackaged = false;
}

const IS_DEV = process.env.NODE_ENV === 'development' || !isPackaged;
const API_BASE = 'https://api.twitch.tv/helix';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET; // NEW

if (!CLIENT_ID && !IS_DEV) {
  console.error('[Config] Missing TWITCH_CLIENT_ID environment variable');
}

const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || 'http://localhost';
// src/shared/config.js  (o kung saan man ito)
const SCOPES = [
  'user:read:email',
  'user:read:follows',
  'user:edit:follows',
  'chat:read',
  'chat:edit',
  'whispers:read',
  'whispers:edit',
  'channel:read:subscriptions',
  'channel:read:stream_key',
  'channel:manage:broadcast',
  'channel:manage:predictions',
  'channel:read:predictions',
  'moderator:read:followers',
].join(' ');

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const REVOKE_URL = 'https://id.twitch.tv/oauth2/revoke';

module.exports = {
  IS_DEV,
  API_BASE,
  CLIENT_ID,
  CLIENT_SECRET, // NEW
  REDIRECT_URI,
  SCOPES,
  TOKEN_URL,
  REVOKE_URL
};