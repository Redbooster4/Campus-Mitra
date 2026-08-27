import { useLocation, useNavigate } from "react-router-dom";
import "./Onboarding.css";

export default function OnboardingPreview() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const preview = state?.preview;
  const displayVal =
    typeof preview === "object" && preview !== null
      ? JSON.stringify(preview, null, 2)
      : "";

  return (
    <main className="onboarding-wrapper">
      <div className="onboarding-container">
        <h1 className="onboarding-header">Your Answers</h1>

        <textarea
          className="preview-textarea"
          value={displayVal}
          readOnly
          rows={7}
          placeholder="Your preview will appear here..."
        />

        <button
          className="preview-button"
          onClick={() => navigate("/chatbot")}
        >
          Navigate to ChatBot
        </button>
      </div>
    </main>
  );
}