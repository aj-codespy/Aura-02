import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Node, Repository } from '../../src/database/repository';
import { DeviceSyncService } from '../../src/services/deviceSync';
import { Colors, Layout, Typography } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function DevicesScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Node[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadDevices = useCallback(async () => {
    const nodes = await Repository.getAllNodes();
    setDevices(nodes);
  }, []);

  useEffect(() => {
    loadDevices();
    // Poll for updates (optional, or rely on sync service events)
    const interval = setInterval(loadDevices, 5000);
    return () => clearInterval(interval);
  }, [loadDevices]);

  const handleToggle = async (device: Node) => {
    const newState = device.status === 'on' ? 'off' : 'on';

    // Optimistic Update
    setDevices(prev =>
      prev.map(d => d.id === device.id ? { ...d, status: newState } : d)
    );
    HapticsService.selection();
    setLoadingId(device.id);

    try {
      await DeviceSyncService.toggleNode(device.id, newState);
    } catch (error) {
      // Rollback
      setDevices(prev =>
        prev.map(d => d.id === device.id ? { ...d, status: device.status } : d)
      );
      HapticsService.error();
      Alert.alert('Connection Failed', 'Could not reach the device.');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePress = useCallback(
    (id: number) => {
      HapticsService.light();
      router.push(`/devices/${id}`);
    },
    [router]
  );

  const handleAddDevice = useCallback(() => {
    HapticsService.medium();
    router.push('/devices/add');
  }, [router]);

  // Group by category
  const groupedDevices = devices.reduce((acc, device) => {
    const category = device.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(device);
    return acc;
  }, {} as Record<string, Node[]>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Devices</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Device</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.entries(groupedDevices).map(([category, categoryDevices]) => (
          <View key={category}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <View style={styles.grid}>
              {categoryDevices.map(device => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.gridItem}
                  onPress={() => handlePress(device.id)}
                >
                  <Card style={styles.card}>
                    <TouchableOpacity
                      style={styles.toggleArea}
                      onPress={() => handleToggle(device)}
                    >
                      {loadingId === device.id ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : (
                        <Ionicons
                          name={device.status === 'on' ? 'power' : 'power-outline'}
                          size={32}
                          color={device.status === 'on' ? Colors.success : Colors.text.disabled}
                          style={styles.icon}
                        />
                      )}
                    </TouchableOpacity>

                    <Text style={styles.cardTitle} numberOfLines={1}>{device.name}</Text>
                    <Text style={[
                      styles.cardStatus,
                      { color: device.status === 'on' ? Colors.success : Colors.text.secondary }
                    ]}>
                      {device.status.toUpperCase()}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {devices.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No devices found.</Text>
            <Text style={styles.emptySubtext}>Tap &quot;Add Device&quot; to pair a new node.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  content: {
    padding: Layout.padding,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Typography.subHeader,
    marginBottom: 12,
    marginTop: 8,
    color: Colors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
  },
  card: {
    alignItems: 'center',
    padding: 16,
    height: 140,
    justifyContent: 'center',
  },
  toggleArea: {
    padding: 10,
    marginBottom: 8,
  },
  icon: {
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    color: Colors.text.primary,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text.primary,
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: Colors.text.secondary,
  },
});
