import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./api/api";
import { ThemeProvider } from "@/context/ThemeProvider";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Preview from "./pages/Preview";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Analytics from "./pages/admin/Analytics";

function LogoutHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    api.post("/auth/logout", {}, { withCredentials: true })
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={["Student", "Counselor"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" 
            element={
              <ProtectedRoute allowedRoles={["Student", "Counselor"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/onboarding" 
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route path="/preview" 
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Preview />
              </ProtectedRoute>
            }
          />
          <Route path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/analytics" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="*" element={<Navigate to="/home" replace/>}/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;