import { useNavigate } from "react-router-dom";
import StaggeredMenu from "../components/StaggeredMenu";
import AnimatedLogo from "../components/AnimatedLogo";
import { HOME_MENU_ITEMS, SOCIAL_ITEMS } from "../constants/navigation";
import styles from "./styles/Home.module.css";
import SpotlightCard from "../components/SpotlightCard";
import {
  Mic,
  Database,
  School,
  PhoneCall,
  ShieldCheck,
  ArrowRight,
  Award,
  Cpu,
  Server,
  Code,
  CheckCircle2,
  ExternalLink,
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

const ARCHITECTURE_TIERS = [
  {
    icon: Code,
    title: "Frontend Application",
    tech: "React 19 • Vite • Tailwind CSS",
    desc: "Responsive SPA client with real-time markdown parsing, Web Speech synthesis, voice recording visualizers, and accessible dark/light themes."
  },
  {
    icon: Server,
    title: "Backend API Layer",
    tech: "Node.js • Express • PostgreSQL",
    desc: "Robust REST microservice handling JWT authentication, role guards, chat sessions, student profiles, callback escalation, and admin telemetry."
  },
  {
    icon: Cpu,
    title: "AI RAG Vector Store",
    tech: "ChromaDB • Semantic Embeddings",
    desc: "Retrieval-Augmented Generation pipeline converting official SBMP brochures, cutoff tables, and CAP manuals into searchable vector chunks."
  },
  {
    icon: Mic,
    title: "Multilingual Voice Engine",
    tech: "Sarvam AI • Whisper Models",
    desc: "Low-latency regional speech recognition supporting Indian languages to democratize admission counseling for students and parents across Maharashtra."
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
        {/* Trust Badge */}
        <div className={styles.trustBadge}>
          <School size={15} />
          <span>SVKM's Shri Bhagubhai Mafatlal Polytechnic • Est. 1961</span>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
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
            Visit SBMP Official Website
            <ExternalLink size={16} />
          </button>
        </div>

        {/* System Architecture Section */}
        <section className={styles.programsSection} style={{ marginTop: "1rem" }}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Technical Foundation</span>
            <h2 className={styles.sectionTitle}>System Architecture & Pipeline</h2>
            <p className={styles.sectionSubtitle}>
              Engineered as an end-to-end full-stack AI system ensuring zero hallucination on critical admission cutoffs and fees.
            </p>
          </div>

          <div className={styles.branchesGrid}>
            {ARCHITECTURE_TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <SpotlightCard key={tier.title} className={styles.branchCard}>
                  <div className={styles.branchCardTop}>
                    <div className={styles.icon} style={{ width: "2.4rem", height: "2.4rem", marginBottom: 0 }}>
                      <Icon size={18} />
                    </div>
                    <span className={styles.branchTypeBadge}>{tier.tech}</span>
                  </div>
                  <h3 className={styles.branchName} style={{ marginTop: "0.75rem" }}>{tier.title}</h3>
                  <p className={styles.branchDesc}>{tier.desc}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* Feature Cards */}
        <section className={styles.featuresSection} style={{ marginTop: "2rem" }}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Core Capabilities</span>
            <h2 className={styles.sectionTitle}>Built for Institutional Reliability</h2>
          </div>

          <div className={styles.grid}>
            {ABOUT_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <SpotlightCard key={item.title} className={styles.card}>
                  <div className={styles.icon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                  <p className={styles.cardDescription}>{item.desc}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* Final Year Project Credits */}
        <section className={styles.sandwichSection} style={{ marginTop: "3rem" }}>
          <div className={styles.sandwichCard}>
            <div className={styles.sandwichContent}>
              <div className={styles.sandwichBadge}>
                <Award size={14} />
                <span>Final Year Capstone Project 2026</span>
              </div>
              <h2 className={styles.sandwichTitle}>Department of Computer Engineering</h2>
              <p className={styles.sandwichDesc}>
                Campus Mitra was conceived and developed as a capstone engineering project at Shri Bhagubhai Mafatlal Polytechnic (SBMP), under the aegis of Shri Vile Parle Kelavani Mandal (SVKM). It modernizes college admissions through production-grade RAG automation.
              </p>
              <div className={styles.sandwichPoints}>
                <div className={styles.pointItem}>
                  <CheckCircle2 size={16} />
                  <span>Autonomous Curriculum Project Demonstration</span>
                </div>
                <div className={styles.pointItem}>
                  <CheckCircle2 size={16} />
                  <span>Real-time Integration with College Knowledge Base</span>
                </div>
                <div className={styles.pointItem}>
                  <CheckCircle2 size={16} />
                  <span>Interactive Admin Telemetry & Inquiry Monitoring</span>
                </div>
              </div>
            </div>
            <div className={styles.sandwichAction}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Institutional Campus Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <div className={styles.footerLogoRow}>
                <School size={20} className={styles.footerBrandIcon} />
                <strong className={styles.footerBrandText}>Campus Mitra</strong>
              </div>
              <p className={styles.footerSubText}>
                Intelligent Academic Counseling & Admissions Advisory Portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic.
              </p>
              <span className={styles.dteTag}>DTE Institute Code: 3010 | Autonomous</span>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Campus Address</h4>
              <p className={styles.footerAddress}>
                Bhaktivedanta Swami Marg, Irla, Vile Parle (West),<br />
                Mumbai - 400 056, Maharashtra, India.
              </p>
              <p className={styles.footerContact}>
                Official Portal: <a href="http://sbmp.ac.in" target="_blank" rel="noopener noreferrer">sbmp.ac.in</a>
              </p>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Engineering Project</h4>
              <p className={styles.footerAddress}>
                Final Year Capstone Project 2026<br />
                Department of Computer Engineering<br />
                SVKM's Shri Bhagubhai Mafatlal Polytechnic
              </p>
              <div className={styles.footerBadge}>
                <ShieldCheck size={14} />
                <span>Verified RAG Architecture</span>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP). All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
