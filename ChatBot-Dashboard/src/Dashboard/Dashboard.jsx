import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MainContent from "./Main_content";
import api from "../api/api.js";

function Dashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout Error Occured: ", err);
    } finally {
      localStorage.removeItem("token");
    }
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-[#120C24] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed md:static z-40 h-screen transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          activeItem={activeItem}
          onSelect={(item) => {
            setActiveItem(item);
            setSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          studentName="student1"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <MainContent />
      </div>
    </div>
  );
}

export default Dashboard;