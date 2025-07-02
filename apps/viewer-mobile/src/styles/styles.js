import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Home Screen Styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  homeContent: {
    paddingHorizontal: 40,
    paddingBottom: 80,
    alignItems: 'center',
    zIndex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    marginBottom: 8,
    fontWeight: '300',
    textAlign: 'center',
  },
  title: {
    fontSize: 42,
    color: 'white',
    fontWeight: '300',
    letterSpacing: 8,
    marginBottom: 40,
    textAlign: 'center',
  },
  startButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    textAlign: 'center',
  },

  // Quiz Screen Styles
  quizContainer: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#f5f3f0',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  cardCounter: {
    fontSize: 14,
    color: '#666',
  },
  cardScrollContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // Card Styles
  cardContainer: {
    height: 400,
    marginVertical: 20,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#ffffff',
  },
  cardBack: {
    backgroundColor: '#f8f9fa',
  },
  cardText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    fontWeight: '400',
  },
  tapHint: {
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Navigation Styles
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#f5f3f0',
  },
  navButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  navButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
});