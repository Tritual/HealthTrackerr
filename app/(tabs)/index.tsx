import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [averages, setAverages] = useState({
    mood: 0,
    stress: 0,
    health: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [])
  );  

  const loadTodayData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = await AsyncStorage.getItem(`health_${today}`);
      if (data) {
        const parsed = JSON.parse(data);
        setTodayEntries(parsed);
        calculateAverages(parsed);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateAverages = (entries: any[]) => {
    const sums = entries.reduce(
      (acc, entry) => ({
        mood: acc.mood + entry.mood,
        stress: acc.stress + entry.stress,
        health: acc.health + (entry.healthScore || 0),
      }),
      { mood: 0, stress: 0, health: 0 }
    );

    setAverages({
      mood: entries.length ? Math.round(sums.mood / entries.length) : 0,
      stress: entries.length ? Math.round(sums.stress / entries.length) : 0,
      health: entries.length ? Math.round(sums.health / entries.length) : 0,
    });
  };


  return (    
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Today's Overview</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Mood</Text>
          <Text style={styles.statValue}>{averages.mood}/10</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Stress</Text>
          <Text style={styles.statValue}>{averages.stress}/10</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Health</Text>
          <Text style={styles.statValue}>{averages.health}/10</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Today's Entries</Text>
      {todayEntries.length === 0 ? (
        <Text style={styles.emptyText}>No entries yet today</Text>
      ) : (
        todayEntries.map((entry, index) => (
          <View key={index} style={styles.entryCard}>
            <Text style={styles.entryTime}>{entry.time}</Text>
            <Text style={styles.entryDetail}>Mood: {entry.mood}/10</Text>
            <Text style={styles.entryDetail}>Stress: {entry.stress}/10</Text>
            {entry.fever && (
              <Text style={styles.entryDetail}>
                {entry.fever}°F
              </Text>
            )} 
            {entry.stressReasons && (
              <Text style={styles.entryDetail}>
                Stress reasons: {entry.stressReasons}
              </Text>
            )}
            {entry.healthIssues && entry.healthIssues.length > 0 && (
              <Text style={styles.entryDetail}>
                Health issues: {entry.healthIssues.join(', ')}
              </Text>
            )}
            {entry.healthBriefs && (
              <Text style={styles.entryDetail}>
                Health Briefs: {entry.healthBriefs}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 20,
  },
  entryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  entryDetail: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 4,
  },
});
