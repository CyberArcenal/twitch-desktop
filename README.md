# 🎮 Twitch Desktop

A feature‑rich, cross‑platform desktop client for Twitch built with **Electron**, **React**, **TypeScript**, and **Vite**. Experience Twitch like a native app – watch streams, chat, manage follows, and get desktop notifications.

![Electron](https://img.shields.io/badge/Electron-32.x-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

## ✨ Features

- 🔐 **Secure Twitch OAuth** – Login via browser window, tokens stored safely in main process
- 🖥️ **Native Desktop Experience** – Separate window, system tray, custom title bar
- 📺 **Watch Streams & VODs** – Embedded player with chat side‑by‑side
- 💬 **Real‑time Chat** – IRC/WebSocket integration with emotes and badges
- 🔔 **Desktop Notifications** – Get alerts when followed channels go live
- ⚡ **Fast & Lightweight** – Vite for blazing fast HMR, small bundle size
- 🎨 **Customizable** – Light/dark theme, adjustable layout

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Desktop Shell  | Electron (main + preload)           |
| UI Framework   | React 18 + TypeScript               |
| Build Tool     | Vite                                |
| IPC            | Electron `ipcMain` / `ipcRenderer`  |
| Twitch API     | Helix API (OAuth 2.0)               |
| Real‑time Chat | `tmi.js` or `@twurple/chat`         |

## 📦 Installation

### Download prebuilt binary (recommended)
Go to [Releases](https://github.com/yourusername/twitch-desktop/releases) and download the installer for your OS.

### Build from source

```bash
# Clone the repository
git clone https://github.com/yourusername/twitch-desktop.git
cd twitch-desktop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Twitch Client ID to .env (get one from https://dev.twitch.tv/console)

# Run in development mode
npm run dev

# Build production app
npm run build
```

## 🚀 Usage

1. Launch the app
2. Click **Login with Twitch** – a browser window will ask for permissions
3. After login, your followed channels will appear
4. Click any stream to watch and chat
5. Enable notifications in settings

## 🗂️ Project Structure

```
twitch-desktop/
├── src/
│   ├── main/           # Electron main process (OAuth, IPC handlers)
│   ├── renderer/       # React + Vite frontend
│   │   ├── components/ # UI components (Player, Chat, Sidebar)
│   │   ├── pages/      # Login, Home, Stream view
│   │   ├── hooks/      # Custom React hooks
│   │   └── store/      # Zustand state management
│   └── shared/         # TypeScript types shared between main & renderer
├── dist-electron/      # Compiled main process
├── dist-renderer/      # Compiled React app
└── release/            # Packaged installers
```

## 🔧 Development Scripts

| Command         | Description                                    |
|-----------------|------------------------------------------------|
| `npm run dev`   | Start Vite dev server + Electron concurrently |
| `npm run build` | Build both Electron and React for production  |
| `npm run dist`  | Create platform‑specific installer            |
| `npm run lint`  | Run ESLint                                     |

## 🔒 Security Notes

- `nodeIntegration: false`, `contextIsolation: true`
- All Twitch API calls go through the main process (no exposed tokens in renderer)
- Tokens stored using `electron-store` or `keytar` (encrypted)

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT © [Your Name]

## 🙏 Acknowledgements

- [Twitch API](https://dev.twitch.tv/)
- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)