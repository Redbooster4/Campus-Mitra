import { useState } from "react";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import {
  ArrowUpRight,
  Bell,
  Bot,
  FileText,
  MessageSquare,
  UserRound,
  ChevronRight,
} from "lucide-react";
import styles from "./styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Home",
    ariaLabel: "Go to home",
    link: "/home",
  },
  {
    label: "Applications",
    ariaLabel: "View applications",
    link: "/application",
  },
  {
    label: "Chatbot",
    ariaLabel: "Chat with AI counselor",
    link: "/chat",
  },
  {
    label: "Profile",
    ariaLabel: "View profile",
    link: "/profile",
  },
];

const socialItems = [
  { label: "Twitter", link: "https://twitter.com" },
  { label: "Instagram", link: "https://instagram.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

export default function Dashboard() {
  const [user]=useState(() => {
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
  const navigate = useNavigate();
  const handleChat = () => {
      navigate("/onboarding");
  };

  const displayName = user?.username || "Student";
  const handleAI=()=>{
    navigate("/chat");
  }

  return(
    <div className={styles.dashboard}>
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering
        menuButtonColor="var(--text)"
        openMenuButtonColor="var(--text)"
        changeMenuColorOnOpen
        colors={["var(--border)", "var(--primary)"]}
        logoUrl={
          <div className={styles.logo}>
            <AnimatedLogo />
          </div>
        }
        accentColor="var(--primary)"
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.topPanel}> 
            <h1>Welcome back, <span>{displayName}</span></h1>
          </div>

          <button
            className={styles.notificationButton}
            aria-label="Notifications">
            <Bell size={20}/>
            <span className={styles.notificationDot}/>
          </button>
        </header>

        <section className={styles.contentGrid}>
          <div className={`${styles.card} ${styles.aiCard}`}>
            <div className={styles.aiGlow} />
            <div className={styles.aiIcon}>
              <Bot size={25} />
            </div>
            <h2 className={styles.aiTitle}>
              Your admission questions, answered.
            </h2>
            <p className={styles.aiDescription}>
              Get help with courses, eligibility, cut-offs, documents,
              fees, and everything else related to your admission.
            </p>

            <button className={styles.primaryButton} onClick={handleChat}>
              Chat with AI Counselor
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className={`${styles.card} ${styles.quickCard}`}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>
                  What would you like to do?
                </h2>
              </div>
            </div>

            <div className={styles.quickActions}>
              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <FileText size={19} />
                </div>

                <div>
                  <strong>My Application</strong>
                  <span>Track your admission</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <MessageSquare size={19} />
                </div>

                <div onClick={handleAI}>
                  <strong>Ask AI Counselor</strong>
                  <span>Get instant guidance</span>
                </div>

                <ChevronRight size={17} />
              </button>

              <button className={styles.quickAction}>
                <div className={styles.quickIcon}>
                  <UserRound size={19} />
                </div>

                <div>
                  <strong>My Profile</strong>
                  <span>Manage your information</span>
                </div>

                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}