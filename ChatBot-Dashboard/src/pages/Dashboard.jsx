import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { ArrowUpRight, MessageSquare, HelpCircle, Headphones, ChevronRight, UserRound, PhoneCall } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import styles from "./styles/Dashboard.module.css";

const PROMPT_CHIPS = [
  "Check my branch cut-off eligibility",
  "Calculate fees & scholarship concessions",
  "Hostel, mess & campus facilities",
  "List of mandatory CAP admission documents",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user?.role === "Admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const [academicProfile, setAcademicProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("studentAcademicProfile");
      const parsed = stored ? JSON.parse(stored) : null;
      return {
        entrancePercentile: parsed?.entrancePercentile || "96.42",
        targetBranch: parsed?.targetBranch || "Computer Engineering",
        category: parsed?.category || "General / Open",
      };
    } catch {
      return {
        entrancePercentile: "96.42",
        targetBranch: "Computer Engineering",
        category: "General / Open",
      };
    }
  });

  const [preferredLanguage] = useState(() => {
    try {
      return localStorage.getItem("preferredLanguage") || "English";
    } catch {
      return "English";
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchRemoteProfile = async () => {
      try {
        const resp = await api.get("/auth/me");
        if (isMounted && resp.data?.user) {
          const u = resp.data.user;
          if (u.target_branch || u.entrance_score || u.category) {
            setAcademicProfile((prev) => ({
              ...prev,
              targetBranch: u.target_branch || prev.targetBranch,
              entrancePercentile: u.entrance_score || prev.entrancePercentile,
              category: u.category || prev.category,
            }));
          }
        }
      } catch (err) {
        console.warn("Profile sync error:", err);
      }
    };
    if (localStorage.getItem("token")) {
      fetchRemoteProfile();
    }
    return () => { isMounted = false; };
  }, []);

  const handleLaunch = (text) => {
    const q = typeof text === "string" ? text : query.trim();
    if (q) {
      navigate("/chat", { state: { initialQuery: q } });
    } else {
      navigate("/chat");
    }
  };

  const snapshotItems = [
    { label: "Target Branch", value: academicProfile.targetBranch },
    { label: "Percentile", value: `${String(academicProfile.entrancePercentile).replace(/%$/, "")}%` },
    { label: "Category", value: academicProfile.category },
    { label: "AI Language", value: preferredLanguage },
  ];

  return (
    <DashboardLayout
      displayName={user?.username || "Student"}
      subtitle="Your centralized AI counseling center. Have questions about cutoffs, fees, or documents? Mitra is ready."
    >
      <div className={`${styles.card} ${styles.aiHeroCard}`}>
        <div>
          <h2 className={styles.aiHeroTitle}>What would you like to explore today?</h2>
          <p className={styles.aiHeroDesc}>
            Get instant, personalized guidance on cutoffs, seat matrices, scholarships, and admission procedures.
          </p>

          <form
            className={styles.queryLauncher}
            onSubmit={(e) => {
              e.preventDefault();
              handleLaunch();
            }}
          >
            <input
              type="text"
              className={styles.queryInput}
              placeholder="Ask Mitra about cutoffs, fees, branch comparisons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.querySubmitBtn} aria-label="Ask AI Counselor">
              <ArrowUpRight size={18} />
            </button>
          </form>

          <div className={styles.promptChips}>
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={styles.promptChip}
                onClick={() => handleLaunch(chip)}
              >
                <HelpCircle size={14} />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className={styles.primaryButton} onClick={() => handleLaunch()}>
          <MessageSquare size={18} />
          <span>Start Counseling with Mitra</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className={styles.sideStack}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <UserRound size={18} />
            </div>
            <h3 className={styles.cardTitle}>Current Profile</h3>
          </div>

          <div className={styles.snapshotGrid}>
            {snapshotItems.map((item) => (
              <div key={item.label} className={styles.snapshotItem}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.outlineActionBtn}
            onClick={() => navigate("/profile")}
          >
            <span>Manage Profile & Preferences</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Headphones size={18} />
            </div>
            <h3 className={styles.cardTitle}>Support & Services</h3>
          </div>

          <button type="button" className={styles.quickActionItem} onClick={() => handleLaunch()}>
            <div className={styles.cardIcon}>
              <MessageSquare size={18} />
            </div>
            <div className={styles.quickActionText}>
              <strong>Instant AI Session</strong>
              <span>24/7 personalized answers</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
