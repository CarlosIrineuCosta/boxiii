import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Card from '../components/Card';
import { styles } from '../styles/styles';

const QuizScreen = ({ topic, onBack }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const cards = topic.cards;

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <View style={styles.quizContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f3f0" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <Text style={styles.cardCounter}>
          {currentCardIndex + 1} / {cards.length}
        </Text>
      </View>

      {/* Card Container */}
      <ScrollView contentContainerStyle={styles.cardScrollContainer}>
        <Card
          question={cards[currentCardIndex].question}
          answer={cards[currentCardIndex].answer}
        />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
          onPress={prevCard}
          disabled={currentCardIndex === 0}
        >
          <Text style={[styles.navButtonText, currentCardIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentCardIndex === cards.length - 1 && styles.navButtonDisabled]}
          onPress={nextCard}
          disabled={currentCardIndex === cards.length - 1}
        >
          <Text style={[styles.navButtonText, currentCardIndex === cards.length - 1 && styles.navButtonTextDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuizScreen;