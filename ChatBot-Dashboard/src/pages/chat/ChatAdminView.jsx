import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ArrowUpRight, RefreshCw, Search, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import api from "@/api/api";
import MessageRenderer from "@/components/MessageRenderer";
import AnimatedLogo from "@/components/AnimatedLogo";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "@/pages/styles/Chat.module.css";

const centerFlex = { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" };
const sidebarHint = { fontSize: "0.78rem", color: "var(--muted)", padding: "4px 8px" };
const flexSpaceBetween = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" };
const ellipsis = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

const field = (inq, key) => inq.student?.[key] || inq[key === "full_name" ? "student_name" : key === "phone" ? "student_phone" : key === "email" ? "student_email" : key] || "";

export default function ChatAdminView({ user, userName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState(location.state?.selectedChatId || null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminLoading, setAdminLoading] = useState(true);
  const [studentChatThread, setStudentChatThread] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchAdminInquiries = async () => {
    try {
      setAdminLoading(true);
      const res = await api.get("/admin/analytics/chats?limit=50", { withCredentials: true });
      const chatRecords = res.data?.chats || res.data?.data || [];
      if (res.data?.success && Array.isArray(chatRecords)) {
        setInquiries(chatRecords);
        if (chatRecords.length > 0) {
          setSelectedInquiryId((prev) => prev || chatRecords[0].chat_id);
        }
      }
    } catch (err) {
      console.error("Failed to load inquiries for admin:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.get("/admin/analytics/chats?limit=50", { withCredentials: true })
      .then((res) => {
        const chatRecords = res.data?.chats || res.data?.data || [];
        if (active && res.data?.success && Array.isArray(chatRecords)) {
          setInquiries(chatRecords);
          if (chatRecords.length > 0) {
            setSelectedInquiryId((prev) => prev || chatRecords[0].chat_id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load inquiries for admin:", err);
      })
      .finally(() => {
        if (active) setAdminLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredInquiries = inquiries.filter((inq) => {
    if (!adminSearch.trim()) return true;
    const term = adminSearch.toLowerCase();
    return (
      field(inq, "full_name").toLowerCase().includes(term) ||
      field(inq, "phone").toLowerCase().includes(term) ||
      (inq.student?.target_branch || inq.target_branch || "").toLowerCase().includes(term) ||
      (inq.question || "").toLowerCase().includes(term)
    );
  });

  const selectedInquiry = inquiries.find((i) => i.chat_id === selectedInquiryId) || filteredInquiries[0] || null;

  useEffect(() => {
    const studentId = selectedInquiry?.student?.student_id;
    let isMounted = true;
    if (studentId) {
      api.get(`/admin/analytics/students/${studentId}/chats`, { withCredentials: true })
        .then((res) => {
          if (isMounted && res.data?.success && Array.isArray(res.data.chats)) {
            setStudentChatThread(res.data.chats);
          }
        })
        .catch(() => {
          if (isMounted) setStudentChatThread(null);
        });
    }
    return () => { isMounted = false; };
  }, [selectedInquiry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [studentChatThread, selectedInquiry]);

  const studentDisplayName = (inq) => inq?.student?.full_name || inq?.student_name || "Prospective Student / Parent";

  return (
    <div className={styles.chatPage}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          {!isCollapsed && (
            <div
              className={styles.brandGroup}
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{ cursor: "pointer" }}
              title="Toggle sidebar"
            >
              <div className={styles.logoWrapper}><AnimatedLogo /></div>
              <div className={styles.brandText}>
                <span className={styles.brandName}>Campus Mitra</span>
                <span className={styles.brandBadge}>Admin Panel</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={styles.collapseBtn}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <div className={styles.sidebarBody}>
          <span className={styles.navSectionTitle}>Navigation</span>
          <button onClick={() => navigate("/admin")} className={styles.navButton} title="Admin Dashboard">
            <LayoutDashboard className={styles.navIcon} />
            <span className={styles.navLabel}>Admin Dashboard</span>
          </button>
          <button onClick={() => navigate("/admin/analytics")} className={styles.navButton} title="System Analytics">
            <ArrowUpRight className={styles.navIcon} />
            <span className={styles.navLabel}>Analytics</span>
          </button>

          <span className={styles.navSectionTitle} style={{ marginTop: "14px" }}>
            Student Inquiries ({inquiries.length})
          </span>

          {adminLoading ? (
            <span style={sidebarHint}>Loading inquiries...</span>
          ) : filteredInquiries.length === 0 ? (
            <span style={sidebarHint}>No inquiries found</span>
          ) : (
            filteredInquiries.map((inq) => {
              const isSelected = inq.chat_id === selectedInquiry?.chat_id;
              const isCallback = inq.student?.callback_requested || inq.callback_requested;
              const sName = studentDisplayName(inq);
              return (
                <button
                  key={inq.chat_id}
                  onClick={() => setSelectedInquiryId(inq.chat_id)}
                  className={styles.navButton}
                  style={{
                    background: isSelected ? "var(--sidebar-accent)" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                    color: isSelected ? "var(--heading)" : "var(--muted)",
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                    gap: "2px", padding: "0.5rem 0.65rem", width: "100%", textAlign: "left",
                  }}
                  title={inq.question}
                >
                  <div style={flexSpaceBetween}>
                    <span style={{ fontWeight: 600, fontSize: "0.8rem", ...ellipsis }}>{sName}</span>
                    {inq.student_rating && (
                      <span
                        style={{
                          fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700, flexShrink: 0,
                          background: "rgba(245, 158, 11, 0.12)", padding: "1px 5px", borderRadius: "4px",
                        }}
                        title={`Student Feedback Rating: ${inq.student_rating} Stars`}
                      >
                        ⭐ {inq.student_rating}★
                      </span>
                    )}
                    {isCallback && (
                      <span style={{ fontSize: "0.65rem", color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>
                        📞 Callback
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", ...ellipsis, width: "100%" }}>
                    {inq.question}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} title={`${userName} (${user?.role || "Admin"})`}>
            <div className={styles.userAvatar}>{userName.charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{user?.role || "Admin"}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.chatMainArea}>
        <main className={styles.mainLayout}>
          <header className={styles.counselorHeader}>
            <div>
              <h2>{selectedInquiry ? studentDisplayName(selectedInquiry) : "Student & Parent Inquiries"}</h2>
              <p className={styles.subtitle}>
                {selectedInquiry ? (
                  <>
                    {field(selectedInquiry, "phone") && `📞 ${field(selectedInquiry, "phone")} | `}
                    {field(selectedInquiry, "email") && `✉️ ${field(selectedInquiry, "email")} | `}
                    {(selectedInquiry.student?.target_branch || selectedInquiry.target_branch) &&
                      `Branch: ${selectedInquiry.student?.target_branch || selectedInquiry.target_branch} | `}
                    {selectedInquiry.created_at &&
                      new Date(selectedInquiry.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    {(selectedInquiry.student_rating || studentChatThread?.student?.student_rating) && (
                      <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: "6px" }}>
                        | ⭐ {selectedInquiry.student_rating || studentChatThread?.student?.student_rating}/5 Rating
                      </span>
                    )}
                  </>
                ) : (
                  "Select an inquiry from the sidebar to inspect student question and AI response."
                )}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.actionBtn} onClick={fetchAdminInquiries} title="Refresh latest inquiries">
                <RefreshCw size={13} style={{ marginRight: "4px" }} /> Refresh
              </button>
              <button className={styles.actionBtn} onClick={() => navigate("/admin")}>Admin Dashboard</button>
              <ThemeToggle />
            </div>
          </header>

          <div className={styles.messagesContainer}>
            {adminLoading ? (
              <div style={centerFlex}>Loading inquiries from chat_history...</div>
            ) : !selectedInquiry ? (
              <div style={centerFlex}>No student inquiries found in chat_history.</div>
            ) : (
              <>
                {(studentChatThread && studentChatThread.length > 0
                  ? studentChatThread
                  : [selectedInquiry]
                ).map((item, idx) => (
                  <div key={item.chat_id || idx} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <div className={`${styles.messageRow} ${styles.userRow}`}>
                      <div className={styles.messageBubble}>
                        <MessageRenderer text={item.question || item.user_message} />
                        <span className={styles.timeStamp}>
                          Asked by {studentDisplayName(selectedInquiry)} •{" "}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className={`${styles.messageRow} ${styles.counselorRow}`}>
                      <div className={styles.messageBubble}>
                        <MessageRenderer text={item.answer || item.ai_reply} />
                        <span className={styles.timeStamp}>Mitra AI Reply</span>
                      </div>

                      {(selectedInquiry.student?.callback_requested || selectedInquiry.callback_requested) &&
                        idx === 0 && (
                          <div className={styles.feedbackContainer}>
                            <span className={styles.feedbackLabel} style={{ color: "var(--primary)", fontWeight: 600 }}>
                              📞 Callback Requested:{" "}
                              {selectedInquiry.student?.phone || selectedInquiry.student_phone || "Phone on file"}{" "}
                              ({selectedInquiry.student?.followup_status || selectedInquiry.followup_status || "Pending"})
                            </span>
                          </div>
                        )}

                      {item.needs_followup && (
                        <div className={styles.feedbackContainer}>
                          <span className={styles.feedbackLabel} style={{ color: "#f59e0b", fontWeight: 600 }}>
                            ⚠️ Flagged for counselor follow-up
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="text" className={styles.chatInput}
              placeholder="Filter inquiries by name, branch, phone, or question keywords..."
              value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)}
            />
            <button type="button" className={styles.sendBtn} aria-label="Filter" title="Filter inquiries">
              <Search size={16} />
            </button>
          </form>

          <p className={styles.disclaimer}>
            Viewing live queries logged in <code>chat_history</code>. Students
            and parents submit questions directly via Mitra AI.
          </p>
        </main>
      </div>
    </div>
  );
}
