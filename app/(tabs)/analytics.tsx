import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryPieChart } from '../../src/components/analytics/CategoryPieChart';
import { EnergyLineChart } from '../../src/components/analytics/EnergyLineChart';
import { UsageHeatmap } from '../../src/components/analytics/UsageHeatmap';
import { SystemHealthOverview } from '../../src/components/home/SystemHealthOverview';
import { Colors, Layout } from '../../src/theme';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <SystemHealthOverview />

        <EnergyLineChart />

        <UsageHeatmap />

        <CategoryPieChart />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.padding,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
});
