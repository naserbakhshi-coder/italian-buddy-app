import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

/**
 * Flashcard component with flip animation
 * @param {Object} props
 * @param {string} props.word - Italian word
 * @param {string} props.translation - English translation
 * @param {string} props.exampleItalian - Example sentence in Italian
 * @param {string} props.exampleEnglish - Example sentence in English
 * @param {Function} props.onKnow - Called when user knows the word
 * @param {Function} props.onDontKnow - Called when user doesn't know
 */
const Flashcard = ({
  word,
  translation,
  exampleItalian,
  exampleEnglish,
  onKnow,
  onDontKnow,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

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
          <Text style={styles.wordText}>{word}</Text>
          <Text style={styles.tapHint}>Tap to reveal</Text>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.translationLabel}>Translation:</Text>
          <Text style={styles.translationText}>{translation}</Text>

          {exampleItalian && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <Text style={styles.exampleItalian}>{exampleItalian}</Text>
              {exampleEnglish && (
                <Text style={styles.exampleEnglish}>{exampleEnglish}</Text>
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
            <Text style={styles.buttonText}>Don't Know</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.knowButton]}
            onPress={onKnow}
          >
            <Text style={styles.buttonIcon}>✓</Text>
            <Text style={styles.buttonText}>I Know This</Text>
          </TouchableOpacity>
        </View>
      )}

      {!flipped && (
        <Text style={styles.instructionText}>
          Tap the card to see the translation and example
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
    height: 400,
    maxWidth: 500,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: '#007AFF',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
  },
  wordText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  tapHint: {
    fontSize: 14,
    color: '#E0E0E0',
    fontStyle: 'italic',
  },
  translationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  translationText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  exampleContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    width: '100%',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  exampleItalian: {
    fontSize: 16,
    color: '#007AFF',
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#999',
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
    borderRadius: 12,
    gap: 8,
  },
  dontKnowButton: {
    backgroundColor: '#FF3B30',
  },
  knowButton: {
    backgroundColor: '#34C759',
  },
  buttonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionText: {
    marginTop: 30,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Flashcard;
