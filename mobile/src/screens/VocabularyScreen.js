import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Flashcard from '../components/Flashcard';
import api from '../services/api';

const VocabularyScreen = () => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadVocabulary();
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your vocabulary...</Text>
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No Words to Review</Text>
        <Text style={styles.emptyText}>
          All caught up! Come back tomorrow for more vocabulary practice.
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadVocabulary}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vocabulary Practice 📖</Text>
        <Text style={styles.headerSubtitle}>
          Card {currentIndex + 1} of {words.length}
        </Text>
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

      {/* Flashcard */}
      <Flashcard
        word={currentWord.word}
        translation={currentWord.translation}
        exampleItalian={currentWord.example_italian}
        exampleEnglish={currentWord.example_english}
        onKnow={handleKnow}
        onDontKnow={handleDontKnow}
      />

      {isReviewing && (
        <View style={styles.reviewingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#34C759',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0F5E8',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  reloadButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewingOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});

export default VocabularyScreen;
