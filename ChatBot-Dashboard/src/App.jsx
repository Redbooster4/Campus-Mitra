import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeProvider";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Preview from "./pages/Preview";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Analytics from "./pages/admin/Analytics";

// protect dashboard, application, chat, studentProfile, counselorProfile
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/dashboard" 
            element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            }
          />
          <Route path="/profile" 
            element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            }
          />
          <Route path="/onboarding" 
            element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            }
          />
          <Route path="/preview" 
            element={
              <ProtectedRoute><Preview /></ProtectedRoute>
            }
          />
          <Route path="/chat" 
            element={
              <ProtectedRoute><Chat /></ProtectedRoute>
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
          <Route path="*" element={<Navigate to="/home" replace/>}/>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;