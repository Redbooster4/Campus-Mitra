import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Home, LayoutDashboard, UserCheck, MessageSquare, Compass } from "lucide-react";

export function HomeModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const quickLinks = [
    {
      title: "Dashboard",
      description: "View your student overview, metrics, and application status",
      icon: <LayoutDashboard size={20} className="text-blue-500" />,
      path: "/dashboard",
    },
    {
      title: "Home Portal",
      description: "Go to the main campus information hub and announcements",
      icon: <Home size={20} className="text-emerald-500" />,
      path: "/home",
    },
    {
      title: "Onboarding",
      description: "Review or complete your student onboarding process",
      icon: <UserCheck size={20} className="text-purple-500" />,
      path: "/onboarding",
    },
    {
      title: "AI Chat Mitra",
      description: "Continue chatting with your academic counselor",
      icon: <MessageSquare size={20} className="text-amber-500" />,
      action: () => onClose(),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Campus Navigation</h2>
              <p className="text-xs text-zinc-400">Quickly jump to any campus portal</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {quickLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                  onClose();
                }
              }}
              className="flex flex-col items-start text-left p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition group cursor-pointer"
            >
              <div className="mb-2 p-2 rounded-lg bg-zinc-900/80 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                {item.title}
              </span>
              <span className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                {item.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800/80">
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

export const homeModal = HomeModal;
export default HomeModal;
