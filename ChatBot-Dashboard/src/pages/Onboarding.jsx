import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const QUESTIONS = [
  {
    key: 'qualification',
    label: 'Where are you in your education journey?',
    options: ['10th / SSC', '12th / HSC', 'ITI', 'Other'],
  },
  {
    key: 'department',
    label: 'Which program are you exploring?',
    options: [
      'Information Technology',
      'Computer Engineering',
      'Mechanical',
      'Civil',
      'Plastic Engineering',
      'Chemical Engineering',
      'Other',
    ],
  },
  {
    key: 'goal',
    label: 'What field interests you most?',
    options: ['Engineering & Innovation', 'Arts', 'Commerce', 'Other'],
  },
  {
    key: 'timeline',
    label: 'When are you hoping to start?',
    options: [
      'Immediately',
      'Within a year',
      'Just exploring for now',
    ],
  },
  {
    key: 'source',
    label: 'How did you hear about us?',
    options: [
      'Friend or family',
      'School counselor',
      'Social media',
      'Search engine',
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [selections, setSelections] = useState({
    qualification: '',
    department: '',
    goal: '',
    timeline: '',
    source: '',
  });

  const current = QUESTIONS[step];

  const progress = Math.round(
    ((step + 1) / QUESTIONS.length) * 100
  );

  const handleSelect = (value) => {
    const updated = {
      ...selections,
      [current.key]: value,
    };

    setSelections(updated);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(
        'chatContext',
        JSON.stringify(updated)
      );

      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 3,
            p: {
              xs: 3,
              sm: 5,
            },
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              mb: 4,
              color: '#1e293b',
              fontSize: {
                xs: '1.7rem',
                sm: '2rem',
              },
            }}
          >
            Let's get to know you a bit better so our AI
            Counselor can assist you perfectly.
          </Typography>

          {/* Progress */}
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              Question {step + 1} of {QUESTIONS.length}
            </Typography>
          </Box>

          {/* Question */}
          <Box>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 2.5,
                color: '#334155',
              }}
            >
              {current.label}
            </Typography>

            {/* Options */}
            <Stack spacing={1.5}>
              {current.options.map((option) => {
                const isSelected =
                  selections[current.key] === option;

                return (
                  <Button
                    key={option}
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() => handleSelect(option)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: isSelected ? 600 : 500,
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      borderWidth: 1.5,

                      color: isSelected
                        ? 'primary.main'
                        : '#334155',

                      borderColor: isSelected
                        ? 'primary.main'
                        : '#cbd5e1',

                      bgcolor: isSelected
                        ? 'rgba(25, 118, 210, 0.08)'
                        : '#ffffff',

                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(25, 118, 210, 0.05)',
                      },
                    }}
                  >
                    {option}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Back Button */}
          {step > 0 && (
            <Button
              type="button"
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                mt: 3,
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              Back
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}