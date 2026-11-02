import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PixelTrail from '../components/PixelTrail.jsx';
import api from '../api/api.js';
import AnimatedLogo from "../components/AnimatedLogo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useTheme } from "@/context/ThemeProvider";
import { Eye, EyeOff, ArrowLeft, LoaderCircle, ShieldAlert, Sparkles, User, ShieldCheck } from "lucide-react";
import styles from "./styles/Login.module.css";

function useCssVar(prop) {
  const { theme } = useTheme();
  return useMemo(() => {
    if (typeof window === "undefined") return "";
    void theme;
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }, [theme, prop]);
}

export default function Login() {
  const [data, setData] = useState({ username: "", role: "Student", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const trailColor = useCssVar("--primary");

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
    if (error) setError("");
  }

  function validate() {
    if (!data.username.trim() || !data.password.trim()) {
      setError("Username and Password are required");
      return false;
    }
    if (data.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  }

  async function handleLogin(e) {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    if (!validate()) return;
    try {
      setLoading(true);
      const resp = await api.post("/auth/login", {
        username: data.username,
        password: data.password
      }, { withCredentials: true });

      if (resp.data?.success && resp.data?.token) {
        localStorage.setItem("token", resp.data.token);
        if (resp.data.user) {
          localStorage.setItem("user", JSON.stringify(resp.data.user));
        }
      }

      const user = resp.data?.user;
      if (user?.role === "Student" && !user?.student_id) {
        navigate("/onboarding");
      } else if (user?.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterInitiate(e) {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const resp = await api.post("/auth/register", {
        username: data.username,
        role: data.role,
        password: data.password
      }, { withCredentials: true });

      if (resp.data?.success && resp.data?.token) {
        localStorage.setItem("token", resp.data.token);
        if (resp.data.user) {
          localStorage.setItem("user", JSON.stringify(resp.data.user));
        }
      }

      const user = resp.data?.user;
      if (user?.role === "Admin") {
        navigate("/admin");
      } else if (!user?.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration Failed. Username may already exist.");
    } finally {
      setLoading(false);
    }
  }

  const fillQuickDemo = (role) => {
    setError("");
    if (role === "admin") {
      setData({ username: "admin", password: "password123", role: "Admin" });
    } else {
      setData({ username: "student", password: "password123", role: "Student" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <PixelTrail
          gridSize={50}
          trailSize={0.1}
          maxAge={250}
          interpolate={5}
          color={trailColor || "#ea580c"}
          gooeyFilter={{ id: "custom-goo-filter", strength: 2 }}
          gooeyEnabled
          gooStrength={2}
        />
        <div className={styles.left}>
          <div className={styles.logo}>
            <AnimatedLogo />
          </div>
          <h1>Campus Mitra</h1>
          <p>AI Academic Advisory & Admissions Counseling</p>
          <span className={styles.institutionTag}>SVKM's Shri Bhagubhai Mafatlal Polytechnic</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.backHomeBtn}
            onClick={() => navigate("/home")}
            aria-label="Back to portal home"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
          <ThemeToggle />
        </div>

        <div className={styles.box}>
          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogoWrapper}>
              <AnimatedLogo />
            </div>
            <h2 className={styles.mobileBrandTitle}>Campus Mitra</h2>
            <p className={styles.mobileBrandSub}>SVKM's SBMP AI Counseling</p>
          </div>

          <h1 className={styles.title}>{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className={styles.subtitle}>
            {isRegister
              ? "Register to start your polytechnic counseling journey"
              : "Sign in to access your admission dashboard and AI advisor"}
          </p>

          <form className={styles.form} onSubmit={isRegister ? handleRegisterInitiate : handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.inputLabel}>Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={data.username}
                onChange={handleChange}
                className={styles.loginInput}
                autoComplete="username"
                required
              />
            </div>

            {isRegister && (
              <div className={styles.inputGroup}>
                <label htmlFor="role" className={styles.inputLabel}>Account Role</label>
                <select
                  id="role"
                  name="role"
                  value={data.role}
                  onChange={handleChange}
                  className={styles.loginSelect}
                >
                  <option value="Student">Student / Parent Inquiry</option>
                  <option value="Admin">Faculty / Administrator</option>
                </select>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={handleChange}
                  className={styles.loginInput}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.error} role="alert">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle size={18} className={styles.spinner} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isRegister ? "Register Account" : "Sign In to Portal"}</span>
              )}
            </button>
          </form>

          <div className={styles.demoHelper}>
            <span className={styles.demoHelperLabel}>
              <Sparkles size={14} /> Quick Demo Fill:
            </span>
            <div className={styles.demoBtnGroup}>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => fillQuickDemo("student")}
                title="Fill student demo credentials"
              >
                <User size={13} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => fillQuickDemo("admin")}
                title="Fill admin demo credentials"
              >
                <ShieldCheck size={13} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <p className={styles.switch}>
            {isRegister ? "Already have an account?" : "Don't have an account yet?"}
            <button
              type="button"
              className={styles.switchBtn}
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
