# 🎮 Twitch Desktop

[![GitHub Release](https://img.shields.io/github/v/release/CyberArcenal/twitch-desktop?style=flat-square)](https://github.com/CyberArcenal/twitch-desktop/releases)
[![Electron](https://img.shields.io/badge/Electron-40.x-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

**A modern, native Twitch desktop client** built with Electron, React, TypeScript, and Vite.  
Watch streams, chat, manage your follows, and get desktop notifications – all in a beautiful, customisable app.

---

## ✨ Features

- 🔐 **Secure Twitch login** – OAuth flow inside the app, tokens stored safely in the main process.
- 🖥️ **Native feel** – Customisable sidebar, smooth animations, glassmorphic design.
- 📺 **Watch streams & VODs** – Embedded Twitch player with chat side‑by‑side.
- 💬 **Real‑time chat** – Full IRC chat with emotes, mentions, replies, and moderation tools (ban / timeout / clear).
- 🔔 **Desktop notifications** – Get alerts when followed channels go live, new followers, subscriptions, and raids.
- ⚡ **Lightning fast** – Vite HMR for development, small production bundle.
- 🎨 **Dark / light theme** – Switch between themes instantly.
- 📌 **Watch Later** – Save streams and VODs to watch later, reorder the list, mark as watched.
- 📜 **Watch history** – Automatically track what you’ve watched (30 seconds trigger).
- 💬 **Whispers** – Direct messages between users, with conversation list and real‑time updates.
- 🛠️ **Stream Manager** – (coming soon) control your own stream: update title, game, run ads, raid, and moderate chat from one dashboard.

---

## 🖼️ Screenshots

> *Screenshots will be added soon.*

---

## 📦 Installation

### Download the pre‑built binary (recommended)

Head to the **[Releases](https://github.com/CyberArcenal/twitch-desktop/releases)** page and download the installer for your operating system:

- **Windows**: `Twitch Desktop-Setup-1.0.0.exe`
- **macOS**: `Twitch Desktop-1.0.0.dmg`
- **Linux**: `Twitch Desktop-1.0.0.AppImage` or `.deb`

Run the installer and launch the app.

### Build from source

If you prefer to build the app yourself:

```bash
# Clone the repository
git clone https://github.com/CyberArcenal/twitch-desktop.git
cd twitch-desktop

# Install dependencies
npm install

# Create a .env file (see next section)
cp .env.example .env

# Run in development mode
npm run dev

# Build production installers (output in /release)
npm run build
```

#### Environment variables

You need a Twitch application to get `CLIENT_ID` and `CLIENT_SECRET`.  
[Create one here](https://dev.twitch.tv/console/apps) (set OAuth redirect URI to `http://localhost`). Then fill your `.env`:

```ini
VITE_TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

> **Note**: The `.env` file is **not** committed to Git – keep your secrets safe.

---

## 🚀 Usage

1. **Launch the app** – you will see the login screen.
2. **Click “Login with Twitch”** – a browser window will ask for permissions (read chat, manage follows, etc.).
3. After logging in, your followed channels appear on the **Following** page.
4. **Click any live stream** to watch and chat.
5. Use the **sidebar** to navigate:
   - **Dashboard** – overview, live channels, recommendations.
   - **Following** – all your followed channels (live/offline filter).
   - **Browse** – discover live channels, categories, top clips.
   - **Library** – your watch history and watch later list.
   - **Whispers** – direct messages.
   - **Settings** – notification preferences, chat filters, appearance, security.
6. **Enable desktop notifications** in `Settings → Notifications` to never miss a live stream.

---

## 🛠️ Development

### Project structure

```
twitch-desktop/
├── src/
│   ├── main/           # Electron main process (IPC handlers, services)
│   ├── renderer/       # React + Vite frontend
│   │   ├── api/        # API clients (chat, streams, follows, etc.)
│   │   ├── components/ # Reusable UI components
│   │   ├── layouts/    # Layout components (Sidebar, TopBar)
│   │   ├── pages/      # All pages (dashboard, following, stream, settings, …)
│   │   └── styles/     # Global CSS / Tailwind
│   └── shared/         # Types and constants shared between main & renderer
├── build/              # Icons and other static assets
├── dist-electron/      # Compiled main process (production)
├── dist-renderer/      # Compiled React app (production)
└── release/            # Packaged installers
```

### Available scripts

| Command           | Description                                           |
|-------------------|-------------------------------------------------------|
| `npm run dev`     | Start Vite dev server + Electron in development mode  |
| `npm run build`   | Build both Electron and React for production          |
| `npm run dist:win`| Build Windows installer (NSIS)                        |
| `npm run dist:mac`| Build macOS installer (DMG)                           |
| `npm run dist:linux` | Build Linux packages (AppImage + deb)              |
| `npm run lint`    | Run ESLint                                            |

---

## 🔒 Security

- `nodeIntegration: false`, `contextIsolation: true`
- All Twitch API calls are made from the main process – tokens never exposed to the renderer.
- Tokens stored using `electron-store` (encrypted with `safeStorage` when available).

---

## 🤝 Contributing

Contributions are very welcome! Follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing`).
5. Open a Pull Request.

Please make sure your code passes linting (`npm run lint`).

---

## 📄 License

MIT © [CyberArcenal](https://github.com/CyberArcenal)

---

## 🙏 Acknowledgements

- [Twitch API](https://dev.twitch.tv/) – for providing the Helix API and chat.
- [Electron](https://www.electronjs.org/) – cross‑platform desktop framework.
- [Vite](https://vitejs.dev/) – ultra‑fast build tool.
- [React](https://reactjs.org/) – UI library.
- [Tailwind CSS](https://tailwindcss.com/) – utility‑first CSS.
- [Lucide Icons](https://lucide.dev/) – beautiful icons.
- [Twurple](https://twurple.js.org/) – Twitch API and chat library.