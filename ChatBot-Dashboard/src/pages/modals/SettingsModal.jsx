import React, { useState } from "react";
import { X, Settings, Moon, Bell, Volume2, Shield, Sparkles } from "lucide-react";

export function SettingsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [streamReplies, setStreamReplies] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="text-xs text-zinc-400">Manage your application & chat preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 my-5">
          {/* Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-200">Push Notifications</p>
                <p className="text-xs text-zinc-400">Receive counselor alerts and updates</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-200">Sound Effects</p>
                <p className="text-xs text-zinc-400">Play sound when new message arrives</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Stream Replies */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-200">Realtime Typing Animation</p>
                <p className="text-xs text-zinc-400">Stream AI responses letter by letter</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={streamReplies}
              onChange={(e) => setStreamReplies(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export const settingsModal = SettingsModal;
export default SettingsModal;
