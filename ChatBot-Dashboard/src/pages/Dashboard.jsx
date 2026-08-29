import { useEffect, useState } from "react";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import {
  ArrowUpRight,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  UserRound,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import styles from "./styles/Dashboard.module.css";
import { Navigate } from "react-router-dom";

const menuItems = [
  {
    label: "Home",
    ariaLabel: "Go to home",
    link: "/home",
  },
  {
    label: "Applications",
    ariaLabel: "View applications",
    link: "/application",
  },
  {
    label: "Chatbot",
    ariaLabel: "Chat with AI counselor",
    link: "/chat",
  },
  {
    label: "Profile",
    ariaLabel: "View profile",
    link: "/profile",
  },
];

const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "Instagram", link: "https://instagram.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

const navigate = new Navigate;
const handleChat = () => {
    navigate("/onboarding");
};

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } 
    catch {
      setUser(null);
    }
  }, []);
  const displayName = user?.username || "Student";

  return (
    <div className={styles.dashboard}>
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen
        colors={["#B497CF", "#5227FF"]}
        logoUrl={
          <div className={styles.logo}>
            <AnimatedLogo />
          </div>
        }
        accentColor="#5227FF"
      />
      <div className={styles.bg} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topPanel}> 
            <h1>Welcome back, <span>{displayName}</span></h1>
          </div>

          <button
            className={styles.notificationButton}
            aria-label="Notifications">
            <Bell size={20} />
            <span className={styles.notificationDot} />
          </button>
        </header>

        <section className={styles.contentGrid}>
          <div className={`${styles.card} ${styles.applicationCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>APPLICATION</p>
                <h2 className={styles.cardTitle}>
                  Your admission journey
                </h2>
              </div>
              <div className={styles.cardIcon}>
                <FileText size={21} />
              </div>
            </div>

            <div className={styles.statusArea}>
              <div className={styles.statusTop}>
                <div>
                  <span className={styles.statusLabel}>
                    Current status
                  </span>

                  <h3 className={styles.statusValue}>
                    Application in progress
                  </h3>
                </div>

                <span className={styles.statusBadge}>
                  <Clock3 size={14} />
                  In Progress
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: "55%" }}
                />
              </div>

              <div className={styles.progressInfo}>
                <span>Application started</span>
                <span>55% complete</span>
              </div>
            </div>

            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div
                  className={`${styles.timelineIcon} ${styles.completed}`}
                >
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <strong>Registration</strong>
                  <span>Completed</span>
                </div>
              </div>

              <div className={styles.timelineLine} />

              <div className={styles.timelineItem}>
                <div
                  className={`${styles.timelineIcon} ${styles.active}`}
                >
                  <FileText size={16} />
                </div>

                <div>
                  <strong>Application</strong>
                  <span>In progress</span>
                </div>
              </div>

              <div className={styles.timelineLine} />

              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>
                  <GraduationCap size={16} />
                </div>

                <div>
                  <strong>Confirmation</strong>
                  <span>Pending</span>
                </div>
              </div>
            </div>

            <button className={styles.outlineButton}>
              View application
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className={`${styles.card} ${styles.aiCard}`}>
            <div className={styles.aiGlow} />
            <div className={styles.aiIcon}>
              <Bot size={25} />
            </div>
            <h2 className={styles.aiTitle}>
              Your admission questions, answered.
            </h2>
            <p className={styles.aiDescription}>
              Get help with courses, eligibility, cut-offs, documents,
              fees, and everything else related to your admission.
            </p>

            <button className={styles.primaryButton} onClick={handleChat}>
              <MessageSquare size={17} />
              Chat with AI Counselor
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className={`${styles.card} ${styles.actionCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>NEXT STEP</p>
                <h2 className={styles.cardTitle}>
                  Complete your profile
                </h2>
              </div>

              <div className={styles.warningIcon}>
                <AlertCircle size={21} />
              </div>
            </div>

            <p className={styles.actionDescription}>
              Complete your student profile so we can personalize your
              counselling experience and keep your admission information
              up to date.
            </p>

            <button className={styles.actionButton}>
              Complete profile
              <ChevronRight size={17} />
            </button>
          </div>

          <div className={`${styles.card} ${styles.quickCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardEyebrow}>QUICK ACCESS</p>

                <h2 className={styles.cardTitle}>
                  What would you like to do?
                </h2>
              </div>
            </div>

            <div className={styles.quickActions}>
              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <FileText size={19} />
                </div>

                <div>
                  <strong>My Application</strong>
                  <span>Track your admission</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <MessageSquare size={19} />
                </div>

                <div>
                  <strong>Ask AI Counselor</strong>
                  <span>Get instant guidance</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <UserRound size={19} />
                </div>

                <div>
                  <strong>My Profile</strong>
                  <span>Manage your information</span>
                </div>

                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}