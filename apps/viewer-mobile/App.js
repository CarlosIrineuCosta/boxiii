import { useState } from 'react';
import { View, StatusBar } from 'react-native';
import HomeScreen from './src/components/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import triviaData from './src/data/trivia.json';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTopic] = useState(triviaData.topics[0]);

  const startQuiz = () => {
    setCurrentScreen('quiz');
  };

  const goHome = () => {
    setCurrentScreen('home');
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {currentScreen === 'home' ? (
        <HomeScreen onStart={startQuiz} />
      ) : (
        <QuizScreen topic={selectedTopic} onBack={goHome} />
      )}
    </View>
  );
}