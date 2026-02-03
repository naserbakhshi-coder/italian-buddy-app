import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import api from '../services/api';

const ScenarioScreen = ({ navigation }) => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingScenarios, setIsFetchingScenarios] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const scenariosList = await api.getScenarios();
        setScenarios(scenariosList);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
        Alert.alert(
          'Connection Error',
          'Could not load scenarios. Make sure the backend is running.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsFetchingScenarios(false);
      }
    };

    fetchScenarios();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && selectedScenario) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, selectedScenario]);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setConversationHistory([]);
    setMessages([
      {
        id: '0',
        text: scenario.openingLine,
        isUser: false,
      },
    ]);
  };

  const handleBack = () => {
    setSelectedScenario(null);
    setMessages([]);
    setConversationHistory([]);
    setInputText('');
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedScenario) {
      return;
    }

    const userMessage = inputText.trim();
    const userMessageObj = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessageObj]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send to backend
      const response = await api.sendScenarioMessage(
        selectedScenario.id,
        userMessage,
        conversationHistory
      );

      // Update conversation history for AI context
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.response },
      ];
      setConversationHistory(newHistory);

      // Update user message with grammar corrections if any
      if (response.grammarCorrections) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessageObj.id
              ? { ...msg, grammarCorrections: response.grammarCorrections }
              : msg
          )
        );
      }

      // Add AI response
      const aiMessageObj = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessageObj]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Connection Error',
        error.message || 'Could not connect to the server. Make sure the backend is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Count user messages for stats
  const userMessageCount = messages.filter((m) => m.isUser).length;

  // Render scenario list view
  if (!selectedScenario) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎭 Scenario Practice</Text>
          <Text style={styles.headerSubtitle}>
            Choose a real-life situation to practice
          </Text>
        </View>

        {/* Scenarios list */}
        <ScrollView style={styles.scenariosContainer} contentContainerStyle={styles.scenariosContent}>
          {isFetchingScenarios ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading scenarios...</Text>
            </View>
          ) : (
            scenarios.map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={styles.scenarioCard}
                onPress={() => handleScenarioSelect(scenario)}
                activeOpacity={0.7}
              >
                <View style={styles.scenarioHeader}>
                  <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                  <View style={styles.scenarioTitleContainer}>
                    <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                    <Text style={styles.scenarioDifficulty}>
                      {scenario.difficulty === 'beginner' ? '⭐ Beginner' : '⭐⭐ Intermediate'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                <View style={styles.objectivesContainer}>
                  <Text style={styles.objectivesTitle}>Goals:</Text>
                  {scenario.objectives.slice(0, 2).map((obj, idx) => (
                    <Text key={idx} style={styles.objectiveItem}>
                      • {obj}
                    </Text>
                  ))}
                  {scenario.objectives.length > 2 && (
                    <Text style={styles.objectiveMore}>
                      +{scenario.objectives.length - 2} more
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    );
  }

  // Render chat view for selected scenario
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header with scenario info */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerGreeting}>
                {selectedScenario.icon} {selectedScenario.title}
              </Text>
              <Text style={styles.headerTitle}>{selectedScenario.description}</Text>
            </View>
            {userMessageCount > 0 && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsNumber}>{userMessageCount}</Text>
                <Text style={styles.statsLabel}>exchanges</Text>
              </View>
            )}
          </View>
        </View>

        {/* Objectives banner */}
        <View style={styles.objectivesBanner}>
          <Text style={styles.objectivesBannerTitle}>Your goals:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedScenario.objectives.map((obj, idx) => (
              <View key={idx} style={styles.objectiveBadge}>
                <Text style={styles.objectiveBadgeText}>{obj}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Respond in Italian..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F5456', // Dark teal base
  },
  header: {
    backgroundColor: '#4A5C5E', // Medium teal
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#F4D5B8', // Peach accent
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.95,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
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
  statsContainer: {
    backgroundColor: '#F4D5B8', // Peach accent
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F5456', // Dark teal on peach
  },
  statsLabel: {
    fontSize: 11,
    color: '#3F5456',
    marginTop: 2,
    fontWeight: '600',
  },
  objectivesBanner: {
    backgroundColor: '#4A5C5E', // Medium teal
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#F4D5B8', // Peach accent
  },
  objectivesBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F4D5B8', // Peach accent
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  objectiveBadge: {
    backgroundColor: 'rgba(244, 213, 184, 0.2)', // Peach with transparency
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#F4D5B8', // Peach accent
  },
  objectiveBadgeText: {
    fontSize: 13,
    color: '#F4D5B8',
    fontWeight: '600',
  },
  scenariosContainer: {
    flex: 1,
  },
  scenariosContent: {
    padding: 16,
  },
  scenarioCard: {
    backgroundColor: '#4A5C5E', // Medium teal card
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#F4D5B8', // Peach accent
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scenarioIcon: {
    fontSize: 42,
    marginRight: 16,
  },
  scenarioTitleContainer: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scenarioDifficulty: {
    fontSize: 13,
    color: '#F4D5B8', // Peach accent
    fontWeight: '600',
  },
  scenarioDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
    lineHeight: 22,
  },
  objectivesContainer: {
    backgroundColor: 'rgba(244, 213, 184, 0.15)', // Peach with transparency
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 213, 184, 0.3)',
  },
  objectivesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F4D5B8', // Peach accent
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  objectiveItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    lineHeight: 20,
  },
  objectiveMore: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#4A5C5E', // Medium teal
    borderTopWidth: 3,
    borderTopColor: '#F4D5B8', // Peach accent
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#3F5456', // Dark teal
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(244, 213, 184, 0.3)', // Peach with transparency
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#F4D5B8', // Peach accent
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#D0D0D0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: '#3F5456', // Dark teal on peach button
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ScenarioScreen;
