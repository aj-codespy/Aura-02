import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Colors, Layout, Typography } from '../../theme';

export const CategoryPieChart = () => {
  const data = [
    { value: 305, color: '#2E7D32', text: '305', label: 'HVAC' },
    { value: 186, color: '#1565C0', text: '186', label: 'Lighting' },
    { value: 209, color: '#C62828', text: '209', label: 'Motors' },
    { value: 73, color: '#6A1B9A', text: '73', label: 'IT' },
    { value: 237, color: '#F9A825', text: '237', label: 'Other' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consumption by Category</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          donut
          showText
          textColor="white"
          radius={120}
          innerRadius={60}
          textSize={12}
          labelsPosition="outward"
        />
      </View>
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    ...Typography.subHeader,
    fontSize: 16,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
