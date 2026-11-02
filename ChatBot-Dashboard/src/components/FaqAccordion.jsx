import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import "./FaqAccordion.css";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What is the Tuition Fee Waiver Scheme (TFWS) and who qualifies at SBMP?",
    answer: "TFWS offers a 100% waiver on tuition fees for meritorious candidates across all 9 SBMP diploma branches (up to 5% supernumerary seats per branch). To qualify, the candidate's family annual income from all sources must be less than Rs. 8 Lakhs, certified by an authorized Tehsildar or Sub-Divisional Officer. Selection is strictly merit-based via DTE CAP rounds.",
    category: "Fees & Scholarships",
    query: "What is the complete TFWS fee concession and eligibility criteria at SBMP?",
  },
  {
    id: "faq-2",
    question: "How does the Gujarati Linguistic Minority quota work under SVKM?",
    answer: "Shri Bhagubhai Mafatlal Polytechnic is administered by Shri Vile Parle Kelavani Mandal (SVKM), a premier linguistic minority public educational trust. 50% of total seats are reserved for Gujarati-speaking candidates domicile in Maharashtra. Candidates must present their School Leaving Certificate (stating Gujarati as mother tongue) or an affidavit.",
    category: "Reservation & Quota",
    query: "Explain the Gujarati Linguistic Minority quota admission process and seat percentage at SBMP.",
  },
  {
    id: "faq-3",
    question: "What is the Autonomous Sandwich Diploma model and how does in-plant training work?",
    answer: "SBMP is an autonomous polytechnic under MSBTE. The hallmark of its curriculum is the 3.5-Year Sandwich Pattern: students spend 2 full academic semesters (1 year total) working on-site as apprentice engineers at top corporations including Larsen & Toubro, Siemens, Godrej, Tata Power, and Mahindra. Students receive industry stipends and accredited evaluation credits.",
    category: "Academic Curriculum",
    query: "Explain the sandwich diploma pattern, duration, and industrial training at SBMP.",
  },
  {
    id: "faq-4",
    question: "Can SBMP diploma graduates gain direct admission into Second Year B.Tech (Lateral Entry)?",
    answer: "Yes! SBMP diploma graduates are eligible for Direct Second Year Engineering (DSE) lateral admissions across top engineering colleges in Maharashtra, including VJTI Mumbai, SPIT, DJ Sanghvi (DJSCE), COEP Pune, and ICT Mumbai. Many SBMP students secure branch toppers positions in university degree colleges.",
    category: "Career & Degree Pathways",
    query: "Which engineering colleges offer direct second year lateral entry to SBMP diploma holders?",
  },
  {
    id: "faq-5",
    question: "What documents are required for physical scrutiny during CAP admission rounds?",
    answer: "Key documents include: 1) Class 10th (SSC) Marksheet, 2) School Leaving Certificate, 3) Maharashtra Domicile / Indian Nationality Certificate, 4) Caste Certificate & Caste Validity (for reserved categories), 5) Non-Creamy Layer (NCL for OBC/VJNT/SBC), and 6) Income Certificate (for TFWS/EBC candidates).",
    category: "Documents & Verification",
    query: "Provide a detailed checklist of mandatory documents for SBMP CAP verification.",
  },
];

export default function FaqAccordion({ onAskMitra }) {
  const [openId, setOpenId] = useState("faq-1");

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-container">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
          >
            <button
              type="button"
              className="faq-question-btn"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
            >
              <div className="faq-q-left">
                <HelpCircle size={17} className="faq-icon" />
                <span className="faq-question-text">{item.question}</span>
              </div>
              <ChevronDown
                size={18}
                className={`faq-arrow ${isOpen ? "faq-arrow-rotated" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="faq-answer-pane">
                <span className="faq-category-tag">{item.category}</span>
                <p className="faq-answer-text">{item.answer}</p>
                <button
                  type="button"
                  className="faq-ask-link"
                  onClick={() => onAskMitra?.(item.query)}
                >
                  <span>Ask Mitra more about this</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
