import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { Node, Repository } from '../../src/database/repository';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Colors, Layout, Typography } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [device, setDevice] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const loadDevice = async () => {
    if (!id) return;
    const nodes = await Repository.getAllNodes();
    const node = nodes.find(n => n.id === Number(id));
    if (node) {
      setDevice(node);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevice();
    const interval = setInterval(loadDevice, 2000); // Poll for live metrics
    return () => clearInterval(interval);
  }, [id]);

  const handleToggle = async (value: boolean) => {
    if (!device) return;
    HapticsService.selection();
    const newState = value ? 'on' : 'off';

    // Optimistic Update
    setDevice({ ...device, status: newState });
    setToggling(true);

    try {
      await DeviceSyncService.toggleNode(device.id, newState);
    } catch (error) {
      // Rollback
      setDevice({ ...device, status: device.status });
      HapticsService.error();
      Alert.alert('Error', 'Failed to toggle device');
    } finally {
      setToggling(false);
    }
  };

  if (loading || !device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const power = (device.voltage * device.current).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            HapticsService.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{device.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <Card style={styles.mainCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.label}>Status</Text>
              <StatusBadge status={device.status === 'on' ? 'online' : 'offline'} />
            </View>
            <Switch
              value={device.status === 'on'}
              onValueChange={handleToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={'#FFF'}
              disabled={toggling}
            />
          </View>
        </Card>

        {/* Live Metrics */}
        <Text style={styles.sectionTitle}>Live Metrics</Text>
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Ionicons name="flash" size={24} color={Colors.warning} />
            <Text style={styles.metricValue}>{device.voltage} V</Text>
            <Text style={styles.metricLabel}>Voltage</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="pulse" size={24} color={Colors.info} />
            <Text style={styles.metricValue}>{device.current} A</Text>
            <Text style={styles.metricLabel}>Current</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Ionicons name="speedometer" size={24} color={Colors.success} />
            <Text style={styles.metricValue}>{power} W</Text>
            <Text style={styles.metricLabel}>Power</Text>
          </Card>
        </View>

        {/* Metadata */}
        <Text style={styles.sectionTitle}>Device Info</Text>
        <Card style={styles.infoCard}>
          <InfoRow label="Type" value={device.type} />
          <View style={styles.divider} />
          <InfoRow label="Category" value={device.category} />
          <View style={styles.divider} />
          <InfoRow label="Temperature" value={`${device.temperature}°C`} />
          <View style={styles.divider} />
          <InfoRow label="Firmware" value="v1.2.0" />
          <View style={styles.divider} />
          <InfoRow label="MAC Address" value="00:1A:2B:3C:4D:5E" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  content: {
    padding: Layout.padding,
    paddingBottom: 40,
  },
  mainCard: {
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.subHeader,
    marginBottom: 12,
    color: Colors.text.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
