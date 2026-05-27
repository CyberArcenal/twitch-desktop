// src/pages/help/index.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Github,
  HelpCircle,
  Keyboard,
  Mail,
  Heart,
  Scale,
  AlertCircle,
  Twitch,
  Users,
  MessageSquare,
  MonitorPlay,
  Bell,
  Clock,
} from 'lucide-react';

interface AppInfo {
  name: string;
  version: string;
  isDev: boolean;
  platform: string;
}

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    const fetchAppInfo = async () => {
      if (window.backendAPI?.appInfo) {
        const info = await window.backendAPI.appInfo();
        setAppInfo(info);
      } else {
        // Fallback
        setAppInfo({
          name: 'Twitch Desktop',
          version: '1.0.0',
          isDev: false,
          platform: process.platform,
        });
      }
    };
    fetchAppInfo();
  }, []);

  const openExternal = (url: string) => {
    if (window.backendAPI?.openExternal) {
      window.backendAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const goBack = () => navigate(-1);

  const keyboardShortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Focus search bar' },
    { keys: ['Ctrl', 'L'], description: 'Go to live channels' },
    { keys: ['Ctrl', 'F'], description: 'Focus following page' },
    { keys: ['Space'], description: 'Play/Pause player' },
    { keys: ['F'], description: 'Toggle fullscreen' },
    { keys: ['M'], description: 'Mute/Unmute' },
    { keys: ['↑', '↓'], description: 'Volume up/down' },
    { keys: ['Esc'], description: 'Close modal / exit fullscreen' },
  ];

  const features = [
    { icon: Twitch, title: 'Watch Live Streams', desc: 'Low-latency playback with chat' },
    { icon: MessageSquare, title: 'Integrated Chat', desc: 'Emotes, badges, and filters' },
    { icon: Bell, title: 'Desktop Notifications', desc: 'Get alerts when followed channels go live' },
    { icon: MonitorPlay, title: 'VOD & Clip Support', desc: 'Watch past broadcasts and clips' },
    { icon: Clock, title: 'Watch Later', desc: 'Save streams to watch later' },
    { icon: Users, title: 'Friends & Whispers', desc: 'Direct messages and friend list' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-[var(--card-hover-bg)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--sidebar-text)]"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-[var(--sidebar-text)]">Help & About</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* App Info Card */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-4 mb-4">
            <img src="./icon.png" alt="Twitch Desktop" className="w-12 h-12 rounded-xl" />
            <div>
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)]">
                {appInfo?.name || 'Twitch Desktop'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Version {appInfo?.version || '1.0.0'} • {appInfo?.platform || 'Desktop'}
                {appInfo?.isDev && ' • Development Mode'}
              </p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] mt-2">
            A modern, feature‑rich desktop client for Twitch built with Electron, React, TypeScript, and Vite.
            Experience Twitch like a native app – watch streams, chat, manage follows, and get desktop notifications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Twitch className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--card-hover-bg)] transition">
                <feature.icon className="w-5 h-5 text-[var(--primary-color)] mt-0.5" />
                <div>
                  <h3 className="font-medium text-[var(--sidebar-text)]">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Keyboard Shortcuts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyboardShortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-[var(--border-color)] last:border-0">
                <span className="text-sm text-[var(--text-secondary)]">{shortcut.description}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, kidx) => (
                    <kbd
                      key={kidx}
                      className="px-2 py-1 bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)] rounded text-xs font-mono border border-[var(--border-color)]"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Quick Links</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openExternal('https://github.com/CyberArcenal/twitch-desktop')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)] rounded-lg text-sm text-[var(--sidebar-text)] transition"
            >
              <Github className="w-4 h-4" /> GitHub Repository
            </button>
            <button
              onClick={() => openExternal('https://dev.twitch.tv/docs')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)] rounded-lg text-sm text-[var(--sidebar-text)] transition"
            >
              <Twitch className="w-4 h-4" /> Twitch API Docs
            </button>
            <button
              onClick={() => openExternal('mailto:cyberarcenal1@gmail.com?subject=Twitch%20Desktop%20Support')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)] rounded-lg text-sm text-[var(--sidebar-text)] transition"
            >
              <Mail className="w-4 h-4" /> Support Email
            </button>
          </div>
        </div>

        {/* License & Disclaimer */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">License</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            Twitch Desktop is open‑source software licensed under the <strong>MIT License</strong>.
            You are free to use, modify, and distribute this software.
          </p>
          <button
            onClick={() => openExternal('https://opensource.org/licenses/MIT')}
            className="text-[var(--primary-color)] hover:underline text-sm"
          >
            Read MIT License →
          </button>
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <p className="text-xs text-[var(--text-tertiary)]">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
              </p>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-xl font-bold text-[var(--sidebar-text)]">Acknowledgments</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Built with ❤️ by <strong>CyberArcenal</strong>.
            Uses the <strong>Twitch API</strong>, <strong>Electron</strong>, <strong>React</strong>, and <strong>Vite</strong>.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Twitch name and logo are trademarks of Twitch Interactive, Inc.
            This project is not affiliated with or endorsed by Twitch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;