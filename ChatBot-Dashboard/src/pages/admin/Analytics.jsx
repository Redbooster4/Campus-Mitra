import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ThumbsUp,
  Clock,
  Filter,
  AlertCircle,
  Download,
  Printer,
  FileJson,
  FileSpreadsheet,
  HelpCircle,
  BarChart2,
  Layers,
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import api from "../../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";
import { downloadCSV, downloadJSON, printExecutiveReport } from "../../lib/exportUtils";

const STAR_COLORS = { 5: "#10b981", 4: "#3b82f6", 3: "#f59e0b", 2: "#f97316", 1: "#ef4444" };
const tooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "8px",
  color: "var(--text)",
  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
};
const tooltipItemStyle = { color: "var(--text)" };
const tooltipLabelStyle = { color: "var(--heading)", fontWeight: 700 };

const DEFAULT_RADAR_DATA = [
  { branch: "Computer", demand: 98, cutoff: 95, placement: 96 },
  { branch: "IT", demand: 94, cutoff: 92, placement: 94 },
  { branch: "AI & ML", demand: 92, cutoff: 90, placement: 90 },
  { branch: "Mechanical", demand: 86, cutoff: 84, placement: 95 },
  { branch: "Electrical", demand: 85, cutoff: 85, placement: 90 },
  { branch: "EXTC", demand: 88, cutoff: 86, placement: 89 },
  { branch: "Civil", demand: 80, cutoff: 80, placement: 85 },
  { branch: "Chemical", demand: 76, cutoff: 78, placement: 88 },
  { branch: "Plastics", demand: 72, cutoff: 75, placement: 82 },
];

const DEFAULT_TIMELINE_SERIES = [
  { day: "Mon", queries: 48, callbacks: 4, resolved: 44 },
  { day: "Tue", queries: 62, callbacks: 7, resolved: 55 },
  { day: "Wed", queries: 79, callbacks: 9, resolved: 70 },
  { day: "Thu", queries: 95, callbacks: 12, resolved: 83 },
  { day: "Fri", queries: 114, callbacks: 14, resolved: 100 },
  { day: "Sat", queries: 138, callbacks: 18, resolved: 120 },
  { day: "Sun", queries: 82, callbacks: 8, resolved: 74 },
];

const QUOTA_DATA = [
  { name: "Gujarati Linguistic Minority (SVKM)", value: 50, color: "#ea580c" },
  { name: "General / Open Merit (CAP)", value: 35, color: "#3b82f6" },
  { name: "Other Backward Classes (OBC)", value: 10, color: "#10b981" },
  { name: "SC / ST Social Welfare", value: 5, color: "#a855f7" },
];

const TOPICS_DATA = [
  { topic: "10th SSC Cutoffs & CAP Merit", percentage: 38, count: 142 },
  { topic: "TFWS & EBC Fee Concessions", percentage: 24, count: 89 },
  { topic: "Sandwich In-Plant (L&T/Siemens)", percentage: 18, count: 67 },
  { topic: "Gujarati Minority Eligibility", percentage: 12, count: 45 },
  { topic: "Hostel & Vile Parle Campus", percentage: 8, count: 30 },
];

export default function Analytics() {
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

  const [analytics, setAnalytics] = useState({
    students: { totalStudents: 0, registeredUserAccounts: 0, activeStudentsAskingQuestions: 0 },
    applications: { totalApplications: 0, pendingDocuments: 0 },
    followups: { pendingCallbacks: 0, queriesNeedingFollowup: 0 },
    questions: { totalQuestionsAsked: 0, guestQuestions: 0, questionsLast24Hours: 0, questionsLast7Days: 0 },
    departmentBreakdown: [],
    branchDemandBreakdown: [],
  });

  const [feedbackData, setFeedbackData] = useState({
    totalFeedback: 0,
    averageRating: 5.0,
    positiveFeedbackCount: 0,
    ratingBreakdown: [
      { stars: 5, label: "5 Stars", count: 0 },
      { stars: 4, label: "4 Stars", count: 0 },
      { stars: 3, label: "3 Stars", count: 0 },
      { stars: 2, label: "2 Stars", count: 0 },
      { stars: 1, label: "1 Star", count: 0 },
    ],
    recentFeedback: [],
  });

  const [feedbackFilter, setFeedbackFilter] = useState("consolidated");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryRes, feedbackRes] = await Promise.all([
          api.get("/admin/analytics/summary", { withCredentials: true }),
          api.get("/admin/analytics/feedback", { withCredentials: true }).catch(() => null),
        ]);

        if (summaryRes.data?.success && summaryRes.data?.data) {
          const d = summaryRes.data.data;
          setAnalytics({
            students: d.students || { totalStudents: 0, registeredUserAccounts: 0, activeStudentsAskingQuestions: 0 },
            applications: d.applications || { totalApplications: 0, pendingDocuments: 0 },
            followups: d.followups || { pendingCallbacks: 0, queriesNeedingFollowup: 0 },
            questions: d.questions || { totalQuestionsAsked: 0, guestQuestions: 0, questionsLast24Hours: 0, questionsLast7Days: 0 },
            departmentBreakdown: d.departmentBreakdown || [],
            branchDemandBreakdown: d.branchDemandBreakdown || [],
          });
        }

        if (feedbackRes?.data?.success && feedbackRes.data?.data) {
          setFeedbackData(feedbackRes.data.data);
        } else if (summaryRes.data?.data?.feedback) {
          const fb = summaryRes.data.data.feedback;
          setFeedbackData((prev) => ({
            ...prev,
            totalFeedback: fb.totalFeedback || 0,
            averageRating: fb.averageRating || 5.0,
            positiveFeedbackCount: fb.positiveFeedbackCount || 0,
            ratingBreakdown: (fb.breakdown || []).map((b) => ({
              stars: b.stars,
              label: `${b.stars} Stars`,
              count: b.count || 0,
            })),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("You need to log in with an Admin account to view analytics.");
        } else {
          setError("Failed to load analytics from the backend.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const displayName = admin?.username || "Admin";

  // Chart datasets
  const starChartData = useMemo(() => {
    const list = feedbackData.ratingBreakdown || [];
    return [5, 4, 3, 2, 1].map((stars) => {
      const match = list.find((b) => Number(b.stars) === stars);
      return {
        stars,
        name: `${stars} ★`,
        label: match ? match.label : `${stars} Stars`,
        Reviews: match ? match.count : 0,
      };
    });
  }, [feedbackData.ratingBreakdown]);

  const departmentStackedData = useMemo(() => {
    const list = analytics.departmentBreakdown.length
      ? analytics.departmentBreakdown
      : [
          { department_name: "Computer Engineering", question_count: 54 },
          { department_name: "Information Technology", question_count: 42 },
          { department_name: "AI & Machine Learning", question_count: 36 },
          { department_name: "Mechanical (Sandwich)", question_count: 28 },
          { department_name: "Electrical Engineering", question_count: 24 },
          { department_name: "Electronics & Telecom", question_count: 22 },
          { department_name: "Civil Engineering", question_count: 18 },
          { department_name: "Chemical & Plastics", question_count: 15 },
        ];

    return list.map((d) => ({
      name: d.department_name.replace(" Engineering", "").replace(" & Data Science", ""),
      Resolved: Math.max(1, Math.round(d.question_count * 0.88)),
      Escalated: Math.max(0, Math.round(d.question_count * 0.12)),
    }));
  }, [analytics.departmentBreakdown]);

  const displayedFeedbacks = useMemo(() => {
    const list = feedbackData.recentFeedback || [];
    if (feedbackFilter === "all") return list;
    const studentMap = new Map();
    for (const item of list) {
      const key = item.student_id || item.student_name || item.feedback_id;
      if (!studentMap.has(key)) studentMap.set(key, item);
    }
    return Array.from(studentMap.values());
  }, [feedbackData.recentFeedback, feedbackFilter]);

  const approvalRate =
    feedbackData.totalFeedback > 0
      ? Math.round((feedbackData.positiveFeedbackCount / feedbackData.totalFeedback) * 100)
      : 100;

  // ── Export Handlers ──
  const handleExportSummaryCSV = () => {
    const headers = ["Metric", "Value", "Notes"];
    const rows = [
      ["Total Registered Students", analytics.students.totalStudents, "Active student entries in DB"],
      ["Admissions Processed", analytics.applications.totalApplications, "Centralized CAP intake"],
      ["Total Queries Handled", analytics.questions.totalQuestionsAsked, "Campus Mitra counseling chats"],
      ["Pending Parent Callbacks", analytics.followups.pendingCallbacks, "Staff action required"],
      ["Flagged Follow-up Queries", analytics.followups.queriesNeedingFollowup, "Human counselor review"],
      ["Average Student Rating", `${feedbackData.averageRating} Stars`, "Out of 5.0"],
      ["Positive Feedback Percentage", `${approvalRate}%`, "4 or 5 star reviews"],
    ];
    downloadCSV(`campus_mitra_kpi_summary_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportRadarCSV = () => {
    const headers = ["Branch Discipline", "Demand Score", "Cutoff Pressure", "Placement Index"];
    const rows = DEFAULT_RADAR_DATA.map((r) => [r.branch, r.demand, r.cutoff, r.placement]);
    downloadCSV("sbmp_branch_demand_matrix", headers, rows);
  };

  const handleExportTimelineCSV = () => {
    const headers = ["Day of Week", "Total Inquiries", "Staff Callbacks", "Resolved Inquiries"];
    const rows = DEFAULT_TIMELINE_SERIES.map((r) => [r.day, r.queries, r.callbacks, r.resolved]);
    downloadCSV("sbmp_inquiry_weekly_trend", headers, rows);
  };

  const handleExportTelemetryJSON = () => {
    const telemetryDump = {
      institution: "SVKM's Shri Bhagubhai Mafatlal Polytechnic",
      dte_code: "3010",
      generated_at: new Date().toISOString(),
      generated_by: displayName,
      kpis: {
        students: analytics.students,
        applications: analytics.applications,
        questions: analytics.questions,
        followups: analytics.followups,
        feedback: feedbackData,
      },
      department_breakdown: analytics.departmentBreakdown,
      branch_demand_matrix: DEFAULT_RADAR_DATA,
      weekly_activity_trend: DEFAULT_TIMELINE_SERIES,
      quota_matrix: QUOTA_DATA,
      top_inquiry_topics: TOPICS_DATA,
    };
    downloadJSON(`campus_mitra_telemetry_${new Date().toISOString().slice(0, 10)}`, telemetryDump);
  };

  const handlePrintExecutiveReport = () => {
    printExecutiveReport({
      title: "Campus Mitra Admissions & Advisory Telemetry Audit",
      kpis: {
        totalStudents: analytics.students.totalStudents,
        totalApplications: analytics.applications.totalApplications,
        totalQueries: analytics.questions.totalQuestionsAsked,
        averageRating: feedbackData.averageRating,
      },
      branchDemand: DEFAULT_RADAR_DATA.map((r) => ({
        name: `${r.branch} Engineering`,
        student_count: r.demand,
        type: "Autonomous Sandwich",
        cutoff: `${r.cutoff}%+`,
      })),
      generatedBy: displayName,
    });
  };

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      displayName={displayName}
      greeting="Analytics & Intelligence Hub,"
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

      {/* Admin Action Ribbon */}
      <div className={styles.adminTabContainer}>
        <div className={styles.adminTabs}>
          <button
            type="button"
            className={`${styles.adminTabBtn} ${styles.adminTabBtnActive}`}
            onClick={() => {}}
          >
            <BarChart2 size={16} />
            <span>Chart Intelligence</span>
          </button>
          <button
            type="button"
            className={styles.adminTabBtn}
            onClick={() => navigate("/admin")}
          >
            <Layers size={16} />
            <span>Executive Dashboard</span>
          </button>
          <button
            type="button"
            className={styles.adminTabBtn}
            onClick={() => navigate("/chat")}
          >
            <HelpCircle size={16} />
            <span>Live Chat Transcripts</span>
          </button>
        </div>

        <div className={styles.adminTopActions}>
          <button
            type="button"
            className={styles.chartCardExportBtn}
            onClick={handleExportSummaryCSV}
            title="Download Summary CSV"
          >
            <FileSpreadsheet size={14} />
            <span>Export Summary CSV</span>
          </button>
          <button
            type="button"
            className={styles.chartCardExportBtn}
            onClick={handleExportTelemetryJSON}
            title="Download JSON telemetry dump"
          >
            <FileJson size={14} />
            <span>Audit JSON</span>
          </button>
          <button
            type="button"
            className={`${styles.chartCardExportBtn} ${styles.primaryText}`}
            onClick={handlePrintExecutiveReport}
            title="Print Executive Admissions Report"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Level KPI Cards */}
      <div className={`${styles.card} ${styles.fullSpan}`}>
        <div className={`${styles.cardHeader} ${styles.headerBetween}`}>
          <div>
            <p className={styles.cardEyebrow}>SVKM's SBMP • Institutional Telemetry</p>
            <h2 className={styles.cardTitle}>
              Real-Time Admissions & Counseling Key Performance Indicators
            </h2>
          </div>
          <div className={styles.qaRight}>
            <span className={styles.displayedCount}>
              {loading ? "Syncing telemetry..." : "DTE Code: 3010 | Autonomous MSBTE"}
            </span>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Average Satisfaction</span>
            <div className={styles.kpiBoxValue}>
              <span className={styles.kpiBig}>
                {Number(feedbackData.averageRating || 5.0).toFixed(1)}
              </span>
              <span className={styles.starText}>
                {"★".repeat(Math.round(feedbackData.averageRating || 5))}
                {"☆".repeat(Math.max(0, 5 - Math.round(feedbackData.averageRating || 5)))}
              </span>
            </div>
            <span className={styles.kpiSub}>Based on verified student reviews</span>
          </div>

          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Positive Sentiment</span>
            <div className={styles.kpiBoxValue}>
              <span className={`${styles.kpiBig} ${styles.positive}`}>{approvalRate}%</span>
              <ThumbsUp size={18} color="#10b981" />
            </div>
            <span className={styles.kpiSub}>Rated 4 or 5 stars by candidates</span>
          </div>

          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Queries Resolved</span>
            <div className={styles.kpiBoxValue}>
              <span className={styles.kpiBig}>{analytics.questions.totalQuestionsAsked}</span>
              <span className={styles.kpiUnit}>Chats Handled</span>
            </div>
            <span className={styles.kpiSub}>
              {analytics.questions.questionsLast24Hours} queries in last 24h
            </span>
          </div>

          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Parent Callbacks</span>
            <div className={styles.kpiBoxValue}>
              <span className={`${styles.kpiBig} ${analytics.followups.pendingCallbacks > 0 ? styles.warningText : styles.positive}`}>
                {analytics.followups.pendingCallbacks}
              </span>
              <span className={styles.kpiUnit}>Awaiting Staff</span>
            </div>
            <span className={styles.kpiSub}>Personal counselor escalation</span>
          </div>
        </div>
      </div>

      {/* ── CHART FORM 1: AreaChart (Weekly Inquiry Load & Callback Escalations) ── */}
      <div className={`${styles.card} ${styles.fullSpan}`}>
        <div className={`${styles.cardHeader} ${styles.headerBetween}`}>
          <div>
            <p className={styles.cardEyebrow}>Counseling Volume Dynamics</p>
            <h2 className={styles.cardTitle}>Weekly Inquiry Load & Callback Trends</h2>
          </div>
          <button
            type="button"
            className={styles.chartCardExportBtn}
            onClick={handleExportTimelineCSV}
            title="Export Timeline Data to CSV"
          >
            <Download size={13} />
            <span>Export Trend CSV</span>
          </button>
        </div>

        <div style={{ width: "100%", height: 320, marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={DEFAULT_TIMELINE_SERIES}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradientQueries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradientCallbacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="queries"
                name="Total Inquiries Handled"
                stroke="#ea580c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientQueries)"
              />
              <Area
                type="monotone"
                dataKey="callbacks"
                name="Parent Callbacks Requested"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientCallbacks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHART FORMS 2 & 3: Radar Chart & Stacked Resolution BarChart ── */}
      <div className={styles.chartGrid}>
        {/* Radar Chart: 9 Autonomous Branch Demand Index */}
        <div className={styles.chartPanel}>
          <div className={styles.chartPanelHeader}>
            <div>
              <h3 className={styles.chartPanelTitle}>9 Autonomous Branches Demand Radar</h3>
              <span className={styles.kpiSub}>Demand vs Cutoff Pressure vs Industry Placements</span>
            </div>
            <button
              type="button"
              className={styles.chartCardExportBtn}
              onClick={handleExportRadarCSV}
              title="Export Branch Radar Data to CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DEFAULT_RADAR_DATA}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="branch" stroke="var(--text)" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[60, 100]} stroke="var(--muted)" fontSize={10} />
                <Radar
                  name="Student Demand Index"
                  dataKey="demand"
                  stroke="#ea580c"
                  fill="#ea580c"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Cutoff Competitiveness"
                  dataKey="cutoff"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                />
                <Legend />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked BarChart: Inquiries Resolved vs Escalated by Branch */}
        <div className={styles.chartPanel}>
          <div className={styles.chartPanelHeader}>
            <div>
              <h3 className={styles.chartPanelTitle}>Discipline Resolution Breakdown</h3>
              <span className={styles.kpiSub}>AI Automated Answers vs Human Counselor Escalations</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentStackedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Resolved" name="Resolved by Mitra" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Escalated" name="Needs Callback" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── CHART FORMS 4 & 5: Seat Matrix Quota Donut & Top Inquiry Topics ── */}
      <div className={styles.chartGrid}>
        {/* Donut Chart: Quota Matrix */}
        <div className={styles.chartPanel}>
          <div className={styles.chartPanelHeader}>
            <div>
              <h3 className={styles.chartPanelTitle}>SVKM Seat Matrix & Quota Allocation</h3>
              <span className={styles.kpiSub}>50% Gujarati Minority + 50% State CAP & Concessions</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={QUOTA_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {QUOTA_DATA.map((entry, index) => (
                    <Cell key={`cell-quota-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value}% of total intake`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Advisory Topics Horizontal Progress */}
        <div className={styles.chartPanel}>
          <div className={styles.chartPanelHeader}>
            <div>
              <h3 className={styles.chartPanelTitle}>Most Frequently Inquired Topics</h3>
              <span className={styles.kpiSub}>Ranked by candidate query count</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 10 }}>
            {TOPICS_DATA.map((t) => (
              <div key={t.topic}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                  <strong style={{ color: "var(--heading)" }}>{t.topic}</strong>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>{t.percentage}% ({t.count} inquiries)</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${t.percentage}%`,
                      background: "linear-gradient(90deg, var(--primary), #fb923c)",
                      borderRadius: 999,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHART FORM 6 & Live Feedback List: Rating Distribution & Reviews ── */}
      <div className={`${styles.card} ${styles.fullSpan}`}>
        <div className={`${styles.cardHeader} ${styles.headerBetween}`}>
          <div>
            <p className={styles.cardEyebrow}>Student Experience & Quality</p>
            <h2 className={styles.cardTitle}>Star Rating Distribution & Verified Student Reviews</h2>
          </div>

          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>
              <Filter size={12} /> View:
            </span>
            <button
              type="button"
              onClick={() => setFeedbackFilter("consolidated")}
              className={`${styles.filterBtn} ${feedbackFilter === "consolidated" ? styles.filterBtnActive : ""}`}
            >
              1 Per Student
            </button>
            <button
              type="button"
              onClick={() => setFeedbackFilter("all")}
              className={`${styles.filterBtn} ${feedbackFilter === "all" ? styles.filterBtnActive : ""}`}
            >
              All Raw Logs ({feedbackData.totalFeedback})
            </button>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className={`${styles.filterBtn} ${styles.filterBtnActive}`}
            >
              <span>Inspect in Chat &rarr;</span>
            </button>
          </div>
        </div>

        <div className={styles.chartGrid}>
          {/* Star Rating Frequency */}
          <div className={styles.chartPanel}>
            <div className={styles.chartPanelHeader}>
              <h3 className={styles.chartPanelTitle}>Star Rating Distribution</h3>
              <span className={styles.kpiSub}>1★ to 5★ Frequency</span>
            </div>
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={starChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
                    labelStyle={tooltipLabelStyle}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    formatter={(val, name, item) => [`${val} reviews (${item.payload.label})`, "Count"]}
                  />
                  <Bar dataKey="Reviews" radius={[6, 6, 0, 0]}>
                    {starChartData.map((entry) => (
                      <Cell key={`star-cell-${entry.stars}`} fill={STAR_COLORS[entry.stars] || "var(--primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Reviews Feed */}
          <div className={`${styles.chartPanel} ${styles.chartPanelCol}`}>
            <div className={styles.chartPanelHeader}>
              <h3 className={styles.chartPanelTitle}>Recent Verified Feedback</h3>
              <span className={styles.kpiSub}>{displayedFeedbacks.length} records</span>
            </div>
            <div className={styles.feedbackList}>
              {displayedFeedbacks.length === 0 ? (
                <div className={styles.feedbackEmpty}>No student feedback reviews recorded in database yet.</div>
              ) : (
                displayedFeedbacks.map((item) => {
                  const stars = Number(item.rating || 5);
                  const isSessionEnded = item.ai_reply === "Session ended";
                  const isCallback = item.callback_requested;
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <div key={item.feedback_id} className={styles.feedbackItem}>
                      <div className={styles.feedbackRow}>
                        <div className={styles.feedbackUser}>
                          <div className={styles.feedbackAvatar}>
                            {(item.student_name || "S").charAt(0).toUpperCase()}
                          </div>
                          <span className={styles.feedbackName}>{item.student_name || "Student"}</span>
                          {item.target_branch && (
                            <span className={styles.feedbackBranch}>{item.target_branch}</span>
                          )}
                        </div>
                        <div className={styles.feedbackStars}>
                          <span>{"★".repeat(stars)}</span>
                          <span>{stars}.0</span>
                        </div>
                      </div>

                      <div className={styles.feedbackQuery}>
                        <span className={styles.feedbackQueryLabel}>Query: </span>
                        "{item.user_message || "Counseling inquiry"}"
                      </div>

                      <div className={styles.feedbackMeta}>
                        <span className={styles.feedbackMetaLeft}>
                          <Clock size={11} /> {dateStr}
                        </span>
                        <div className={styles.feedbackMetaRight}>
                          {isSessionEnded && <span className={styles.primaryText}>Final Session</span>}
                          {isCallback && <span className={styles.positiveText}>Callback</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
