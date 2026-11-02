import { useState } from "react";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import "./AdmissionTimeline.css";

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "DTE Maharashtra Portal Registration",
    timeframe: "June - July 2026",
    status: "Upcoming",
    desc: "Create candidate login on the official DTE Maharashtra polytechnic admission portal (poly24.dtemaharashtra.gov.in) with Class 10th seat number, personal details, and upload scanned academic certificates.",
    keyTip: "Ensure student name matches exactly with Class 10th (SSC) marksheet to prevent verification flags.",
    query: "How do I register for DTE Maharashtra polytechnic admissions on the portal?",
  },
  {
    step: "02",
    title: "Document Scrutiny at Facilitation Center (FC)",
    timeframe: "July 2026",
    status: "Mandatory",
    desc: "Choose Physical Scrutiny (visit SVKM's SBMP Facilitation Center in Vile Parle) or E-Scrutiny online. Officials verify original marksheets, caste validity, non-creamy layer, and income certificates.",
    keyTip: "SBMP is an official Facilitation Center (FC Code: 3010). Physical verification takes less than 20 minutes.",
    query: "What is the procedure for document verification at the SBMP Facilitation Center?",
  },
  {
    step: "03",
    title: "State Merit List & Grievance Window",
    timeframe: "July 2026",
    status: "Ranking",
    desc: "DTE displays Provisional Merit List. Candidates have a 3-day window to raise grievances for corrections in category, marks, or gender before the Final General Merit List is published.",
    keyTip: "Check your State General Merit Rank and Category Rank — cutoffs are determined strictly by merit rank.",
    query: "How does the DTE state merit list ranking work for SBMP cutoff rounds?",
  },
  {
    step: "04",
    title: "CAP Option Form Submission (Choice Code 3010)",
    timeframe: "Late July - August 2026",
    status: "Strategic",
    desc: "Submit prioritized list of college choice codes. Enter Choice Code 3010 for SBMP autonomous sandwich programs. Apply for TFWS (Tuition Fee Waiver Scheme) choices with the 'T' suffix.",
    keyTip: "Put SBMP Computer (301024510) and IT (301024610) as Top Preferences if you have 90%+ score.",
    query: "What are the exact DTE institute choice codes for SBMP engineering diploma branches?",
  },
  {
    step: "05",
    title: "Seat Allotment, Freeze & Campus Reporting",
    timeframe: "August 2026",
    status: "Final Admission",
    desc: "If allotted preferred choice 1, seat is Auto-Frozen. Pay the seat acceptance fee online and report in person to Shri Bhagubhai Mafatlal Polytechnic, Vile Parle West for fee payment and original document deposit.",
    keyTip: "Retain multiple photocopies and scanned PDFs of all documents before submitting originals to SBMP office.",
    query: "What is the fee payment and confirmation process when reporting to SBMP campus?",
  },
];

export default function AdmissionTimeline({ onSelectQuery, onAskMitra }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleAsk = (query) => {
    if (onAskMitra) {
      onAskMitra(query);
    } else if (onSelectQuery) {
      onSelectQuery(query);
    }
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-nav">
        {TIMELINE_STEPS.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={step.step}
              type="button"
              className={`timeline-step-btn ${isActive ? "timeline-step-active" : ""}`}
              onClick={() => setActiveStep(idx)}
            >
              <div className="step-num-pill">{step.step}</div>
              <div className="step-nav-text">
                <span className="step-nav-title">{step.title}</span>
                <span className="step-nav-time">{step.timeframe}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="timeline-detail-card">
        <div className="timeline-detail-header">
          <div className="step-badge-row">
            <span className="step-tag">Step {TIMELINE_STEPS[activeStep].step}</span>
            <span className="step-status-tag">{TIMELINE_STEPS[activeStep].status}</span>
            <span className="step-timeframe-tag">
              <Clock size={13} />
              {TIMELINE_STEPS[activeStep].timeframe}
            </span>
          </div>
          <h3 className="timeline-detail-title">{TIMELINE_STEPS[activeStep].title}</h3>
        </div>

        <p className="timeline-detail-desc">{TIMELINE_STEPS[activeStep].desc}</p>

        <div className="timeline-tip-box">
          <div className="tip-icon">
            <Sparkles size={16} />
          </div>
          <div className="tip-content">
            <strong>Admissions Pro-Tip:</strong>
            <p>{TIMELINE_STEPS[activeStep].keyTip}</p>
          </div>
        </div>

        <div className="timeline-detail-actions">
          <button
            type="button"
            className="timeline-ask-btn"
            onClick={() => handleAsk(TIMELINE_STEPS[activeStep].query)}
          >
            <span>Ask Mitra about {TIMELINE_STEPS[activeStep].title}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
