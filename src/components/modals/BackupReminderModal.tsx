import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { DataExportService } from '../../services/dataExport';

interface BackupReminderModalProps {
    visible: boolean;
    onClose: () => void;
    lastBackupDate: Date | null;
}

export const BackupReminderModal: React.FC<BackupReminderModalProps> = ({
    visible,
    onClose,
    lastBackupDate,
}) => {
    const { colors } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    const handleBackupNow = async () => {
        setIsExporting(true);
        try {
            const result = await DataExportService.exportAllData();
            if (result.success) {
                alert('Backup completed successfully!');
                onClose();
            } else {
                alert(`Backup failed: ${result.error}`);
            }
        } catch (error) {
            alert('Backup failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleRemindLater = async () => {
        await DataExportService.snoozeReminder();
        onClose();
    };

    const daysSinceBackup = lastBackupDate
        ? Math.floor((Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: colors.card }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>
                        Time to Backup Your Data
                    </Text>

                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {lastBackupDate
                            ? `It's been ${daysSinceBackup} days since your last backup. `
                            : 'You haven\'t backed up your data yet. '}
                        Regular backups help protect your energy data and schedules.
                    </Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
                            onPress={handleBackupNow}
                            disabled={isExporting}
                        >
                            <Ionicons name="cloud-upload" size={20} color="#FFF" />
                            <Text style={styles.primaryButtonText}>
                                {isExporting ? 'Backing up...' : 'Backup Now'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
                            onPress={handleRemindLater}
                            disabled={isExporting}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                Remind me in 7 days
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={onClose}
                            disabled={isExporting}
                        >
                            <Text style={[styles.dismissButtonText, { color: colors.textSecondary }]}>
                                Dismiss
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 24,
    },
    buttons: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    primaryButton: {
        // backgroundColor set dynamically
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    dismissButton: {
        paddingVertical: 12,
    },
    dismissButtonText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
