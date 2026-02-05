import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import Flashcard from '../components/Flashcard';
import api from '../services/api';

const VocabularyScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadVocabulary();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadVocabulary = async () => {
    try {
      setIsLoading(true);
      const dueWords = await api.getVocabularyDue('demo-user');

      if (dueWords.length === 0) {
        // No words yet, seed some vocabulary
        await api.seedVocabulary('demo-user', 20);
        const newWords = await api.getVocabularyDue('demo-user');
        setWords(newWords);
      } else {
        setWords(dueWords);
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      Alert.alert(
        'Error',
        'Could not load vocabulary. Make sure the backend is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnow = async () => {
    if (isReviewing) return;

    const currentWord = words[currentIndex];
    setIsReviewing(true);

    try {
      await api.reviewVocabulary(currentWord.id, true);
      moveToNextWord();
    } catch (error) {
      console.error('Error reviewing vocabulary:', error);
      Alert.alert('Error', 'Could not save your progress');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDontKnow = async () => {
    if (isReviewing) return;

    const currentWord = words[currentIndex];
    setIsReviewing(true);

    try {
      await api.reviewVocabulary(currentWord.id, false);
      moveToNextWord();
    } catch (error) {
      console.error('Error reviewing vocabulary:', error);
      Alert.alert('Error', 'Could not save your progress');
    } finally {
      setIsReviewing(false);
    }
  };

  const moveToNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all words
      Alert.alert(
        'Great Job!',
        `You've reviewed ${words.length} words today. Come back tomorrow for more!`,
        [
          {
            text: 'Review Again',
            onPress: () => {
              setCurrentIndex(0);
              loadVocabulary();
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F4D5B8" />
        <Text style={styles.loadingText}>Loading your vocabulary...</Text>
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vocabulary Practice</Text>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Words to Review</Text>
          <Text style={styles.emptyText}>
            All caught up! Come back tomorrow for more vocabulary practice.
          </Text>
          <TouchableOpacity style={styles.reloadButton} onPress={loadVocabulary}>
            <Text style={styles.reloadButtonText}>Load More Words</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Vocabulary Practice</Text>
            <Text style={styles.headerSubtitle}>
              Card {currentIndex + 1} of {words.length}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statsNumber}>{words.length - currentIndex}</Text>
            <Text style={styles.statsLabel}>remaining</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((currentIndex + 1) / words.length) * 100}%` },
          ]}
        />
      </View>

      {/* Flashcard - pass word object directly */}
      <Flashcard
        word={currentWord}
        onKnow={handleKnow}
        onDontKnow={handleDontKnow}
      />

      {isReviewing && (
        <View style={styles.reviewingOverlay}>
          <ActivityIndicator size="small" color="#F4D5B8" />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F5456',
  },
  header: {
    backgroundColor: '#4A5C5E',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#F4D5B8',
  },
  backButton: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#F4D5B8',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F5456',
  },
  statsLabel: {
    fontSize: 11,
    color: '#3F5456',
    marginTop: 2,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(244, 213, 184, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F4D5B8',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#3F5456',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  reloadButton: {
    backgroundColor: '#F4D5B8',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  reloadButtonText: {
    color: '#3F5456',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewingOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});

export default VocabularyScreen;
