import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaggeredMenu from '../components/StaggeredMenu';
import {
  ArrowRight,
  MessageSquare,
  PhoneCall,
  Zap,
  GraduationCap,
  Sparkles,
  Calculator,
  ChevronRight,
  School,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import styles from './styles/Home.module.css';
import { HOME_MENU_ITEMS, SOCIAL_ITEMS } from '../constants/navigation';
import MaskedHeading from '../components/MaskedHeading';
import SpotlightCard from '../components/SpotlightCard';
import InfiniteMarquee from '../components/InfiniteMarquee';
import AdmissionTimeline from '../components/AdmissionTimeline';
import FaqAccordion from '../components/FaqAccordion';
import BentoGrid from '../components/BentoGrid';
import NumberTicker from '../components/NumberTicker';
import BranchComparator from '../components/BranchComparator';
import FeeCalculator from '../components/FeeCalculator';
import video from '../assets/SBMP INTRO.mp4';
import poster from '../assets/poster.png';

const STATS = [
  { value: 9, suffix: "", label: "Diploma Disciplines", sub: "Premier Autonomous Programs" },
  { value: 100, suffix: "%", label: "Sandwich Placements", sub: "2 Semesters In-Plant Training" },
  { value: 60, suffix: "+", label: "Years of Heritage", sub: "Established in 1961 by SVKM" },
  { value: 24, suffix: "/7", label: "Multilingual AI", sub: "English, Hindi, Marathi, Gujarati" },
];

const RECRUITERS = [
  "🏢 Larsen & Toubro (L&T)",
  "⚡ Siemens India",
  "🛠️ Godrej & Boyce",
  "💡 Tata Power",
  "🚗 Mahindra & Mahindra",
  "🌐 Reliance Industries",
  "❄️ Voltas Limited",
  "🏗️ Toyo Engineering",
  "🔌 Schneider Electric",
  "📜 MSBTE Autonomous Status",
  "🏛️ SVKM Trust Heritage (Est. 1961)",
  "🎯 Direct Second Year (VJTI / SPIT / DJSCE)",
];

const TESTIMONIALS = [
  {
    author: "Aarav Shah",
    role: "Computer Engineering ('24) • Now at VJTI Mumbai",
    tag: "Direct 2nd Yr B.Tech",
    quote:
      "Secured direct lateral admission into VJTI Computer Engineering after 3.5 years at SBMP. The two sandwich semesters in industry gave me a distinct practical edge over 12th standard entrants.",
  },
  {
    author: "Diya Patel",
    role: "Information Technology ('25) • TFWS Scholar",
    tag: "100% Tuition Waiver",
    quote:
      "Campus Mitra answered all our queries about TFWS fee concessions and Gujarati minority quota accurately at 11 PM during CAP option filling. We saved ₹60,000 annually with zero stress.",
  },
  {
    author: "Rohan Kulkarni",
    role: "Mechanical Engineering ('23) • Junior Engineer at Siemens",
    tag: "L&T / Siemens Training",
    quote:
      "SBMP's autonomous sandwich pattern was the turning point of my career. Training for a full year on real shop floors at L&T helped me land an offer before my final semester exams.",
  },
];

const BRANCHES = [
  {
    id: "comp",
    name: "Computer Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "94% - 97%",
    desc: "Software engineering, full-stack development, cloud computing, and cybersecurity with mandatory industrial internship.",
  },
  {
    id: "it",
    name: "Information Technology",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "92% - 95%",
    desc: "Enterprise networks, database administration, web architectures, and mobile app development.",
  },
  {
    id: "aiml",
    name: "AI & Machine Learning",
    type: "Industry Aligned",
    duration: "3 Years",
    cutoffRange: "90% - 94%",
    desc: "Deep learning models, natural language processing, computer vision, and predictive data science.",
  },
  {
    id: "mech",
    name: "Mechanical Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "84% - 89%",
    desc: "CAD/CAM automation, robotics, thermal power systems, and manufacturing in partnership with Larsen & Toubro.",
  },
  {
    id: "civil",
    name: "Civil Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "80% - 86%",
    desc: "Structural design, surveying, geotechnical engineering, and smart city infrastructure development.",
  },
  {
    id: "electrical",
    name: "Electrical Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "85% - 90%",
    desc: "Power electronics, electrical drives, renewable energy grids, and high-voltage transmission.",
  },
  {
    id: "extc",
    name: "Electronics & Telecom",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "86% - 91%",
    desc: "Embedded systems, IoT architecture, 5G wireless protocols, and signal processing.",
  },
  {
    id: "chemical",
    name: "Chemical Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "78% - 84%",
    desc: "Unit operations, process simulation, polymer reactions, and industrial safety in prime chemical manufacturing.",
  },
  {
    id: "plastics",
    name: "Plastics Engineering",
    type: "Sandwich Pattern",
    duration: "3.5 Years",
    cutoffRange: "75% - 82%",
    desc: "Polymer chemistry, injection molding, mold design, and sustainable bio-plastics technology.",
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "24/7 AI Academic Counseling",
    desc: "Instant, verified answers on cutoffs, tuition fees, scholarship criteria, and CAP seat matrices grounded directly in official college documents."
  },
  {
    icon: PhoneCall,
    title: "Official Staff Escalation",
    desc: "Need personalized one-on-one attention? Request a phone callback or schedule a campus visit directly through your chat session."
  },
  {
    icon: Zap,
    title: "Multilingual Voice AI",
    desc: "Consult Mitra in your mother tongue. Speak or listen in English, Hindi (हिन्दी), Marathi (मराठी), or Gujarati (ગુજરાતી)."
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [percentileInput, setPercentileInput] = useState("");
  const [estimatedResult, setEstimatedResult] = useState(null);

  const handleEstimate = (e) => {
    e.preventDefault();
    const score = parseFloat(percentileInput);
    if (isNaN(score) || score <= 0 || score > 100) return;

    const matched = BRANCHES.filter((b) => {
      const minCutoff = parseFloat(b.cutoffRange.split("%")[0]);
      return score >= minCutoff - 4;
    });

    setEstimatedResult({
      score,
      count: matched.length,
      topPick: matched[0]?.name || "Chemical / Plastics Engineering",
      allMatches: matched,
    });
  };

  const handleAskBranch = (branchName) => {
    navigate("/chat", {
      state: {
        initialQuery: `What are the admission cutoffs, fee breakdown, and sandwich training details for ${branchName} at SBMP?`,
      },
    });
  };

  const handleEstimatorConsult = () => {
    const q = estimatedResult
      ? `I have scored ${estimatedResult.score}% in 10th SSC. Which diploma engineering branches at SBMP am I eligible for in CAP rounds?`
      : `What are the cutoff percentiles for all diploma programs at SBMP?`;
    navigate("/chat", { state: { initialQuery: q } });
  };

  return (
    <div className={styles.wrapper}>
      {/* Slide-out Menu for Deep Shortcuts */}
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
        {/* Institutional Trust Ribbon */}
        <div className={styles.trustBadge}>
          <School size={15} />
          <span>SVKM's Shri Bhagubhai Mafatlal Polytechnic • Autonomous • Est. 1961</span>
        </div>

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
          The intelligent, AI-powered academic advisory and counseling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP), Mumbai. Get personalized cutoff guidance, fee breakdowns, and real-time counseling support.
        </p>

        <div className={styles.btngroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
            onClick={() => navigate("/dashboard")}
          >
            <MessageSquare size={18} />
            Ask AI Counselor
            <ArrowRight size={18} />
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}
            onClick={() => window.open("http://sbmp.ac.in/", "_blank")}
          >
            Visit Official College Portal
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Stats Strip with Animated Number Tickers */}
        <div className={styles.statsStrip}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statBox}>
              <strong className={styles.statValue}>
                <NumberTicker value={s.value} suffix={s.suffix} />
              </strong>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Industry Recruiters & Autonomous Accreditation Marquee */}
        <div className={styles.marqueeSection}>
          <span className={styles.marqueeHeaderLabel}>
            In-Plant Industrial Training Partners & Autonomous Accreditation
          </span>
          <InfiniteMarquee items={RECRUITERS} speed={32} />
        </div>

        {/* Interactive Eligibility Estimator Widget */}
        <section className={styles.estimatorSection}>
          <div className={styles.estimatorCard}>
            <div className={styles.estimatorHeader}>
              <div className={styles.estimatorIcon}>
                <Calculator size={22} />
              </div>
              <div className={styles.estimatorTitleWrap}>
                <h2 className={styles.estimatorTitle}>Instant Admission Cutoff Estimator</h2>
                <p className={styles.estimatorSubtitle}>
                  Enter your expected 10th (SSC) or diploma entrance score to preview eligible SBMP branches:
                </p>
              </div>
            </div>

            <form onSubmit={handleEstimate} className={styles.estimatorForm}>
              <div className={styles.estimatorInputGroup}>
                <input
                  type="number"
                  step="0.01"
                  min="35"
                  max="100"
                  placeholder="Enter percentage (e.g. 88.50%)"
                  value={percentileInput}
                  onChange={(e) => setPercentileInput(e.target.value)}
                  className={styles.estimatorInput}
                  required
                />
                <button type="submit" className={styles.estimatorSubmitBtn}>
                  Calculate Matches
                  <Sparkles size={16} />
                </button>
              </div>
            </form>

            {estimatedResult && (
              <div className={styles.estimatorResult}>
                <div className={styles.resultSummary}>
                  <CheckCircle2 size={20} className={styles.checkSuccess} />
                  <span>
                    At <strong>{estimatedResult.score}%</strong>, you qualify for up to{" "}
                    <strong>{estimatedResult.count} SBMP Diploma branches</strong> in centralized CAP rounds!
                  </span>
                </div>
                <div className={styles.matchChips}>
                  {estimatedResult.allMatches.slice(0, 4).map((b) => (
                    <span key={b.id} className={styles.matchChip}>
                      {b.name} ({b.cutoffRange})
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.consultAiBtn}
                  onClick={handleEstimatorConsult}
                >
                  <span>Ask Mitra for In-Depth Cutoff & CAP Strategy</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 9 Diploma Engineering Programs */}
        <section className={styles.programsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Academic Disciplines</span>
            <h2 className={styles.sectionTitle}>Explore Autonomous Diploma Programs</h2>
            <p className={styles.sectionSubtitle}>
              Shri Bhagubhai Mafatlal Polytechnic offers 9 prestigious engineering disciplines under autonomous MSBTE curriculum.
            </p>
          </div>

          <div className={styles.branchesGrid}>
            {BRANCHES.map((b) => (
              <SpotlightCard key={b.id} className={styles.branchCard}>
                <div className={styles.branchCardTop}>
                  <span className={styles.branchTypeBadge}>{b.type}</span>
                  <span className={styles.branchDuration}>{b.duration}</span>
                </div>
                <h3 className={styles.branchName}>{b.name}</h3>
                <p className={styles.branchDesc}>{b.desc}</p>
                <div className={styles.branchCardBottom}>
                  <div className={styles.branchCutoff}>
                    <span className={styles.cutoffLabel}>Typical Cut-off:</span>
                    <strong className={styles.cutoffValue}>{b.cutoffRange}</strong>
                  </div>
                  <button
                    type="button"
                    className={styles.branchActionBtn}
                    onClick={() => handleAskBranch(b.name)}
                    title={`Ask Mitra about ${b.name}`}
                  >
                    <span>Inquire</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Branch Comparator Matrix */}
        <section className={styles.comparatorSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Interactive Matrix</span>
            <h2 className={styles.sectionTitle}>Compare Autonomous Diploma Branches</h2>
            <p className={styles.sectionSubtitle}>
              Benchmark any two SBMP branches side-by-side across cutoffs, in-plant training semesters, stipends, and direct second-year degree pathways.
            </p>
          </div>
          <BranchComparator />
        </section>

        {/* Core Features */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Why Campus Mitra</span>
            <h2 className={styles.sectionTitle}>Engineered for Student & Parent Success</h2>
            <p className={styles.sectionSubtitle}>
              Bridging the gap between prospective diploma candidates and official academic faculty guidance.
            </p>
          </div>

          <div className={styles.grid}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <SpotlightCard key={f.title} className={styles.card}>
                  <div className={styles.icon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.cardDescription}>{f.desc}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* Institutional Pillars Bento Grid */}
        <section className={styles.bentoSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Institutional Pillars</span>
            <h2 className={styles.sectionTitle}>Engineered for Academic & Career Mastery</h2>
            <p className={styles.sectionSubtitle}>
              Explore the unique autonomous ecosystem, in-plant industrial training, and fee waivers at SVKM's SBMP.
            </p>
          </div>
          <BentoGrid />
        </section>

        {/* CAP Admission Roadmap Timeline */}
        <section className={styles.timelineSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>CAP Admission Roadmap</span>
            <h2 className={styles.sectionTitle}>5-Step Centralized Admission Process</h2>
            <p className={styles.sectionSubtitle}>
              Navigate from candidate registration to physical campus reporting at SVKM's SBMP with zero friction.
            </p>
          </div>
          <AdmissionTimeline
            onAskMitra={(query) =>
              navigate("/chat", { state: { initialQuery: query } })
            }
          />
        </section>

        {/* Student & Parent Testimonials Grid */}
        <section className={styles.testimonialsSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Voices of SBMP</span>
            <h2 className={styles.sectionTitle}>What Our Students & Parents Say</h2>
            <p className={styles.sectionSubtitle}>
              Discover how SBMP's autonomous sandwich training and Mitra's guidance shape engineering careers.
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t) => (
              <SpotlightCard key={t.author} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.quoteIcon}>“</div>
                  <span className={styles.testimonialTag}>{t.tag}</span>
                </div>
                <p className={styles.testimonialQuote}>{t.quote}</p>
                <div className={styles.testimonialAuthorWrap}>
                  <div className={styles.testimonialAvatar}>
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className={styles.testimonialAuthor}>{t.author}</h4>
                    <p className={styles.testimonialRole}>{t.role}</p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Tuition Fee & Scholarship Calculator */}
        <section className={styles.feeSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Fee Transparency</span>
            <h2 className={styles.sectionTitle}>Institutional Fee & Concession Calculator</h2>
            <p className={styles.sectionSubtitle}>
              Calculate your exact net payable annual fees, EBC concessions, and 100% TFWS tuition waivers as per Maharashtra FRA regulations.
            </p>
          </div>
          <FeeCalculator />
        </section>

        {/* Frequently Asked Questions */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionBadge}>Got Questions?</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to know about autonomous sandwich diplomas, fees, minority quota, and CAP rounds.
            </p>
          </div>
          <FaqAccordion
            onAskMitra={(query) =>
              navigate("/chat", { state: { initialQuery: query } })
            }
          />
        </section>

        {/* Institutional Campus Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <div className={styles.footerLogoRow}>
                <GraduationCap size={20} className={styles.footerBrandIcon} />
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
