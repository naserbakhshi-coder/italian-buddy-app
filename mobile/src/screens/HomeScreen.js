import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

const HomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const modules = [
    {
      id: 'chat',
      title: 'Italian Conversation',
      icon: '💬',
      description: 'Practice natural Italian with AI tutor and get real-time grammar corrections',
      color: '#F4D5B8', // Peach accent
      screen: 'Chat',
    },
    {
      id: 'scenarios',
      title: 'Real-Life Scenarios',
      icon: '🎭',
      description: 'Role-play in 8 authentic situations: restaurants, hotels, shopping, and more',
      color: '#E8C4A0', // Light coral/peach
      screen: 'Scenarios',
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Flashcards',
      icon: '📚',
      description: 'Master 50 Italian words with spaced repetition and AI-generated examples',
      color: '#7FA39B', // Sage teal
      screen: 'Vocabulary',
    },
    {
      id: 'daily',
      title: 'Daily Writing Prompts',
      icon: '✍️',
      description: 'Get daily creative prompts and detailed feedback on your Italian writing',
      color: '#C89B6D', // Warm caramel
      comingSoon: true,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header with personalized greeting */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.greeting}>Ciao, Naser! 👋</Text>
          <Text style={styles.title}>My Italian Buddy</Text>
          <Text style={styles.subtitle}>Your Personal AI Language Coach</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🇮🇹 Intermediate Level</Text>
          </View>
        </Animated.View>

        {/* Welcome message */}
        <Animated.View
          style={[
            styles.welcomeCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeText}>
            Continue your Italian learning journey with personalized practice modes designed just for you.
          </Text>
        </Animated.View>

        {/* Module cards */}
        <Text style={styles.sectionTitle}>Choose Your Practice Mode</Text>

        {modules.map((module, index) => (
          <Animated.View
            key={module.id}
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.moduleCard, { borderLeftColor: module.color }]}
              onPress={() => !module.comingSoon && navigation.navigate(module.screen)}
              activeOpacity={module.comingSoon ? 1 : 0.7}
              disabled={module.comingSoon}
            >
              <View style={styles.moduleHeader}>
                <View style={[styles.iconContainer, { backgroundColor: module.color + '15' }]}>
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                </View>
                {module.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </View>

              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>

              {!module.comingSoon && (
                <View style={[styles.startButton, { backgroundColor: module.color }]}>
                  <Text style={styles.startButtonText}>Start Practice →</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Stats/Progress section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>75%</Text>
              <Text style={styles.statLabel}>App Complete</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Modes Ready</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Scenarios</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Made with ❤️ for your Italian journey</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#556D6F', // Softer teal base
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: '#4A5C5E', // Medium teal
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#F4D5B8', // Peach accent
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F5456',
  },
  welcomeCard: {
    backgroundColor: '#4A5C5E', // Medium teal card
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#F4D5B8', // Peach accent
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F4D5B8', // Peach accent
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)', // Light white
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moduleCard: {
    backgroundColor: '#4A5C5E', // Medium teal card
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  moduleIcon: {
    fontSize: 34,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(244, 213, 184, 0.2)', // Peach with transparency
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4D5B8',
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F4D5B8',
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: '#4A5C5E', // Medium teal card
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F4D5B8', // Peach border
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F4D5B8', // Peach accent
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#F4D5B8', // Peach accent
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    marginBottom: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

export default HomeScreen;
