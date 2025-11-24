import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../src/context/ThemeContext';
import { Alert, Repository } from '../../src/database/repository';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Layout, Typography } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

import { ScheduleWidget } from '../../src/components/home/Schedule';
import { StatCard } from '../../src/components/ui/StatCard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState({
    online: 0,
    total: 0,
    alerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    const nodes = await Repository.getAllNodes();
    const alerts = await Repository.getUnreadAlerts();

    setStats({
      online: nodes.filter(n => n.status === 'on').length,
      total: nodes.length,
      alerts: alerts.length,
    });
    setRecentAlerts(alerts.slice(0, 3));
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    HapticsService.medium();
    setRefreshing(true);
    await DeviceSyncService.syncAll();
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <View style={styles.iconButtonContent}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
              {stats.alerts > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: colors.primary }]}>Hi, Ayush</Text>
            <Text style={[styles.subGreeting, { color: colors.text.secondary }]}>Welcome back</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Overview Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Factory Overview
          </Text>
          <View style={styles.liveBadge}>
            <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.liveText, { color: colors.success }]}>LIVE</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Devices Online"
            value={stats.online}
            subtext={`of ${stats.total} total`}
            icon="shield-checkmark-outline"
            iconColor={colors.success}
            borderColor={colors.success}
            style={{ width: '100%' }} // Full width for first card
          />

          <View style={styles.row}>
            <StatCard
              title="kWh Today"
              value="1,842"
              trend="+ 12% vs yesterday"
              trendPositive={true}
              icon="flash-outline"
              iconColor={colors.accent}
              borderColor={colors.accent}
            />
            <StatCard
              title="Active Alerts"
              value={stats.alerts}
              subtext="Needs attention"
              icon="warning-outline"
              iconColor={colors.error}
              borderColor={colors.error}
            />
          </View>
        </View>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Alerts</Text>
            {recentAlerts.map(alert => (
              <View
                key={alert.id}
                style={[
                  styles.alertItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor:
                        alert.level === 'critical' ? colors.error + '20' : colors.warning + '20',
                    },
                  ]}
                >
                  <Ionicons
                    name={alert.level === 'critical' ? 'warning' : 'alert-circle'}
                    size={20}
                    color={alert.level === 'critical' ? colors.error : colors.warning}
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text
                    style={[styles.alertMessage, { color: colors.text.primary }]}
                    numberOfLines={1}
                  >
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.text.secondary }]}>Just now</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
              </View>
            ))}
          </View>
        )}

        {/* Schedule Widget */}
        <ScheduleWidget />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  subGreeting: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.subHeader,
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
  statsGrid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconButtonContent: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  alertsSection: {
    marginTop: 24,
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
});
