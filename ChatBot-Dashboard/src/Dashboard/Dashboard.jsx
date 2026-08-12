import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import MainContent from "./Main_content.jsx";
import ChatWindow from "./chatbot/ChatWindow.jsx";

function Dashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();
  const isChatView = activeItem === "Chat with AI";

  async function handleLogout() {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error occurred:", err);
    } finally {
      localStorage.removeItem("token");
    }
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-[#0F0B1F] overflow-hidden">
      {/* Main nav sidebar — hidden while in Chat with AI view */}
      {!isChatView && (
        <Sidebar
          activeItem={activeItem}
          onSelect={setActiveItem}
          onLogout={handleLogout}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar language={language} onLanguageChange={setLanguage} />

        {isChatView ? (
          <ChatWindow
            language={language}
            onBack={() => setActiveItem("Dashboard")}
          />
        ) : (
          <MainContent tab={activeItem} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;