import React from "react";
import { useNavigate } from "react-router-dom";
import { X, User, LogOut, Mail, ShieldCheck, Calendar } from "lucide-react";

export function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing stored user:", err);
  }

  const user = storedUser || {
    username: "Student User",
    email: "student@campusmitra.edu",
    role: "Student",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onClose();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">My Profile</h2>
              <p className="text-xs text-zinc-400">Account overview and session controls</p>
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

        {/* User Card */}
        <div className="my-5 p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold text-lg shadow-md">
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{user.username}</h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <Mail size={12} />
              <span className="truncate">{user.email || "No email provided"}</span>
            </div>
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
              <ShieldCheck size={11} />
              {user.role || "Student"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export const profileModal = ProfileModal;
export default ProfileModal;
