import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Repository } from '../../database/repository';
import { Colors, Layout, Typography } from '../../theme';

type TimeRange = '1H' | '24H' | '7D';

export const EnergyLineChart = () => {
  const screenWidth = Dimensions.get('window').width;
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [data, setData] = useState<{ value: number; label: string }[]>([]);

  const loadData = async () => {
    const now = Date.now();
    let startTime: number;
    let buckets: number;

    switch (timeRange) {
      case '1H':
        startTime = now - 60 * 60 * 1000; // 1 hour ago
        buckets = 60; // 1 point per minute
        break;
      case '24H':
        startTime = now - 24 * 60 * 60 * 1000; // 24 hours ago
        buckets = 24; // 1 point per hour
        break;
      case '7D':
        startTime = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        buckets = 7; // 1 point per day
        break;
    }

    // Get all nodes and aggregate their data
    const nodes = await Repository.getAllNodes();
    if (nodes.length === 0) {
      setData([]);
      return;
    }

    // For simplicity, we'll aggregate data from the first node
    // In a real scenario, you might want to sum across all nodes or let user select
    const nodeId = nodes[0].id;
    const aggregatedData = await Repository.getAggregatedDataPoints(
      nodeId,
      startTime,
      now,
      buckets
    );

    if (aggregatedData.length === 0) {
      // No data, show empty state
      setData([]);
      return;
    }

    // Format data for chart
    const formattedData = aggregatedData.map((point, index) => {
      let label = '';
      const date = new Date(point.timestamp);

      if (timeRange === '1H') {
        label = date.getMinutes() + 'm';
      } else if (timeRange === '24H') {
        label = date.getHours() + 'h';
      } else {
        label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      }

      return {
        value: point.avgPower,
        label: index % Math.floor(aggregatedData.length / 6) === 0 ? label : '', // Show ~6 labels
      };
    });

    setData(formattedData);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Energy Consumption</Text>
        <View style={styles.rangeSelector}>
          {(['1H', '24H', '7D'] as TimeRange[]).map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.rangeButton, timeRange === range && styles.rangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.rangeText, timeRange === range && styles.rangeTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {data.length > 0 ? (
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            color={Colors.primary}
            thickness={3}
            startFillColor={Colors.primary}
            endFillColor={Colors.primary}
            startOpacity={0.2}
            endOpacity={0.0}
            areaChart
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor={Colors.border}
            yAxisTextStyle={{ color: Colors.text.secondary, fontSize: 12 }}
            xAxisLabelTextStyle={{ color: Colors.text.secondary, fontSize: 12 }}
            hideDataPoints={false}
            dataPointsColor={Colors.primary}
            curved
            width={screenWidth - 80}
            height={200}
            initialSpacing={10}
            spacing={Math.max(20, (screenWidth - 100) / data.length)}
            rulesColor={Colors.border}
            rulesType="solid"
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubtext}>Data will appear as devices are monitored</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...Typography.subHeader,
    fontSize: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  rangeTextActive: {
    color: '#FFF',
  },
  chartContainer: {
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text.primary,
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
});
