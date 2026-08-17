import { useLocation, useNavigate } from "react-router-dom";
import "./Onboarding.css";

export default function OnboardingPreview() {
  const navigate = useNavigate();
  const location=useLocation();
  const preview=location.state?.preview;
  const displayVal=typeof preview === "object"&&preview!==null
  ? JSON.stringify(preview, null, 2): "";

  function handleClick(){
    navigate("/chatbot");
  } 

  return (
    <main className="onboarding-wrapper">
      <div className="onboarding-container">
        <h1 className="onboarding-header">
          Your Answers: 
        </h1>
        <textarea
          className="preview-textarea"
          value={displayVal}
          readOnly
          rows={7}
          placeholder="Your preview will appear here..."
        />
        <button 
            className="items-center font-semibold py-2 rounded-xl transition duration-200 mb-8"
            style={{ background: "#594bf9", color: "#EEEDFE" }}
            onMouseEnter={e => e.target.style.background="#776bfc"}
            onMouseLeave={e => e.target.style.background="#594bf9"}
            onClick={handleClick}>
            Navigate to ChatBot
        </button>
      </div>
    </main>
  );
}