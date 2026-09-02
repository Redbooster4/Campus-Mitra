import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import Toast from "./Toast";
import MessageFeedback from "./MessageFeedback";

const initialMessage = { id: "init", sender: "bot", text: "Hi! How can I help you today?" };

function ChatWindow({ language = "en" }) {
  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [initialMessage] }
  ]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 15000) + 5000;
    const timer = setTimeout(() => setToastMessage("random"), randomDelay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  function handleNewChat() {
    const newChat = { id: Date.now(), title: "New Chat", messages: [initialMessage] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }

  function handleRenameChat(chatId, newTitle) {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
    );
  }

  function handleDeleteChat(chatId) {
    setChats((prev) => {
      const remaining = prev.filter((chat) => chat.id !== chatId);
      if (chatId === activeChatId) {
        if (remaining.length > 0) {
          setActiveChatId(remaining[0].id);
        } else {
          const newChat = { id: Date.now(), title: "New Chat", messages: [initialMessage] };
          setActiveChatId(newChat.id);
          return [newChat];
        }
      }
      return remaining;
    });
  }

  function updateActiveChatMessages(updater) {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: updater(chat.messages) } : chat
      )
    );
  }

  async function handleSend() {
    if (input.trim() === "" || isSending) return;

    const userMessage = { id: `${Date.now()}-user`, sender: "user", text: input };
    updateActiveChatMessages((prev) => [...prev, userMessage]);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId && chat.title === "New Chat"
          ? { ...chat, title: input.slice(0, 25) }
          : chat
      )
    );

    const query = input;
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          student_id: "e6f53010-740a-4074-956a-d9b45685adf4",
          language
        })
      });

      const data = await response.json();
      const botMessage = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text: data.answer
      };
      updateActiveChatMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      updateActiveChatMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-error`, sender: "bot", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFeedback(chatId, messageId, type) {
    const chat = chats.find((c) => c.id === chatId);
    const message = chat?.messages.find((m) => m.id === messageId);

    try {
      await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "e6f53010-740a-4074-956a-d9b45685adf4",
          message_text: message?.text,
          feedback: type // "up" or "down"
        })
      });
    } catch (err) {
      console.error("Feedback submission failed:", err);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex-1 flex min-h-0 bg-gradient-to-br from-[#0F0B1F] via-[#120C24] to-[#0F0B1F]">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 overflow-y-auto chat-scrollbar min-h-0">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-[#1A1333] flex items-center justify-center text-sm shrink-0">
                    🤖
                  </div>
                )}
                <div className="flex flex-col">
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-[#1A1333] text-indigo-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "bot" && msg.id !== "init" && (
                    <MessageFeedback
                      messageId={msg.id}
                      chatId={activeChatId}
                      onFeedback={handleFeedback}
                    />
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    S
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex items-end gap-2 justify-start animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-full bg-[#1A1333] flex items-center justify-center text-sm shrink-0">
                  🤖
                </div>
                <div className="bg-[#1A1333] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="relative border-t border-[#2E1F6B] bg-[#0F0B1F]/60 backdrop-blur px-4 py-4">
          {toastMessage && (
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
          )}

          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 bg-[#1A1333] text-white placeholder-indigo-300/50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 transition-shadow disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;