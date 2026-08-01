import { useState } from "react";
import { Bell, Search, Menu, X } from "lucide-react";

function Navbar({ studentName = "Student", onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false);

  if (searchOpen) {
    return (
      <header className="h-16 flex items-center gap-3 px-4 bg-[#0F0B1F] border-b border-[#2E1F6B]">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300"
            size={16}
          />
          <input
            type="text"
            autoFocus
            placeholder="Search..."
            className="w-full bg-[#1A1333] text-white placeholder-indigo-300 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#2E1F6B] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setSearchOpen(false)}
          className="text-indigo-200 hover:text-white shrink-0"
        >
          <X size={22} />
        </button>
      </header>
    );
  }

  return (
    <header className="h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-[#0F0B1F] border-b border-[#2E1F6B] overflow-hidden">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden text-indigo-200 hover:text-white shrink-0"
        >
          <Menu size={22} />
        </button>

        {/* Desktop search bar */}
        <div className="relative w-full max-w-xs hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#1A1333] text-white placeholder-indigo-300 text-sm rounded-xl pl-9 pr-4 py-2 border border-[#2E1F6B] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden text-indigo-200 hover:text-white shrink-0"
        >
          <Search size={20} />
        </button>

        <button className="relative text-indigo-200 hover:text-white transition-colors shrink-0">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-sm font-medium hidden lg:block truncate max-w-[120px]">
            {studentName}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;