import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  Play,
  Layers,
  Award,
} from "lucide-react";
import "./VivaDemoLauncher.css";

const VIVA_SCENARIOS = [
  {
    id: "viva-1",
    tag: "High Cutoff CAP Strategy",
    title: "96.5% SSC Merit Analysis (Computer vs IT)",
    desc: "Evaluates cutoff percentile bands, autonomous credits, and choice code priority 3010.",
    query:
      "I have scored 96.5% in 10th SSC. Between Computer Engineering and Information Technology at SBMP, which branch should I place as Choice Code 1 in CAP rounds?",
  },
  {
    id: "viva-2",
    tag: "Fee Waiver & Scholarships",
    title: "TFWS & EBC Concession Under ₹8 Lakhs",
    desc: "Demonstrates 100% tuition waiver calculation, developmental fee, and tehsildar income certificate.",
    query:
      "My family annual income is ₹4.5 Lakhs. Do I qualify for the 100% TFWS tuition fee waiver at SBMP, and what documents are required for FC scrutiny?",
  },
  {
    id: "viva-3",
    tag: "Autonomous Sandwich Pattern",
    title: "1-Year In-Plant Training at L&T & Siemens",
    desc: "Explains two industrial plant semesters (Sem 4 & 7 or 5 & 8), stipend, and campus placements.",
    query:
      "Explain SBMP's autonomous 3.5-year sandwich pattern, including in-plant training semesters with Larsen & Toubro, student stipends, and placement records.",
  },
  {
    id: "viva-4",
    tag: "SVKM Trust Minority",
    title: "50% Gujarati Linguistic Minority Quota",
    desc: "Explains institutional reservation under SVKM trust, school leaving certificate, and cutoffs.",
    query:
      "How does the 50% Gujarati Linguistic Minority quota work under SVKM trust at SBMP, and what is the cutoff advantage?",
  },
  {
    id: "viva-5",
    tag: "Lateral Degree Pathways",
    title: "Direct Second Year B.Tech Entry to VJTI/SPIT",
    desc: "Demonstrates university degree lateral admission pathways for autonomous diploma toppers.",
    query:
      "Can SBMP autonomous diploma graduates secure direct second-year lateral admission (DSE) into top engineering colleges like VJTI Mumbai and SPIT?",
  },
];

export default function VivaDemoLauncher() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLaunchScenario = (query) => {
    setIsOpen(false);
    navigate("/chat", { state: { initialQuery: query } });
  };

  return (
    <div className="viva-launcher-root">
      {!isOpen && (
        <button
          type="button"
          className="viva-fab-btn"
          onClick={() => setIsOpen(true)}
          title="Open Viva & Presentation Demonstration Scenarios"
        >
          <Award size={18} />
          <span>Viva Demo Mode</span>
          <span className="viva-fab-dot" />
        </button>
      )}

      {isOpen && (
        <div className="viva-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="viva-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="viva-modal-header">
              <div className="viva-badge-row">
                <span className="viva-badge">
                  <Sparkles size={13} />
                  <span>Capstone Examination Mode</span>
                </span>
                <span className="viva-subtitle">FYP 2026 • SVKM's SBMP</span>
              </div>
              <button
                type="button"
                className="viva-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="viva-intro">
              <h3 className="viva-title">Demonstration Scenarios for Project Examiners</h3>
              <p className="viva-desc">
                Select any golden scenario to trigger automated RAG retrieval, verified document citations, and real-time counseling responses:
              </p>
            </div>

            <div className="viva-scenarios-list">
              {VIVA_SCENARIOS.map((s) => (
                <div
                  key={s.id}
                  className="viva-scenario-item"
                  onClick={() => handleLaunchScenario(s.query)}
                >
                  <div className="viva-scenario-left">
                    <span className="viva-scenario-tag">{s.tag}</span>
                    <h4 className="viva-scenario-title">{s.title}</h4>
                    <p className="viva-scenario-desc">{s.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="viva-play-btn"
                    title="Run Scenario"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Run</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="viva-footer-row">
              <span className="viva-footer-text">
                Powered by Hybrid ChromaDB RAG & Sarvam Multilingual Speech Engine
              </span>
              <button
                type="button"
                className="viva-inspect-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/admin/analytics");
                }}
              >
                <Layers size={14} />
                <span>Open Telemetry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
