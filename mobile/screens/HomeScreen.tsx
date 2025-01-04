import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { useAppSelector } from '../store';

export default function HomeScreen({ navigation }) {
  const certificates = useAppSelector(state => state.certificates.items);

  return (
    <View style={styles.container}>
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <StatItem 
            title="Certificats"
            value={certificates.length}
            trend="up"
          />
          <StatItem 
            title="Score"
            value="95/100"
            color="green"
          />
        </View>
      </Card>

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.scanButtonText}>
          Scanner un QR Code
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  statsCard: {
    padding: 16,
    marginBottom: 16
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});