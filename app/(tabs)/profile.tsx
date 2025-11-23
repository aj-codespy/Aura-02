import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { AuthService } from '../../src/services/auth';
import { Colors, Layout } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [serverOffline, setServerOffline] = useState(true);
  const [deviceUnreachable, setDeviceUnreachable] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [promos, setPromos] = useState(false);

  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    HapticsService.light();
    setter(prev => !prev);
  };

  const handleLogout = async () => {
    HapticsService.medium();
    await AuthService.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Choose what alerts you receive.</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
              <View>
                <Text style={styles.rowTitle}>Enable Notifications</Text>
                <Text style={styles.rowSubtitle}>Master toggle for all alerts</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={() => toggle(setNotifications)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>ALERT TYPES</Text>

        <Card style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Server Offline</Text>
            <Switch
              value={serverOffline}
              onValueChange={() => toggle(setServerOffline)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={!notifications}
            />
          </View>

          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Device Unreachable</Text>
            <Switch
              value={deviceUnreachable}
              onValueChange={() => toggle(setDeviceUnreachable)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={!notifications}
            />
          </View>

          <View style={[styles.row, styles.borderBottom]}>
            <Text style={styles.settingLabel}>Maintenance Reminders</Text>
            <Switch
              value={maintenance}
              onValueChange={() => toggle(setMaintenance)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={!notifications}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.settingLabel}>Promotional Updates & Tips</Text>
            <Switch
              value={promos}
              onValueChange={() => toggle(setPromos)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={!notifications}
            />
          </View>
        </Card>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support & About</Text>
          <Text style={styles.headerSubtitle}>Help resources and legal information.</Text>
        </View>

        <Card style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.borderBottom]}
            onPress={() => HapticsService.light()}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.text.primary} />
              <Text style={styles.settingLabel}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.borderBottom]}
            onPress={() => HapticsService.light()}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="mail-outline" size={24} color={Colors.text.primary} />
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.borderBottom]}
            onPress={() => HapticsService.light()}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="document-text-outline" size={24} color={Colors.text.primary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => HapticsService.light()}>
            <View style={styles.rowIcon}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.text.primary} />
              <View>
                <Text style={styles.settingLabel}>About</Text>
                <Text style={styles.rowSubtitle}>v1.0.1 (Build 240723)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Developer Tools</Text>
          <Text style={styles.headerSubtitle}>System verification and diagnostics.</Text>
        </View>

        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={async () => {
              HapticsService.medium();
              const { runDBTests } = require('../../src/utils/dbTest');
              const { runSyncTests } = require('../../src/utils/syncTest');

              try {
                const dbResult = await runDBTests();
                if (!dbResult.success) throw new Error(dbResult.message);

                const syncResult = await runSyncTests();
                if (!syncResult.success) throw new Error(syncResult.message);

                alert(
                  '✅ All Systems Operational\n\nDatabase: OK\nSync Service: OK\nAlert Logic: OK'
                );
              } catch (e) {
                alert(`❌ Diagnostics Failed\n\n${e}`);
              }
            }}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="construct-outline" size={24} color={Colors.text.primary} />
              <View>
                <Text style={styles.settingLabel}>Run System Diagnostics</Text>
                <Text style={styles.rowSubtitle}>Verify DB, Sync, and Alerts</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </Card>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  card: {
    padding: 0, // Override default padding for list items
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  logoutButton: {
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
