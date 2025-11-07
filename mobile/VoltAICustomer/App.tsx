import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

export default function App() {
  const [billAmount, setBillAmount] = useState(0);
  const [usage, setUsage] = useState(350);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const calculateBill = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/calculate-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usage: usage
        }),
      });
      
      const data = await response.json();
      setBillAmount(data.amount);
      
      Alert.alert('Bill Calculated', `Your bill is $${data.amount.toFixed(2)} for ${data.usage} kWh`);
    } catch (error) {
      console.log('Error connecting to server:', error);
      // Fallback calculation
      const amount = usage * 0.15;
      setBillAmount(amount);
      Alert.alert('Offline Mode', `Calculated bill: $${amount.toFixed(2)}`);
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = () => {
    Alert.alert('Payment', 'Payment feature will be added soon!');
  };

  const getAIInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/detect-anomalies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usageHistory: [300, 320, 350, 400, usage] // Sample history + current usage
        }),
      });
      
      const data = await response.json();
      
      const insights = [
        data.message,
        `Average usage: ${data.averageUsage.toFixed(0)} kWh`,
        data.isAnomaly ? '🚨 Unusual usage pattern detected!' : '✅ Usage patterns normal'
      ];
      
      setAiInsights(insights);
      Alert.alert('AI Analysis Complete', data.message);
    } catch (error) {
      console.log('Error getting AI insights:', error);
      Alert.alert('AI Service', 'AI insights temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateBill();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚡ VoltAI</Text>
      <Text style={styles.subtitle}>Your Smart Energy Assistant</Text>
      
      {/* Current Bill Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Bill</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" />
        ) : (
          <>
            <Text style={styles.billAmount}>${billAmount.toFixed(2)}</Text>
            <Text style={styles.usage}>Usage: {usage} kWh</Text>
            <Text style={styles.rate}>Rate: $0.15 per kWh</Text>
          </>
        )}
      </View>

      {/* AI Insights Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Insights</Text>
        {aiInsights.length > 0 ? (
          aiInsights.map((insight, index) => (
            <Text key={index} style={styles.insight}>
              {insight}
            </Text>
          ))
        ) : (
          <>
            <Text style={styles.insight}>
              💡 Your usage is 15% lower than last month!
            </Text>
            <Text style={styles.insight}>
              🌡️ Hot weather increased AC usage
            </Text>
            <Text style={styles.insight}>
              💰 You could save $15 by shifting usage to night
            </Text>
          </>
        )}
        
        <TouchableOpacity style={styles.aiButton} onPress={getAIInsights}>
          <Text style={styles.aiButtonText}>
            {loading ? 'Analyzing...' : 'Get AI Analysis'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.button} onPress={calculateBill} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Calculating...' : 'Refresh Bill'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.payButton} onPress={simulatePayment}>
          <Text style={styles.payButtonText}>Pay Bill Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setUsage(usage + 50)}>
          <Text style={styles.secondaryButtonText}>Simulate Usage Increase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setUsage(usage - 50)}>
          <Text style={styles.secondaryButtonText}>Simulate Usage Decrease</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>VoltAI v1.0 - Smart Energy Management</Text>
        <Text style={styles.footerSubtext}>Connected • Secure • AI-Powered</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 8,
    color: '#0066cc',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  billAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginVertical: 8,
  },
  usage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  rate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  insight: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
    opacity: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#00a650',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  aiButton: {
    backgroundColor: '#8a2be2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  footerSubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
});