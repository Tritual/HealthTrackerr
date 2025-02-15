import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import { Calendar } from 'react-native-calendars';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );
  

  const loadAllData = async () => {
    try {
      const data: { [key: string]: any[] } = {};
      const today = new Date();

      // Load only last 30 days initially for better performance
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        const dayData = await AsyncStorage.getItem(`health_${date}`);
        if (dayData) {
          data[date] = JSON.parse(dayData);
        }
      }
      setEntries(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>History</Text>

      <TouchableOpacity
        onPress={() => setCalendarExpanded(!calendarExpanded)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleButtonText}>
          {calendarExpanded ? 'Hide Calendar' : 'Show Calendar'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={{ flex: 1 }}>
        {calendarExpanded && (
          <Calendar
            onDayPress={(day: { dateString: React.SetStateAction<string> }) =>
              setSelectedDate(day.dateString)
            }
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: '#6366f1',
              },
              ...Object.keys(entries).reduce((acc, date) => {
                acc[date] = {
                  marked: true,
                  dotColor: '#6366f1',
                  textStyle: { fontWeight: 'bold' },
                };
                return acc;
              }, {}),
            }}
            style={styles.calendar}
            theme={{
              backgroundColor: '#f3f4f6',
              calendarBackground: '#fff',
              textSectionTitleColor: '#1f2937',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#fff',
              todayTextColor: '#6366f1',
              dayTextColor: '#4b5563',
              arrowColor: '#6366f1',
              monthTextColor: '#1f2937',
            }}
          />
        )}

        <ScrollView style={styles.entriesContainer}>
          {entries[selectedDate]?.map((entry, index) => (
            <View key={index} style={styles.entryCard}>
              <Text style={styles.entryTime}>{entry.time}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Mood</Text>
                  <Text style={styles.statValue}>{entry.mood}/10</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Stress</Text>
                  <Text style={styles.statValue}>{entry.stress}/10</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Health</Text>
                  <Text style={styles.statValue}>{entry.healthScore}/10</Text>
                </View>
              </View>
              {entry.stressReasons && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Stress Reasons:</Text>
                  <Text style={styles.detailText}>{entry.stressReasons}</Text>
                </View>
              )}
              {entry.fever && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Fever:</Text>
                  <Text style={styles.detailText}>{entry.fever}</Text>
                </View>
              )}
              {entry.healthIssues && entry.healthIssues.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Health Issues:</Text>
                  <View style={styles.issuesContainer}>
                    {entry.healthIssues.map((issue: string, i: number) => (
                      <View key={i} style={styles.issueTag}>
                        <Text style={styles.issueText}>{issue}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {entry.healthBriefs && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Health Briefs:</Text>
                  <Text style={styles.detailText}>{entry.healthBriefs}</Text>
                </View>
              )}
            </View>
          ))}
          {(!entries[selectedDate] || entries[selectedDate].length === 0) && (
            <Text style={styles.noEntriesText}>No entries for this date</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  toggleButton: {
    alignSelf: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  toggleButtonText: { color: '#fff', fontSize: 16 },
  calendar: { marginBottom: 20, borderRadius: 12, overflow: 'hidden' },
  calendarTheme: {
    backgroundColor: '#f3f4f6',
    calendarBackground: '#fff',
    textSectionTitleColor: '#1f2937',
    selectedDayBackgroundColor: '#6366f1',
    selectedDayTextColor: '#fff',
    todayTextColor: '#6366f1',
    dayTextColor: '#4b5563',
    arrowColor: '#6366f1',
    monthTextColor: '#1f2937',
  },
  entriesContainer: { flex: 1, paddingHorizontal: 20 },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryTime: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#6366f1' },
  detailSection: { marginTop: 12 },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailText: { fontSize: 14, color: '#4b5563' },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  issueTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  issueText: { fontSize: 12, color: '#374151' },
  noEntriesText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 20,
  },
});
