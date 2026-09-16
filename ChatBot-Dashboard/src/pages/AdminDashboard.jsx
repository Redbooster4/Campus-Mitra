import { useEffect, useState } from "react";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import {
  ArrowUpRight,
  Bell,
  Users,
  BarChart,
  Settings,
  ChevronRight,
  FileCheck
} from "lucide-react";
import styles from "./styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    ariaLabel: "Admin Dashboard",
    link: "/admin",
  },
  {
    label: "Applications",
    ariaLabel: "Manage Applications",
    link: "/admin/applications",
  },
  {
    label: "Analytics",
    ariaLabel: "System Analytics",
    link: "/admin/analytics",
  },
  {
    label: "Settings",
    ariaLabel: "System Settings",
    link: "/admin/settings",
  },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        setAdmin(JSON.parse(storedUser));
      } catch {
        setAdmin(null);
      }
    }
  }, []);

  const displayName = admin?.username || "Admin";

  return (
    <div className={styles.dashboard}>
      <StaggeredMenu
        position="left"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering
        menuButtonColor="var(--text)"
        openMenuButtonColor="var(--text)"
        changeMenuColorOnOpen
        colors={["var(--border)", "var(--primary)"]}
        logoUrl={
          <div className={styles.logo}>
            <AnimatedLogo />
          </div>
        }
        accentColor="var(--primary)"
      />
      <div className={styles.bg} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topPanel}>
            <h1>
              Welcome, <span>{displayName}</span>
            </h1>
          </div>

          <button className={styles.notificationButton} aria-label="Alerts">
            <Bell size={20} />
            <span className={styles.notificationDot} />
          </button>
        </header>

        <section className={styles.contentGrid}>
          {/* We reuse the aiCard for a beautiful System Overview panel */}
          <div className={`${styles.card} ${styles.aiCard}`}>
            <div className={styles.aiGlow} />
            <div className={styles.aiIcon}>
              <BarChart size={25} />
            </div>
            <h2 className={styles.aiTitle}>System Overview</h2>
            <p className={styles.aiDescription}>
              Currently tracking 1,245 active student applications. Campus Mitra
              has successfully resolved 8,430 queries this week, reducing manual
              support workload by 74%.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => navigate("/admin/analytics")}
            >
              View Full Analytics
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className={`${styles.card} ${styles.quickCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Pending Tasks</h2>
              </div>
            </div>

            <div className={styles.quickActions}>
              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <FileCheck size={19} />
                </div>

                <div>
                  <strong>Document Verifications</strong>
                  <span>42 pending student approvals</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <Users size={19} />
                </div>

                <div>
                  <strong>Student Queries</strong>
                  <span>12 escalated tickets from AI</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <Settings size={19} />
                </div>

                <div>
                  <strong>System Config</strong>
                  <span>Manage cutoff lists & dates</span>
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

