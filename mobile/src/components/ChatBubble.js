import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GrammarHighlight from './GrammarHighlight';

/**
 * Chat message bubble component
 * @param {Object} props
 * @param {string} props.message - Message text
 * @param {boolean} props.isUser - Whether message is from user
 * @param {Object} props.grammarCorrections - Grammar corrections (if any)
 * @param {Function} props.onGrammarPress - Callback when grammar correction is tapped
 */
const ChatBubble = ({ message, isUser, grammarCorrections, onGrammarPress }) => {
  const hasErrors = grammarCorrections && grammarCorrections.errors && grammarCorrections.errors.length > 0;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message}
        </Text>
      </View>

      {/* Show grammar corrections below user messages */}
      {isUser && hasErrors && (
        <View style={styles.grammarContainer}>
          <GrammarHighlight
            corrections={grammarCorrections.errors}
            onPress={onGrammarPress}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#F4D5B8', // Peach accent for user messages
  },
  aiBubble: {
    backgroundColor: '#4A5C5E', // Medium teal for AI messages
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#3F5456', // Dark teal text on peach background
  },
  aiText: {
    color: '#FFFFFF', // White text on teal background
  },
  grammarContainer: {
    marginTop: 8,
    marginLeft: 8,
  },
});

export default ChatBubble;
