// src/shared/config.js
let isPackaged = false;
try {
  const electron = require('electron');
  isPackaged = electron.app.isPackaged;
} catch (e) {
  isPackaged = false;
}

const IS_DEV = process.env.NODE_ENV === 'development' || !isPackaged;

const MOCK_API_BASE = 'http://localhost:8080/helix';
const REAL_API_BASE = 'https://api.twitch.tv/helix';

const CLIENT_ID = IS_DEV ? 'mock' : (process.env.TWITCH_CLIENT_ID || 'your_client_id_here');

const REDIRECT_URI = 'http://localhost:3000/auth/callback';
const SCOPES = [
  'user:read:email',
  'chat:read',
  'chat:edit',
  'channel:read:subscriptions',
  'user:read:follows'
].join(' ');

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const REVOKE_URL = 'https://id.twitch.tv/oauth2/revoke';
const API_BASE = IS_DEV ? MOCK_API_BASE : REAL_API_BASE;

module.exports = {
  IS_DEV,
  API_BASE,
  CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
  TOKEN_URL,
  REVOKE_URL
};