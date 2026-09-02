import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MessageSquare,
  Sparkles,
  Info,
  X,
  PlusCircle,
} from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "10th Marksheet Verified",
    message: "Your 10th standard marksheet has been approved by the admission committee.",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    isRead: false,
    category: "document",
  },
  {
    id: "notif-2",
    title: "Counselor Responded",
    message: "Mr. Sharma replied: 'Seat confirmation for CSE branch is open till Friday.'",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    category: "chat",
  },
  {
    id: "notif-3",
    title: "Fee Payment Reminder",
    message: "Semester 1 registration fee deadline is approaching in 3 days.",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    category: "fee",
  },
  {
    id: "notif-4",
    title: "Application Status Updated",
    message: "Application #CM-2026-892 moved to 'Under Review' status.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    category: "application",
  },
  {
    id: "notif-5",
    title: "AI Course Recommendation",
    message: "CampusMitra AI suggested 3 elective tracks based on your interests.",
    type: "ai",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    isRead: true,
    category: "ai",
  },
];

const SAMPLE_NEW_NOTIFICATIONS = [
  {
    title: "Hostel Allocation Open",
    message: "Hostel room preferences can now be submitted through the portal.",
    type: "info",
    category: "application",
  },
  {
    title: "Document Approved",
    message: "Transfer Certificate has been successfully verified.",
    type: "success",
    category: "document",
  },
  {
    title: "Schedule Consultation",
    message: "Dean of Academics is holding an open Q&A session tomorrow at 11 AM.",
    type: "warning",
    category: "chat",
  },
  {
    title: "AI Chat Summary Ready",
    message: "Your recent conversation about scholarship eligibility has been summarized.",
    type: "ai",
    category: "ai",
  },
];

function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_mitra_notifications");
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const dropdownRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("campus_mitra_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications to localStorage", e);
    }
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addSimulatedNotification = () => {
    const randomItem =
      SAMPLE_NEW_NOTIFICATIONS[
        Math.floor(Math.random() * SAMPLE_NEW_NOTIFICATIONS.length)
      ];
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...randomItem,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const renderIcon = (type, category) => {
    switch (type) {
      case "success":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            {category === "document" ? <FileCheck2 size={16} /> : <CheckCircle2 size={16} />}
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle size={16} />
          </div>
        );
      case "ai":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            {category === "chat" ? <MessageSquare size={16} /> : <Info size={16} />}
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isOpen
            ? "bg-[#1F173D] text-white ring-1 ring-indigo-500"
            : "text-indigo-200 hover:text-white hover:bg-[#1A1333]"
        }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold bg-indigo-500 text-white rounded-full flex items-center justify-center px-1 shadow-md shadow-indigo-600/50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#160F2E] border border-[#2E1F6B] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-4 bg-[#120C24] border-b border-[#2E1F6B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-[#1F173D] text-indigo-400 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="px-2 py-1 text-xs text-indigo-300 hover:text-white bg-[#1A1333] hover:bg-indigo-600/30 border border-[#2E1F6B] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={13} />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all notifications"
                  className="p-1.5 text-indigo-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center px-4 py-2 border-b border-[#2E1F6B]/60 bg-[#160F2E] gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-300 hover:text-white hover:bg-[#1A1333]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                filter === "unread"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-300 hover:text-white hover:bg-[#1A1333]"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto divide-y divide-[#2E1F6B]/40 flex-1 max-h-80">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-indigo-300/70">
                <div className="w-12 h-12 rounded-full bg-[#1A1333] border border-[#2E1F6B] flex items-center justify-center text-indigo-400 mb-2">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-medium text-white">No notifications</p>
                <p className="text-xs text-indigo-400 mt-1">
                  {filter === "unread"
                    ? "You've read all your notifications."
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleReadStatus(item.id)}
                  className={`group p-3.5 flex items-start gap-3 cursor-pointer transition-all duration-150 relative ${
                    !item.isRead
                      ? "bg-[#1D143D]/70 hover:bg-[#221749]"
                      : "hover:bg-[#1A1333]/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Category icon */}
                  {renderIcon(item.type, item.category)}

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-baseline justify-between gap-1">
                      <p
                        className={`text-xs font-semibold truncate ${
                          !item.isRead ? "text-white" : "text-indigo-200"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    <p className="text-xs text-indigo-300/90 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-indigo-400/80 font-medium">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                      {!item.isRead && (
                        <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-medium bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side status / delete */}
                  <div className="absolute right-3 top-3.5 flex items-center gap-1">
                    {!item.isRead ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    ) : null}
                    <button
                      onClick={(e) => deleteNotification(item.id, e)}
                      title="Delete"
                      className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-red-400 p-1 rounded transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Interactive Testing Action */}
          <div className="p-2.5 bg-[#120C24] border-t border-[#2E1F6B] flex items-center justify-between gap-2">
            <span className="text-[11px] text-indigo-400/70 pl-1">
              Click any item to toggle read
            </span>
            <button
              onClick={addSimulatedNotification}
              className="text-[11px] text-indigo-300 hover:text-white bg-[#1A1333] hover:bg-indigo-600/40 border border-[#2E1F6B] px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle size={13} className="text-indigo-400" />
              <span>Simulate alert</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
