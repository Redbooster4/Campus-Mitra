import { useLocation, useNavigate } from "react-router-dom"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import ThemeToggle from "@/components/ThemeToggle"
import api from "@/api/api"
import "./styles/Onboarding.css"

const items = [
  {
    name: "language",
    required: false,
    prompt: "What is your preferred language?",
    description: "Choose your primary language for counseling with Mitra.",
    choices: [
      { value: "English", label: "English" },
      { value: "Hindi", label: "Hindi (हिंदी)" },
      { value: "Marathi", label: "Marathi (मराठी)" },
      { value: "Gujarati", label: "Gujarati (ગુજરાતી)" },
    ],
  },
  {
    name: "journey",
    required: false,
    prompt: "What is your current academic qualification?",
    description: "Help us determine your diploma eligibility and entry stage.",
    choices: [
      { value: "Class 10th (SSC / Appearing)", label: "Class 10th (SSC / Appearing)" },
      { value: "Class 12th (HSC Science / MCVC)", label: "Class 12th Science / MCVC" },
      { value: "ITI / Technical Certificate", label: "ITI / Technical Trade Certificate" },
      { value: "Parent / Guardian Inquiry", label: "Parent / Guardian seeking admission guidance" },
    ],
  },
  {
    name: "program",
    required: false,
    prompt: "Which SBMP engineering diploma interests you?",
    description: "Select your target diploma program at Shri Bhagubhai Mafatlal Polytechnic.",
    choices: [
      { value: "Computer Engineering", label: "Computer Engineering" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Artificial Intelligence & Machine Learning", label: "Artificial Intelligence & Machine Learning" },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Civil Engineering", label: "Civil Engineering" },
      { value: "Electrical Engineering", label: "Electrical Engineering" },
    ],
  },
  {
    name: "admission_type",
    required: false,
    prompt: "Which admission route are you exploring?",
    description: "Select your intended admission quota or process.",
    choices: [
      { value: "CAP / DTE Merit Round", label: "CAP Centralized Merit Round (DTE Maharashtra)" },
      { value: "Direct Second Year (Lateral Entry)", label: "Direct Second Year Lateral Entry (DSE)" },
      { value: "Institutional / Minority Quota", label: "Institutional / Linguistic Minority Quota" },
      { value: "General Cutoff & Fee Inquiry", label: "General Cutoff & Fee Inquiry" },
    ],
  },
  {
    name: "timeline",
    required: false,
    prompt: "When do you plan to apply?",
    description: "Let us know your target admission window.",
    choices: [
      { value: "Upcoming Academic Year", label: "Upcoming Academic Year Admissions" },
      { value: "Direct Lateral Entry Window", label: "Direct Lateral Entry Window" },
      { value: "Researching Options", label: "Currently exploring branch eligibility & cutoffs" },
    ],
  },
  {
    name: "source",
    required: false,
    prompt: "How did you hear about SVKM's SBMP?",
    description: "Help us understand how you found Campus Mitra.",
    choices: [
      { value: "School / College Counselor", label: "School / College Guidance Counselor" },
      { value: "SVKM Alumni / Current Student", label: "SVKM Alumni or Current Student" },
      { value: "DTE Maharashtra Portal", label: "DTE Maharashtra Admission Portal" },
      { value: "Campus Visit / Website", label: "Campus Visit or Official Website" },
    ],
  },
];

export default function Onboarding(){
  const location = useLocation();
  const isCounselorFlow = location.pathname.includes("counselor");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const answers = new FormData(event.currentTarget);
    const formDataObj = Object.fromEntries(answers.entries());
    
    if (formDataObj.language) {
      localStorage.setItem("preferredLanguage", formDataObj.language);
    }
    if (formDataObj.program) {
      localStorage.setItem("preferredBranch", formDataObj.program);
    }
    
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = {
          ...parsedUser,
          target_branch: formDataObj.program || parsedUser.target_branch,
          onboardingCompleted: true,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        await api.put("/auth/profile", {
          target_branch: formDataObj.program || null,
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Could not sync profile during onboarding:", e);
    }
    
    navigate("/preview", { state: { preview: formDataObj } });
  }

  return (
  <main className="onboarding-wrapper">
    <div className="onboarding-theme-toggle">
      <ThemeToggle />
    </div>
    <div className="onboarding-container">
      <header className="onboarding-header">
        <p className="question-label">
          {isCounselorFlow ? "Counselor onboarding" : "Student onboarding"}
        </p>
        <h1>Tell us a bit more about your goals</h1>
      </header>

      <Questionnaire items={items} onSubmit={handleSubmit}>
        <QuestionnaireProgress />

        {items.map((question) => (
          <QuestionnaireItem
            key={question.name}
            name={question.name}
            required={question.required}>
            <QuestionnaireTitle>
              {question.prompt}
            </QuestionnaireTitle>

            <QuestionnaireDescription>
              {question.description}
            </QuestionnaireDescription>

            <QuestionnaireChoices>
              {question.choices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  <span className="option-label">{choice.label}</span>

                  {"description" in choice && (
                    <span className="option-description">
                      {choice.description}
                    </span>
                  )}
                </QuestionnaireChoice>
              ))}

              {"input" in question && (
                <QuestionnaireInput
                  aria-label={question.input.label}
                  placeholder={question.input.placeholder}
                />
              )}
            </QuestionnaireChoices>
            <QuestionnaireError className="error-msg"/>
          </QuestionnaireItem>
        ))}

        <QuestionnaireActions>
          <QuestionnairePrevious className="back-btn"/>
          <QuestionnaireSkip className="skip-btn"/>
          <QuestionnaireNext className="next-btn"/>
          <QuestionnaireSubmit className="submit-btn next-btn"/>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  </main>
);
}