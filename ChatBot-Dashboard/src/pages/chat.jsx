import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink, SidebarHistoryItem, SidebarText } from "../components/sideBar";
import {
  Send,
  LayoutDashboard,
  MessageSquare,
  Activity,
  User,
  Plus,
} from "lucide-react";
import styles from "./styles/Chat.module.css";
import AnimatedLogo from "@/components/AnimatedLogo";

const sidebarLinks = [
  {
    label: "Home",
    href: "/home",
    icon: <LayoutDashboard className={styles.sidebarIcon} />,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Activity className={styles.sidebarIcon} />,
  },
  {
    label: "Chatbot",
    href: "/chat",
    icon: <MessageSquare className={styles.sidebarIcon} />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className={styles.sidebarIcon} />,
  },
];

const initialSuggestions = [
  { label: "Course Recommendations", query: "Can you help me choose the right courses for next semester?" },
  { label: "Scholarships & Financial Aid", query: "What scholarship and financial aid options are available?" },
  { label: "Admission Deadlines & Fees", query: "What are the upcoming admission deadlines and fee structures?" },
];

const humanResponses = {
  course: "Choosing the right courses can feel overwhelming, but you don't have to do it alone! Based on your academic interests, I recommend balancing core requirements with electives that excite you. Would you like me to look at specific branch specializations or course syllabi with you?",
  scholarship: "We have several merit-based and need-based financial aid programs available! Applications for the upcoming term are currently open. Should I guide you through the eligibility criteria or document submission process?",
  housing: "Living on campus is a great way to experience university life! We offer single and shared dorms with 24/7 Wi-Fi, study lounges, and dining hall access. Are you interested in on-campus hostels or nearby off-campus options?",
  admission: "Admission dates vary slightly by department, but key deadlines for the upcoming semester are approaching fast. Fees can be paid in flexible installments. What specific degree program are you looking into?",
  default: "I hear you! As your campus counselor, I'm here to support you through every step of your college journey—whether it's managing study workload, navigating campus resources, or planning your career path. Tell me a bit more so I can help best!"
};

const getFormattedTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const [user, setUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if(storedUser){
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
        },
      ],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState("session-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

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
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleSend = (textToSend) => {
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

    setTimeout(() => {
      let responseText = humanResponses.default;
       
      // AI RESPO

      const counselorMsgId = Date.now() + 1;
      const counselorMsgTime = getFormattedTime();

      const counselorMsg = {
        id: counselorMsgId,
        sender: "counselor",
        text: responseText,
        time: counselorMsgTime,
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
      setIsTyping(false);
    }, 1200);
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
              },
            ],
          };
        }
        return s;
      })
    );
  };

  return (
    <div className={styles.chatPage}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody>
          <div className={styles.sidebarWrapper}>
            <div className={styles.brandContainer}>
              <div className={styles.logo}><AnimatedLogo/></div>
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
                    onClick={() => setActiveSessionId(session.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className={styles.mainLayout}>
        {/* Simple Header */}
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
                {msg.text}
                <span className={styles.timeStamp}>{msg.time}</span>
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
    </div>
  );
}
