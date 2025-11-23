import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { DataExportService } from '../../src/services/dataExport';
import { HapticsService } from '../../src/utils/haptics';

export default function DataExportScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadBackupDate();
    }, []);

    const loadBackupDate = async () => {
        const date = await DataExportService.getLastBackupDate();
        setLastBackupDate(date);
    };

    const handleExportAll = useCallback(async () => {
        HapticsService.medium();
        setIsExporting(true);
        try {
            const result = await DataExportService.exportAllData();
            if (result.success) {
                Alert.alert(
                    'Export Successful',
                    `Exported ${result.filesCreated.length} files successfully!`,
                    [{ text: 'OK' }]
                );
                await loadBackupDate();
            } else {
                Alert.alert('Export Failed', result.error || 'Unknown error', [{ text: 'OK' }]);
            }
        } catch (error) {
            Alert.alert('Export Failed', 'An error occurred during export', [{ text: 'OK' }]);
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleImport = useCallback(async () => {
        HapticsService.medium();
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/csv',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setIsImporting(true);
            const importResult = await DataExportService.importData(result.assets[0].uri);

            if (importResult.success) {
                const total = Object.values(importResult.imported).reduce((a, b) => a + b, 0);
                Alert.alert(
                    'Import Successful',
                    `Imported ${total} records:\n` +
                    `• Energy Data: ${importResult.imported.energyData}\n` +
                    `• Schedules: ${importResult.imported.schedules}\n` +
                    `• Devices: ${importResult.imported.devices}\n` +
                    `• Alerts: ${importResult.imported.alerts}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Import Failed',
                    importResult.errors.join('\n'),
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert('Import Failed', 'An error occurred during import', [{ text: 'OK' }]);
        } finally {
            setIsImporting(false);
        }
    }, []);

    const formatDate = (date: Date | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Data Export</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Last Backup Info */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="time-outline" size={24} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Last Backup</Text>
                    </View>
                    <Text style={[styles.lastBackupText, { color: colors.textSecondary }]}>
                        {formatDate(lastBackupDate)}
                    </Text>
                    {lastBackupDate && (
                        <Text style={[styles.lastBackupDate, { color: colors.textSecondary }]}>
                            {lastBackupDate.toLocaleDateString()} at {lastBackupDate.toLocaleTimeString()}
                        </Text>
                    )}
                </View>

                {/* Export Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Data</Text>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={handleExportAll}
                    disabled={isExporting}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Export All Data</Text>
                        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                            Export all energy data, schedules, devices, and alerts to CSV files
                        </Text>
                    </View>
                    {isExporting ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    )}
                </TouchableOpacity>

                {/* Import Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Import Data</Text>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={handleImport}
                    disabled={isImporting}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="cloud-download-outline" size={28} color={colors.success} />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Import from CSV</Text>
                        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                            Import previously exported data from CSV files
                        </Text>
                    </View>
                    {isImporting ? (
                        <ActivityIndicator color={colors.success} />
                    ) : (
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    )}
                </TouchableOpacity>

                {/* Info Section */}
                <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        Regular backups help protect your data. We recommend backing up every 30 days.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 16,
    },
    card: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    lastBackupText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    lastBackupDate: {
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 8,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
        marginTop: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
});
