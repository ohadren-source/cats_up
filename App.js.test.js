// App.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Purchases from 'react-native-purchases';

// ============================================================================
// CONFIG
// ============================================================================

const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app';
const REVENUECAT_PUBLIC_KEY = 'appl_gNFmOHvscXhhhoQWpgDvVPQeLZm';
const FREE_QUESTION_LIMIT = 3;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CATSUP = () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('Mathematics');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // simple per‑app‑run id so iPhone/iPad don’t share "anonymous"
  const [sessionId] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  useEffect(() => {
    const initTimer = setTimeout(() => {
      initializePurchases();
    }, 500);

    return () => clearTimeout(initTimer);
  }, []);

  async function initializePurchases() {
    try {
      await Purchases.configure({
        apiKey: REVENUECAT_PUBLIC_KEY,
      });

      await checkSubscriptionStatus();
      console.log('RevenueCat initialized');
    } catch (error) {
      console.error('RevenueCat init error:', error);
    }
  }

  async function checkSubscriptionStatus() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const rcCustomerId = customerInfo.originalAppUserId;
      setCustomerId(rcCustomerId);

      if (customerInfo.entitlements.active['premium']) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Subscription check error:', error);
    }
  }

  // ==========================================================================
  // ASK QUESTION (Calls backend)
  // ==========================================================================

  async function handleAskQuestion() {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    setLoading(true);

    try {
      // TEMP: fixed test ID so all devices share the same limit during QA
      const effectiveId = 'TEST-USER-001';

      const response = await fetch(`${BACKEND_URL}/api/catsup/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: effectiveId,
          question,
          topic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 403) {
          Alert.alert(
            'Limit Reached',
            'Upgrade to Premium for unlimited questions',
            [
              { text: 'Upgrade', onPress: handleSubscribe },
              { text: 'Cancel', onPress: () => {} },
            ]
          );
          return;
        }

        throw new Error(errorData.error || 'Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      setQuestionCount((prev) => prev + 1);
      setQuestion('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process question');
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  async function handleSubscribe() {
    // Prevent double-tap
    if (isPurchasing) return;

    try {
      setIsPurchasing(true);

      // Fetch offerings
      const offerings = await Purchases.getOfferings();

      // No packages available (misconfigured or network issue)
      if (
        !offerings.current ||
        offerings.current.availablePackages.length === 0
      ) {
        Alert.alert(
          'Store Unavailable',
          'No subscription packages are available right now. Please try again later or contact support.'
        );
        return;
      }

      const package_ = offerings.current.availablePackages[0];

      // Attempt purchase
      try {
        const { customerInfo } = await Purchases.purchasePackage(package_);

        // Success
        if (customerInfo.entitlements.active['premium']) {
          setIsSubscribed(true);
          Alert.alert(
            'Success',
            'You are now subscribed to CATSUP Premium!'
          );
        }
      } catch (e) {
        // User cancelled StoreKit sheet (expected, no alert needed)
        if (e.userCancelled) {
          console.log('User cancelled purchase');
        } else {
          // Purchase failed (payment declined, network error, etc.)
          Alert.alert(
            'Purchase Failed',
            'We could not complete your purchase. Please check your payment method and try again, or contact support if this continues.'
          );
          console.error('Purchase error:', e);
        }
      }
    } catch (error) {
      // RevenueCat/network error before StoreKit even launched
      Alert.alert(
        'Connection Error',
        'Unable to connect to the App Store. Please check your internet connection and try again.'
      );
      console.error('Subscription error:', error);
    } finally {
      // Always reset loading state
      setIsPurchasing(false);
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const remainingFree =
    FREE_QUESTION_LIMIT - (questionCount % FREE_QUESTION_LIMIT || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CATSUP</Text>
        <Text style={styles.subtitle}>Learn Through Questions</Text>
        <Text style={styles.formula}>Understanding = Questions / Ego</Text>
      </View>

      {!isSubscribed && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleSubscribe}
          disabled={isPurchasing}
        >
          <Text style={styles.upgradeText}>
            {isPurchasing
              ? 'Contacting App Store…'
              : `Premium · ${remainingFree} free left`}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.topicSelector}>
        {['Mathematics', 'Science', 'History', 'Literature', 'Philosophy'].map(
          (t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.topicButton,
                topic === t && styles.topicButtonActive,
              ]}
              onPress={() => setTopic(t)}
            >
              <Text
                style={[
                  styles.topicText,
                  topic === t && styles.topicTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Ask a question..."
        placeholderTextColor="#666"
        value={question}
        onChangeText={setQuestion}
      />

      <TouchableOpacity
        style={styles.askButton}
        onPress={handleAskQuestion}
        disabled={loading}
      >
        <Text style={styles.askButtonText}>
          {loading ? 'Thinking...' : 'Ask'}
        </Text>
      </TouchableOpacity>

      <View style={styles.answerContainer}>
        <ScrollView>
          {answer ? (
            <Text style={styles.answerText}>{answer}</Text>
          ) : (
            <Text style={styles.placeholderText}>
              Your answer will appear here
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  formula: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: '#ff6b35',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topicSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  topicButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
  },
  topicButtonActive: {
    backgroundColor: '#ff6b35',
  },
  topicText: {
    color: '#888',
    fontSize: 12,
  },
  topicTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  askButton: {
    backgroundColor: '#ff6b35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  answerContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
  },
  answerText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CATSUP;
