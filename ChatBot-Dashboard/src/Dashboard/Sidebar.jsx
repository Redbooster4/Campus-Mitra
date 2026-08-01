import { LayoutDashboard, FileText, MessageSquare, User, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Application Status", icon: FileText },
  { label: "Chat with AI", icon: MessageSquare },
  { label: "Profile", icon: User },
];

function Sidebar({ activeItem, onSelect, onLogout }) {
  return (
    <aside className="h-screen w-64 bg-[#0F0B1F] border-r border-[#2E1F6B] flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#2E1F6B]">
        <span className="text-2xl">🤖</span>
        <span className="text-white font-bold text-lg">SBMP Assistant</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ label, icon: Icon }) => {
          const isActive = activeItem === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-200 hover:bg-[#1A1333] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-6 border-t border-[#2E1F6B]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-[#1A1333] hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;