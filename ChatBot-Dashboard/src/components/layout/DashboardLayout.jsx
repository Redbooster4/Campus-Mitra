import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaggeredMenu from "../StaggeredMenu";
import { Bell, ArrowUpRight } from "lucide-react";
import api from "../../api/api";
import styles from "../../pages/styles/Dashboard.module.css";
import modalStyles from "../../pages/styles/Modal.module.css";
import { STUDENT_MENU_ITEMS, SOCIAL_ITEMS } from "../../constants/navigation";

export default function DashboardLayout({
  menuItems = STUDENT_MENU_ITEMS,
  socialItems = SOCIAL_ITEMS,
  greeting = "Welcome back,",
  displayName,
  subtitle,
  children,
}) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [adminAlerts, setAdminAlerts] = useState({
    pendingCallbacks: 0,
    urgentQueries: 0,
    recentInquiries: [],
  });

  const [isAdmin] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return String(u?.role || "").toLowerCase() === "admin";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isAdmin || !localStorage.getItem("token")) return;
    let isMounted = true;

    const fetchAdminAlerts = async () => {
      try {
        const [summaryRes, chatsRes] = await Promise.all([
          api.get("/admin/analytics/summary", { withCredentials: true }).catch(() => null),
          api.get("/admin/analytics/chats?limit=4", { withCredentials: true }).catch(() => null),
        ]);

        if (isMounted) {
          const s = summaryRes?.data?.data;
          const chats = chatsRes?.data?.chats || chatsRes?.data?.data || [];
          setAdminAlerts({
            pendingCallbacks: s?.followups?.pendingCallbacks || 0,
            urgentQueries: s?.followups?.queriesNeedingFollowup || 0,
            recentInquiries: Array.isArray(chats) ? chats : [],
          });
        }
      } catch (err) {
        console.debug("Admin notification fetch skipped:", err);
      }
    };

    fetchAdminAlerts();
    const interval = setInterval(fetchAdminAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  const totalAlerts = adminAlerts.pendingCallbacks + adminAlerts.urgentQueries;

  return (
    <div className={styles.dashboard}>
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={socialItems.length > 0}
        displayItemNumbering
        accentColor="var(--primary)"
      />
      <div className={styles.bg} />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topPanel}>
            <h1>
              {greeting} <span>{displayName}</span>
            </h1>
            {subtitle && <p className={styles.topSubtitle}>{subtitle}</p>}
          </div>

          {isAdmin && (
            <button
              className={styles.notificationButton}
              aria-label="Inquiry Notifications"
              onClick={() => setIsNotifOpen(true)}
            >
              <Bell size={20} />
              {totalAlerts > 0 ? (
                <span className={styles.notificationBadge}>{totalAlerts}</span>
              ) : (
                <span className={styles.notificationDot} />
              )}
            </button>
          )}
        </header>

        <section className={styles.contentGrid}>
          {children}
        </section>
      </main>

      {isAdmin && isNotifOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsNotifOpen(false)}>
          <div
            className={modalStyles.modalContent}
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.qaRow} style={{ marginBottom: "1rem" }}>
              <h2 className={modalStyles.modalTitle} style={{ margin: 0 }}>
                Inquiry Notifications
              </h2>
            </div>

            <div className={styles.snapshotGrid} style={{ marginBottom: "1rem" }}>
              <div className={styles.snapshotItem}>
                <span>Pending Callbacks</span>
                <strong className={adminAlerts.pendingCallbacks > 0 ? styles.primaryText : ""}>
                  {adminAlerts.pendingCallbacks} Callbacks
                </strong>
              </div>
              <div className={styles.snapshotItem}>
                <span>Urgent Escalations</span>
                <strong className={adminAlerts.urgentQueries > 0 ? styles.warningText : ""}>
                  {adminAlerts.urgentQueries} Flagged
                </strong>
              </div>
            </div>

            <p className={modalStyles.modalDescription} style={{ marginBottom: "0.85rem", fontSize: "0.82rem" }}>
              Latest student queries raised in counseling:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.25rem" }}>
              {adminAlerts.recentInquiries.length === 0 ? (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
                  No recent student inquiries recorded.
                </div>
              ) : (
                adminAlerts.recentInquiries.slice(0, 3).map((inq) => (
                  <div
                    key={inq.chat_id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate("/chat", { state: { selectedChatId: inq.chat_id } });
                    }}
                    className={styles.quickActionItem}
                    style={{ padding: "8px 12px", margin: 0, cursor: "pointer" }}
                    title="Click to view full inquiry in Chat"
                  >
                    <div className={styles.quickActionText}>
                      <strong>{inq.student_name || "Student"}</strong>
                      <span>{inq.question}</span>
                    </div>
                    <ArrowUpRight size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  </div>
                ))
              )}
            </div>

            <div className={modalStyles.buttonGroup}>
              <button
                className={modalStyles.primaryButton}
                onClick={() => {
                  setIsNotifOpen(false);
                  navigate("/chat");
                }}
              >
                Open Admin Chat Inspector
              </button>
              <button
                className={modalStyles.dangerButton}
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                onClick={() => setIsNotifOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
