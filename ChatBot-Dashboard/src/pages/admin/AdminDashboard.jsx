import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ArrowUpRight,
  Users,
  BarChart,
  ChevronRight,
  PhoneCall,
  AlertCircle,
  Search,
  Download,
  Clock
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";

export default function AdminDashboard(){
  const [admin] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      try{
        return JSON.parse(storedUser);
      } 
      catch{
        return null;
      }
    }
    return null;
  });
  
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    totalQueries: 0,
    totalStudents: 0,
    pendingCallbacks: 0,
    queriesNeedingFollowup: 0,
    averageRating: 5.0,
    totalFeedback: 0,
  });
  const [recentChats, setRecentChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get("/admin/analytics/summary", { withCredentials: true });
        const d = resp.data?.data;
        if (d) {
          setAnalytics({
            totalApplications: d.applications?.totalApplications ?? d.students?.registeredUserAccounts ?? 0,
            totalQueries: d.questions?.totalQuestionsAsked ?? 0,
            totalStudents: d.students?.totalStudents ?? 0,
            pendingCallbacks: d.followups?.pendingCallbacks ?? 0,
            queriesNeedingFollowup: d.followups?.queriesNeedingFollowup ?? 0,
            averageRating: d.feedback?.averageRating ?? 5.0,
            totalFeedback: d.feedback?.totalFeedback ?? 0,
          });
        }

        // Fetch recent inquiries / callbacks stream
        try {
          const chatsResp = await api.get("/admin/analytics/chats?limit=4", { withCredentials: true });
          if (chatsResp.data?.success && Array.isArray(chatsResp.data?.data)) {
            setRecentChats(chatsResp.data.data);
          }
        } catch {
          // Non-critical fallback
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("You need to log in with an Admin account to view dashboard statistics.");
        } else {
          setError("Failed to load statistics from the backend.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const displayName = admin?.username || "Admin";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/analytics?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/admin/analytics");
    }
  };

  const handleExportCSV = async () => {
    try {
      const resp = await api.get("/admin/analytics/chats?limit=100", { withCredentials: true });
      const records = resp.data?.data || [];
      if (!records.length) {
        alert("No student inquiry records found to export.");
        return;
      }
      const headers = ["Chat ID", "Student Name", "Phone", "Email", "Target Branch", "Question", "Callback Requested", "Followup Status", "Date"];
      const rows = records.map(r => [
        r.chat_id,
        `"${(r.student_name || "Guest").replace(/"/g, '""')}"`,
        `"${r.student_phone || ""}"`,
        `"${r.student_email || ""}"`,
        `"${r.target_branch || ""}"`,
        `"${(r.question || "").replace(/"/g, '""')}"`,
        r.callback_requested ? "Yes" : "No",
        r.followup_status || "Pending",
        r.created_at || ""
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `campus_mitra_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export inquiries.");
    }
  };

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      displayName={displayName}
      greeting="Admin Workspace,"
      subtitle="Institutional management portal. Monitor student inquiries, parent callbacks, and counseling metrics."
    >
      {/* Left Main Card: System Overview & Student Lookup */}
      <div className={`${styles.card} ${styles.aiCard}`}>
        <div className={styles.aiIcon}>
          <BarChart size={25}/>
        </div>
        <h2 className={styles.aiTitle}>System Control & Overview</h2>

        {error ? (
          <div style={{ margin: "14px 0", padding: "12px 16px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#f87171" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: "0.95rem" }}>⚠️ {error}</p>
            <button
              className={styles.primaryButton}
              style={{ padding: "6px 14px", fontSize: "0.85rem", background: "var(--primary)" }}
              onClick={() => navigate("/login")}
            >
              Log in as Admin
            </button>
          </div>
        ) : (
          <div>
            <p className={styles.aiDescription}>
              {loading ? (
                "Loading latest institutional statistics..."
              ) : (
                <>
                  Overseeing <strong>{analytics.totalStudents}</strong> student profiles and <strong>{analytics.totalApplications}</strong> admissions. 
                  Campus-Mitra has resolved <strong>{analytics.totalQueries}</strong> parent/student queries with an average satisfaction rating of <strong>{analytics.averageRating} ★</strong>.
                </>
              )}
            </p>

            {/* Quick Student / Parent Search Bar */}
            <form className={styles.queryLauncher} onSubmit={handleSearch} style={{ marginTop: "1rem", marginBottom: "1.25rem" }}>
              <input
                type="text"
                className={styles.queryInput}
                placeholder="Search students, parents, phone numbers, or branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.querySubmitBtn} aria-label="Search Inquiries">
                <Search size={18} />
              </button>
            </form>

            {/* Snapshot KPI Grid */}
            <div className={styles.snapshotGrid} style={{ marginBottom: "1.5rem" }}>
              <div className={styles.snapshotItem}>
                <span>Registered Students</span>
                <strong>{analytics.totalStudents} Active</strong>
              </div>
              <div className={styles.snapshotItem}>
                <span>Parent Callbacks</span>
                <strong style={{ color: analytics.pendingCallbacks > 0 ? "var(--primary)" : "var(--heading)" }}>
                  {analytics.pendingCallbacks} Pending
                </strong>
              </div>
              <div className={styles.snapshotItem}>
                <span>Total Queries Resolved</span>
                <strong>{analytics.totalQueries} Chats</strong>
              </div>
              <div className={styles.snapshotItem}>
                <span>Flagged Escalations</span>
                <strong style={{ color: analytics.queriesNeedingFollowup > 0 ? "#f59e0b" : "var(--heading)" }}>
                  {analytics.queriesNeedingFollowup} Urgent
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "auto" }}>
          <button
            className={styles.primaryButton}
            onClick={() => navigate("/admin/analytics")}
          >
            Open Full Analytics Hub
            <ArrowUpRight size={17}/>
          </button>

          <button
            type="button"
            className={styles.outlineActionBtn}
            style={{ width: "auto", padding: "10px 16px" }}
            onClick={handleExportCSV}
            title="Download CSV report of student inquiries"
          >
            <Download size={16} style={{ marginRight: "6px" }} />
            <span>Export Inquiries (CSV)</span>
          </button>
        </div>
      </div>

      {/* Right Column: Upgraded Operations & Control Center */}
      <div className={styles.sideStack}>
        <div className={`${styles.card} ${styles.quickCard}`}>
          <div className={styles.cardHeader} style={{ marginBottom: "14px" }}>
            <div>
              <h2 className={styles.cardTitle}>Operations & Control Center</h2>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block", marginTop: "2px" }}>
                Manage student inquiries, parent callbacks & escalations
              </span>
            </div>
          </div>

          <div className={styles.quickActions}>
            {/* 1. Parent & Student Callbacks */}
            <button 
              className={styles.quickAction} 
              onClick={() => navigate("/admin/analytics")}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.quickIcon} style={{ background: "rgba(249, 115, 22, 0.15)", color: "var(--primary)" }}>
                  <PhoneCall size={18}/>
                </span>
                <div>
                  <strong>Parent & Student Callbacks</strong>
                  <span>{analytics.pendingCallbacks} requests awaiting staff call</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ 
                  fontSize: "0.74rem", 
                  padding: "2px 8px", 
                  borderRadius: "10px", 
                  background: analytics.pendingCallbacks > 0 ? "rgba(239, 68, 68, 0.16)" : "rgba(16, 185, 129, 0.16)", 
                  color: analytics.pendingCallbacks > 0 ? "#ef4444" : "#10b981", 
                  fontWeight: 600 
                }}>
                  {analytics.pendingCallbacks > 0 ? `${analytics.pendingCallbacks} Pending` : "All Clear"}
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>

            {/* 2. Student Queries & Live Logs */}
            <button 
              className={styles.quickAction} 
              onClick={() => navigate("/chat")}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.quickIcon} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                  <Users size={18}/>
                </span>
                <div>
                  <strong>Student Queries & Chats</strong>
                  <span>Monitor questions and chat submissions</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.74rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>
                  {analytics.totalQueries} Total
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>

            {/* 3. Escalated Inquiries */}
            <button 
              className={styles.quickAction} 
              onClick={() => navigate("/admin/analytics")}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.quickIcon} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                  <AlertCircle size={18}/>
                </span>
                <div>
                  <strong>Escalated Follow-ups</strong>
                  <span>Questions flagged for human counseling</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ 
                  fontSize: "0.74rem", 
                  padding: "2px 8px", 
                  borderRadius: "10px", 
                  background: analytics.queriesNeedingFollowup > 0 ? "rgba(245, 158, 11, 0.16)" : "rgba(16, 185, 129, 0.16)", 
                  color: analytics.queriesNeedingFollowup > 0 ? "#f59e0b" : "#10b981", 
                  fontWeight: 600 
                }}>
                  {analytics.queriesNeedingFollowup} Flagged
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>
          </div>
        </div>

        {/* Live Recent Inquiries Feed */}
        {recentChats.length > 0 && (
          <div className={styles.card} style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--heading)" }}>
                  Recent Inquiries Feed
                </h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}
              >
                View all in Chat &rarr;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentChats.map((chat) => (
                <div 
                  key={chat.chat_id}
                  onClick={() => navigate("/chat", { state: { selectedChatId: chat.chat_id } })}
                  title="Click to view conversation in /chat"
                  style={{
                    padding: "9px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.82rem",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: "10px" }}>
                    <div style={{ fontWeight: 600, color: "var(--heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.student_name || "Prospective Student"}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.question}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 7px",
                    borderRadius: "8px",
                    background: chat.callback_requested ? "rgba(249, 115, 22, 0.15)" : "var(--surface)",
                    color: chat.callback_requested ? "var(--primary)" : "var(--muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap"
                  }}>
                    {chat.callback_requested ? "Callback" : chat.target_branch || "Inquiry"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
