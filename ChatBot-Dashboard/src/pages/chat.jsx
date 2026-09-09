import { useState, useEffect, useRef } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sideBar";
import {
  Send,
  LayoutDashboard,
  MessageSquare,
  Activity,
  User,
} from "lucide-react";
import styles from "./styles/Chat.module.css";

const sidebarLinks = [
  {
    label: "Home",
    href: "/home",
    icon: <LayoutDashboard className="text-indigo-400 h-4 w-4 flex-shrink-0" />,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Activity className="text-indigo-400 h-4 w-4 flex-shrink-0" />,
  },
  {
    label: "Chatbot",
    href: "/chat",
    icon: <MessageSquare className="text-indigo-400 h-4 w-4 flex-shrink-0" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <User className="text-indigo-400 h-4 w-4 flex-shrink-0" />,
  },
];

const initialSuggestions = [
  { label: "Course Recommendations", query: "Can you help me choose the right courses for next semester?" },
  { label: "Scholarships & Financial Aid", query: "What scholarship and financial aid options are available?" },
  { label: "Campus Housing & Facilities", query: "Tell me about campus hostel accommodation and facilities." },
  { label: "Admission Deadlines & Fees", query: "What are the upcoming admission deadlines and fee structures?" },
];

const humanResponses = {
  course: "Choosing the right courses can feel overwhelming, but you don't have to do it alone! Based on your academic interests, I recommend balancing core requirements with electives that excite you. Would you like me to look at specific branch specializations or course syllabi with you?",
  scholarship: "We have several merit-based and need-based financial aid programs available! Applications for the upcoming term are currently open. Should I guide you through the eligibility criteria or document submission process?",
  housing: "Living on campus is a great way to experience university life! We offer single and shared dorms with 24/7 Wi-Fi, study lounges, and dining hall access. Are you interested in on-campus hostels or nearby off-campus options?",
  admission: "Admission dates vary slightly by department, but key deadlines for the upcoming semester are approaching fast. Fees can be paid in flexible installments. What specific degree program are you looking into?",
  default: "I hear you! As your campus counselor, I'm here to support you through every step of your college journey—whether it's managing study workload, navigating campus resources, or planning your career path. Tell me a bit more so I can help best!"
};

export default function Chat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

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
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "counselor",
        text: `Hey ${userName}! 👋 I'm Mitra, your campus counselor and academic advisor. Think of me as your friendly guide for everything campus life—from choosing courses and managing deadlines to finding scholarships. What's on your mind today?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let responseText = humanResponses.default;
      const lower = query.toLowerCase();
      if (lower.includes("course") || lower.includes("subject") || lower.includes("branch")) {
        responseText = humanResponses.course;
      } else if (lower.includes("scholarship") || lower.includes("fee") || lower.includes("financial")) {
        responseText = humanResponses.scholarship;
      } else if (lower.includes("housing") || lower.includes("hostel") || lower.includes("dorm") || lower.includes("room")) {
        responseText = humanResponses.housing;
      } else if (lower.includes("admission") || lower.includes("deadline") || lower.includes("apply")) {
        responseText = humanResponses.admission;
      }

      const counselorMsg = {
        id: Date.now() + 1,
        sender: "counselor",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, counselorMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "counselor",
        text: `Fresh start! How can I help you today, ${userName}?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className={styles.chatPage}>
      {/* Clean Minimal Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-2.5 py-1 px-1 font-semibold text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-500/30 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                CM
              </div>
              <span className="text-sm font-semibold tracking-wide text-slate-100">Campus Mitra</span>
            </div>
            <div className="mt-8 flex flex-col gap-1.5">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className={styles.bgGlow} />

      <main className={styles.mainLayout}>
        {/* Counselor Profile Header */}
        <header className={styles.counselorHeader}>
          <div className={styles.counselorProfile}>
            <div className={styles.avatarWrapper}>
              <span className="font-bold text-sm text-white">M</span>
              <span className={styles.onlineBadge} title="Mitra is online" />
            </div>
            <div className={styles.counselorInfo}>
              <h2>Mitra</h2>
              <p className={styles.subtitle}>Senior Academic Advisor & Student Counselor</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={handleReset} title="Restart Conversation">
              Reset
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.sender === "user" ? styles.userRow : styles.counselorRow
              }`}
            >
              <div className={styles.messageAvatar}>
                {msg.sender === "user" ? userInitial : "M"}
              </div>
              <div className={styles.messageBubble}>
                {msg.text}
                <span className={styles.timeStamp}>{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.messageRow} ${styles.counselorRow}`}>
              <div className={styles.messageAvatar}>M</div>
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

        {/* Message Input Form */}
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
