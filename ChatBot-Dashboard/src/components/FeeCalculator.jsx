import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import "./FeeCalculator.css";

const FEE_RULES = {
  general: {
    name: "General / Open Merit",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: (income) => {
      if (income === "low" || income === "mid") {
        // EBC Scheme: 50% Tuition fee waiver
        return 27273;
      }
      return 0;
    },
    schemeName: (income) =>
      income === "high" ? "Standard Open Category" : "Rajarshi Shahu Maharaj EBC (50% Tuition Waiver)",
    authority: "Competent Revenue Authority (Income Certificate < ₹8 Lakhs for EBC)",
  },
  tfws: {
    name: "TFWS (Tuition Fee Waiver Scheme)",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: () => 54545, // 100% Tuition Fee Waived
    schemeName: "AICTE / DTE Maharashtra 100% Tuition Waiver",
    authority: "Sub-Divisional Officer (SDO) / Tehsildar (Family Income < ₹8 Lakhs Mandatory)",
  },
  obc: {
    name: "OBC (Other Backward Classes)",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: (income) => {
      if (income === "high") return 0;
      return 27273; // 50% Tuition waiver via Mahadbt
    },
    schemeName: "Post-Matric Scholarship Scheme (50% Tuition Waiver)",
    authority: "Non-Creamy Layer (NCL) Certificate valid for FY 2026-27 + Caste Validity",
  },
  scst: {
    name: "SC / ST (Scheduled Castes / Tribes)",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: () => 60000, // 100% Tuition & Development fee reimbursed
    schemeName: "Social Justice & Tribal Development 100% Free-ship",
    authority: "Caste Certificate & Scrutiny Committee Caste Validity Certificate",
  },
  ews: {
    name: "EWS (Economically Weaker Section)",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: (income) => (income === "high" ? 0 : 27273),
    schemeName: "Maharashtra State EWS 50% Fee Concession",
    authority: "EWS Eligibility Certificate issued by Tahsildar / Executive Magistrate",
  },
  minority: {
    name: "Gujarati Linguistic Minority (SVKM)",
    baseTuition: 54545,
    devFee: 5455,
    otherFee: 3500,
    getConcession: (income) => (income === "low" || income === "mid" ? 27273 : 0),
    schemeName: "SVKM Trust Minority Quota + EBC Concession (if eligible)",
    authority: "School Leaving Certificate stating Gujarati as Mother Tongue + Domicile",
  },
};

export default function FeeCalculator() {
  const navigate = useNavigate();
  const [categoryKey, setCategoryKey] = useState("general");
  const [incomeLevel, setIncomeLevel] = useState("mid"); // "low" (<2.5L), "mid" (2.5L-8L), "high" (>8L)

  const rule = FEE_RULES[categoryKey];
  const totalStandard = rule.baseTuition + rule.devFee + rule.otherFee;
  const concession = rule.getConcession(incomeLevel);
  const netPayable = Math.max(rule.otherFee, totalStandard - concession);

  const formatRupee = (num) =>
    "₹" + num.toLocaleString("en-IN");

  const handleConsultFees = () => {
    navigate("/chat", {
      state: {
        initialQuery: `What is the exact annual tuition fee and scholarship concession for ${rule.name} with family income category '${incomeLevel}' at SBMP?`,
      },
    });
  };

  return (
    <div className="fee-calc-container">
      <SpotlightCard className="fee-calc-card">
        <div className="fee-calc-header">
          <div className="fee-calc-icon">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="fee-calc-title">SBMP Tuition & Scholarship Fee Calculator</h3>
            <p className="fee-calc-sub">
              Regulated by Fees Regulating Authority (FRA) • DTE Code: 3010
            </p>
          </div>
        </div>

        <div className="fee-controls-grid">
          {/* Category Selector */}
          <div className="fee-control-group">
            <label htmlFor="feeCategory">Seat Allocation Category</label>
            <select
              id="feeCategory"
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="fee-select"
            >
              <option value="general">General / Open (CAP Round)</option>
              <option value="tfws">TFWS (100% Tuition Fee Waiver)</option>
              <option value="obc">OBC (Other Backward Classes)</option>
              <option value="scst">SC / ST (Social Welfare / Free-ship)</option>
              <option value="ews">EWS (Economically Weaker Section)</option>
              <option value="minority">Gujarati Linguistic Minority (SVKM)</option>
            </select>
          </div>

          {/* Income Level Selector */}
          <div className="fee-control-group">
            <label htmlFor="feeIncome">Annual Family Income</label>
            <select
              id="feeIncome"
              value={incomeLevel}
              onChange={(e) => setIncomeLevel(e.target.value)}
              className="fee-select"
            >
              <option value="low">Less than ₹2.5 Lakhs / year</option>
              <option value="mid">₹2.5 Lakhs to ₹8.0 Lakhs / year</option>
              <option value="high">Above ₹8.0 Lakhs / year</option>
            </select>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="fee-breakdown-card">
          <div className="fee-breakdown-rows">
            <div className="fee-row">
              <span>Base Tuition Fee (FRA Approved):</span>
              <strong>{formatRupee(rule.baseTuition)}</strong>
            </div>
            <div className="fee-row">
              <span>Development Fee:</span>
              <strong>{formatRupee(rule.devFee)}</strong>
            </div>
            <div className="fee-row">
              <span>Exam, Library & Autonomous Gymkhana:</span>
              <strong>{formatRupee(rule.otherFee)}</strong>
            </div>
            <div className="fee-row fee-discount-row">
              <span>Concession ({rule.schemeName(incomeLevel)}):</span>
              <strong className="fee-savings-text">
                - {formatRupee(concession)}
              </strong>
            </div>
          </div>

          <div className="fee-total-banner">
            <div>
              <span className="fee-total-label">Net Annual Fee Payable</span>
              <strong className="fee-total-amount">{formatRupee(netPayable)}</strong>
            </div>

            {concession > 0 && (
              <div className="fee-savings-badge">
                <Sparkles size={15} />
                <span>You Save {formatRupee(concession)} / year</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Requirements Box */}
        <div className="fee-auth-box">
          <ShieldCheck size={18} className="fee-auth-icon" />
          <div className="fee-auth-text">
            <strong>Mandatory Document for Concession:</strong>
            <p>{rule.authority}</p>
          </div>
        </div>

        <div className="fee-actions">
          <button
            type="button"
            className="fee-consult-btn"
            onClick={handleConsultFees}
          >
            <CheckCircle2 size={16} />
            <span>Consult Mitra on Payment Schedules & Mahadbt Portal</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}
