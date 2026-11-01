import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { ArrowUpRight, Users, BarChart, ChevronRight, PhoneCall, AlertCircle, Search, Download, Star } from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";

export default function AdminDashboard(){
  const [admin]=useState(() => {
    const storedUser=localStorage.getItem("user");
    if(storedUser){
      try{ return JSON.parse(storedUser); }
      catch{ return null; }
    }
    return null;
  });

  const [analytics, setAnalytics]=useState({
    totalApplications: 0, totalQueries: 0, totalStudents: 0,
    pendingCallbacks: 0, queriesNeedingFollowup: 0, averageRating: 5.0, totalFeedback: 0,
  });
  const [searchQuery, setSearchQuery]=useState("");
  const [loading, setLoading]=useState(true);
  const [error, setError]=useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchAnalytics=async() => {
      try{
        setLoading(true);
        setError(null);
        const resp=await api.get("/admin/analytics/summary", { withCredentials: true });
        const d=resp.data?.data;
        if(d){
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
      }
      catch(err){
        console.error("Failed to fetch analytics:", err);
        if(err.response?.status === 401 || err.response?.status === 403) {
          setError("Log in with an Admin account");
        } else {
          setError("Failed to load");
        }
      }
      finally{ setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  const displayName=admin?.username || "Admin";
  const handleSearch=(e) => {
    e.preventDefault();
    if(searchQuery.trim()){
      navigate(`/admin/analytics?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/admin/analytics");
    }
  };
  const handleExportCSV = async () => {
    try {
      const resp=await api.get("/admin/analytics/chats?limit=100", { withCredentials: true });
      const records=resp.data?.chats || resp.data?.data || [];
      if(!records.length){
        alert("No student inquiry records found to export.");
        return;
      }
      const headers=["Chat ID", "Student Name", "Phone", "Email", "Target Branch", "Question", "Callback Requested", "Followup Status", "Date"];
      const rows=records.map(r => [
        r.chat_id,
        `"${(r.student?.full_name || r.student_name || "Guest").replace(/"/g, '""')}"`,
        `"${r.student?.phone || r.student_phone || ""}"`,
        `"${r.student?.email || r.student_email || ""}"`,
        `"${r.student?.target_branch || r.target_branch || ""}"`,
        `"${(r.question || "").replace(/"/g, '""')}"`,
        (r.student?.callback_requested ?? r.callback_requested) ? "Yes" : "No",
        r.student?.followup_status || r.followup_status || "Pending",
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
    }
    catch(err){
      console.error("Export failed:", err);
      alert("Failed to export inquiries.");
    }
  };

  return(
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS} displayName={displayName}
      greeting="Admin Workspace, ">

      {error && (
        <div className={styles.errorBanner}>
          <div className={styles.qaLeft}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => navigate('/login')} className={styles.errorLoginBtn}>
            Log in as Admin
          </button>
        </div>
      )}

      <div className={`${styles.card} ${styles.aiCard}`}>
        <div className={styles.aiIcon}><BarChart size={20}/></div>
        <h2 className={styles.aiTitle}>System Control & Overview</h2>
        <div>
          <p className={styles.aiDescription}>
            {loading ? "Loading latest institutional statistics..." : (
              <>
                Overseeing <strong>{analytics.totalStudents}</strong> student profiles and <strong>{analytics.totalApplications}</strong> admissions.
                Campus-Mitra has resolved <strong>{analytics.totalQueries}</strong> parent/student queries with an average satisfaction rating of <strong>{analytics.averageRating} ★</strong>.
              </>
            )}
          </p>
          <form className={styles.queryLauncher} onSubmit={handleSearch}>
            <input type="text" className={styles.queryInput} placeholder="Search students, parents, phone numbers, or branches..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            <button type="submit" className={styles.querySubmitBtn} aria-label="Search Inquiries">
              <Search size={18} />
            </button>
          </form>
          <div className={styles.snapshotGrid}>
            <div className={styles.snapshotItem}>
              <span>Registered Students</span>
              <strong>{analytics.totalStudents} Active</strong>
            </div>
            <div className={styles.snapshotItem}>
              <span>Parent Callbacks</span>
              <strong className={analytics.pendingCallbacks > 0 ? styles.primaryText : ""}>
                {analytics.pendingCallbacks} Pending
              </strong>
            </div>
            <div className={styles.snapshotItem}>
              <span>Total Queries Resolved</span>
              <strong>{analytics.totalQueries} Chats</strong>
            </div>
            <div className={styles.snapshotItem}>
              <span>Flagged Escalations</span>
              <strong className={analytics.queriesNeedingFollowup > 0 ? styles.warningText : ""}>
                {analytics.queriesNeedingFollowup} Urgent
              </strong>
            </div>
            <div className={styles.snapshotItem} onClick={() => navigate("/admin/analytics")} title="Click to view Satisfaction & Rating Intelligence in Analytics">
              <span>Satisfaction Rating</span>
              <strong className={styles.warningText}>
                {analytics.averageRating ? `${analytics.averageRating} ★` : "5.0 ★"}
              </strong>
            </div>
          </div>
        </div>
        <div className={styles.actionsRow}>
          <button className={styles.primaryButton} onClick={() => navigate("/admin/analytics")}>
            Open Full Analytics Hub
            <ArrowUpRight size={17}/>
          </button>
          <button type="button" className={styles.outlineActionBtn}
            onClick={handleExportCSV} title="Download CSV report of student inquiries">
            <Download size={16} />
            <span>Export Inquiries (CSV)</span>
          </button>
        </div>
      </div>

      <div className={styles.sideStack}>
        <div className={`${styles.card} ${styles.quickCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Operations & Control Center</h2>
            </div>
          </div>
          <div className={styles.quickActions}>
            <button className={`${styles.quickAction} ${styles.qaRow}`} onClick={() => navigate("/admin/analytics")}>
              <div className={styles.qaLeft}>
                <div className={styles.quickIcon}>
                  <PhoneCall size={18}/>
                </div>
                <div className={styles.quickActionText}>
                  <strong>Parent & Student Callbacks</strong>
                  <span>{analytics.pendingCallbacks} requests awaiting staff call</span>
                </div>
              </div>
              <div className={styles.qaRight}>
                <span className={`${styles.pill} ${analytics.pendingCallbacks > 0 ? styles.pillPending : styles.pillClear}`}>
                  {analytics.pendingCallbacks > 0 ? `${analytics.pendingCallbacks} Pending` : "All Clear"}
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>
            <button className={`${styles.quickAction} ${styles.qaRow}`} onClick={() => navigate("/chat")}>
              <div className={styles.qaLeft}>
                <div className={`${styles.quickIcon} ${styles.pillTotal}`}>
                  <Users size={18}/>
                </div>
                <div className={styles.quickActionText}>
                  <strong>Student Queries & Chats</strong>
                  <span>Monitor questions and chat submissions</span>
                </div>
              </div>
              <div className={styles.qaRight}>
                <span className={`${styles.pill} ${styles.pillTotal}`}>
                  {analytics.totalQueries} Total
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>
            <button className={`${styles.quickAction} ${styles.qaRow}`} onClick={() => navigate("/admin/analytics")}>
              <div className={styles.qaLeft}>
                <div className={`${styles.quickIcon} ${styles.pillRating}`}>
                  <AlertCircle size={18}/>
                </div>
                <div className={styles.quickActionText}>
                  <strong>Escalated Follow-ups</strong>
                  <span>Questions flagged for human counseling</span>
                </div>
              </div>
              <div className={styles.qaRight}>
                <span className={`${styles.pill} ${analytics.queriesNeedingFollowup > 0 ? styles.pillFlagged : styles.pillClear}`}>
                  {analytics.queriesNeedingFollowup} Flagged
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>
            <button className={`${styles.quickAction} ${styles.qaRow}`} onClick={() => navigate("/admin/analytics")}>
              <div className={styles.qaLeft}>
                <div className={`${styles.quickIcon} ${styles.pillRating}`}>
                  <Star size={18}/>
                </div>
                <div className={styles.quickActionText}>
                  <strong>Student Satisfaction & Ratings</strong>
                  <span>Analyze star distributions & counseling feedback</span>
                </div>
              </div>
              <div className={styles.qaRight}>
                <span className={`${styles.pill} ${styles.pillRating}`}>
                  {analytics.averageRating ? `${analytics.averageRating} ★` : "5.0 ★"} ({analytics.totalFeedback} reviews)
                </span>
                <ChevronRight size={17}/>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
