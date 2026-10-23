import { useNavigate } from 'react-router-dom';
import StaggeredMenu from '../components/StaggeredMenu';
import { ArrowRight, MessageSquare, PhoneCall, Zap } from 'lucide-react';
import styles from './styles/Home.module.css';
import { HOME_MENU_ITEMS, SOCIAL_ITEMS } from '../constants/navigation';
import MaskedHeading from '../components/MaskedHeading';
import video from '../assets/SBMP INTRO.mp4';
import poster from '../assets/poster.png';

const FEATURES = [
  {
    icon: MessageSquare,
    title: "24/7 AI Guidance",
    desc: "Have questions about courses, cut-offs, or fees? Mitra provides instant, verified answers anytime."
  },
  {
    icon: PhoneCall,
    title: "Counselor Callback",
    desc: "Need one-on-one personal guidance? Request an official phone callback or schedule a counseling session directly through chat."
  },
  {
    icon: Zap,
    title: "Live Tracking",
    desc: "Never wonder where you stand. Track your application status step-by-step from inquiry to final confirmation."
  }
];

export default function Home() {
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
        <MaskedHeading
          text="Navigate Your Future With Confidence"
          mediaType="video"
          src={video}
          poster={poster}
          fillScale={1.25}
          parallax={26}
          reveal="rise"
          trigger="view"
          drift={18}
          stagger={0.09}
          align="center"
          weight={1000}
          textScale={0.125}
        />
        <p className={styles.leadDescription}>
          The intelligent, AI-powered academic advisory and counseling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic. Get personalized cutoff guidance, fee breakdowns, and real-time counseling support.
        </p>

        <div className={styles.btngroup}>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} onClick={() => window.open("http://sbmp.ac.in/", "_blank")}>
            Start Application 
            <ArrowRight size={18} />
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`} onClick={() => navigate("/dashboard")}>
            <MessageSquare size={18} />
            Ask AI Counselor
          </button>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={styles.card}>
                <div className={styles.icon}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.cardDescription}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
