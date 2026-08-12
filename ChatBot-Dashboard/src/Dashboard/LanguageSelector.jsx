import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
];

function LanguageSelector({ language, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-indigo-200 hover:bg-[#1A1333] hover:text-white transition-colors"
        title="Change language"
      >
        <Globe size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1A1333] border border-[#2E1F6B] rounded-xl shadow-lg shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="px-4 pt-3 pb-2 text-xs font-semibold text-indigo-400/70 tracking-wide">
            LANGUAGE
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                lang.code === language
                  ? "text-white bg-indigo-600/20"
                  : "text-indigo-200 hover:bg-[#241a3f]"
              }`}
            >
              {lang.label}
              {lang.code === language && <Check size={14} className="text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;