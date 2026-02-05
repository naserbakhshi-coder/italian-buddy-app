import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

/**
 * Flashcard component with flip animation
 * Matches the app's teal/peach color scheme
 *
 * @param {Object} props
 * @param {Object} props.word - Word object from API with word, translation, category, etc.
 * @param {Function} props.onKnow - Called when user knows the word
 * @param {Function} props.onDontKnow - Called when user doesn't know
 */
const Flashcard = ({ word, onKnow, onDontKnow }) => {
  const [flipped, setFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  // Reset flip state when word changes
  useEffect(() => {
    setFlipped(false);
    flipAnimation.setValue(0);
  }, [word?.id]);

  const handleFlip = () => {
    if (!flipped) {
      // Flip to back
      Animated.spring(flipAnimation, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setFlipped(true);
    } else {
      // Flip to front
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
      setFlipped(false);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  if (!word) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Flashcard */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFlip}
        style={styles.cardContainer}
      >
        {/* Front of card */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          {word.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{word.category}</Text>
            </View>
          )}
          <Text style={styles.wordText}>{word.word}</Text>
          <Text style={styles.tapHint}>Tap to reveal translation</Text>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.translationLabel}>Translation:</Text>
          <Text style={styles.translationText}>{word.translation}</Text>

          {word.example_italian && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <Text style={styles.exampleItalian}>{word.example_italian}</Text>
              {word.example_english && (
                <Text style={styles.exampleEnglish}>{word.example_english}</Text>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Action buttons - only show when flipped */}
      {flipped && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.dontKnowButton]}
            onPress={onDontKnow}
          >
            <Text style={styles.buttonIcon}>✗</Text>
            <Text style={styles.buttonText}>Need Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.knowButton]}
            onPress={onKnow}
          >
            <Text style={styles.buttonIcon}>✓</Text>
            <Text style={styles.buttonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      )}

      {!flipped && (
        <Text style={styles.instructionText}>
          Tap the card to see the translation
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    height: 340,
    maxWidth: 500,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#F4D5B8',
  },
  cardFront: {
    backgroundColor: '#4A5C5E',
  },
  cardBack: {
    backgroundColor: '#3F5456',
  },
  categoryBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(244, 213, 184, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4D5B8',
  },
  categoryText: {
    color: '#F4D5B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  wordText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tapHint: {
    position: 'absolute',
    bottom: 24,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  translationLabel: {
    fontSize: 14,
    color: '#F4D5B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
  },
  translationText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(244, 213, 184, 0.1)',
    borderRadius: 12,
    width: '100%',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#F4D5B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  exampleItalian: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  exampleEnglish: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 16,
    width: '100%',
    maxWidth: 500,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dontKnowButton: {
    backgroundColor: '#E74C3C',
  },
  knowButton: {
    backgroundColor: '#2ECC71',
  },
  buttonIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructionText: {
    marginTop: 30,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default Flashcard;
