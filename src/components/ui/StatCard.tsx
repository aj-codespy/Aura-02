import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../theme';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: string;
  trendPositive?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

const StatCardComponent: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconColor = Colors.primary,
  trend,
  trendPositive,
  borderColor,
  style,
}) => {
  return (
    <Card
      style={[
        styles.container,
        borderColor ? { borderLeftWidth: 4, borderLeftColor: borderColor } : {},
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={16} color="#FFF" />
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>

      {subtext && <Text style={styles.subtext}>{subtext}</Text>}

      {trend && (
        <Text style={[styles.trend, { color: trendPositive ? Colors.success : Colors.error }]}>
          {trend}
        </Text>
      )}
    </Card>
  );
};

// Memoize to prevent unnecessary re-renders
export const StatCard = React.memo(StatCardComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '48%', // Allow 2 per row
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 20,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
