import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';
import { Repository } from '../../database/repository';
import { Colors } from '../../theme';

interface DeviceStats {
  online: number;
  offline: number;
  byCategory: { [key: string]: number };
}

export const DeviceStatusChart = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState<DeviceStats>({
    online: 0,
    offline: 0,
    byCategory: {},
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const nodes = await Repository.getAllNodes();

    const online = nodes.filter(n => n.status === 'on').length;
    const offline = nodes.length - online;

    // Count by category
    const byCategory: { [key: string]: number } = {};
    nodes.forEach(node => {
      const category = node.category || 'Other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    setStats({ online, offline, byCategory });
  };

  // Status pie chart data
  const statusData = [
    {
      value: stats.online,
      color: Colors.success,
      text: `${stats.online}`,
      label: 'Online',
    },
    {
      value: stats.offline,
      color: colors.text.secondary,
      text: `${stats.offline}`,
      label: 'Offline',
    },
  ].filter(item => item.value > 0);

  // Category distribution data
  const categoryColors = {
    HVAC: Colors.primary,
    Lighting: Colors.accent,
    Motors: Colors.warning,
    IT: '#8B5CF6',
    Other: colors.text.secondary,
  };

  const categoryData = Object.entries(stats.byCategory).map(([category, count]) => ({
    value: count,
    color: categoryColors[category as keyof typeof categoryColors] || colors.text.secondary,
    text: `${count}`,
    label: category,
  }));

  const total = stats.online + stats.offline;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Device Fleet Status</Text>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: Colors.success }]} />
          <Text style={[styles.liveText, { color: Colors.success }]}>LIVE</Text>
        </View>
      </View>

      {total > 0 ? (
        <View style={styles.content}>
          {/* Status Distribution */}
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: colors.text.secondary }]}>
              Status Distribution
            </Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={statusData}
                donut
                radius={60}
                innerRadius={40}
                centerLabelComponent={() => (
                  <View style={styles.centerLabel}>
                    <Text style={[styles.centerValue, { color: colors.text.primary }]}>
                      {total}
                    </Text>
                    <Text style={[styles.centerText, { color: colors.text.secondary }]}>Total</Text>
                  </View>
                )}
              />
              <View style={styles.legend}>
                {statusData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendLabel, { color: colors.text.secondary }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.text.primary }]}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Category Breakdown */}
          {categoryData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={[styles.chartTitle, { color: colors.text.secondary }]}>By Category</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={categoryData}
                  donut
                  radius={60}
                  innerRadius={40}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Ionicons name="grid-outline" size={24} color={colors.text.secondary} />
                    </View>
                  )}
                />
                <View style={styles.legend}>
                  {categoryData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendLabel, { color: colors.text.secondary }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.legendValue, { color: colors.text.primary }]}>
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={colors.text.secondary} />
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No devices found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    gap: 24,
  },
  chartSection: {
    gap: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  centerText: {
    fontSize: 12,
  },
  legend: {
    flex: 1,
    gap: 8,
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
  legendLabel: {
    flex: 1,
    fontSize: 14,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
