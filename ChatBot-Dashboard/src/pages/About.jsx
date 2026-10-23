import { useNavigate } from "react-router-dom";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import { HOME_MENU_ITEMS, SOCIAL_ITEMS } from "../constants/navigation";
import styles from "./styles/Home.module.css";
import {
  Mic,
  Database,
  School,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Award,
} from "lucide-react";

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
        <p className={styles.description}>
          The intelligent, AI-powered academic advisory and counseling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai. Built with Retrieval-Augmented Generation (RAG) and multilingual speech recognition to assist students and parents 24/7.
        </p>
        <div className={styles.btngroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
            onClick={() => navigate("/chat")}>
            Ask AI Counselor <ArrowRight size={18} />
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}
            onClick={() => window.open("http://sbmp.ac.in/", "_blank")}>
            Visit SBMP Website
          </button>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}>
              <Database size={24} />
            </div>
            <h3 className={styles.featureTitle}>Document-Grounded RAG</h3>
            <p className={styles.description}>
              Trained on official SBMP diploma cutoffs, fee structures, CAP admission rules, and branch syllabi with verified, hallucination-free answers.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <Mic size={24} />
            </div>
            <h3 className={styles.featureTitle}>Multilingual Voice AI</h3>
            <p className={styles.description}>
              Integrated with Sarvam AI speech-to-text supporting English, Hindi (हिन्दी), Marathi (मराठी), and Gujarati (ગુજરાતી) for seamless parent counseling.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <PhoneCall size={24} />
            </div>
            <h3 className={styles.featureTitle}>Counselor Callback</h3>
            <p className={styles.description}>
              Direct human escalation when personal attention is needed. Request an admission phone callback or campus visit directly from the chat.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <School size={24} />
            </div>
            <h3 className={styles.featureTitle}>SBMP Heritage (Est. 1961)</h3>
            <p className={styles.description}>
              Autonomous polytechnic under SVKM, offering 9+ premier diploma engineering disciplines with industry-aligned sandwich pattern training.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <ShieldCheck size={24} />
            </div>
            <h3 className={styles.featureTitle}>Secure Architecture</h3>
            <p className={styles.description}>
              Full-stack system featuring React 19, Express, PostgreSQL, ChromaDB vector search, JWT role protection, and administrative analytics.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <Award size={24} />
            </div>
            <h3 className={styles.featureTitle}>Capstone Project 2026</h3>
            <p className={styles.description}>
              Developed as a flagship final year engineering project to modernize and automate student intake, inquiry handling, and academic counseling.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
