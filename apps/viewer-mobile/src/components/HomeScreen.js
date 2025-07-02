import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { styles } from '../styles/styles';

const HomeScreen = ({ onStart }) => (
  <View style={styles.homeContainer}>
    <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" />
    
    {/* Background with zen imagery */}
    <ImageBackground
      source={{ uri: 'https://your-zen-image-url.com/torii.jpg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={styles.homeContent}>
        <Text style={styles.subtitle}>CONTEXTUALIZE YOUR TOPIC</Text>
        <Text style={styles.title}>ZEN QUIZ</Text>
        
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={onStart}
          activeOpacity={0.7}
        >
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  </View>
);

export default HomeScreen;