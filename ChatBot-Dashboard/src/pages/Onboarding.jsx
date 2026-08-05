import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {MoveRight} from 'lucide-react';
import './Onboarding.css';

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

// const [selections, setSelections] = useState({
//   qualification: 'graduate',
//   department: 'design',
//   goal: 'exploring',
//   timeline: 'year',
//   source: 'family',
// });
const QUESTIONS = [
  {
    key:'qualification',
    label:'Where are you in your education journey?',
    options:['10th/SSC', '12th/HSC', 'ITI', 'Other'],
  },
  {
    key:'department',
    label:'Which program are you exploring?',
    options:['Information Technology', 'Computer Engineering', 'Mechanical', 'Civil', 'Plastic Engineering', 'Chemical Engineering', 'Other'],
  },
  {
    key: 'goal',
    label: 'What field interests you most?',
    options: ['Engineering & Innovation', 'Arts', 'Commerce', 'Other'],
  },
  {
    key: 'timeline',
    label: 'When are you hoping to start?',
    options: [],
  },
  {
    key: 'source',
    label: 'How did you hear about us?',
    options: [],
  },
];
export default function Onboarding() {
  const navigate = useNavigate();
  const [selections, setSelections]=useState({ 
    qualification: '', 
    department: '', 
    goal: '',
    timeline: '',
    source: ''
  });
  const handleChange=(key, value)=>{
    setSelections(prev=>({ ...prev, [key]: value }));
  };
  const handleSubmit=(e)=>{
    e.preventDefault();
    localStorage.setItem('chatContext', JSON.stringify(selections));
    navigate('/dashboard');
  };
  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-container">
        <h1 className="onboarding-header">
          Let's get to know you a bit better so our AI Counselor can assist you perfectly.
        </h1>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {QUESTIONS.map(q => (
            <label key={q.key} className="question-row">
              <span>{q.label}</span>
              <select
                value={selections[q.key]}
                onChange={(e) => handleChange(q.key, e.target.value)}
                required>
                <option value="" disabled>Select an option…</option>
                {q.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          ))}

          <button type="submit">Continue to Dashboard<MoveRight/></button>
        </form>
      </div>
    </div>
  );
}