import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ArrowUpRight,
  Users,
  BarChart,
  ChevronRight,
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";

export default function AdminDashboard(){
  const [admin]=useState(() => {
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
    pendingDocuments: 0,
    totalStudents: 0,
  });
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
            pendingDocuments: d.applications?.pendingDocuments ?? 0,
            totalStudents: d.students?.totalStudents ?? 0
          });
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

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      displayName={displayName}
      greeting="Welcome,">

      <div className={`${styles.card} ${styles.aiCard}`}>
        <div className={styles.aiGlow}/>
        <div className={styles.aiIcon}>
          <BarChart size={25}/>
        </div>
        <h2 className={styles.aiTitle}>System Overview</h2>
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
          <p className={styles.aiDescription}>
            {loading ? (
              "Loading latest system analytics..."
            ) : (
              <>
                Currently tracking <strong>{analytics.totalApplications}</strong> active student applications out of <strong>{analytics.totalStudents}</strong> registered students. 
                Campus Mitra has successfully resolved <strong>{analytics.totalQueries}</strong> queries so far, drastically reducing manual support workload.
              </>
            )}
          </p>
        )}

        <button
          className={styles.primaryButton}
          onClick={() => navigate("/admin/analytics")}>
          View Full Analytics
          <ArrowUpRight size={17}/>
        </button>
      </div>

      <div className={`${styles.card} ${styles.quickCard}`}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Pending Tasks</h2>
          </div>
        </div>

                <div className={styles.quickActions}>
          <button className={styles.quickAction} onClick={() => navigate("/chat")}>
            <span className={styles.quickIcon}>
              <Users size={19}/>
            </span>
            <span>
              <strong>Student Queries</strong>
              <span>Monitor and reply to chats</span>
            </span>
            <ChevronRight size={17}/>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

