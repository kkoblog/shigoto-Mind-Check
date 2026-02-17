import React, { useState } from 'react';
import Layout from './components/Layout';
import WelcomeScreen from './components/WelcomeScreen';
import QuickCheckScreen from './components/QuickCheckScreen';
import DeepDiveOptInScreen from './components/DeepDiveOptInScreen';
import MainCheckScreen from './components/MainCheckScreen';
import ResultScreen from './components/ResultScreen';
import { ScreenName, Answers } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [answers, setAnswers] = useState<Answers>({
    quickCheck: {},
    mainCheck: {},
    freeText: '',
    deepDiveOptIn: false,
  });

  const handleStart = () => {
    setCurrentScreen(ScreenName.QUICK_CHECK);
  };

  const handleQuickCheckComplete = (quickAnswers: Record<string, boolean>) => {
    setAnswers(prev => ({ ...prev, quickCheck: quickAnswers }));
    setCurrentScreen(ScreenName.DEEP_DIVE_OPTIN);
  };

  const handleDeepDiveChoice = (optIn: boolean) => {
    setAnswers(prev => ({ ...prev, deepDiveOptIn: optIn }));
    if (optIn) {
      setCurrentScreen(ScreenName.MAIN_CHECK);
    } else {
      setCurrentScreen(ScreenName.RESULT);
    }
  };

  const handleMainCheckComplete = (mainAnswers: Record<string, number>, freeText: string) => {
    setAnswers(prev => ({ ...prev, mainCheck: mainAnswers, freeText }));
    setCurrentScreen(ScreenName.RESULT);
  };

  return (
    <Layout>
      {currentScreen === ScreenName.WELCOME && (
        <WelcomeScreen onStart={handleStart} />
      )}
      {currentScreen === ScreenName.QUICK_CHECK && (
        <QuickCheckScreen onComplete={handleQuickCheckComplete} />
      )}
      {currentScreen === ScreenName.DEEP_DIVE_OPTIN && (
        <DeepDiveOptInScreen onChoice={handleDeepDiveChoice} />
      )}
      {currentScreen === ScreenName.MAIN_CHECK && (
        <MainCheckScreen onComplete={handleMainCheckComplete} />
      )}
      {currentScreen === ScreenName.RESULT && (
        <ResultScreen answers={answers} />
      )}
    </Layout>
  );
}

export default App;
