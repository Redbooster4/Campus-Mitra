import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GitCompare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import "./BranchComparator.css";

const BRANCH_DATABASE = {
  comp: {
    id: "comp",
    name: "Computer Engineering",
    intake: 120,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "94.6% - 97.2%",
    tfwsCutoff: "96.8%+",
    plantSemesters: "Sem 4 & Sem 7 (1 Full Year)",
    keyRecruiters: "L&T Infotech, Siemens, Tata Consultancy, Godrej Infotech",
    degreeLateral: "VJTI Mumbai, SPIT, DJ Sanghvi (Highest DSE Conversion)",
    stipendRange: "₹8,000 - ₹15,000 / month",
    coreFocus: "Full-Stack Dev, Cloud Computing, Cyber Security, Distributed Systems",
  },
  it: {
    id: "it",
    name: "Information Technology",
    intake: 60,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "92.4% - 95.8%",
    tfwsCutoff: "95.5%+",
    plantSemesters: "Sem 4 & Sem 7 (1 Full Year)",
    keyRecruiters: "Siemens, L&T Technology Services, Capgemini, Godrej",
    degreeLateral: "VJTI, SPIT, DJ Sanghvi, Thadomal Shahani",
    stipendRange: "₹8,000 - ₹14,000 / month",
    coreFocus: "Enterprise Networks, Database Architecture, Web Services, Mobile Systems",
  },
  aiml: {
    id: "aiml",
    name: "AI & Machine Learning",
    intake: 60,
    pattern: "3-Yr Autonomous",
    typicalCutoff: "90.2% - 94.0%",
    tfwsCutoff: "94.0%+",
    plantSemesters: "6-Month Capstone Internship",
    keyRecruiters: "Jio Platforms, Reliance AI, L&T, Tech Startups",
    degreeLateral: "SPIT Mumbai, DJ Sanghvi, COEP Pune (AI/Data Science)",
    stipendRange: "₹10,000 - ₹18,000 / month",
    coreFocus: "Deep Learning, Natural Language Processing, Computer Vision, Predictive ML",
  },
  mech: {
    id: "mech",
    name: "Mechanical Engineering",
    intake: 60,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "84.5% - 89.2%",
    tfwsCutoff: "90.0%+",
    plantSemesters: "Sem 5 & Sem 8 (1 Full Year)",
    keyRecruiters: "Larsen & Toubro Heavy Engg, Godrej & Boyce, Tata Power, Voltas",
    degreeLateral: "VJTI Mechanical, COEP Pune, Sardar Patel (SPCE)",
    stipendRange: "₹7,500 - ₹12,000 / month",
    coreFocus: "CAD/CAM Automation, Thermal Power, Mechatronics, Industrial Robotics",
  },
  civil: {
    id: "civil",
    name: "Civil Engineering",
    intake: 60,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "80.0% - 86.4%",
    tfwsCutoff: "87.0%+",
    plantSemesters: "Sem 5 & Sem 8 (1 Full Year)",
    keyRecruiters: "L&T Construction, Shapoorji Pallonji, Godrej Properties, CIDCO",
    degreeLateral: "VJTI Civil, SPCE Mumbai, COEP Pune",
    stipendRange: "₹7,000 - ₹11,000 / month",
    coreFocus: "Structural Design, Smart Cities Surveying, Geotech, BIM Modeling",
  },
  electrical: {
    id: "electrical",
    name: "Electrical Engineering",
    intake: 60,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "85.2% - 90.6%",
    tfwsCutoff: "91.2%+",
    plantSemesters: "Sem 5 & Sem 8 (1 Full Year)",
    keyRecruiters: "Tata Power, Siemens Energy, Schneider Electric, Reliance Power",
    degreeLateral: "VJTI Electrical, SPCE, COEP Pune",
    stipendRange: "₹8,000 - ₹13,000 / month",
    coreFocus: "Power Electronics, Renewable Micro-Grids, High-Voltage Drives, EV Systems",
  },
  extc: {
    id: "extc",
    name: "Electronics & Telecom",
    intake: 60,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "86.0% - 91.5%",
    tfwsCutoff: "92.0%+",
    plantSemesters: "Sem 4 & Sem 7 (1 Full Year)",
    keyRecruiters: "Siemens, Toyo Engineering, Schneider, Tata Communications",
    degreeLateral: "VJTI EXTC, SPIT Mumbai, DJ Sanghvi",
    stipendRange: "₹7,500 - ₹12,500 / month",
    coreFocus: "IoT Architecture, 5G Wireless, Embedded C/RTOS, Signal Processing",
  },
  chemical: {
    id: "chemical",
    name: "Chemical Engineering",
    intake: 30,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "78.0% - 84.5%",
    tfwsCutoff: "86.0%+",
    plantSemesters: "Sem 5 & Sem 8 (1 Full Year)",
    keyRecruiters: "Reliance Industries, Bharat Petroleum, Toyo Engineering, Pidilite",
    degreeLateral: "ICT Mumbai (Top Chemical Institute), Thadomal Shahani",
    stipendRange: "₹8,000 - ₹14,000 / month",
    coreFocus: "Unit Operations, Process Simulation, Polymer Reaction, Plant Safety",
  },
  plastics: {
    id: "plastics",
    name: "Plastics Engineering",
    intake: 30,
    pattern: "3.5-Yr Sandwich",
    typicalCutoff: "75.0% - 82.0%",
    tfwsCutoff: "83.5%+",
    plantSemesters: "Sem 5 & Sem 8 (1 Full Year)",
    keyRecruiters: "Supreme Petrochem, Nilkamal, Godrej & Boyce, Reliance Polymers",
    degreeLateral: "ICT Mumbai (Polymer & Surface Tech), MIT Pune",
    stipendRange: "₹7,500 - ₹12,000 / month",
    coreFocus: "Injection Mold Design, Bio-Plastics, Polymer Rheology, Extrusion Tech",
  },
};

export default function BranchComparator() {
  const navigate = useNavigate();
  const [branchAKey, setBranchAKey] = useState("comp");
  const [branchBKey, setBranchBKey] = useState("mech");

  const branchA = BRANCH_DATABASE[branchAKey];
  const branchB = BRANCH_DATABASE[branchBKey];

  const handleInquireComparison = () => {
    navigate("/chat", {
      state: {
        initialQuery: `Compare ${branchA.name} and ${branchB.name} at SBMP in terms of cutoffs, sandwich training partners, and direct second year B.Tech opportunities.`,
      },
    });
  };

  return (
    <div className="comparator-container">
      <div className="comparator-selectors">
        <div className="comparator-selector-box">
          <label htmlFor="compBranchA">Branch 1 (Primary)</label>
          <select
            id="compBranchA"
            value={branchAKey}
            onChange={(e) => setBranchAKey(e.target.value)}
            className="comparator-select"
          >
            {Object.values(BRANCH_DATABASE).map((b) => (
              <option key={b.id} value={b.id} disabled={b.id === branchBKey}>
                {b.name} ({b.pattern})
              </option>
            ))}
          </select>
        </div>

        <div className="comparator-vs-badge">
          <GitCompare size={18} />
          <span>VS</span>
        </div>

        <div className="comparator-selector-box">
          <label htmlFor="compBranchB">Branch 2 (Comparison)</label>
          <select
            id="compBranchB"
            value={branchBKey}
            onChange={(e) => setBranchBKey(e.target.value)}
            className="comparator-select"
          >
            {Object.values(BRANCH_DATABASE).map((b) => (
              <option key={b.id} value={b.id} disabled={b.id === branchAKey}>
                {b.name} ({b.pattern})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="comparator-matrix-grid">
        {/* Branch A Card */}
        <SpotlightCard className="comparator-card">
          <div className="comparator-card-top">
            <span className="comparator-badge">{branchA.pattern}</span>
            <span className="comparator-intake">{branchA.intake} Seats</span>
          </div>
          <h3 className="comparator-branch-title">{branchA.name}</h3>

          <div className="comparator-metric-rows">
            <div className="comparator-row">
              <span className="comp-label">Typical Cutoff:</span>
              <strong className="comp-value comp-accent">{branchA.typicalCutoff}</strong>
            </div>
            <div className="comparator-row">
              <span className="comp-label">TFWS Cutoff:</span>
              <strong className="comp-value">{branchA.tfwsCutoff}</strong>
            </div>
            <div className="comparator-row">
              <span className="comp-label">In-Plant Semesters:</span>
              <span className="comp-text">{branchA.plantSemesters}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Apprenticeship Stipend:</span>
              <span className="comp-text">{branchA.stipendRange}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Key Industry Recruiters:</span>
              <span className="comp-text">{branchA.keyRecruiters}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Direct Degree Pathways:</span>
              <span className="comp-text">{branchA.degreeLateral}</span>
            </div>
          </div>

          <div className="comp-tags-box">
            <span className="comp-subhead">Core Curriculum:</span>
            <p className="comp-desc-text">{branchA.coreFocus}</p>
          </div>
        </SpotlightCard>

        {/* Branch B Card */}
        <SpotlightCard className="comparator-card">
          <div className="comparator-card-top">
            <span className="comparator-badge">{branchB.pattern}</span>
            <span className="comparator-intake">{branchB.intake} Seats</span>
          </div>
          <h3 className="comparator-branch-title">{branchB.name}</h3>

          <div className="comparator-metric-rows">
            <div className="comparator-row">
              <span className="comp-label">Typical Cutoff:</span>
              <strong className="comp-value comp-accent">{branchB.typicalCutoff}</strong>
            </div>
            <div className="comparator-row">
              <span className="comp-label">TFWS Cutoff:</span>
              <strong className="comp-value">{branchB.tfwsCutoff}</strong>
            </div>
            <div className="comparator-row">
              <span className="comp-label">In-Plant Semesters:</span>
              <span className="comp-text">{branchB.plantSemesters}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Apprenticeship Stipend:</span>
              <span className="comp-text">{branchB.stipendRange}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Key Industry Recruiters:</span>
              <span className="comp-text">{branchB.keyRecruiters}</span>
            </div>
            <div className="comparator-row">
              <span className="comp-label">Direct Degree Pathways:</span>
              <span className="comp-text">{branchB.degreeLateral}</span>
            </div>
          </div>

          <div className="comp-tags-box">
            <span className="comp-subhead">Core Curriculum:</span>
            <p className="comp-desc-text">{branchB.coreFocus}</p>
          </div>
        </SpotlightCard>
      </div>

      <div className="comparator-action-footer">
        <button
          type="button"
          className="comparator-cta-btn"
          onClick={handleInquireComparison}
        >
          <Sparkles size={16} />
          <span>Ask Mitra For In-Depth Comparison Analysis</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
