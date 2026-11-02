import { useNavigate } from "react-router-dom";
import SpotlightCard from "./SpotlightCard";
import {
  Briefcase,
  Award,
  ShieldCheck,
  GraduationCap,
  Mic,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import "./BentoGrid.css";

export default function BentoGrid() {
  const navigate = useNavigate();

  const handleInquire = (query) => {
    navigate("/chat", { state: { initialQuery: query } });
  };

  return (
    <div className="bento-container">
      {/* ── Item 1: Large Featured Card (Sandwich Training) ── */}
      <SpotlightCard className="bento-card bento-span-2 bento-card-featured">
        <div className="bento-top-row">
          <div className="bento-badge-highlight">
            <Briefcase size={14} />
            <span>Hallmark Advantage</span>
          </div>
          <span className="bento-tag">3.5-Year Sandwich Pattern</span>
        </div>

        <div className="bento-featured-content">
          <h3 className="bento-title-large">
            1 Year of Paid In-Plant Industrial Apprenticeship
          </h3>
          <p className="bento-desc-large">
            SBMP students spend two full academic semesters working on factory shop floors and tech offices at Larsen & Toubro, Siemens India, Godrej & Boyce, and Tata Power, graduating with real work experience, professional networks, and pre-placement offers.
          </p>

          <div className="bento-perks-row">
            <div className="bento-perk-item">
              <CheckCircle2 size={15} />
              <span>Paid Monthly Stipend</span>
            </div>
            <div className="bento-perk-item">
              <CheckCircle2 size={15} />
              <span>Full Autonomous Industry Credits</span>
            </div>
            <div className="bento-perk-item">
              <CheckCircle2 size={15} />
              <span>Recruiter Day Priority</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="bento-cta-btn"
          onClick={() =>
            handleInquire(
              "Explain the SBMP sandwich diploma in-plant training companies and placement packages."
            )
          }
        >
          <span>Ask Mitra About Placements</span>
          <ArrowRight size={14} />
        </button>
      </SpotlightCard>

      {/* ── Item 2: Autonomous Status ── */}
      <SpotlightCard className="bento-card">
        <div className="bento-icon-box">
          <Award size={20} />
        </div>
        <h4 className="bento-title">Autonomous Status Since 1989</h4>
        <p className="bento-desc">
          First autonomous polytechnic in Maharashtra under MSBTE. Curricula are updated annually with industry advisory boards to ensure modern software, robotics, and CAD standards.
        </p>
        <span className="bento-stat-pill">DTE Institute Code: 3010</span>
      </SpotlightCard>

      {/* ── Item 3: TFWS & Minority Quota ── */}
      <SpotlightCard className="bento-card">
        <div className="bento-icon-box">
          <ShieldCheck size={20} />
        </div>
        <h4 className="bento-title">100% Tuition Waiver & Quotas</h4>
        <p className="bento-desc">
          50% seats reserved for Gujarati Linguistic Minority under SVKM trust. Plus up to 5% supernumerary TFWS seats with complete 100% tuition fee waiver for income &lt; ₹8 Lakhs.
        </p>
        <button
          type="button"
          className="bento-text-link"
          onClick={() =>
            handleInquire(
              "What is the TFWS fee concession and Gujarati minority admission cutoff at SBMP?"
            )
          }
        >
          <span>Check Quota Eligibility</span>
          <ArrowRight size={13} />
        </button>
      </SpotlightCard>

      {/* ── Item 4: Direct 2nd Year Lateral Entry ── */}
      <SpotlightCard className="bento-card">
        <div className="bento-icon-box">
          <GraduationCap size={20} />
        </div>
        <h4 className="bento-title">Direct 2nd Year Degree Lateral Entry</h4>
        <p className="bento-desc">
          Top diploma graduates secure direct admission into 2nd year B.Tech/B.E. at VJTI Mumbai, SPIT, DJ Sanghvi (DJSCE), and COEP Pune without giving JEE or 12th standard.
        </p>
        <span className="bento-stat-pill">VJTI / SPIT / DJSCE Pathways</span>
      </SpotlightCard>

      {/* ── Item 5: Multilingual Voice AI ── */}
      <SpotlightCard className="bento-card">
        <div className="bento-icon-box">
          <Mic size={20} />
        </div>
        <h4 className="bento-title">Multilingual Voice AI Counselor</h4>
        <p className="bento-desc">
          Mitra provides natural regional speech-to-text in English, Hindi (हिन्दी), Marathi (मराठी), and Gujarati (ગુજરાતી), empowering parents to consult in their mother tongue.
        </p>
        <button
          type="button"
          className="bento-text-link"
          onClick={() =>
            handleInquire("How do I speak to Mitra in Hindi, Marathi, or Gujarati?")
          }
        >
          <span>Try Voice Counseling</span>
          <ArrowRight size={13} />
        </button>
      </SpotlightCard>
    </div>
  );
}
