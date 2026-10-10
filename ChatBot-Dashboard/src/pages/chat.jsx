import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarHistoryItem, SidebarText } from "../components/sideBar";
import {
  Send,
  LayoutDashboard,
  Cog,
  User,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  X,
} from "lucide-react";
import styles from "./styles/Chat.module.css";
import AnimatedLogo from "@/components/AnimatedLogo";
import ModalManager from "./modals/ModalManager";

const initialSuggestions = [
  { label: "Course Recommendations", query: "Can you help me choose the right courses for next semester?" },
  { label: "Scholarships & Financial Aid", query: "What scholarship and financial aid options are available?" },
  { label: "Admission Deadlines & Fees", query: "What are the upcoming admission deadlines and fee structures?" },
];

const FEEDBACK_REASONS = [
  "Inaccurate information",
  "Incomplete answer",
  "Did not answer question",
  "Hard to understand",
  "Other",
];

const getFormattedTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const [user, setUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackModalMsgId, setFeedbackModalMsgId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("Inaccurate information");
  const [feedbackNote, setFeedbackNote] = useState("");
  const messagesEndRef = useRef(null);

  const closeModal = () => setActiveModal(null);
  const sidebarLinks = [
    {
      label: "Home",
      onClick: () => setActiveModal("home"),
      icon: <LayoutDashboard className={styles.sidebarIcon} />,
    },
    {
      label: "Settings",
      onClick: () => setActiveModal("settings"),
      icon: <Cog className={styles.sidebarIcon} />,
    },
    {
      label: "Profile",
      onClick: () => setActiveModal("profile"),
      icon: <User className={styles.sidebarIcon} />,
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const userName = user?.username || "Friend";
  const [sessions, setSessions] = useState([
    {
      id: "session-1",
      title: "Course Guidance",
      messages: [
        {
          id: 1,
          sender: "counselor",
          text: `Hey ${userName}! I'm Mitra, your campus counselor and academic advisor. What's on your mind today?`,
          time: "10:30 AM",
          feedback: null,
        },
      ],
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("session-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Auto-scroll when messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, feedbackModalMsgId]);

  const handleNewChat = () => {
    const now = Date.now();
    const newId = `session-${now}`;
    const timeStr = getFormattedTime();
    const newSession = {
      id: newId,
      title: "New Conversation",
      messages: [
        {
          id: now,
          sender: "counselor",
          text: `Hey ${userName}! How can I help you in this new session?`,
          time: timeStr,
          feedback: null,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setFeedbackModalMsgId(null);
  };

  const sendFeedbackToBackend = async (payload) => {
    try {
      await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Feedback API offline or unreachable:", err);
    }
  };

  const handleFeedbackClick = (msgId, type) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    if (msg.feedback === type) {
      // Toggle off feedback
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId
                  ? { ...m, feedback: null, feedbackNotice: null, feedbackReason: null, feedbackNote: null }
                  : m
              ),
            };
          }
          return s;
        })
      );
      if (feedbackModalMsgId === msgId) {
        setFeedbackModalMsgId(null);
      }
      return;
    }

    if (type === "up") {
      setFeedbackModalMsgId(null);
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      feedback: "up",
                      feedbackReason: null,
                      feedbackNote: null,
                      feedbackNotice: "Thanks for your feedback! 👍",
                    }
                  : m
              ),
            };
          }
          return s;
        })
      );

      sendFeedbackToBackend({
        feedback: "up",
        message_id: msgId,
        query: msg.query || null,
        response: msg.text,
        student_id: user?.student_id || null,
      });

      // Clear notice after 3 seconds
      setTimeout(() => {
        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === msgId ? { ...m, feedbackNotice: null } : m
                ),
              };
            }
            return s;
          })
        );
      }, 3000);
    } else if (type === "down") {
      // Open detailed reason card
      setSelectedReason("Inaccurate information");
      setFeedbackNote("");
      setFeedbackModalMsgId(msgId);

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId ? { ...m, feedback: "down", feedbackNotice: null } : m
              ),
            };
          }
          return s;
        })
      );
    }
  };

  const submitDetailedFeedback = (msgId) => {
    const msg = messages.find((m) => m.id === msgId);
    setFeedbackModalMsgId(null);

    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    feedback: "down",
                    feedbackReason: selectedReason,
                    feedbackNote: feedbackNote.trim(),
                    feedbackNotice: "Thank you for your feedback! We will work to improve.",
                  }
                : m
            ),
          };
        }
        return s;
      })
    );

    sendFeedbackToBackend({
      feedback: "down",
      message_id: msgId,
      query: msg?.query || null,
      response: msg?.text || "",
      reason: selectedReason,
      note: feedbackNote.trim(),
      student_id: user?.student_id || null,
    });

    // Clear notice after 3.5 seconds
    setTimeout(() => {
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId ? { ...m, feedbackNotice: null } : m
              ),
            };
          }
          return s;
        })
      );
    }, 3500);
  };

  const handleCopyMessage = (text, msgId) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    const userMsgId = Date.now();
    const userMsgTime = getFormattedTime();

    const userMsg = {
      id: userMsgId,
      sender: "user",
      text: query,
      time: userMsgTime,
    };

    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          const updatedTitle = s.title === "New Conversation" ? query.slice(0, 22) + "..." : s.title;
          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

    if (!textToSend) setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          student_id: user?.student_id || null,
          language: "en",
        }),
      });

      let responseText = "";
      if (response.ok) {
        const data = await response.json();
        responseText = data.answer || data.message || "I received your query but got an empty answer.";
      } else {
        const errData = await response.json().catch(() => null);
        responseText = errData?.answer || errData?.error || "Sorry, I'm having trouble retrieving information right now. Please try again later.";
      }

      const counselorMsg = {
        id: Date.now() + 1,
        sender: "counselor",
        text: responseText,
        time: getFormattedTime(),
        query: query,
        feedback: null,
      };

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, counselorMsg],
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error("Chat API Error:", err);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: "counselor",
        text: "Could not connect to AI services. Please ensure the Python API server is running on port 5000.",
        time: getFormattedTime(),
        query: query,
        feedback: null,
      };

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, fallbackMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    const resetId = Date.now();
    const resetTime = getFormattedTime();

    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              {
                id: resetId,
                sender: "counselor",
                text: `Fresh start! How can I help you today, ${userName}?`,
                time: resetTime,
                feedback: null,
              },
            ],
          };
        }
        return s;
      })
    );
    setFeedbackModalMsgId(null);
  };

  return (
    <div className={styles.chatPage}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody>
          <div className={styles.sidebarWrapper}>
            <div className={styles.brandContainer}>
              <div className={styles.logo}><AnimatedLogo /></div>
              <SidebarText className={styles.logoText}>Campus Mitra</SidebarText>
            </div>

            <div className={styles.navSection}>
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.historySection}>
              <div className={styles.historyHeader}>
                <SidebarText className={styles.historyTitle}>Recent Chats</SidebarText>
                <button
                  onClick={handleNewChat}
                  className={styles.newChatBtn}
                  title="New Conversation"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className={styles.historyList}>
                {sessions.map((session) => (
                  <SidebarHistoryItem
                    key={session.id}
                    title={session.title}
                    isActive={session.id === activeSessionId}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setFeedbackModalMsgId(null);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className={styles.mainLayout}>
        <header className={styles.counselorHeader}>
          <div>
            <h2>Mitra</h2>
            <p className={styles.subtitle}>Senior Academic Advisor & Student Counselor</p>
          </div>
          <button className={styles.actionBtn} onClick={handleReset}>
            Reset
          </button>
        </header>

        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.sender === "user" ? styles.userRow : styles.counselorRow
              }`}
            >
              <div className={styles.messageBubble}>
                <div className={styles.messageText}>{msg.text}</div>
                
                <div className={styles.messageFooter}>
                  <span className={styles.timeStamp}>{msg.time}</span>
                  
                  {msg.sender === "counselor" && (
                    <div className={styles.feedbackActions}>
                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${
                          msg.feedback === "up" ? styles.feedbackActiveUp : ""
                        }`}
                        onClick={() => handleFeedbackClick(msg.id, "up")}
                        title="Good response"
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp size={13} />
                      </button>

                      <button
                        type="button"
                        className={`${styles.feedbackBtn} ${
                          msg.feedback === "down" ? styles.feedbackActiveDown : ""
                        }`}
                        onClick={() => handleFeedbackClick(msg.id, "down")}
                        title="Bad response"
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown size={13} />
                      </button>

                      <button
                        type="button"
                        className={styles.feedbackBtn}
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        title={copiedId === msg.id ? "Copied!" : "Copy response"}
                        aria-label="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <Check size={13} className={styles.copiedIcon} />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Thumbs Down Feedback Dialog */}
                {feedbackModalMsgId === msg.id && (
                  <div className={styles.feedbackDetailCard}>
                    <div className={styles.feedbackDetailHeader}>
                      <span>Why wasn't this response helpful?</span>
                      <button
                        type="button"
                        className={styles.feedbackCloseBtn}
                        onClick={() => setFeedbackModalMsgId(null)}
                        aria-label="Close"
                      >
                        <X size={13} />
                      </button>
                    </div>

                    <div className={styles.reasonTags}>
                      {FEEDBACK_REASONS.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          className={`${styles.reasonTag} ${
                            selectedReason === reason ? styles.reasonTagSelected : ""
                          }`}
                          onClick={() => setSelectedReason(reason)}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      className={styles.feedbackNoteInput}
                      placeholder="Optional: add details or suggest an answer..."
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitDetailedFeedback(msg.id)}
                    />

                    <div className={styles.feedbackDetailFooter}>
                      <button
                        type="button"
                        className={styles.feedbackSkipBtn}
                        onClick={() => setFeedbackModalMsgId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.feedbackSubmitBtn}
                        onClick={() => submitDetailedFeedback(msg.id)}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                )}

                {/* Feedback Toast Notice */}
                {msg.feedbackNotice && (
                  <div
                    className={`${styles.feedbackNotice} ${
                      msg.feedback === "down" ? styles.feedbackNoticeDown : ""
                    }`}
                  >
                    {msg.feedbackNotice}
                  </div>
                )}
              </div>
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

          {/* Quick Suggestions Pills */}
          {messages.length < 3 && !isTyping && (
            <div className={styles.suggestionsArea}>
              {initialSuggestions.map((item, idx) => (
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

        {/* Input Form */}
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
            placeholder={`Ask Mitra about courses, housing, fees...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </main>

      <ModalManager activeModal={activeModal} onClose={closeModal} />
    </div>
  );
}

