import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

function Toast({ message, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(prev - step, 0));
    }, interval);

    const closeTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  return (
    <div className="absolute bottom-full right-0 mb-3 animate-slide-up">
      <div className="bg-[#1A1333] border border-[#2E1F6B] rounded-xl overflow-hidden shadow-lg w-72">
        <div className="px-4 py-3 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-indigo-100 text-sm flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-indigo-300 hover:text-white shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="h-1 bg-[#0F0B1F]">
          <div
            className="h-full bg-blue-400 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default Toast;