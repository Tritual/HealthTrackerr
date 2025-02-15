import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { router } from 'expo-router';

const healthIssues = [
  'Respiratory Issues',
  'Headache',
  'Stomachache',
  'Back Pain',
  'Vomits',
  'Fatigue',
  'Eyes',
  'Pcod',
  'Anxiety',
];

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [anger, setAnger] = useState(5);
  const [fever, setFever] = useState('');
  const [stressReasons, setStressReasons] = useState('');
  const [healthBriefs, sethealthBriefs] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [healthScore, setHealthScore] = useState(5);

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const renderScaleButtons = (
    value: number,
    onChange: (value: number) => void
  ) => {
    return (
      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleButton,
              value === num && styles.scaleButtonSelected,
            ]}
            onPress={() => onChange(num)}
          >
            <Text
              style={[
                styles.scaleButtonText,
                value === num && styles.scaleButtonTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const saveEntry = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'h:mm a');

      const entry = {
        mood,
        stress,
        stressReasons,
        fever,
        healthBriefs,
        healthIssues: selectedIssues,
        healthScore,
        time,
      };

      const existingData = await AsyncStorage.getItem(`health_${today}`);
      const entries = existingData ? JSON.parse(existingData) : [];
      entries.push(entry);

      await AsyncStorage.setItem(`health_${today}`, JSON.stringify(entries));

      // Reset form
      setMood(5);
      setStress(5);
      setStressReasons('');
      setFever('');
      sethealthBriefs('');
      setSelectedIssues([]);
      setHealthScore(5);

      router.push('/');
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Track Your Health</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How's your mood?</Text>
        {renderScaleButtons(mood, setMood)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stress Level</Text>
        {renderScaleButtons(stress, setStress)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How angry are you >:(</Text>
        {renderScaleButtons(anger, setAnger)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Issues</Text>
        <View style={styles.issuesContainer}>
          {healthIssues.map((issue) => (
            <TouchableOpacity
              key={issue}
              style={[
                styles.issueButton,
                selectedIssues.includes(issue) && styles.issueButtonSelected,
              ]}
              onPress={() => toggleIssue(issue)}
            >
              <Text
                style={[
                  styles.issueButtonText,
                  selectedIssues.includes(issue) &&
                    styles.issueButtonTextSelected,
                ]}
              >
                {issue}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Briefs</Text>
        <TextInput
          style={styles.input}
          value={healthBriefs}
          onChangeText={sethealthBriefs}
          placeholder="Elaborate?"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reasons for Stress</Text>
        <TextInput
          style={styles.input}
          value={stressReasons}
          onChangeText={setStressReasons}
          placeholder="What's causing your stress?"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Temperature</Text>
        <TextInput
          style={styles.input}
          value={fever}
          onChangeText={setFever}
          placeholder="If high, how much?"
          multiline
          numberOfLines={1}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Health Score</Text>
        {renderScaleButtons(healthScore, setHealthScore)}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  scaleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scaleButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  scaleButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  scaleButtonTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  issuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  issueButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  issueButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  issueButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
