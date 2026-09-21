import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ArrowUpRight,
  Users,
  BarChart,
  Settings,
  ChevronRight,
  FileCheck
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

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

export default function AdminDashboard(){
  const [admin, setAdmin] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    totalQueries: 0,
    pendingDocuments: 0,
    totalStudents: 0,
  });
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser=localStorage.getItem("user");
    if(storedUser){
      try{
        setAdmin(JSON.parse(storedUser));
      }
      catch{
        setAdmin(null);
      }
    }

    const fetchAnalytics = async () => {
      try{
        const resp=await api.get("/admin/analytics/summary", { withCredentials: true });
        setAnalytics(resp.data.data);
      }
      catch(err){
        console.error("Failed to fetch analytics:", err);
      }
    };
    fetchAnalytics();
  }, []);
  const displayName=admin?.username||"Admin";

  return(
    <DashboardLayout
      menuItems={menuItems}
      displayName={displayName}
      greeting="Welcome,">

      <div className={`${styles.card} ${styles.aiCard}`}>
        <div className={styles.aiGlow}/>
        <div className={styles.aiIcon}>
          <BarChart size={25}/>
        </div>
        <h2 className={styles.aiTitle}>System Overview</h2>
        <p className={styles.aiDescription}>
          Currently tracking <strong>{analytics.totalApplications}</strong> active student applications out of <strong>{analytics.totalStudents}</strong> registered students. 
          Campus Mitra has successfully resolved <strong>{analytics.totalQueries}</strong> queries so far, drastically reducing manual support workload.
        </p>

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
          <button className={styles.quickAction}>
            <div className={styles.quickIcon}>
              <FileCheck size={19} />
            </div>
            <div>
              <strong>Document Verifications</strong>
              <span>{analytics.pendingDocuments} pending student approvals</span>
            </div>
            <ChevronRight size={17} />
          </button>

          <button className={styles.quickAction}>
            <div className={styles.quickIcon}>
              <Users size={19} />
            </div>
            <div>
              <strong>Student Queries</strong>
            </div>

            <ChevronRight size={17}/>
          </button>

          <button className={styles.quickAction}>
            <div className={styles.quickIcon}>
              <Settings size={19} />
            </div>
            <div>
              <strong>System Config</strong>
              <span>Manage cutoff lists & dates</span>
            </div>
            <ChevronRight size={17}/>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

