import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  MessageSquare,
  User,
  GraduationCap,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const navLinks = [
    { label: "Home", to: "/home" },
    { label: "AI Counselor", to: "/chat" },
    { label: "About", to: "/about" },
  ];

  if (user) {
    if (user.role === "Admin") {
      navLinks.push({ label: "Admin Workspace", to: "/admin" });
      navLinks.push({ label: "Analytics", to: "/admin/analytics" });
    } else {
      navLinks.push({ label: "Dashboard", to: "/dashboard" });
      navLinks.push({ label: "Profile", to: "/profile" });
    }
  }

  return (
    <>
      <header className={`navbar-header ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Brand Logo & Trust Tag */}
          <Link to="/home" className="navbar-brand">
            <div className="navbar-logo-wrap">
              <GraduationCap size={20} className="navbar-brand-icon" />
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">Campus Mitra</span>
              <span className="navbar-brand-sub">SVKM's SBMP • DTE 3010</span>
            </div>
          </Link>

          {/* Quick Search / Command Palette Trigger */}
          <button
            type="button"
            className="navbar-search-trigger"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            aria-label="Search branches, cutoffs, and admissions"
          >
            <Search size={14} className="navbar-search-icon" />
            <span className="navbar-search-placeholder">
              Quick search cutoffs, TFWS, branches...
            </span>
            <kbd className="navbar-search-kbd">Ctrl K</kbd>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="navbar-desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="navbar-right-cluster">
            <ThemeToggle className="navbar-theme-toggle" />

            {user ? (
              <div className="navbar-user-dropdown">
                <Link
                  to={user.role === "Admin" ? "/admin" : "/dashboard"}
                  className="navbar-user-pill"
                  title="Open Dashboard"
                >
                  <User size={15} />
                  <span className="navbar-user-name">
                    {user.username || user.full_name || "Account"}
                  </span>
                </Link>
                <button
                  type="button"
                  className="navbar-logout-btn"
                  onClick={handleLogout}
                  title="Sign out of account"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="navbar-auth-buttons">
                <Link to="/login" className="navbar-btn-login">
                  Sign In
                </Link>
                <Link to="/chat" className="navbar-btn-counselor">
                  <MessageSquare size={14} />
                  <span>Ask Mitra</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {isMobileMenuOpen && (
          <div className="navbar-mobile-drawer">
            <button
              type="button"
              className="navbar-mobile-search-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
            >
              <Search size={16} />
              <span>Search SBMP Programs & Cutoffs (Ctrl K)</span>
            </button>

            <div className="navbar-mobile-links">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`navbar-mobile-link ${
                    location.pathname === link.to ? "navbar-mobile-link-active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="navbar-mobile-bottom">
              <div className="navbar-mobile-trust">
                <ShieldCheck size={14} />
                <span>Autonomous MSBTE • SVKM Trust</span>
              </div>
              {user ? (
                <button
                  type="button"
                  className="navbar-mobile-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign Out ({user.username || "Account"})</span>
                </button>
              ) : (
                <Link to="/login" className="navbar-btn-login" style={{ width: "100%", textAlign: "center" }}>
                  Sign In to Candidate Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
