import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ThumbsUp, Clock, Filter, AlertCircle
} from "lucide-react";
import styles from "../styles/Dashboard.module.css";
import api from "../../api/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { ADMIN_MENU_ITEMS } from "../../constants/navigation";

const COLORS = ['#fdba74', '#fed7aa', '#f97316', '#fb923c', '#ffedd5'];
const STAR_COLORS = { 5: "#10b981", 4: "#3b82f6", 3: "#f59e0b", 2: "#f97316", 1: "#ef4444" };
const tooltipStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' };
const tooltipItemStyle = { color: 'var(--text)' };
const tooltipLabelStyle = { color: 'var(--heading)', fontWeight: 600 };

export default function Analytics() {
  const [admin] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch { return null; }
    }
    return null;
  });

  const [analytics, setAnalytics] = useState({
    students: { totalStudents: 0, registeredUserAccounts: 0, activeStudentsAskingQuestions: 0 },
    questions: { totalQuestionsAsked: 0, guestQuestions: 0, questionsLast24Hours: 0, questionsLast7Days: 0 },
    departmentBreakdown: [],
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
          api.get("/admin/analytics/feedback", { withCredentials: true }).catch(() => null)
        ]);

        if (summaryRes.data?.success && summaryRes.data?.data) {
          const d = summaryRes.data.data;
          setAnalytics({
            students: d.students || { totalStudents: 0, registeredUserAccounts: 0, activeStudentsAskingQuestions: 0 },
            questions: d.questions || { totalQuestionsAsked: 0, guestQuestions: 0, questionsLast24Hours: 0, questionsLast7Days: 0 },
            departmentBreakdown: d.departmentBreakdown || [],
          });
        }

        if (feedbackRes?.data?.success && feedbackRes.data?.data) {
          setFeedbackData(feedbackRes.data.data);
        } else if (summaryRes.data?.data?.feedback) {
          const fb = summaryRes.data.data.feedback;
          setFeedbackData(prev => ({
            ...prev,
            totalFeedback: fb.totalFeedback || 0,
            averageRating: fb.averageRating || 5.0,
            positiveFeedbackCount: fb.positiveFeedbackCount || 0,
            ratingBreakdown: (fb.breakdown || []).map(b => ({
              stars: b.stars,
              label: `${b.stars} Stars`,
              count: b.count || 0
            }))
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
  const registered = analytics.students?.registeredUserAccounts || 0;
  const totalStudents = analytics.students?.totalStudents || 0;
  const unregistered = Math.max(0, totalStudents - registered);

  const studentData = [
    { name: 'Registered', value: registered },
    { name: 'Unregistered', value: unregistered }
  ];

  const activeQuestions = analytics.students?.activeStudentsAskingQuestions || 0;
  const engagementData = [
    { name: 'Active (Asked Qs)', value: activeQuestions },
    { name: 'Inactive', value: Math.max(0, registered - activeQuestions) }
  ];

  const totalQuestions = analytics.questions?.totalQuestionsAsked || 0;
  const questionsLast7Days = analytics.questions?.questionsLast7Days || 0;
  const questionsLast24Hours = analytics.questions?.questionsLast24Hours || 0;
  const olderQuestions = Math.max(0, totalQuestions - questionsLast7Days);

  const queryData = [
    { name: 'Last 24h', count: questionsLast24Hours },
    { name: '2 to 7 Days ago', count: Math.max(0, questionsLast7Days - questionsLast24Hours) },
    { name: 'Older', count: olderQuestions }
  ];

  const deptData = (analytics.departmentBreakdown || []).map(d => ({
    name: d.department_name,
    Queries: d.question_count
  }));

  const starChartData = useMemo(() => {
    const list = feedbackData.ratingBreakdown || [];
    return [5, 4, 3, 2, 1].map(stars => {
      const match = list.find(b => Number(b.stars) === stars);
      return {
        stars,
        name: `${stars} ★`,
        label: match ? match.label : `${stars} Stars`,
        Reviews: match ? match.count : 0
      };
    });
  }, [feedbackData.ratingBreakdown]);

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

  const approvalRate = feedbackData.totalFeedback > 0
    ? Math.round((feedbackData.positiveFeedbackCount / feedbackData.totalFeedback) * 100)
    : 100;

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      displayName={displayName}
      greeting="Analytics Overview,"
    >
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

      <div className={`${styles.card} ${styles.fullSpan}`}>
        <div className={`${styles.cardHeader} ${styles.headerBetween}`}>
          <div>
            <p className={styles.cardEyebrow}>Student Experience & Quality</p>
            <h2 className={styles.cardTitle}>
              Student Satisfaction & Rating Intelligence
            </h2>
          </div>

          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>
              <Filter size={12} /> View:
            </span>
            <button
              type="button"
              onClick={() => setFeedbackFilter("consolidated")}
              className={`${styles.filterBtn} ${feedbackFilter === "consolidated" ? styles.filterBtnActive : ""}`}
              title="Consolidates duplicate rapid ratings per student"
            >
              1 Per Student
            </button>
            <button
              type="button"
              onClick={() => setFeedbackFilter("all")}
              className={`${styles.filterBtn} ${feedbackFilter === "all" ? styles.filterBtnActive : ""}`}
              title="View all individual reaction and session ratings"
            >
              All Raw Logs ({feedbackData.totalFeedback})
            </button>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className={`${styles.filterBtn} ${styles.filterBtnActive}`}
              title="Inspect all live chat logs & transcripts in Admin Chat"
            >
              <span>Admin Chat Logs &rarr;</span>
            </button>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Average Rating</span>
            <div className={styles.kpiBoxValue}>
              <span className={styles.kpiBig}>
                {Number(feedbackData.averageRating || 5.0).toFixed(1)}
              </span>
              <span className={styles.starText}>
                {"★".repeat(Math.round(feedbackData.averageRating || 5))}
                {"☆".repeat(Math.max(0, 5 - Math.round(feedbackData.averageRating || 5)))}
              </span>
            </div>
            <span className={styles.kpiSub}>Across all submitted counseling sessions</span>
          </div>

          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Positive Sentiment</span>
            <div className={styles.kpiBoxValue}>
              <span className={`${styles.kpiBig} ${styles.positive}`}>{approvalRate}%</span>
              <ThumbsUp size={18} color="#10b981" />
            </div>
            <span className={styles.kpiSub}>Rated 4 or 5 stars by students</span>
          </div>

          <div className={styles.kpiBox}>
            <span className={styles.kpiBoxLabel}>Total Feedback Submissions</span>
            <div className={styles.kpiBoxValue}>
              <span className={styles.kpiBig}>{feedbackData.totalFeedback}</span>
              <span className={styles.kpiUnit}>Records in DB</span>
            </div>
            <span className={styles.kpiSub}>{displayedFeedbacks.length} unique student sessions</span>
          </div>
        </div>

        <div className={styles.chartGrid}>
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
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    formatter={(val, name, item) => [`${val} reviews (${item.payload.label})`, 'Count']}
                  />
                  <Bar dataKey="Reviews" radius={[6, 6, 0, 0]}>
                    {starChartData.map((entry) => (
                      <Cell key={`star-cell-${entry.stars}`} fill={STAR_COLORS[entry.stars] || 'var(--primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${styles.chartPanel} ${styles.chartPanelCol}`}>
            <div className={styles.chartPanelHeader}>
              <h3 className={styles.chartPanelTitle}>Student Reviews & Feedback</h3>
              <div className={styles.qaRight}>
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className={`${styles.filterBtn} ${styles.filterBtnActive}`}
                  title="View full conversation transcripts in /chat"
                >
                  <span>Inspect in Chat &rarr;</span>
                </button>
              </div>
            </div>
            <div className={styles.feedbackList}>
              {displayedFeedbacks.length === 0 ? (
                <div className={styles.feedbackEmpty}>No feedback reviews recorded in database yet.</div>
              ) : (
                displayedFeedbacks.map((item) => {
                  const stars = Number(item.rating || 5);
                  const isSessionEnded = item.ai_reply === "Session ended";
                  const isCallback = item.callback_requested;
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardEyebrow}>User Base</p>
            <h2 className={styles.cardTitle}>Student Demographics</h2>
          </div>
        </div>
        <div className={styles.columnGap20}>
          <div className={styles.sectionChart}>
            <h3 className={styles.sectionChartTitle}>Registration Status</h3>
            <div className={styles.sectionChartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={studentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {studentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.sectionChart}>
            <h3 className={styles.sectionChartTitle}>User Engagement</h3>
            <div className={styles.sectionChartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                    {engagementData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardEyebrow}>Engagement</p>
            <h2 className={styles.cardTitle}>Query Timeline</h2>
          </div>
        </div>
        <div className={styles.timelineWrap}>
          <h3 className={styles.sectionChartTitle}>Queries Over Time</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={queryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar dataKey="count" fill="var(--orange-light)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${styles.card} ${styles.fullSpan}`}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardEyebrow}>Topics & Categories</p>
            <h2 className={styles.cardTitle}>Department Interaction Breakdown</h2>
          </div>
        </div>
        <div className={styles.deptWrap}>
          {deptData.length === 0 ? (
            <div className={styles.centerMuted}>
              {loading ? "Loading department analytics..." : "No department query data recorded yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={deptData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="Queries" fill="var(--orange-light)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
