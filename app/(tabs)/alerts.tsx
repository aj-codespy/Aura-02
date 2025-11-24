import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alert, Repository } from '../../src/database/repository';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadAlerts = async () => {
    const a = await Repository.getUnreadAlerts();
    setAlerts(a);
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    await Repository.markAlertRead(id);
    loadAlerts();
  };

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={[styles.card, item.level === 'critical' ? styles.cardCritical : null]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>⚠️ {item.level.toUpperCase()}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString()}</Text>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleMarkRead(item.id)}>
        <Text style={styles.buttonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Alerts</Text>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active alerts.</Text>
            <Text style={styles.emptySubtext}>System is running smoothly.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f1c40f',
  },
  cardCritical: {
    borderLeftColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  message: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  buttonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
  },
});
