import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  Home,
  LayoutDashboard,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import api from "@/api/api";
import AnimatedLogo from "@/components/AnimatedLogo";
import MessageRenderer from "@/components/MessageRenderer";
import GlideSelect from "@/components/GlideSelect";
import ThemeToggle from "@/components/ThemeToggle";
import VoiceInput from "@/components/VoiceInput";
import ChatAdminView from "@/pages/chat/ChatAdminView";
import ChatFeedbackModal from "@/pages/chat/ChatFeedbackModal";
import { languages, translations } from "@/constants/chatTranslations";
import styles from "./styles/Chat.module.css";

const getFormattedTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const generateId = () => Date.now();
const SESSION_IDLE_TIMEOUT = 10 * 60 * 1000;

const createPrivacyDisclosureText = (userData, dbSynced = false) => {
  let storedUser = {};
  let academicProfile = {};
  let counselingPrefs = {};

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) storedUser = JSON.parse(rawUser);
  } catch (err) {
    console.warn("Could not parse user from localStorage:", err);
  }

  try {
    const rawAcademic = localStorage.getItem("studentAcademicProfile");
    if (rawAcademic) academicProfile = JSON.parse(rawAcademic);
  } catch (err) {
    console.warn("Could not parse academic profile:", err);
  }

  try {
    const rawPrefs = localStorage.getItem("counselingPreferences");
    if (rawPrefs) counselingPrefs = JSON.parse(rawPrefs);
  } catch (err) {
    console.warn("Could not parse counseling preferences:", err);
  }

  const token = localStorage.getItem("token");
  const preferredLanguage = localStorage.getItem("preferredLanguage") || "English";
  const preferredBranch = localStorage.getItem("preferredBranch") || "";

  // Merge live /auth/me user data if provided
  const activeUser = { ...storedUser, ...(userData || {}) };

  const username = activeUser.username || activeUser.full_name || "Guest Student";
  const studentId = activeUser.student_id || activeUser.id || "Temporary Guest Session";
  const role = activeUser.role ? String(activeUser.role).toUpperCase() : "STUDENT";
  const email = activeUser.email || "Not specified in profile";
  const phone = activeUser.phone || activeUser.phone_number || "Not specified in profile";

  const targetBranch =
    activeUser.target_branch ||
    academicProfile.targetBranch ||
    preferredBranch ||
    "Computer Engineering (Default SBMP Diploma)";
  const tenthPercentage =
    activeUser.tenth_percentage || academicProfile.tenthPercentage || "Not entered yet";
  const entranceScore =
    activeUser.entrance_score || academicProfile.entrancePercentile || "Not entered yet";
  const category = activeUser.category || academicProfile.category || "General / Open";
  const quota = activeUser.admission_quota || academicProfile.quota || "State CAP / Merit";

  const counselingMode = counselingPrefs.mode || "Online AI Advisory (Text & Voice)";
  const consent = counselingPrefs.followUpConsent
    ? "Granted for counselor callback"
    : "Optional (Only shared if callback requested)";

  return `### 🔒 Privacy & Data Transparency Audit
*(Frontend Testing Mode — Synchronized with **Database & LocalStorage**)*

Here is the exact record of student details currently loaded into Mitra's counseling memory:

#### 1. Identity & Credentials (Database & LocalStorage)
* **Student Name / User**: \`${username}\`
* **Student ID / UID**: \`${studentId}\`
* **Account Role**: \`${role}\`
* **Email Address**: \`${email}\`
* **Contact Phone**: \`${phone}\`
* **Auth Session**: \`${token ? "Active JWT Bearer Token (Stored in LocalStorage)" : "Unauthenticated Guest"}\`
* **Database Sync Status**: \`${dbSynced ? "✅ Synchronized live with Backend /auth/me" : "⚡ Loaded from LocalStorage cache"}\`

#### 2. Academic Profile (Used for Course & Cutoff Recommendations)
* **Target Diploma Branch**: **${targetBranch}**
* **Class 10th Percentage**: \`${tenthPercentage}\`
* **Entrance Percentile / Score**: \`${entranceScore}\`
* **Category**: \`${category}\`
* **Admission Quota**: \`${quota}\`

#### 3. Counseling Preferences & Session State
* **Active Language**: \`${preferredLanguage}\`
* **Interaction Mode**: \`${counselingMode}\`
* **Parent Callback Status**: \`${consent}\`
* **Data Storage Policy**: Your academic scores and inquiries are kept strictly confidential for SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP) admission counseling.`;
};

export default function Chat() {
  const [user] = useState(() => {
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

  const userName = user?.username || "Friend";
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  // If Admin, render the dedicated Admin Inquiries Inspector
  if (isAdmin) {
    return <ChatAdminView user={user} userName={userName} />;
  }

  return <StudentChatRoom user={user} userName={userName} />;
}

function StudentChatRoom({ user, userName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldPromptForProfile =
    !user?.role ||
    ["student", "parent"].includes(String(user.role).toLowerCase());

  // Input & message states
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceBusy, setIsVoiceBusy] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("preferredLanguage") || "English"
  );

  // Message feedback states
  const [feedbackRatings, setFeedbackRatings] = useState(() => {
    const saved = localStorage.getItem("chatFeedbackRatings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [feedbackStatus, setFeedbackStatus] = useState({});

  // Session & inactivity tracking states
  const [profilePromptVisible, setProfilePromptVisible] = useState(
    shouldPromptForProfile
  );
  const [profilePromptNonce, setProfilePromptNonce] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionEndedManually, setSessionEndedManually] = useState(false);
  const [sessionNeedsFollowup, setSessionNeedsFollowup] = useState(false);
  const [sessionRating, setSessionRating] = useState(0);
  const [contactPhone, setContactPhone] = useState(
    user?.phone || user?.phone_number || ""
  );
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [sessionFeedbackBusy, setSessionFeedbackBusy] = useState(false);
  const [sessionFeedbackSaved, setSessionFeedbackSaved] = useState(false);
  const [sessionFeedbackError, setSessionFeedbackError] = useState("");

  const messagesEndRef = useRef(null);
  const idleTimerRef = useRef(null);
  const sessionStatusRef = useRef("active");
  const markActivityRef = useRef(() => {});
  const endSessionRef = useRef(() => {});
  const latestInteractionRef = useRef({
    chatId: null,
    userMessage: null,
    aiReply: null,
  });
  const sessionChatIdsRef = useRef([]);
  const initialHandledRef = useRef(false);

  const requiresContact = sessionNeedsFollowup || sessionEndedManually;

  // Auto-dismiss profile reminder toast after 8 seconds
  useEffect(() => {
    if (!shouldPromptForProfile || !profilePromptVisible) return undefined;
    const timer = window.setTimeout(
      () => setProfilePromptVisible(false),
      8000
    );
    return () => window.clearTimeout(timer);
  }, [profilePromptNonce, profilePromptVisible, shouldPromptForProfile]);

  // Inactivity timeout effect (10 mins)
  useEffect(() => {
    const expireSession = async () => {
      if (sessionStatusRef.current !== "active") return;
      sessionStatusRef.current = "checking-followup";

      try {
        const result = await api.post("/chat/followup-status", {
          chat_ids: sessionChatIdsRef.current,
        });
        setSessionNeedsFollowup(Boolean(result.data?.needs_followup));
      } catch (error) {
        console.warn("Could not check chat follow-up status:", error);
        setSessionNeedsFollowup(false);
      }

      sessionStatusRef.current = "expired";
      setSessionExpired(true);
    };
    endSessionRef.current = expireSession;

    const markActivity = () => {
      if (sessionStatusRef.current !== "active") return;
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(
        expireSession,
        SESSION_IDLE_TIMEOUT
      );
    };
    const handleActivity = () => {
      if (!document.hidden) markActivity();
    };
    const activityEvents = ["pointerdown", "keydown", "input", "touchstart"];

    markActivityRef.current = markActivity;
    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleActivity, { passive: true });
    });
    markActivity();

    return () => {
      window.clearTimeout(idleTimerRef.current);
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, handleActivity);
      });
      markActivityRef.current = () => {};
      endSessionRef.current = () => {};
    };
  }, []);

  // Per-message thumbs feedback
  const handleFeedback = async (msg, score) => {
    const msgId = typeof msg === "object" ? msg.id : msg;
    setFeedbackRatings((prev) => {
      const updated = { ...prev, [msgId]: score };
      localStorage.setItem("chatFeedbackRatings", JSON.stringify(updated));
      return updated;
    });

    setFeedbackStatus((prev) => ({ ...prev, [msgId]: "submitting" }));

    try {
      await api.post("/chat/feedback", {
        rating: score,
        user_message: msg?.userMessage || null,
        ai_reply: msg?.text || null,
        chat_id: msg?.chatId || null,
        student_id: user?.student_id || user?.id || null,
      });
      setFeedbackStatus((prev) => ({ ...prev, [msgId]: "saved" }));
    } catch (err) {
      console.warn("Feedback backend sync error, saved locally:", err);
      setFeedbackStatus((prev) => ({ ...prev, [msgId]: "error" }));
    }
  };

  const [messages, setMessages] = useState(() => {
    const defaultLang = localStorage.getItem("preferredLanguage") || "English";
    const t = translations[defaultLang] || translations.English;
    return [
      {
        id: "msg-init",
        sender: "counselor",
        text: t.initialMsg(userName),
        type: "initialMsg",
        time: getFormattedTime(),
      },
    ];
  });

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
    const t = translations[newLang] || translations.English;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.type === "initialMsg")
          return { ...m, text: t.initialMsg(userName) };
        if (m.type === "resetMsg")
          return { ...m, text: t.resetMsg(userName) };
        return m;
      })
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message to backend
  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue.trim();
    if (!query || sessionStatusRef.current !== "active") return;
    markActivityRef.current();
    latestInteractionRef.current = {
      chatId: null,
      userMessage: query,
      aiReply: null,
    };

    const userMsg = {
      id: generateId(),
      sender: "user",
      text: query,
      time: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    const lowerQuery = query.toLowerCase();
    const isPrivacyQuery =
      lowerQuery.includes("what details") ||
      lowerQuery.includes("my details") ||
      lowerQuery.includes("privacy") ||
      lowerQuery.includes("what do you know") ||
      lowerQuery.includes("data do you have") ||
      lowerQuery.includes("details do you have") ||
      lowerQuery.includes("details does the chatbot have") ||
      lowerQuery.includes("details does the bot have") ||
      lowerQuery.includes("गोपनीयता") ||
      lowerQuery.includes("तपशील") ||
      lowerQuery.includes("વિગતો");

    if (isPrivacyQuery) {
      const counselorMsg = {
        id: generateId(),
        sender: "counselor",
        text: createPrivacyDisclosureText(user, true),
        time: getFormattedTime(),
        type: "privacyDisclosure",
      };
      setMessages((prev) => [...prev, counselorMsg]);
      return;
    }

    const isEscalateQuery =
      lowerQuery.includes("escalat") ||
      lowerQuery.includes("human counselor") ||
      lowerQuery.includes("talk to human") ||
      lowerQuery.includes("talk to counselor") ||
      lowerQuery.includes("human advisor") ||
      lowerQuery.includes("सलाहकार से बात") ||
      lowerQuery.includes("मानव समुपदेशक") ||
      lowerQuery.includes("માનવ કાઉન્સેલર");

    if (isEscalateQuery) {
      try {
        const studentId = user?.student_id || user?.id || null;
        const validEmail =
          user?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
            ? user.email
            : `${(user?.username || "student").toLowerCase().replace(/[^a-z0-9]/g, "") || "student"}@sbmp.ac.in`;
        const validPhone =
          user?.phone && /^[0-9+() .-]{7,20}$/.test(user.phone)
            ? user.phone
            : null;

        await api.post("/chat/request-callback", {
          student_id: studentId,
          phone: validPhone,
          email: validEmail,
          full_name: user?.full_name || user?.username || "Student",
          target_branch: user?.target_branch || null,
          chat_id: latestInteractionRef.current?.chatId || null,
          notes: `Escalated inquiry: "${query}"`,
        });
      } catch (err) {
        console.warn("Escalation callback request warning:", err);
      }

      const counselorMsg = {
        id: generateId(),
        sender: "counselor",
        text: `### 🚨 Inquiry Escalated to Human Counselor
Your inquiry has been officially escalated to the **Shri Bhagubhai Mafatlal Polytechnic (SBMP) Admissions Office**.

* **Status**: \`Pending Review (Flagged for Follow-up)\`
* **Student**: \`${userName}\`
* **Next Steps**: A senior faculty counselor will inspect this chat log and review your admission questions.`,
        time: getFormattedTime(),
        type: "escalationConfirmation",
      };
      setMessages((prev) => [...prev, counselorMsg]);
      return;
    }

    setIsTyping(true);

    try {
      let responseText = "";
      let chatId = null;
      const parseResponse = (raw) => {
        if (typeof raw === "string") return raw;
        if (!raw) return "";
        if (Array.isArray(raw)) {
          return raw
            .map((item) => parseResponse(item))
            .filter(Boolean)
            .join("\n\n");
        }
        if (typeof raw === "object") {
          return (
            raw.text ||
            raw.answer ||
            raw.message ||
            raw.content ||
            JSON.stringify(raw)
          );
        }
        return String(raw);
      };

      const res = await api.post("/chat", {
        query,
        student_id: user?.student_id || user?.id || null,
        language: language,
      });
      responseText = parseResponse(res.data?.answer || res.data?.message);
      chatId = res.data?.chat_id || null;

      if (!responseText) {
        responseText =
          "I hear you! As your campus counselor, I'm here to support you through every step of your polytechnic journey. Tell me a bit more so I can assist you best!";
      }

      const counselorMsg = {
        id: generateId(),
        sender: "counselor",
        text: responseText,
        time: getFormattedTime(),
        chatId: chatId,
        userMessage: query,
      };

      latestInteractionRef.current = {
        chatId,
        userMessage: query,
        aiReply: responseText,
      };
      if (chatId && !sessionChatIdsRef.current.includes(chatId)) {
        sessionChatIdsRef.current.push(chatId);
      }
      setMessages((prev) => [...prev, counselorMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const counselorMsg = {
        id: generateId(),
        sender: "counselor",
        text: "Sorry, I couldn't reach the admission assistant server. Please check that backend services are running.",
        time: getFormattedTime(),
      };
      setMessages((prev) => [...prev, counselorMsg]);
    } finally {
      setIsTyping(false);
      markActivityRef.current();
    }
  };

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    const initialQuery = location.state?.initialQuery;
    if (initialQuery && !initialHandledRef.current) {
      initialHandledRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      handleSendRef.current(initialQuery);
    }
  }, [location.state?.initialQuery, location.pathname, navigate]);

  const handleStartNewSession = () => {
    sessionStatusRef.current = "active";
    setSessionExpired(false);
    setSessionEndedManually(false);
    setSessionNeedsFollowup(false);
    setSessionRating(0);
    setContactPhone(user?.phone || user?.phone_number || "");
    setContactEmail(user?.email || "");
    setSessionFeedbackBusy(false);
    setSessionFeedbackSaved(false);
    setSessionFeedbackError("");
    latestInteractionRef.current = {
      chatId: null,
      userMessage: null,
      aiReply: null,
    };
    sessionChatIdsRef.current = [];
    setMessages([
      {
        id: generateId(),
        sender: "counselor",
        text: (
          translations[language] || translations.English
        ).resetMsg(userName),
        type: "resetMsg",
        time: getFormattedTime(),
      },
    ]);
    if (shouldPromptForProfile) {
      setProfilePromptVisible(true);
      setProfilePromptNonce((nonce) => nonce + 1);
    }
    markActivityRef.current();
  };

  const handleEndSession = () => {
    if (sessionStatusRef.current !== "active") return;
    window.clearTimeout(idleTimerRef.current);
    setSessionEndedManually(true);
    setSessionExpired(true);
    if (sessionRating < 1) {
      setSessionRating(5);
    }
    endSessionRef.current();
  };

  const handleFinalFeedbackSubmit = async (event) => {
    event.preventDefault();
    if (sessionFeedbackBusy) return;

    const effectiveRating = sessionRating >= 1 ? sessionRating : 5;
    const hasContact = Boolean(contactPhone.trim() || contactEmail.trim());

    setSessionFeedbackBusy(true);
    setSessionFeedbackError("");
    try {
      let studentId = user?.student_id || user?.id || null;
      if (hasContact) {
        try {
          const callbackResponse = await api.post("/chat/request-callback", {
            student_id: studentId,
            phone: contactPhone.trim() || null,
            email: contactEmail.trim() || null,
            full_name: user?.full_name || user?.username || "Student",
            target_branch: user?.target_branch || null,
            chat_id: latestInteractionRef.current?.chatId || null,
            notes: "Follow-up requested after an admission chat session.",
          });
          studentId = callbackResponse.data?.student_id || studentId;
        } catch (cbErr) {
          console.warn("Callback registration error (continuing to submit rating):", cbErr);
        }
      }

      await api.post("/chat/feedback", {
        rating: effectiveRating,
        user_message: latestInteractionRef.current?.userMessage || "Counseling session completed",
        ai_reply: latestInteractionRef.current?.aiReply || "Session ended",
        chat_id: latestInteractionRef.current?.chatId || null,
        student_id: studentId,
        callback_requested: hasContact,
      });

      setSessionFeedbackSaved(true);
    } catch (error) {
      console.error("Could not submit session feedback:", error);
      setSessionFeedbackError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not save feedback. Please try again."
      );
    } finally {
      setSessionFeedbackBusy(false);
    }
  };

  return (
    <div className={styles.chatPage}>
      {/* Profile Prompt Toast */}
      {profilePromptVisible && shouldPromptForProfile && (
        <div
          className={`${styles.counselorHeader} ${styles.profilePromptToast}`}
          role="status"
          aria-live="polite"
        >
          <div>
            <h2>Personalize your chats</h2>
            <p className={styles.subtitle}>
              Complete your profile for more helpful, tailored answers.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.profilePromptLink}`}
              onClick={() => navigate("/profile")}
            >
              Complete profile <ArrowUpRight size={15} />
            </button>
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={() => setProfilePromptVisible(false)}
              aria-label="Dismiss profile reminder"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Session Expiry & Callback Feedback Modal */}
      <ChatFeedbackModal
        isOpen={sessionExpired}
        sessionFeedbackSaved={sessionFeedbackSaved}
        sessionEndedManually={sessionEndedManually}
        sessionNeedsFollowup={sessionNeedsFollowup}
        sessionRating={sessionRating}
        setSessionRating={setSessionRating}
        contactPhone={contactPhone}
        setContactPhone={setContactPhone}
        contactEmail={contactEmail}
        setContactEmail={setContactEmail}
        sessionFeedbackBusy={sessionFeedbackBusy}
        sessionFeedbackError={sessionFeedbackError}
        requiresContact={requiresContact}
        onSubmit={handleFinalFeedbackSubmit}
        onStartNewSession={handleStartNewSession}
      />

      {/* Student Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          {!isCollapsed && (
            <div
              className={styles.brandGroup}
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{ cursor: "pointer" }}
              title="Toggle sidebar"
            >
              <div className={styles.logoWrapper}>
                <AnimatedLogo />
              </div>
              <div className={styles.brandText}>
                <span className={styles.brandName}>Campus Mitra</span>
                <span className={styles.brandBadge}>AI Counselor</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={styles.collapseBtn}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        <div className={styles.sidebarBody}>
          <span className={styles.navSectionTitle}>Navigation</span>
          {[
            { label: "Home", path: "/home", Icon: Home },
            { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
            { label: "Profile", path: "/profile", Icon: User },
          ].map(({ label, path, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={styles.navButton}
              title={label}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div
            className={styles.userCard}
            title={`${userName} (${user?.role || "Student"})`}
          >
            <div className={styles.userAvatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>
                {user?.role || "Student"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <div className={styles.chatMainArea}>
        <main className={styles.mainLayout}>
          <header className={styles.counselorHeader}>
            <div>
              <h2>Mitra</h2>
              <p className={styles.subtitle}>
                Senior Academic Advisor & Student Counselor
              </p>
            </div>
            <div className={styles.headerActions}>
              <GlideSelect
                options={languages}
                value={language}
                onChange={(val) => handleLanguageChange(val)}
                ariaLabel="Select counseling language"
                showTags
                accentColor="var(--primary)"
                surfaceColor="var(--card)"
                highlightColor="var(--card-hover)"
                textColor="var(--text)"
                size="md"
                radius={10}
                menuWidth={180}
                placement="bottom"
                align="right"
                popDuration={180}
                glideDuration={240}
                rememberPosition
              />
              <button
                className={styles.actionBtn}
                onClick={handleStartNewSession}
                disabled={sessionExpired}
              >
                Reset
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleEndSession}
                disabled={sessionExpired}
              >
                End chat
              </button>
              <ThemeToggle />
            </div>
          </header>

          <div className={styles.messagesContainer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.sender === "user"
                    ? styles.userRow
                    : styles.counselorRow
                }`}
              >
                <div className={styles.messageBubble}>
                  <MessageRenderer text={msg.text} />
                  <span className={styles.timeStamp}>{msg.time}</span>
                </div>

                {msg.sender === "counselor" &&
                  msg.type !== "initialMsg" &&
                  msg.type !== "resetMsg" &&
                  msg.type !== "privacyDisclosure" &&
                  msg.type !== "escalationConfirmation" && (
                    <div className={styles.feedbackContainer}>
                      <span className={styles.feedbackLabel}>
                        {feedbackRatings[msg.id]
                          ? "Feedback:"
                          : "Was this helpful?"}
                      </span>
                      <div className={styles.thumbsGroup}>
                        <button
                          type="button"
                          className={`${styles.thumbButton} ${
                            feedbackRatings[msg.id] === 5
                              ? styles.thumbActiveUp
                              : ""
                          }`}
                          onClick={() => handleFeedback(msg, 5)}
                          disabled={feedbackStatus[msg.id] === "submitting"}
                          title="Helpful (Thumbs up)"
                          aria-label="Helpful"
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.thumbButton} ${
                            feedbackRatings[msg.id] === 1
                              ? styles.thumbActiveDown
                              : ""
                          }`}
                          onClick={() => handleFeedback(msg, 1)}
                          disabled={feedbackStatus[msg.id] === "submitting"}
                          title="Not helpful (Thumbs down)"
                          aria-label="Not helpful"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                      {feedbackStatus[msg.id] === "submitting" && (
                        <span className={styles.feedbackThankYou}>
                          • Saving...
                        </span>
                      )}
                      {(feedbackStatus[msg.id] === "saved" ||
                        (!feedbackStatus[msg.id] &&
                          feedbackRatings[msg.id] > 0)) && (
                        <span className={styles.feedbackThankYou}>
                          • Thanks!
                        </span>
                      )}
                      {feedbackStatus[msg.id] === "error" && (
                        <span
                          className={styles.feedbackThankYou}
                          style={{ color: "var(--warning)" }}
                        >
                          • Saved locally
                        </span>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageRow} ${styles.counselorRow}`}>
                <div className={styles.messageBubble}>
                  <div className={styles.typingIndicator}>
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                  </div>
                </div>
              </div>
            )}

            {messages.filter((m) => m.sender === "user").length === 0 && !isTyping && (
              <div className={styles.suggestionsArea}>
                {(
                  translations[language] || translations.English
                ).suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    className={styles.suggestionChip}
                    onClick={() => handleSend(item.query)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className={styles.inputForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Ask Mitra about courses, housing, fees..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={sessionExpired || isVoiceBusy}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <VoiceInput
              disabled={sessionExpired || isTyping}
              language={language}
              onBusyChange={setIsVoiceBusy}
              onTranscript={(transcript) => {
                setInputValue((current) =>
                  [current.trim(), transcript].filter(Boolean).join(" ")
                );
                markActivityRef.current();
              }}
            />

            <button
              type="submit"
              className={styles.sendBtn}
              disabled={
                !inputValue.trim() ||
                isTyping ||
                sessionExpired ||
                isVoiceBusy
              }
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>

          <p className={styles.disclaimer}>
            Campus Mitra can make mistakes. Please verify with the{" "}
            <a
              href="https://sbmp.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.disclaimerLink}
            >
              official website
            </a>
            .
          </p>
        </main>
      </div>
    </div>
  );
}
