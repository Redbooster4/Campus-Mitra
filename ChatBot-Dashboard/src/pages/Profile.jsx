import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import StaggeredMenu from "../components/StaggeredMenu";
import {
  ArrowLeft,
  MessageSquare,
  User,
  GraduationCap,
  Sliders,
  Check,
  Save,
  FileCheck,
  Sparkles,
  Info,
} from "lucide-react";
import styles from "./styles/Profile.module.css";
import { STUDENT_MENU_ITEMS, SOCIAL_ITEMS } from "../constants/navigation";
import SquishSwitch from '../components/SquishSwitch';
import SpotlightCard from '../components/SpotlightCard';

const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati"];
const TONE_OPTIONS = [
  { value: "detailed", title: "Detailed & In-Depth", desc: "Includes cut-off trends, placement stats, and syllabus breakdowns." },
  { value: "concise", title: "Quick & Direct", desc: "Brief answers focused strictly on cut-off numbers and document lists." },
  { value: "mentorship", title: "Step-by-Step Mentorship", desc: "Friendly, roadmap-style advice explaining each CAP round step." },
];

const SBMP_BRANCHES = [
  { name: "Computer Engineering", typicalCutoff: 94 },
  { name: "Information Technology", typicalCutoff: 92 },
  { name: "Artificial Intelligence & Machine Learning", typicalCutoff: 90 },
  { name: "Mechanical Engineering", typicalCutoff: 84 },
  { name: "Civil Engineering", typicalCutoff: 80 },
  { name: "Electrical Engineering", typicalCutoff: 85 },
  { name: "Electronics & Telecommunication", typicalCutoff: 86 },
  { name: "Chemical Engineering", typicalCutoff: 78 },
  { name: "Plastics Engineering", typicalCutoff: 75 },
];

const CATEGORY_DOCUMENTS = {
  "General / Open": "SSC Marksheet, Leaving Certificate (LC), Domicile / Nationality Certificate.",
  "OBC": "Caste Certificate, Caste Validity Certificate, and valid Non-Creamy Layer (NCL) certificate.",
  "SC": "Caste Certificate and Caste Validity Certificate issued by Maharashtra Social Welfare Dept.",
  "ST": "Caste Certificate and Scrutiny Tribe Validity Certificate issued by Tribal Development Dept.",
  "EWS": "Eligibility Certificate for Economically Weaker Section (EWS) issued by competent revenue authority.",
  "TFWS": "Family Income Certificate below Rs. 8 Lakhs/year issued by Sub-Divisional Officer / Tehsildar.",
  "Gujarati Linguistic Minority": "School Leaving Certificate stating Mother Tongue as Gujarati + Maharashtra Domicile.",
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [academicData, setAcademicData] = useState(() => {
    const saved = localStorage.getItem("studentAcademicProfile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.debug(err);
      }
    }
    return {
      sscPercentage: "",
      hscPercentage: "",
      entranceExam: "MHT-CET",
      entrancePercentile: "",
      targetBranch: "Computer Engineering",
      category: "General / Open",
    };
  });

  const [counselingPrefs, setCounselingPrefs] = useState(() => {
    const savedLang =
      user?.preferredLanguage || localStorage.getItem("preferredLanguage") || "English";
    const saved = localStorage.getItem("counselingPreferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, language: savedLang };
      } catch (err) {
        console.error("Failed to parse preferences", err);
      }
    }
    return { language: savedLang, tone: "detailed", targetYear: "2026-2027" };
  });

  const [parentMode, setParentMode] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleAcademicChange = (e) => {
    setAcademicData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSavedStatus(false);
  };

  const handleLanguageSelect = (lang) => {
    setCounselingPrefs((prev) => ({ ...prev, language: lang }));
    localStorage.setItem("preferredLanguage", lang);
    setSavedStatus(false);
  };

  const handleToneSelect = (tone) => {
    setCounselingPrefs((prev) => ({ ...prev, tone }));
    setSavedStatus(false);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchRemoteProfile = async () => {
      try {
        const resp = await api.get("/auth/me");
        if (isMounted && resp.data?.user) {
          const u = resp.data.user;
          setUser((prev) => {
            const updated = { ...(prev || {}), ...u };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
          });
          setAcademicData((prev) => ({
            ...prev,
            targetBranch: u.target_branch || prev.targetBranch || "Computer Engineering",
            entrancePercentile: u.entrance_score || prev.entrancePercentile || "",
            category: u.category || prev.category || "General / Open",
          }));
        }
      } catch (err) {
        console.warn("Could not fetch remote profile:", err);
      }
    };
    if (localStorage.getItem("token")) {
      fetchRemoteProfile();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    localStorage.setItem("studentAcademicProfile", JSON.stringify(academicData));
    localStorage.setItem("counselingPreferences", JSON.stringify(counselingPrefs));
    localStorage.setItem("preferredLanguage", counselingPrefs.language);

    try {
      const resp = await api.put("/auth/profile", {
        target_branch: academicData.targetBranch,
        entrance_score: academicData.entrancePercentile,
        category: academicData.category,
      });
      if (resp.data?.user) {
        const mergedUser = {
          ...user,
          ...resp.data.user,
          preferredLanguage: counselingPrefs.language,
        };
        localStorage.setItem("user", JSON.stringify(mergedUser));
        setUser(mergedUser);
      }
    } catch (err) {
      console.warn("Backend profile sync error, saved locally:", err);
    }

    if (user) {
      const updatedUser = { ...user, preferredLanguage: counselingPrefs.language };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const handleStartCounseling = () => {
    handleSave();
    navigate("/chat", {
      state: {
        initialQuery: `Hi Mitra, I am interested in ${academicData.targetBranch} under the ${academicData.category} category. Can you give me specific cut-offs, fee details, and advice?`,
      },
    });
  };

  const displayName = user?.username || "Student";
  const displayEmail =
    user?.email || `${displayName.toLowerCase().replace(/\s+/g, "")}@student.ac.in`;

  // Compute live match prediction
  const scoreVal =
    parseFloat(academicData.entrancePercentile) ||
    parseFloat(academicData.sscPercentage) ||
    0;
  const branchMeta = SBMP_BRANCHES.find((b) => b.name === academicData.targetBranch);
  const targetCutoff = branchMeta?.typicalCutoff || 85;

  let matchStatus = "Enter score to evaluate";
  let matchBadgeClass = styles.badgeNeutral;
  if (scoreVal > 0) {
    if (scoreVal >= targetCutoff) {
      matchStatus = `High Probability (~${targetCutoff}% Cutoff) - Excellent Match`;
      matchBadgeClass = styles.badgeHigh;
    } else if (scoreVal >= targetCutoff - 5) {
      matchStatus = `Competitive CAP Range (~${targetCutoff}% Cutoff) - Target Round 2/3`;
      matchBadgeClass = styles.badgeMedium;
    } else {
      matchStatus = `Aspirational Reach - Consider TFWS or Lateral Entry options`;
      matchBadgeClass = styles.badgeReach;
    }
  }

  const requiredDocs =
    CATEGORY_DOCUMENTS[academicData.category] || CATEGORY_DOCUMENTS["General / Open"];

  return (
    <div className={styles.profilePage}>
      <StaggeredMenu
        position="left"
        items={STUDENT_MENU_ITEMS}
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
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <section className={styles.profileBanner}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User size={38} />
            </div>
            <div className={styles.userMeta}>
              <h1>{displayName}</h1>
              <p>{displayEmail}</p>
              <span className={styles.userRoleBadge}>
                {user?.role ? String(user.role).toUpperCase() : "STUDENT CANDIDATE"}
              </span>
            </div>
          </div>

          <button className={styles.bannerAction} onClick={handleStartCounseling}>
            <MessageSquare size={18} />
            Consult AI Counselor
          </button>
        </section>

        {/* Parent / Guardian Mode */}
        <div className={styles.parentToggleCard}>
          <div className={styles.parentToggleInfo}>
            <h3>Parent / Guardian View Mode</h3>
            <p>Switch on to inspect FRA fee breakdowns, hostel facilities, and official helpline.</p>
          </div>
          <SquishSwitch
            checked={parentMode}
            onChange={(checked) =>
              setParentMode(
                typeof checked === "boolean" ? checked : Boolean(checked?.target?.checked)
              )
            }
            label="Parent mode"
            trackColor="var(--border)"
            trackOnColor="var(--primary)"
            width={76}
            height={38}
            radius={19}
            speed={50}
            stretch={36}
            hoverScale={1.035}
            colorDuration={320}
            disabled={false}
            thumbColor="var(--muted)"
            thumbOnColor="var(--primary-foreground)"
          />
        </div>

        {parentMode && (
          <section className={styles.parentPanel}>
            <div className={styles.parentRow}>
              <div className={styles.parentBox}>
                <h4>Transparent Fee Breakdown</h4>
                <p>
                  Tuition and developmental fees are strictly regulated by the Fees Regulating Authority (FRA). Full concessions are available for TFWS and EBC categories.
                </p>
              </div>
              <div className={styles.parentBox}>
                <h4>Hostel & Campus Safety</h4>
                <p>
                  24/7 security, separate monitored boys and girls hostels in Vile Parle, biometric campus entry, and regular attendance reports.
                </p>
              </div>
              <div className={styles.parentBox}>
                <h4>Official Admission Desk</h4>
                <p>
                  +91 (022) 4233-6000 (SBMP Admission Office)<br />
                  Office hours: Mon - Sat (9:30 AM to 5:00 PM)
                </p>
              </div>
            </div>
          </section>
        )}

        <div className={styles.grid}>
          {/* Academic Profile */}
          <SpotlightCard className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <GraduationCap size={22} />
              </div>
              <div>
                <h2>Academic Profile & Scores</h2>
                <p>Keep your qualifying examination details up to date for precise cutoff advice</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="sscPercentage">Class 10th (SSC) %</label>
                <input
                  id="sscPercentage"
                  name="sscPercentage"
                  type="text"
                  value={academicData.sscPercentage}
                  onChange={handleAcademicChange}
                  placeholder="e.g. 94.60"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="hscPercentage">Class 12th (HSC) % (Optional)</label>
                <input
                  id="hscPercentage"
                  name="hscPercentage"
                  type="text"
                  value={academicData.hscPercentage}
                  onChange={handleAcademicChange}
                  placeholder="e.g. 88.20"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entranceExam">Entrance Qualification</label>
                <select
                  id="entranceExam"
                  name="entranceExam"
                  value={academicData.entranceExam}
                  onChange={handleAcademicChange}
                >
                  <option value="SSC Merit">10th SSC CAP Merit</option>
                  <option value="MHT-CET">MHT-CET Score</option>
                  <option value="JEE Main">JEE Main Score</option>
                  <option value="Diploma Merit">Direct Second Year (DSE Lateral)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="entrancePercentile">Score / Percentile</label>
                <input
                  id="entrancePercentile"
                  name="entrancePercentile"
                  type="text"
                  value={academicData.entrancePercentile}
                  onChange={handleAcademicChange}
                  placeholder="e.g. 96.42"
                />
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="targetBranch">Target Diploma Branch</label>
                <select
                  id="targetBranch"
                  name="targetBranch"
                  value={academicData.targetBranch}
                  onChange={handleAcademicChange}
                >
                  {SBMP_BRANCHES.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} (Typical Cutoff ~{b.typicalCutoff}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Eligibility Match Gauge */}
              <div className={styles.formGroupFull}>
                <div className={`${styles.predictionCard} ${matchBadgeClass}`}>
                  <Sparkles size={16} />
                  <div>
                    <strong className={styles.predictionTitle}>Cutoff Compatibility:</strong>
                    <span className={styles.predictionText}>{matchStatus}</span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="category">CAP Seat Allocation Category</label>
                <select
                  id="category"
                  name="category"
                  value={academicData.category}
                  onChange={handleAcademicChange}
                >
                  <option value="General / Open">General / Open (Merit Quota)</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Castes)</option>
                  <option value="ST">ST (Scheduled Tribes)</option>
                  <option value="EWS">EWS (Economically Weaker Section - 10% Quota)</option>
                  <option value="TFWS">TFWS (Tuition Fee Waiver Scheme - 100% Tuition Waived)</option>
                  <option value="Gujarati Linguistic Minority">Gujarati Linguistic Minority (SVKM Trust Quota)</option>
                </select>
              </div>

              {/* Required Documents Card */}
              <div className={styles.formGroupFull}>
                <div className={styles.docsRequiredBox}>
                  <FileCheck size={16} className={styles.docsRequiredIcon} />
                  <div>
                    <strong>Mandatory Documents for {academicData.category}:</strong>
                    <p>{requiredDocs}</p>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Counseling Preferences */}
          <SpotlightCard className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Sliders size={22} />
              </div>
              <div>
                <h2>Counseling Preferences</h2>
                <p>Personalize how Mitra interacts and structures advice during chat sessions</p>
              </div>
            </div>

            <div className={styles.formGroupFull}>
              <label>Interaction & Voice Language</label>
              <div className={styles.languagePills}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`${styles.langPill} ${
                      counselingPrefs.language === lang ? styles.langPillActive : ""
                    }`}
                    onClick={() => handleLanguageSelect(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroupFull} style={{ marginTop: 18 }}>
              <label>Counselor Guidance Style</label>
              <div className={styles.toneList}>
                {TONE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`${styles.toneOption} ${
                      counselingPrefs.tone === opt.value ? styles.toneActive : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={opt.value}
                      checked={counselingPrefs.tone === opt.value}
                      onChange={() => handleToneSelect(opt.value)}
                    />
                    <div>
                      <strong>{opt.title}</strong>
                      <span>{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.quickTipsBox}>
              <Info size={16} />
              <span>
                Tip: Mitra is equipped with speech-to-text. Select your preferred language to enable natural voice inquiries on phone and desktop.
              </span>
            </div>
          </SpotlightCard>
        </div>

        <div className={styles.saveBar}>
          {savedStatus && (
            <span className={styles.saveSuccess}>
              <Check size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Profile details successfully synchronized with database
            </span>
          )}
          <button className={styles.saveButton} onClick={handleSave}>
            <Save size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Save Profile & Preferences
          </button>
        </div>
      </main>
    </div>
  );
}
