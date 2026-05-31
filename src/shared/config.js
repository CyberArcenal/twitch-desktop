const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

let isPackaged = false;
try {
  const electron = require("electron");
  isPackaged = electron.app.isPackaged;
} catch (e) {
  isPackaged = false;
}

const IS_DEV = process.env.NODE_ENV === "development" || !isPackaged;
const API_BASE = "https://api.twitch.tv/helix";

const CLIENT_ID =
  process.env.TWITCH_CLIENT_ID || process.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET; // NEW

if (!CLIENT_ID && !IS_DEV) {
  console.error("[Config] Missing TWITCH_CLIENT_ID environment variable");
}

const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || "http://localhost";

// const SCOPES = [
//   "user:read:email",
//   "user:read:follows",
//   "user:edit:follows",
//   "chat:read",
//   "chat:edit",
//   "clips:edit",
//   "whispers:read",
//   "whispers:edit",
//   "channel:read:subscriptions",
//   "channel:manage:moderators",
//   "channel:read:stream_key",
//   "channel:manage:broadcast",
//   "channel:manage:predictions",
//   "channel:manage:raids",
//   "channel:read:predictions",
//   "moderator:read:followers",
//   "moderation:read",
//   "user:read:chat",
//   "user:write:chat",
// ].join(" ");

const SCOPES = [
  // Legacy chat (IRC) – panatilihin para sa backward compatibility
  "chat:read",
  "chat:edit",

  // User Info
  "user:read:email",
  "user:read:follows",
  "user:edit:follows", // Deprecated but still required for follow/unfollow

  // Modern Chat (Helix Chat API)
  "user:read:chat",
  "user:write:chat",
  "channel:moderate", // For moderation actions
  "user:bot",         // Para sa bot functionality sa chat

  // Whispers
  "user:manage:whispers", // Basa at send ng whispers

  // Clips
  "clips:edit",
  "channel:manage:clips", // Pamahalaan ang mga clips

  // Channel Management
  "channel:read:subscriptions",
  "channel:manage:moderators",
  "channel:read:stream_key",
  "channel:manage:broadcast",
  "channel:manage:predictions",
  "channel:read:predictions",
  "channel:manage:raids",
  "channel:edit:commercial",     // Magpatakbo ng ads
  "channel:manage:schedule",     // Pamahalaan ang streaming schedule
  "channel:manage:vips",         // Magdagdag/remove ng VIPs
  "channel:manage:videos",       // Burahin ang VODs

  // Followers & Moderation
  "moderator:read:followers",
  "moderation:read",
  "moderator:manage:banned_users",   // Ban/Unban users
  "moderator:manage:automod",        // I-manage ang AutoMod
  "moderator:manage:announcements",  // Mag-announce sa chat

  // Bits at Monetization
  "bits:read",                       // Basahin ang Bits leaderboard
  "channel:read:goals",              // Basahin ang Creator Goals
  "channel:read:hype_train",         // Basahin ang Hype Train status
  "channel:read:charity",            // Basahin ang charity campaigns

  // Channel Points (Redemptions & Polls)
  "channel:read:redemptions",        // Basahin ang custom rewards
  "channel:manage:redemptions",      // Pamahalaan ang rewards
  "channel:read:polls",              // Basahin ang polls
  "channel:manage:polls",            // Gumawa/end ng polls

  // Editors
  "channel:read:editors",            // Tingnan ang listahan ng editors

  // Blocked users
  "user:read:blocked_users",
  "user:manage:blocked_users",

  // Analytics (kung kailangan)
  "analytics:read:extensions",
  "analytics:read:games"
].join(" ");

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const REVOKE_URL = "https://id.twitch.tv/oauth2/revoke";

module.exports = {
  IS_DEV,
  API_BASE,
  CLIENT_ID,
  CLIENT_SECRET, // NEW
  REDIRECT_URI,
  SCOPES,
  TOKEN_URL,
  REVOKE_URL,
};
