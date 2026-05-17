// src/pages/Live/components/BroadcastSettings.tsx
import React from 'react';
import { Settings, Mic, Video, Wifi } from 'lucide-react';

export interface BroadcastSettingsType {
  title: string;
  gameName: string;
  audioDevice: string;
  videoDevice: string;
  bitrate: number;
  encoder: string;
  server: string;
}

interface Props {
  settings: BroadcastSettingsType;
  onChange: (newSettings: Partial<BroadcastSettingsType>) => void;
}

export const BroadcastSettings: React.FC<Props> = ({ settings, onChange }) => {
  return (
    <div className="windows-card p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] pb-2">
        <Settings size={18} className="text-[var(--twitch-purple)]" />
        <h3 className="text-white font-semibold">Broadcast Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            <Mic size={14} className="inline mr-1" /> Audio Device
          </label>
          <select
            value={settings.audioDevice}
            onChange={(e) => onChange({ audioDevice: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white"
          >
            <option>Default Microphone (Realtek)</option>
            <option>Headset Microphone</option>
            <option>USB Microphone</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            <Video size={14} className="inline mr-1" /> Video Device
          </label>
          <select
            value={settings.videoDevice}
            onChange={(e) => onChange({ videoDevice: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white"
          >
            <option>Logitech C920</option>
            <option>Elgato Cam Link</option>
            <option>Integrated Webcam</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            <Wifi size={14} className="inline mr-1" /> Bitrate (kbps)
          </label>
          <select
            value={settings.bitrate}
            onChange={(e) => onChange({ bitrate: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white"
          >
            <option value={2500}>2500 (Low)</option>
            <option value={4500}>4500 (Medium)</option>
            <option value={6000}>6000 (High - Recommended)</option>
            <option value={8000}>8000 (Very High)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Encoder</label>
          <select
            value={settings.encoder}
            onChange={(e) => onChange({ encoder: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white"
          >
            <option>NVENC H.264 (NVIDIA)</option>
            <option>AMD AMF</option>
            <option>x264 (Software)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Ingest Server</label>
          <select
            value={settings.server}
            onChange={(e) => onChange({ server: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white"
          >
            <option>Auto (Recommended)</option>
            <option>Europe: Amsterdam</option>
            <option>US West: San Francisco</option>
            <option>US East: New York</option>
            <option>Asia: Tokyo</option>
          </select>
        </div>
      </div>
    </div>
  );
};