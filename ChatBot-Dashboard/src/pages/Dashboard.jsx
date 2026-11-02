import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  ArrowUpRight,
  MessageSquare,
  HelpCircle,
  Headphones,
  ChevronRight,
  UserRound,
  Calculator,
  FileText,
  Briefcase,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import SpotlightCard from "../components/SpotlightCard";
import styles from "./styles/Dashboard.module.css";

const PROMPT_CHIPS = [
  "Check my branch cut-off eligibility",
  "Calculate fees & scholarship concessions",
  "Hostel, mess & campus facilities",
  "List of mandatory CAP admission documents",
  "Explain 3.5-year sandwich training companies",
];

const ADMISSION_ACTIONS = [
  {
    icon: Calculator,
    title: "Cutoff Analysis & Chances",
    desc: "Calculate admission cutoff match for CAP rounds",
    prompt: "What were the round 1, 2, and 3 cutoffs for Computer Engineering and IT at SBMP last year?",
  },
  {
    icon: FileText,
    title: "CAP Documents Checklist",
    desc: "Mandatory certificates for DTE verification",
    prompt: "List all mandatory documents needed for diploma admission verification in CAP rounds.",
  },
  {
    icon: Briefcase,
    title: "Sandwich Pattern Placements",
    desc: "L&T, Siemens, Godrej in-plant training details",
    prompt: "Which companies recruit SBMP sandwich diploma students and what are the average packages?",
  },
  {
    icon: PhoneCall,
    title: "Request Human Counselor Call",
    desc: "Escalate for official staff callback",
    prompt: "Escalate my query to a human counselor for phone callback.",
  },
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
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLaunch = (text) => {
    const q = typeof text === "string" ? text : query.trim();
    if (q) {
      navigate("/chat", { state: { initialQuery: q } });
    } else {
      navigate("/chat");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  };

  const numericScore = parseFloat(String(academicProfile.entrancePercentile).replace(/%$/, ""));
  const isHighMatch = !isNaN(numericScore) && numericScore >= 92;

  const snapshotItems = [
    { label: "Target Branch", value: academicProfile.targetBranch },
    { label: "Percentile / Score", value: `${String(academicProfile.entrancePercentile).replace(/%$/, "")}%` },
    { label: "Category", value: academicProfile.category },
    { label: "Counseling Language", value: preferredLanguage },
  ];

  return (
    <DashboardLayout
      displayName={user?.username || "Student"}
      greeting={getGreeting()}
      subtitle="Welcome to your SVKM's SBMP academic advisory center"
    >
      <SpotlightCard className={`${styles.card} ${styles.aiHeroCard}`}>
        <div>
          <div className={styles.aiHeroBadge}>
            <Sparkles size={14} />
            <span>AI Admission Assistant • Live</span>
          </div>
          <h2 className={styles.aiHeroTitle}>What would you like to explore today?</h2>
          <p className={styles.aiDescription}>
            Mitra is trained on official SVKM's SBMP syllabus, previous years' CAP cutoffs, fee concessions (TFWS/EWS), and autonomous academic schedules.
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
      </SpotlightCard>

      <div className={styles.sideStack}>
        {/* Profile Snapshot Card */}
        <SpotlightCard className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <UserRound size={18} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Academic Profile Snapshot</h3>
              <p className={styles.cardEyebrow}>Loaded in AI Counseling Memory</p>
            </div>
          </div>

          <div className={styles.snapshotGrid}>
            {snapshotItems.map((item) => (
              <div key={item.label} className={styles.snapshotItem}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className={styles.matchStatusBanner}>
            <CheckCircle2 size={16} className={styles.matchStatusIcon} />
            <span>
              {isHighMatch
                ? `Strong eligibility for ${academicProfile.targetBranch} based on ${numericScore}% score.`
                : `Score recorded. Check CAP round cut-offs and TFWS quota.`}
            </span>
          </div>

          <button
            type="button"
            className={styles.outlineActionBtn}
            onClick={() => navigate("/profile")}
          >
            <span>Update Profile & Preferences</span>
            <ChevronRight size={15} />
          </button>
        </SpotlightCard>

        {/* Support & Quick Services */}
        <SpotlightCard className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <Headphones size={18} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Admission Action Hub</h3>
              <p className={styles.cardEyebrow}>Frequently Requested Services</p>
            </div>
          </div>

          <div className={styles.quickActions}>
            {ADMISSION_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  className={styles.quickActionItem}
                  onClick={() => handleLaunch(item.prompt)}
                >
                  <div className={styles.cardIcon}>
                    <Icon size={17} />
                  </div>
                  <div className={styles.quickActionText}>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </SpotlightCard>
      </div>
    </DashboardLayout>
  );
}
