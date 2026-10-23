import { useNavigate } from "react-router-dom";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import { HOME_MENU_ITEMS, SOCIAL_ITEMS } from "../constants/navigation";
import styles from "./styles/Home.module.css";
import {
  Mic, Database, School, PhoneCall, ShieldCheck, ArrowRight, Award,
} from "lucide-react";

const ABOUT_CARDS = [
  {
    icon: Database,
    title: "Document-Grounded RAG",
    desc: "Trained on official SBMP diploma cutoffs, fee structures, CAP admission rules, and branch syllabi with verified, hallucination-free answers."
  },
  {
    icon: Mic,
    title: "Multilingual Voice AI",
    desc: "Integrated with Sarvam AI speech-to-text supporting English, Hindi (हिन्दी), Marathi (मराठी), and Gujarati (ગુજરાતી) for seamless parent counseling."
  },
  {
    icon: PhoneCall,
    title: "Counselor Callback",
    desc: "Direct human escalation when personal attention is needed. Request an admission phone callback or campus visit directly from the chat."
  },
  {
    icon: School,
    title: "SBMP Heritage (Est. 1961)",
    desc: "Autonomous polytechnic under SVKM, offering 9+ premier diploma engineering disciplines with industry-aligned sandwich pattern training."
  },
  {
    icon: ShieldCheck,
    title: "Secure Architecture",
    desc: "Full-stack system featuring React 19, Express, PostgreSQL, ChromaDB vector search, JWT role protection, and administrative analytics."
  },
  {
    icon: Award,
    title: "Capstone Project 2026",
    desc: "Developed as a flagship final year engineering project to modernize and automate student intake, inquiry handling, and academic counseling."
  }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <StaggeredMenu
        position="left"
        items={HOME_MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        menuButtonColor="var(--text)"
        openMenuButtonColor="var(--text)"
        changeMenuColorOnOpen
        colors={["var(--border)", "var(--primary)"]}
        accentColor="var(--primary)"
      />

      <main className={styles.main}>
        <div style={{ marginBottom: "1rem" }}>
          <AnimatedLogo />
        </div>
        <h1 className={styles.title}>
          About <span className={styles.gradient}>Campus-Mitra</span>
        </h1>
        <p className={styles.leadDescription}>
          The intelligent, AI-powered academic advisory and counseling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai. Built with Retrieval-Augmented Generation (RAG) and multilingual speech recognition to assist students and parents 24/7.
        </p>

        <div className={styles.btngroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
            onClick={() => navigate("/chat")}
          >
            Ask AI Counselor <ArrowRight size={18} />
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}
            onClick={() => window.open("http://sbmp.ac.in/", "_blank")}
          >
            Visit SBMP Website
          </button>
        </div>

        <div className={styles.grid}>
          {ABOUT_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={styles.card}>
                <div className={styles.icon}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
