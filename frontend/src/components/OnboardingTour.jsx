import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../context/AuthContext';

export default function OnboardingTour() {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already completed the tour
    const hasCompletedTour = localStorage.getItem('messwala_tour_completed');
    if (!hasCompletedTour && user) {
      // Delay slightly to let the UI mount
      setTimeout(() => setRun(true), 1500);
    }
  }, [user]);

  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className='text-xl font-bold mb-2'>Welcome to MessWala! 🎊</h2>
          <p>
            Let's take a quick tour to help you get the most out of your completely transparent mess
            management system.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#nav-dashboard',
      content:
        "Your Dashboard gives you a bird's-eye view of everything happening today, spanning attendance to total expenses.",
    },
    {
      target: '#nav-attendance',
      content:
        'Mark your meals efficiently. Skipping a meal? Mark it absent to help us stop food wastage!',
    },
    {
      target: '#nav-expenses',
      content:
        'True Transparency! Track exactly how every single rupee is spent by the committee in real-time.',
    },
    {
      target: '#nav-feedback',
      content: 'Rate your meals and help us serve better food. Your voice actually matters here!',
    },
    {
      target: '#nav-tasks',
      content: 'See exactly what the committee is fixing or buying. Hold management accountable.',
    },
    {
      target: '#dark-mode-toggle',
      content: 'Burning the midnight oil? Switch into our beautiful Dark Mode instantly!',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('messwala_tour_completed', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#f59e0b', // amber-500
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
        },
        buttonClose: {
          display: 'none',
        },
        buttonNext: {
          backgroundColor: '#f59e0b',
          borderRadius: '8px',
          color: '#fff',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '12px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '14px',
        },
      }}
    />
  );
}
