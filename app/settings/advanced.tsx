import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Repository } from '../../src/database/repository';
import { Layout } from '../../src/theme';

export default function AdvancedScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all servers, devices, alerts, and data points. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await Repository.clearDatabase();
              Alert.alert('Success', 'All data has been cleared', [
                {
                  text: 'OK',
                  onPress: () => router.push('/(tabs)/'),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear database');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Advanced</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>DANGER ZONE</Text>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: colors.error + '20', borderColor: colors.error },
            ]}
            onPress={handleClearData}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <View style={styles.buttonText}>
                <Text style={[styles.buttonLabel, { color: colors.error }]}>Clear All Data</Text>
                <Text style={[styles.buttonDescription, { color: colors.text.secondary }]}>
                  Delete all servers, devices, and history
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    padding: Layout.padding,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  dangerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonDescription: {
    fontSize: 14,
  },
});
