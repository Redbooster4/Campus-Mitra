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

// Where are you in your education journey ?
// High school graduate
// Which program are you exploring ?
// Still exploring 
// What field interests you most?
// Design & Arts
// When are you hoping to start?
// Within a year
// How did you hear about us?
// Friend or family

const items = [
  {
    name:"journey",
    required:false,
    prompt:"Where are you in your education journey?",
    description:"Tell us where you are right now.",
    choices:[
      { value:"high-school", label:"High school" },
      { value:"high-school-graduate", label:"High school graduate" },
      { value:"diploma", label:"Diploma" },
      { value:"undergraduate", label:"Undergraduate" },
    ],
  },
  {
    name:"program",
    required:false,
    prompt:"Which program are you exploring?",
    description:"Choose the type of program you're interested in.",
    choices:[
      { value:"exploring", label:"Still exploring" },
      { value:"diploma", label:"Diploma" },
      { value:"undergraduate", label:"Undergraduate" },
      { value:"postgraduate", label:"Postgraduate" },
    ],
  },
  {
    name:"field",
    required:false,
    prompt:"What field interests you most?",
    description:"Pick the area you'd like to explore.",
    choices:[
      { value:"technology", label:"Technology" },
      { value:"business", label:"Business" },
      { value:"design-arts", label:"Design & Arts" },
      { value:"science", label:"Science" },
    ],
  },
  {
    name:"start",
    required:false,
    prompt:"When are you hoping to start?",
    description:"Let us know your preferred timeline.",
    choices:[
      { value:"asap", label:"ASAP" },
      { value:"6-months", label:"Within 6 months" },
      { value:"year", label:"Within a year" },
      { value:"exploring", label:"Just exploring" },
    ],
  },
  {
    name:"source",
    required:false,
    prompt:"How did you hear about us?",
    description:"Help us understand how you found us.",
    choices:[
      { value:"friend-family", label:"Friend or family" },
      { value:"social-media", label:"Social media" },
      { value:"google", label:"Google" },
      { value:"other", label:"Other" },
    ],
  },
];

export default function Onboarding(){
  const location = useLocation();
  const isCounselorFlow = location.pathname.includes("counselor");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    //console.log("Form submitted!"); 
    const answers = new FormData(event.currentTarget);
    const formDataObj = Object.fromEntries(answers.entries());
    //console.log("Captured Answers:", formDataObj);
    navigate("/preview", {state: {preview: formDataObj}});
  }

  return(
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-50">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-400">
            {isCounselorFlow ? "Counselor onboarding" :"Student onboarding"}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Tell us a bit more about your goals
          </h1>
        </div>

        <Questionnaire items={items} onSubmit={handleSubmit}>
          <QuestionnaireProgress />
          {items.map((question) => (
            <QuestionnaireItem
              key={question.name}
              name={question.name}
              required={question.required}
            >
              <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
              <QuestionnaireDescription>
                {question.description}
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {question.choices.map((choice) => (
                  <QuestionnaireChoice key={choice.value} value={choice.value}>
                    <span className="font-medium">{choice.label}</span>
                    {"description" in choice ? (
                      <span className="text-muted-foreground">
                        {choice.description}
                      </span>
                    ) : null}
                  </QuestionnaireChoice>
                ))}
                {"input" in question ? (
                  <QuestionnaireInput
                    aria-label={question.input.label}
                    placeholder={question.input.placeholder}
                  />
                ) : null}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
          ))}
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit />
          </QuestionnaireActions>
        </Questionnaire>
      </div>
    </main>
  );
}