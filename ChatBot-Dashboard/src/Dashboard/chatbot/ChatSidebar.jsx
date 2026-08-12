import { useState } from "react";
import { Trash2, Check, X, MessageSquare, Plus } from "lucide-react";

function ChatSidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  function handleDeleteClick(e, chatId) {
    e.stopPropagation();
    onDeleteChat(chatId);
  }

  function startEditing(e, chat) {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditValue(chat.title);
  }

  function saveEdit(e, chatId) {
    e.stopPropagation();
    if (editValue.trim() !== "") onRenameChat(chatId, editValue.trim());
    setEditingId(null);
  }

  function cancelEdit(e) {
    e.stopPropagation();
    setEditingId(null);
  }

  function handleKeyDown(e, chatId) {
    if (e.key === "Enter") saveEdit(e, chatId);
    else if (e.key === "Escape") cancelEdit(e);
  }

  return (
    <div className="w-64 h-full bg-[#0F0B1F] border-r border-[#2E1F6B] flex flex-col p-4">
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm mb-5 transition-all hover:scale-[1.02] active:scale-95 shadow-sm shadow-indigo-900/40"
      >
        <Plus size={16} />
        New Chat
      </button>

      <p className="text-indigo-400/70 text-xs font-semibold tracking-wide mb-3 px-1">
        CHAT HISTORY
      </p>

      <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
        {chats.length === 0 && (
          <div className="text-center py-10 px-2">
            <MessageSquare className="mx-auto text-indigo-400/30 mb-2" size={28} />
            <p className="text-indigo-400/60 text-sm">No conversations yet</p>
          </div>
        )}

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            onDoubleClick={(e) => startEditing(e, chat)}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors ${
              chat.id === activeChatId
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                : "text-indigo-200 hover:bg-[#1A1333]"
            }`}
          >
            {editingId === chat.id ? (
              <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, chat.id)}
                  autoFocus
                  className="flex-1 bg-[#0F0B1F] text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={(e) => saveEdit(e, chat.id)}
                  className="text-green-400 hover:text-green-300 shrink-0"
                >
                  <Check size={14} />
                </button>
                <button onClick={cancelEdit} className="text-red-400 hover:text-red-300 shrink-0">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare size={14} className="shrink-0 opacity-60" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 text-indigo-300 hover:text-red-400 ml-2 shrink-0 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatSidebar;