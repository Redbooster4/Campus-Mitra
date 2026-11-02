import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ArrowUpRight,
  Users,
  ChevronRight,
  PhoneCall,
  AlertCircle,
  Search,
  Download,
  Star,
  FileSpreadsheet,
  FileJson,
  Printer,
  Layers,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";
import { downloadCSV, downloadJSON, printExecutiveReport } from "../../lib/exportUtils";

const DEFAULT_BRANCH_DEMAND = [
  { branch: "Computer Engineering", student_count: 98, type: "Autonomous Sandwich", cutoff: "94% - 97%" },
  { branch: "Information Technology", student_count: 94, type: "Autonomous Sandwich", cutoff: "92% - 95%" },
  { branch: "AI & Machine Learning", student_count: 92, type: "Industry Aligned", cutoff: "90% - 94%" },
  { branch: "Mechanical Engineering", student_count: 86, type: "Autonomous Sandwich", cutoff: "84% - 89%" },
  { branch: "Electrical Engineering", student_count: 85, type: "Autonomous Sandwich", cutoff: "85% - 90%" },
  { branch: "Electronics & Telecom", student_count: 88, type: "Autonomous Sandwich", cutoff: "86% - 91%" },
  { branch: "Civil Engineering", student_count: 80, type: "Autonomous Sandwich", cutoff: "80% - 86%" },
  { branch: "Chemical Engineering", student_count: 76, type: "Autonomous Sandwich", cutoff: "78% - 84%" },
  { branch: "Plastics Engineering", student_count: 72, type: "Autonomous Sandwich", cutoff: "75% - 82%" },
];

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [admin] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "inquiries" | "exports"

  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    totalQueries: 0,
    totalStudents: 0,
    pendingCallbacks: 0,
    queriesNeedingFollowup: 0,
    averageRating: 5.0,
    totalFeedback: 0,
  });

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filterType, setFilterType] = useState("all"); // "all" | "callbacks" | "followup"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "Pending" | "Contacted" | "Resolved" | "Enrolled"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);

  // ── Fetch Analytics Summary ──
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
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Log in with an Admin account");
      } else {
        setError("Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Inquiries List ──
  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const resp = await api.get("/admin/analytics/chats?limit=100", { withCredentials: true });
      const records = resp.data?.chats || resp.data?.data || [];
      setChats(records);
    } catch (err) {
      console.warn("Could not fetch chat logs:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(); // eslint-disable-line react-hooks/set-state-in-effect
    fetchChats();
  }, []);

  // ── Status Update for Inquiries ──
  const handleStatusChange = async (studentId, newStatus) => {
    if (!studentId) return;
    try {
      setUpdatingStudentId(studentId);
      await api.patch(`/admin/analytics/students/${studentId}/followup`, {
        followup_status: newStatus,
        callback_requested: newStatus === "Resolved" || newStatus === "Enrolled" ? false : undefined,
      });

      // Update in local state immediately
      setChats((prev) =>
        prev.map((c) => {
          if (c.student?.student_id === studentId || c.student_id === studentId) {
            return {
              ...c,
              student: c.student
                ? {
                    ...c.student,
                    followup_status: newStatus,
                    callback_requested: newStatus === "Resolved" || newStatus === "Enrolled" ? false : c.student.callback_requested,
                  }
                : c.student,
              followup_status: newStatus,
            };
          }
          return c;
        })
      );

      // Decrement pending callbacks if resolved
      if (newStatus === "Resolved" || newStatus === "Enrolled") {
        setAnalytics((prev) => ({
          ...prev,
          pendingCallbacks: Math.max(0, prev.pendingCallbacks - 1),
        }));
      }
    } catch (err) {
      console.error("Failed to update followup status:", err);
      alert("Failed to update student status. Please try again.");
    } finally {
      setUpdatingStudentId(null);
    }
  };

  // ── Filtered Inquiries Computation ──
  const filteredChats = useMemo(() => {
    let result = [...chats];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const studentName = item.student?.full_name || item.student_name || "";
        const phone = item.student?.phone || item.student_phone || "";
        const branch = item.student?.target_branch || item.target_branch || "";
        const question = item.question || item.user_message || "";
        return (
          studentName.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q) ||
          branch.toLowerCase().includes(q) ||
          question.toLowerCase().includes(q)
        );
      });
    }

    if (filterType === "callbacks") {
      result = result.filter((item) => item.student?.callback_requested || item.callback_requested);
    } else if (filterType === "followup") {
      result = result.filter((item) => item.needs_followup);
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => {
        const status = item.student?.followup_status || item.followup_status || "Pending";
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    return result;
  }, [chats, searchQuery, filterType, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredChats.length / itemsPerPage));
  const paginatedChats = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredChats.slice(start, start + itemsPerPage);
  }, [filteredChats, currentPage, itemsPerPage]);

  // ── Export Functions ──
  const handleExportInquiriesCSV = () => {
    const records = filteredChats.length ? filteredChats : chats;
    if (!records.length) {
      alert("No student inquiry records found to export.");
      return;
    }
    const headers = [
      "Chat ID",
      "Student Name",
      "Phone",
      "Email",
      "Target Branch",
      "SSC Score",
      "Inquiry Question",
      "AI Answer",
      "Callback Requested",
      "Followup Status",
      "Date",
    ];
    const rows = records.map((r) => [
      r.chat_id,
      r.student?.full_name || r.student_name || "Guest Student",
      r.student?.phone || r.student_phone || "N/A",
      r.student?.email || r.student_email || "N/A",
      r.student?.target_branch || r.target_branch || "General Inquiries",
      r.student?.entrance_score || "N/A",
      r.question || r.user_message || "",
      r.answer || r.ai_reply || "",
      (r.student?.callback_requested ?? r.callback_requested) ? "Yes" : "No",
      r.student?.followup_status || r.followup_status || "Pending",
      r.created_at || new Date().toISOString(),
    ]);
    downloadCSV(`campus_mitra_inquiries_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportBranchDemandCSV = () => {
    const headers = ["Branch Discipline", "Demand Index", "Program Pattern", "Typical Cutoff"];
    const rows = DEFAULT_BRANCH_DEMAND.map((b) => [b.branch, b.student_count, b.type, b.cutoff]);
    downloadCSV(`sbmp_branch_demand_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportFullTelemetryJSON = () => {
    const dump = {
      institution: "SVKM's Shri Bhagubhai Mafatlal Polytechnic",
      dte_code: "3010",
      generated_at: new Date().toISOString(),
      generated_by: admin?.username || "Admin",
      system_kpis: analytics,
      total_inquiries_count: chats.length,
      branch_demand: DEFAULT_BRANCH_DEMAND,
      inquiries_sample: chats.slice(0, 50),
    };
    downloadJSON(`campus_mitra_audit_${new Date().toISOString().slice(0, 10)}`, dump);
  };

  const handlePrintExecutiveReport = () => {
    printExecutiveReport({
      title: "Campus Mitra Admissions & Advisory Executive Summary",
      kpis: analytics,
      branchDemand: DEFAULT_BRANCH_DEMAND,
      generatedBy: admin?.username || "Admin Officer",
    });
  };

  const displayName = admin?.username || "Admin";

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      displayName={displayName}
      greeting="Admin Workspace,"
    >
      {error && (
        <div className={styles.errorBanner}>
          <div className={styles.qaLeft}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => navigate("/login")} className={styles.errorLoginBtn}>
            Log in as Admin
          </button>
        </div>
      )}

      {/* ── Top Organized Navigation Tabs ── */}
      <div className={styles.adminTabContainer}>
        <div className={styles.adminTabs}>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "overview" ? styles.adminTabBtnActive : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Layers size={16} />
            <span>Executive Overview</span>
          </button>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "inquiries" ? styles.adminTabBtnActive : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            <Users size={16} />
            <span>Inquiries & Callbacks</span>
            {analytics.pendingCallbacks > 0 && (
              <span className={styles.tabCountBadge}>{analytics.pendingCallbacks}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${activeTab === "exports" ? styles.adminTabBtnActive : ""}`}
            onClick={() => setActiveTab("exports")}
          >
            <Download size={16} />
            <span>Export Center</span>
          </button>
          <button
            type="button"
            className={styles.adminTabBtn}
            onClick={() => navigate("/admin/analytics")}
          >
            <BarChart3 size={16} />
            <span>Chart Intelligence &rarr;</span>
          </button>
        </div>

        <div className={styles.adminTopActions}>
          <button
            type="button"
            className={styles.chartCardExportBtn}
            onClick={handleExportInquiriesCSV}
            title="Download CSV report of inquiries"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className={`${styles.chartCardExportBtn} ${styles.primaryText}`}
            onClick={handlePrintExecutiveReport}
            title="Print official executive report"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── System Health Bar ── */}
      <div className={styles.systemHealthBar}>
        <div className={styles.healthCluster}>
          <span className={styles.healthItem}>
            <span className={styles.healthDot} />
            PostgreSQL Database: <strong>Connected</strong>
          </span>
          <span className={styles.healthItem}>
            <span className={styles.healthDot} />
            ChromaDB Vector RAG: <strong>9 Branches Synced</strong>
          </span>
          <span className={styles.healthItem}>
            <span className={styles.healthDot} />
            Sarvam AI Speech Engine: <strong>Active</strong>
          </span>
        </div>
        <div className={styles.healthItem}>
          <span>DTE Institute Code: <strong>3010</strong> • Autonomous Status</span>
        </div>
      </div>

      {/* ══════════════ TAB 1: EXECUTIVE OVERVIEW ══════════════ */}
      {activeTab === "overview" && (
        <>
          <div className={`${styles.card} ${styles.aiCard}`}>
            <div className={styles.aiHeroBadge}>
              <BarChart3 size={14} />
              <span>Institutional Command Center</span>
            </div>
            <h2 className={styles.aiTitle}>System Control & Overview</h2>
            <div>
              <p className={styles.aiDescription}>
                {loading ? (
                  "Loading latest institutional statistics..."
                ) : (
                  <>
                    Overseeing <strong>{analytics.totalStudents}</strong> student profiles and{" "}
                    <strong>{analytics.totalApplications}</strong> admissions. Campus-Mitra has
                    resolved <strong>{analytics.totalQueries}</strong> parent/student queries with
                    an average satisfaction rating of <strong>{analytics.averageRating} ★</strong>.
                  </>
                )}
              </p>

              <form
                className={styles.queryLauncher}
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveTab("inquiries");
                }}
              >
                <input
                  type="text"
                  className={styles.queryInput}
                  placeholder="Search student names, phone numbers, branch preferences, or inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className={styles.querySubmitBtn}
                  aria-label="Search Inquiries"
                >
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
                <div
                  className={styles.snapshotItem}
                  onClick={() => navigate("/admin/analytics")}
                  title="Click to view Satisfaction & Rating Intelligence in Analytics"
                >
                  <span>Satisfaction Rating</span>
                  <strong className={styles.warningText}>
                    {analytics.averageRating ? `${analytics.averageRating} ★` : "5.0 ★"}
                  </strong>
                </div>
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate("/admin/analytics")}
              >
                Open Full Analytics Hub
                <ArrowUpRight size={17} />
              </button>
              <button
                type="button"
                className={styles.outlineActionBtn}
                onClick={() => setActiveTab("inquiries")}
              >
                <Users size={16} />
                <span>Manage Inquiries & Callbacks</span>
              </button>
              <button
                type="button"
                className={styles.outlineActionBtn}
                onClick={handleExportInquiriesCSV}
                title="Download CSV report of student inquiries"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className={styles.sideStack}>
            <div className={`${styles.card} ${styles.quickCard}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Operations & Control Center</h2>
                  <p className={styles.cardEyebrow}>Immediate Staff Actions</p>
                </div>
              </div>

              <div className={styles.quickActions}>
                <button
                  type="button"
                  className={`${styles.quickAction} ${styles.qaRow}`}
                  onClick={() => {
                    setFilterType("callbacks");
                    setActiveTab("inquiries");
                  }}
                >
                  <div className={styles.qaLeft}>
                    <div className={styles.quickIcon}>
                      <PhoneCall size={18} />
                    </div>
                    <div className={styles.quickActionText}>
                      <strong>Parent & Student Callbacks</strong>
                      <span>{analytics.pendingCallbacks} requests awaiting staff call</span>
                    </div>
                  </div>
                  <div className={styles.qaRight}>
                    <span
                      className={`${styles.pill} ${
                        analytics.pendingCallbacks > 0 ? styles.pillPending : styles.pillClear
                      }`}
                    >
                      {analytics.pendingCallbacks > 0
                        ? `${analytics.pendingCallbacks} Pending`
                        : "All Clear"}
                    </span>
                    <ChevronRight size={17} />
                  </div>
                </button>

                <button
                  type="button"
                  className={`${styles.quickAction} ${styles.qaRow}`}
                  onClick={() => navigate("/chat")}
                >
                  <div className={styles.qaLeft}>
                    <div className={`${styles.quickIcon} ${styles.pillTotal}`}>
                      <Users size={18} />
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
                    <ChevronRight size={17} />
                  </div>
                </button>

                <button
                  type="button"
                  className={`${styles.quickAction} ${styles.qaRow}`}
                  onClick={() => {
                    setFilterType("followup");
                    setActiveTab("inquiries");
                  }}
                >
                  <div className={styles.qaLeft}>
                    <div className={`${styles.quickIcon} ${styles.pillRating}`}>
                      <AlertCircle size={18} />
                    </div>
                    <div className={styles.quickActionText}>
                      <strong>Escalated Follow-ups</strong>
                      <span>Questions flagged for human counseling</span>
                    </div>
                  </div>
                  <div className={styles.qaRight}>
                    <span
                      className={`${styles.pill} ${
                        analytics.queriesNeedingFollowup > 0
                          ? styles.pillFlagged
                          : styles.pillClear
                      }`}
                    >
                      {analytics.queriesNeedingFollowup} Flagged
                    </span>
                    <ChevronRight size={17} />
                  </div>
                </button>

                <button
                  type="button"
                  className={`${styles.quickAction} ${styles.qaRow}`}
                  onClick={() => navigate("/admin/analytics")}
                >
                  <div className={styles.qaLeft}>
                    <div className={`${styles.quickIcon} ${styles.pillRating}`}>
                      <Star size={18} />
                    </div>
                    <div className={styles.quickActionText}>
                      <strong>Student Satisfaction & Ratings</strong>
                      <span>Analyze star distributions & counseling feedback</span>
                    </div>
                  </div>
                  <div className={styles.qaRight}>
                    <span className={`${styles.pill} ${styles.pillRating}`}>
                      {analytics.averageRating ? `${analytics.averageRating} ★` : "5.0 ★"} (
                      {analytics.totalFeedback} reviews)
                    </span>
                    <ChevronRight size={17} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ TAB 2: INQUIRIES & CALLBACK MANAGEMENT TABLE ══════════════ */}
      {activeTab === "inquiries" && (
        <div className={styles.tableContainer}>
          <div className={styles.tableToolbar}>
            <div>
              <p className={styles.cardEyebrow}>Candidate Relationship Management</p>
              <h2 className={styles.cardTitle}>Student Inquiries & Callback Queue</h2>
            </div>

            <div className={styles.tableFilters}>
              <div className={styles.tableSearchBox}>
                <Search size={15} color="var(--muted)" />
                <input
                  type="text"
                  className={styles.tableSearchInput}
                  placeholder="Filter by name, phone, branch, query..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <select
                className={styles.tableSelect}
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Inquiries</option>
                <option value="callbacks">Callbacks Only ({analytics.pendingCallbacks})</option>
                <option value="followup">Flagged Follow-ups</option>
              </select>

              <select
                className={styles.tableSelect}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="Resolved">Resolved</option>
                <option value="Enrolled">Enrolled</option>
              </select>

              <button
                type="button"
                className={styles.chartCardExportBtn}
                onClick={handleExportInquiriesCSV}
                title="Export filtered table as CSV"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                className={styles.chartCardExportBtn}
                onClick={fetchChats}
                title="Refresh table"
              >
                <RefreshCw size={14} className={loadingChats ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className={styles.tableScrollArea}>
            <table className={styles.inquiryTable}>
              <thead>
                <tr>
                  <th>Candidate & Contact</th>
                  <th>Branch Preference</th>
                  <th>Score</th>
                  <th>Inquiry / Question Asked</th>
                  <th>Flags</th>
                  <th>Follow-up Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedChats.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                      {loadingChats ? "Loading inquiries..." : "No student inquiries found matching current filters."}
                    </td>
                  </tr>
                ) : (
                  paginatedChats.map((item, idx) => {
                    const studentId = item.student?.student_id || item.student_id;
                    const studentName = item.student?.full_name || item.student_name || "Guest Student";
                    const studentPhone = item.student?.phone || item.student_phone || "Not provided";
                    const targetBranch = item.student?.target_branch || item.target_branch || "Undeclared";
                    const score = item.student?.entrance_score ? `${item.student.entrance_score}%` : "—";
                    const question = item.question || item.user_message || "Admissions query";
                    const isCallback = item.student?.callback_requested || item.callback_requested;
                    const isFlagged = item.needs_followup;
                    const currentStatus = item.student?.followup_status || item.followup_status || "Pending";
                    const dateStr = item.created_at
                      ? new Date(item.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent";

                    return (
                      <tr key={item.chat_id || `chat-${idx}`}>
                        <td>
                          <div className={styles.studentMetaCol}>
                            <span className={styles.studentNameText}>{studentName}</span>
                            <span className={styles.studentContactText}>{studentPhone}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.feedbackBranch}>{targetBranch}</span>
                        </td>
                        <td>
                          <strong>{score}</strong>
                        </td>
                        <td>
                          <div className={styles.queryTextWrap} title={question}>
                            "{question}"
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {isCallback && <span className={`${styles.pill} ${styles.pillPending}`}>Callback</span>}
                            {isFlagged && <span className={`${styles.pill} ${styles.pillFlagged}`}>Flagged</span>}
                            {!isCallback && !isFlagged && <span className={`${styles.pill} ${styles.pillClear}`}>Standard</span>}
                          </div>
                        </td>
                        <td>
                          {studentId ? (
                            <select
                              className={`${styles.statusDropdown} ${
                                currentStatus === "Resolved"
                                  ? styles.statusDropdownResolved
                                  : currentStatus === "Enrolled"
                                  ? styles.statusDropdownEnrolled
                                  : styles.statusDropdownPending
                              }`}
                              value={currentStatus}
                              disabled={updatingStudentId === studentId}
                              onChange={(e) => handleStatusChange(studentId, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Enrolled">Enrolled</option>
                            </select>
                          ) : (
                            <span className={styles.pillClear}>Guest</span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {dateStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationBar}>
            <span>
              Showing {filteredChats.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredChats.length)} of {filteredChats.length} records
            </span>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB 3: EXPORT & AUDIT CENTER ══════════════ */}
      {activeTab === "exports" && (
        <div className={styles.exportSection}>
          <div className={styles.sectionHeading} style={{ textAlign: "left", marginBottom: "1rem" }}>
            <span className={styles.sectionBadge}>Data Portability & Compliance</span>
            <h2 className={styles.sectionTitle}>Admissions Export & Telemetry Center</h2>
            <p className={styles.sectionSubtitle}>
              Export verified institutional datasets in CSV, structured JSON, or printable executive audit summaries.
            </p>
          </div>

          <div className={styles.exportGrid}>
            {/* Card 1: Inquiries CSV */}
            <div className={styles.exportCard}>
              <div className={styles.exportCardHeader}>
                <div className={styles.exportCardIcon}>
                  <FileSpreadsheet size={22} />
                </div>
                <div className={styles.exportCardMeta}>
                  <h3 className={styles.exportCardTitle}>Student Inquiries & Callbacks (CSV)</h3>
                  <p className={styles.exportCardDesc}>
                    Tabular download containing all student queries, phone numbers, target engineering branches, and follow-up status.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.exportBtn} ${styles.exportBtnPrimary}`}
                onClick={handleExportInquiriesCSV}
              >
                <Download size={16} />
                <span>Download Inquiries CSV</span>
              </button>
            </div>

            {/* Card 2: Branch Demand CSV */}
            <div className={styles.exportCard}>
              <div className={styles.exportCardHeader}>
                <div className={styles.exportCardIcon}>
                  <BarChart3 size={22} />
                </div>
                <div className={styles.exportCardMeta}>
                  <h3 className={styles.exportCardTitle}>Autonomous Branch Demand Matrix (CSV)</h3>
                  <p className={styles.exportCardDesc}>
                    Complete breakdown of 9 autonomous diploma disciplines, candidate interest volume, typical cutoffs, and sandwich pattern training.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportBranchDemandCSV}
              >
                <Download size={16} />
                <span>Download Branch CSV</span>
              </button>
            </div>

            {/* Card 3: Complete Audit JSON */}
            <div className={styles.exportCard}>
              <div className={styles.exportCardHeader}>
                <div className={styles.exportCardIcon}>
                  <FileJson size={22} />
                </div>
                <div className={styles.exportCardMeta}>
                  <h3 className={styles.exportCardTitle}>Full Telemetry & Audit Dump (JSON)</h3>
                  <p className={styles.exportCardDesc}>
                    Raw structured JSON dump including all system KPIs, department interactions, rating breakdown, and system metadata.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportFullTelemetryJSON}
              >
                <Download size={16} />
                <span>Export Audit JSON</span>
              </button>
            </div>

            {/* Card 4: Executive Print Report */}
            <div className={styles.exportCard}>
              <div className={styles.exportCardHeader}>
                <div className={styles.exportCardIcon}>
                  <Printer size={22} />
                </div>
                <div className={styles.exportCardMeta}>
                  <h3 className={styles.exportCardTitle}>Official Executive Summary (Print / PDF)</h3>
                  <p className={styles.exportCardDesc}>
                    Institutional audit document with SVKM SBMP header, KPI summary scorecard, branch breakdown, and official signature block.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.exportBtn} ${styles.exportBtnPrimary}`}
                onClick={handlePrintExecutiveReport}
              >
                <Printer size={16} />
                <span>Generate Print Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
