# Stream Manager – Full Implementation Plan

## 1. Objective
Magkaroon ng dedicated page sa Twitch Desktop app kung saan ang streamer ay:
- Makakakita kung live siya (auto-refresh)
- Magagabayan upang mag-go live (stream key, OBS setup)
- Makokontrol ang chat (ban, timeout, clear chat)
- Makikita ang real‑time events (new followers, subs, raids)
- Maka‑update ng stream info (title, game)
- Maka‑run ng mga quick actions (ad, raid, poll)
- (Optional) Makita ang stream health (bitrate, fps via OBS WebSocket)

## 2. Folder Structure
```
src/renderer/pages/stream-manager/
├── index.tsx                      # Main page, handles live status
├── components/
│   ├── NotLiveView.tsx            # “Go Live” guide (stream key, dashboard link)
│   ├── LiveStreamManager.tsx      # Tabs container when live
│   ├── StreamInfoCard.tsx         # Title, game, viewer count, uptime
│   ├── ChatModerationPanel.tsx    # Chat messages + moderation buttons
│   ├── EventsPanel.tsx            # Real‑time follow/sub/raid list
│   ├── QuickActions.tsx           # Update title, run ad, start raid, poll
│   └── StreamHealth.tsx           # OBS stats (optional)
├── hooks/
│   ├── useLiveStatus.ts           # Fetch live stream every 30 sec
│   ├── useStreamInfo.ts           # Update title/game via API
│   ├── useModeration.ts           # Ban, timeout, clear chat
│   ├── useStreamEvents.ts         # EventSub (follow, subscribe, raid)
│   └── useOBSWebSocket.ts         # Connect to OBS WebSocket
└── utils/
    └── streamKeyStorage.ts        # Securely save/retrieve stream key
```

## 3. Backend Requirements (IPC Handlers)
Kailangan ng mga bagong IPC channel sa main process:

| Channel | Methods | Scopes Needed |
|---------|---------|----------------|
| `streams` | `getMyStream` (already exists) | none (public) |
| `moderation` | `ban`, `timeout`, `unban`, `clearChat`, `getModerators`, `addModerator`, `removeModerator` | `moderator:manage:banned_users`, `moderator:manage:chat_messages`, `channel:manage:moderators` |
| `chat-settings` | `getSettings`, `updateSettings` (slow, follower-only, emote-only) | `moderator:manage:chat_settings` |
| `stream-info` | `updateTitle`, `updateGame`, `getTags`, `updateTags` | `channel:manage:broadcast` |
| `channel-actions` | `runAd`, `startRaid`, `createPoll`, `endPoll` | `channel:manage:redemptions`, `channel:manage:polls`, `channel:manage:raids` |
| `eventsub` (already present) | subscribe to `channel.follow`, `channel.subscribe`, `channel.raid` | `moderation:read`, `channel:read:subscriptions` |

## 4. Detailed Component Specifications

### 4.1 NotLiveView
- Displays a large card with:
  - Stream key input (secure storage, show/hide, copy)
  - Link to Twitch dashboard to retrieve key
  - “I'm Live – Refresh” button (calls `checkLiveStatus`)
- After going live, `LiveStreamManager` mounts.

### 4.2 LiveStreamManager
- Tabs: **Info**, **Chat**, **Events**, **Health**
- Quick actions bar (floating or bottom) with:
  - Update title (quick inline edit)
  - Run 30s ad
  - Start raid (search channel)
  - Create poll

### 4.3 StreamInfoCard
- Shows:
  - Stream title (editable inline)
  - Game category (searchable dropdown using `/search/categories`)
  - Current viewer count
  - Uptime (since `stream.started_at`)
  - Thumbnail preview of stream (optional)

### 4.4 ChatModerationPanel
- Reuses `ChatMessageList` from existing chat sidebar
- Each message has hover buttons: **Timeout (10m)**, **Ban**
- Top bar: **Clear Chat** button, **Slow Mode** toggle
- (Future) Add/remove moderator from list

### 4.5 EventsPanel
- Listens to EventSub (WebSocket) for:
  - `channel.follow` → show “🎉 @user followed!”
  - `channel.subscribe` → “⭐ @user subscribed (Tier 1)”
  - `channel.raid` → “🚀 Raid from @user with X viewers”
- Each event includes timestamp (relative “just now”, “2 min ago”)
- Option to clear events or auto‑scroll

### 4.6 QuickActions
- Floating bar at bottom (similar to Twitter’s tweet composer) or fixed right sidebar.
- Buttons:
  - **Update Title** → opens modal with current title + save
  - **Run Ad** → call `POST /channels/commercial` (duration 30s)
  - **Start Raid** → search channel (debounced) → confirm → call `POST /raids`
  - **Create Poll** → modal with question, choices, duration

### 4.7 StreamHealth (Optional)
- Requires OBS WebSocket (port 4455)
- Configuration screen to input password and auto‑connect
- Shows:
  - Bitrate (kbps)
  - FPS
  - Dropped frames (%)
  - CPU usage (if OBS exposes)

## 5. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer (React)                        │
├─────────────────────────────────────────────────────────────┤
│  StreamManagerPage                                          │
│    ├─ useLiveStatus() ─────┐                               │
│    │                        │                               │
│    ├─ NotLiveView           │                               │
│    │    └─ save/load streamKey from secure storage         │
│    │                                                        │
│    └─ LiveStreamManager                                     │
│         ├─ StreamInfoCard → updateTitle/game (API)          │
│         ├─ ChatModerationPanel → ban/timeout/clear (IPC)    │
│         ├─ EventsPanel → EventSub WebSocket (IPC)           │
│         ├─ QuickActions → runAd/raid/poll (IPC)             │
│         └─ StreamHealth → OBS WebSocket (optional)          │
└─────────────────────────────────────────────────────────────┘
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Main (Electron)                        │
├─────────────────────────────────────────────────────────────┤
│  – twitch-api (additional methods)                  │
│  – twitch-chat (moderation helpers)                 │
│  – eventsub (new subscriptions)                     │
│  – obs-websocket (optional)                         │
│  – ipc handlers (new channels: moderation, stream-info, etc)│
└─────────────────────────────────────────────────────────────┘
```

## 6. UI Styling Guidelines
- Consistent with Twitch dark theme (`bg-[#0e0e10]`, cards `bg-[#1f1f23]`)
- Hover effects on messages (fast, smooth transitions)
- Modals with semi‑transparent backdrop (`bg-black/70`)
- Icons from `lucide-react` (consistent with existing)
- Responsive: fixed width 340px for right panels, main area flexible

## 7. Implementation Phases

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| **Phase 1** | Create `stream-manager` page skeleton, routing, `useLiveStatus` hook | 2h |
| **Phase 2** | Implement `NotLiveView` with stream key storage (Electron `safeStorage`) | 2h |
| **Phase 3** | Build `LiveStreamManager` tabs layout and `StreamInfoCard` (read‑only first) | 2h |
| **Phase 4** | Integrate real chat into `ChatModerationPanel`, add ban/timeout IPC | 4h |
| **Phase 5** | Add `QuickActions`: update title, run ad, start raid | 3h |
| **Phase 6** | Add EventSub for follows/subs/raids, display in `EventsPanel` | 3h |
| **Phase 7** | (Optional) OBS WebSocket integration for stream health | 4h |
| **Phase 8** | Polish UI, add loading states, error handling, auto‑refresh | 2h |

## 8. Dependencies
- Existing: `@twurple/api`, `@twurple/chat`, `@twurple/eventsub-ws`
- To add for OBS: `obs-websocket-js` (optional)
- For secure storage: Electron’s `safeStorage` (already in main process)

## 9. Testing Checklist
- [ ] NotLiveView displays correctly when offline
- [ ] Stream key is saved and loaded across app restarts
- [ ] After going live in OBS, clicking refresh shows live stream data
- [ ] Chat messages appear in moderation panel
- [ ] Ban button removes user from chat (test with second account)
- [ ] Timeout button mutes user for X seconds
- [ ] Clear Chat removes all messages (API call succeeds)
- [ ] Update title changes stream title (visible on Twitch)
- [ ] Run Ad triggers a 30‑second commercial (broadcaster only)
- [ ] Raid flow works (search, confirm, raid)
- [ ] EventsPanel shows new follow/sub/raid in real time
- [ ] StreamHealth (if implemented) connects to OBS and shows stats

## 10. Potential Pitfalls & Mitigations
- **Stream key storage**: Use `safeStorage.encryptString` / `decryptString`; never log.
- **EventSub reconnection**: Implement automatic reconnect on WebSocket close.
- **Rate limiting**: Moderation endpoints have rate limits – implement queue or debounce.
- **OBS WebSocket**: Password must be stored securely; handle connection failures gracefully.

---

**Next Step:** Start with Phase 1 – create the page and routing.  
You can assign each phase to a separate branch/PR.