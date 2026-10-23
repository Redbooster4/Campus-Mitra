import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import api from "@/api/api";
import "./styles/Onboarding.css";

const FIELD_LABELS = {
  language: "Preferred Language",
  journey: "Academic Qualification",
  program: "Target SBMP Program",
  admission_type: "Admission Route",
  timeline: "Application Window",
  source: "Information Source",
};

export default function OnboardingPreview() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const preview = state?.preview || {
    language: localStorage.getItem("preferredLanguage") || "English",
    program: localStorage.getItem("preferredBranch") || "Computer Engineering",
    journey: "Class 10th (SSC / Appearing)",
    admission_type: "CAP / DTE Merit Round",
  };

  const entries = Object.entries(preview).filter(
    ([key, value]) => Boolean(value) && FIELD_LABELS[key]
  );

  const handleComplete = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const updated = {
          ...parsed,
          target_branch: preview.program || parsed.target_branch,
          onboardingCompleted: true,
        };
        localStorage.setItem("user", JSON.stringify(updated));

        await api.put("/auth/profile", {
          target_branch: preview.program || null,
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Could not sync profile completion:", err);
    }

    navigate("/chat", {
      state: {
        initialQuery: preview.program
          ? `I'm interested in the ${preview.program} diploma program. Can you guide me on eligibility, cutoffs, and admissions?`
          : null,
      },
    });
  };

  return (
    <main className="onboarding-wrapper">
      <div className="onboarding-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="onboarding-container">
        <header className="onboarding-header">
          <p className="question-label">Profile Preferences</p>
          <h1>Review Your Academic Profile</h1>
          <p className="progress-label">
            Mitra will use these preferences to personalize your polytechnic counseling.
          </p>
        </header>

        <div className="preview-summary-card">
          {entries.length > 0 ? (
            entries.map(([key, value]) => (
              <div key={key} className="preview-summary-row">
                <span className="preview-summary-label">
                  {FIELD_LABELS[key] || key}
                </span>
                <span className="preview-summary-value">{String(value)}</span>
              </div>
            ))
          ) : (
            <div className="preview-summary-row">
              <span className="preview-summary-label">Preferred Branch</span>
              <span className="preview-summary-value">Engineering Diploma</span>
            </div>
          )}
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="preview-button"
            onClick={handleComplete}
          >
            Start Counseling with Mitra
          </button>
          <button
            type="button"
            className="preview-secondary-button"
            onClick={() => navigate("/onboarding")}
          >
            Edit Preferences
          </button>
        </div>
      </div>
    </main>
  );
}
