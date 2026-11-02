import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  GraduationCap,
  FileText,
  Compass,
  ArrowRight,
  Sun,
  PhoneCall,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeProvider";
import "./CommandPalette.css";

const COMMAND_ITEMS = [
  // ── Branches ──
  {
    id: "branch-comp",
    category: "Autonomous Branches",
    title: "Computer Engineering",
    subtitle: "3.5-Yr Sandwich • Software & Cloud • Cutoff: 94% - 97%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "What are the admission cutoffs, fee breakdown, and sandwich training details for Computer Engineering at SBMP?",
        },
      }),
  },
  {
    id: "branch-it",
    category: "Autonomous Branches",
    title: "Information Technology",
    subtitle: "3.5-Yr Sandwich • Enterprise Networks & Web • Cutoff: 92% - 95%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "What are the cutoff percentiles, syllabus, and IT placements at SBMP?",
        },
      }),
  },
  {
    id: "branch-aiml",
    category: "Autonomous Branches",
    title: "AI & Machine Learning",
    subtitle: "3-Yr Autonomous • Deep Learning & Data Science • Cutoff: 90% - 94%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Explain the AI and Machine Learning diploma curriculum and faculty at SBMP.",
        },
      }),
  },
  {
    id: "branch-mech",
    category: "Autonomous Branches",
    title: "Mechanical Engineering",
    subtitle: "3.5-Yr Sandwich • CAD/CAM & Robotics • L&T Training • Cutoff: 84% - 89%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "How does the mechanical sandwich diploma and L&T in-plant training work at SBMP?",
        },
      }),
  },
  {
    id: "branch-civil",
    category: "Autonomous Branches",
    title: "Civil Engineering",
    subtitle: "3.5-Yr Sandwich • Structural Design & Smart Cities • Cutoff: 80% - 86%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery: "Explain SBMP Civil engineering sandwich diploma and site training.",
        },
      }),
  },
  {
    id: "branch-elec",
    category: "Autonomous Branches",
    title: "Electrical Engineering",
    subtitle: "3.5-Yr Sandwich • Power Grids & Drives • Cutoff: 85% - 90%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "What are the cutoffs and industrial apprenticeships for Electrical Engineering at SBMP?",
        },
      }),
  },
  {
    id: "branch-extc",
    category: "Autonomous Branches",
    title: "Electronics & Telecommunication",
    subtitle: "3.5-Yr Sandwich • IoT, 5G & Embedded Systems • Cutoff: 86% - 91%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Explain EXTC branch sandwich training and diploma career pathways at SBMP.",
        },
      }),
  },
  {
    id: "branch-chem",
    category: "Autonomous Branches",
    title: "Chemical Engineering",
    subtitle: "3.5-Yr Sandwich • Process Tech & Safety • Cutoff: 78% - 84%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "What are the career opportunities and plant training for Chemical Engineering at SBMP?",
        },
      }),
  },
  {
    id: "branch-plastics",
    category: "Autonomous Branches",
    title: "Plastics Engineering",
    subtitle: "3.5-Yr Sandwich • Polymers & Sustainable Mold Design • Cutoff: 75% - 82%",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Tell me about the Plastics Engineering diploma program and industry partners at SBMP.",
        },
      }),
  },

  // ── Admissions & Schemes ──
  {
    id: "scheme-tfws",
    category: "Admissions & Schemes",
    title: "TFWS (Tuition Fee Waiver Scheme)",
    subtitle: "100% Tuition Waived • Annual Income < ₹8 Lakhs • Supernumerary Seats",
    icon: FileText,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "What is the TFWS scheme, income certificate requirement, and cutoff criteria at SBMP?",
        },
      }),
  },
  {
    id: "scheme-gujarati",
    category: "Admissions & Schemes",
    title: "Gujarati Linguistic Minority Quota",
    subtitle: "50% Institutional Reservation under SVKM Trust • LC / Affidavit Required",
    icon: FileText,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Explain the Gujarati linguistic minority quota admission process, documents, and cutoffs at SBMP.",
        },
      }),
  },
  {
    id: "scheme-sandwich",
    category: "Admissions & Schemes",
    title: "3.5-Year Autonomous Sandwich Pattern",
    subtitle: "2 Full Semesters of Paid In-Plant Industrial Apprenticeship (L&T, Siemens, Godrej)",
    icon: Sparkles,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Explain the autonomous 3.5 year sandwich pattern training and placement companies at SBMP.",
        },
      }),
  },
  {
    id: "scheme-lateral",
    category: "Admissions & Schemes",
    title: "Direct 2nd Year Degree Lateral Entry (DSE)",
    subtitle: "Direct B.Tech Admission pathways into VJTI, SPIT, DJ Sanghvi, COEP Pune",
    icon: GraduationCap,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "Which top engineering colleges in Maharashtra offer direct second year lateral entry to SBMP diploma toppers?",
        },
      }),
  },
  {
    id: "scheme-docs",
    category: "Admissions & Schemes",
    title: "CAP Mandatory Documents Checklist",
    subtitle: "SSC Marksheet, LC, Domicile, Caste Validity, NCL & Income Verification",
    icon: FileText,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery:
            "List all mandatory documents required for CAP document scrutiny at SBMP Facilitation Center (FC 3010).",
        },
      }),
  },

  // ── Quick Navigation ──
  {
    id: "nav-home",
    category: "Navigation",
    title: "Home Page",
    subtitle: "Campus Mitra admissions landing portal and cutoff estimator",
    icon: Compass,
    action: (navigate) => navigate("/home"),
  },
  {
    id: "nav-chat",
    category: "Navigation",
    title: "AI Academic Counselor",
    subtitle: "24/7 multilingual advisory with voice input in English, Hindi, Marathi, Gujarati",
    icon: Sparkles,
    action: (navigate) => navigate("/chat"),
  },
  {
    id: "nav-dashboard",
    category: "Navigation",
    title: "Student Dashboard",
    subtitle: "Candidate workspace, academic snapshot, and counseling hub",
    icon: Compass,
    action: (navigate) => navigate("/dashboard"),
  },
  {
    id: "nav-profile",
    category: "Navigation",
    title: "Academic Profile & Cutoff Gauge",
    subtitle: "Target branch compatibility gauge, category docs, and parent view mode",
    icon: Compass,
    action: (navigate) => navigate("/profile"),
  },
  {
    id: "nav-about",
    category: "Navigation",
    title: "About Campus Mitra",
    subtitle: "System architecture, full-stack RAG pipeline, and FYP 2026 capstone credits",
    icon: Compass,
    action: (navigate) => navigate("/about"),
  },
  {
    id: "nav-admin",
    category: "Navigation",
    title: "Admin Control Center",
    subtitle: "Admissions oversight, candidate callback queue, and inquiries management",
    icon: Compass,
    action: (navigate) => navigate("/admin"),
  },
  {
    id: "nav-analytics",
    category: "Navigation",
    title: "Analytics & Telemetry Hub",
    subtitle: "Multi-dimensional charts, branch radar, quota matrix, and export center",
    icon: Compass,
    action: (navigate) => navigate("/admin/analytics"),
  },

  // ── Actions ──
  {
    id: "action-theme",
    category: "Actions",
    title: "Toggle Dark / Light Theme",
    subtitle: "Switch appearance theme between light and high-contrast dark mode",
    icon: Sun,
    action: (navigate, { theme, setTheme }) => {
      setTheme(theme === "dark" ? "light" : "dark");
    },
  },
  {
    id: "action-callback",
    category: "Actions",
    title: "Request Human Counselor Callback",
    subtitle: "Escalate to SBMP admission staff for personal phone guidance",
    icon: PhoneCall,
    action: (navigate) =>
      navigate("/chat", {
        state: {
          initialQuery: "I would like to request an official staff phone callback for admission counseling.",
        },
      }),
  },
];

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter items
  const filteredItems = COMMAND_ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation within list
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const handleSelect = (item) => {
    onClose();
    item.action(navigate, { theme, setTheme });
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="cmd-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-search-row">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search branches, cutoffs, TFWS, admissions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          {query && (
            <button
              type="button"
              className="cmd-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X size={15} />
            </button>
          )}
          <span className="cmd-esc-badge">ESC</span>
        </div>

        <div className="cmd-results">
          {filteredItems.length === 0 ? (
            <div className="cmd-empty">
              <Search size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
              <p>No results found for "{query}"</p>
              <span>Try searching for "Computer", "TFWS", "Minority", or "Cutoff"</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? "cmd-item-selected" : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">
                    <Icon size={17} />
                  </div>
                  <div className="cmd-item-content">
                    <div className="cmd-item-header">
                      <span className="cmd-item-title">{item.title}</span>
                      <span className="cmd-item-cat">{item.category}</span>
                    </div>
                    <span className="cmd-item-sub">{item.subtitle}</span>
                  </div>
                  <ArrowRight size={14} className="cmd-item-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-footer-keys">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Close</span>
          </div>
          <span className="cmd-footer-brand">
            SVKM's SBMP • Campus Mitra
          </span>
        </div>
      </div>
    </div>
  );
}
