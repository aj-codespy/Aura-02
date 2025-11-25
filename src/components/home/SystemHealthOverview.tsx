import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Repository } from '../../database/repository';
import { Colors } from '../../theme';

interface HealthStats {
    score: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Critical';
    onlineCount: number;
    totalCount: number;
    alertCount: number;
    powerUsage: number;
}

export const SystemHealthOverview = () => {
    const { colors } = useTheme();
    const [stats, setStats] = useState<HealthStats>({
        score: 100,
        status: 'Excellent',
        onlineCount: 0,
        totalCount: 0,
        alertCount: 0,
        powerUsage: 0,
    });

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        const nodes = await Repository.getAllNodes();
        const alerts = await Repository.getUnreadAlerts();

        const totalCount = nodes.length;
        const onlineCount = nodes.filter(n => n.status === 'on').length;
        const offlineCount = totalCount - onlineCount;
        const criticalAlerts = alerts.filter(a => a.level === 'critical').length;

        // Calculate Health Score
        // Start at 100
        // -10 per offline device
        // -15 per critical alert
        // -5 per warning alert
        let score = 100;
        if (totalCount > 0) {
            score -= (offlineCount * 10);
            score -= (criticalAlerts * 15);
            score -= (alerts.length - criticalAlerts) * 5;
        }

        score = Math.max(0, Math.min(100, score));

        let status: HealthStats['status'] = 'Excellent';
        if (score < 60) status = 'Critical';
        else if (score < 80) status = 'Fair';
        else if (score < 95) status = 'Good';

        // Calculate approximate power usage (sum of voltage * current)
        // This is a rough estimate based on current state
        const powerUsage = nodes.reduce((acc, node) => {
            return acc + (node.voltage || 0) * (node.current || 0);
        }, 0);

        setStats({
            score,
            status,
            onlineCount,
            totalCount,
            alertCount: alerts.length,
            powerUsage,
        });
    };

    const getStatusColor = (status: HealthStats['status']) => {
        switch (status) {
            case 'Excellent': return Colors.success;
            case 'Good': return Colors.primary;
            case 'Fair': return Colors.warning;
            case 'Critical': return Colors.error;
            default: return Colors.text.primary;
        }
    };

    const statusColor = getStatusColor(stats.status);

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text.primary }]}>System Health</Text>
                    <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Real-time diagnostics</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.scoreText, { color: statusColor }]}>{stats.score}%</Text>
                </View>
            </View>

            <View style={styles.mainMetric}>
                <Ionicons name="pulse" size={32} color={statusColor} />
                <View>
                    <Text style={[styles.statusText, { color: statusColor }]}>{stats.status}</Text>
                    <Text style={[styles.statusSubtext, { color: colors.text.secondary }]}>
                        {stats.score === 100 ? 'All systems operational' : 'Attention required'}
                    </Text>
                </View>
            </View>

            <View style={styles.grid}>
                {/* Network Status */}
                <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <View style={styles.gridHeader}>
                        <Ionicons name="server-outline" size={18} color={Colors.primary} />
                        <Text style={[styles.gridLabel, { color: colors.text.secondary }]}>Network</Text>
                    </View>
                    <Text style={[styles.gridValue, { color: colors.text.primary }]}>
                        {stats.onlineCount}/{stats.totalCount}
                    </Text>
                    <Text style={[styles.gridSubtext, { color: colors.text.secondary }]}>Online</Text>
                </View>

                {/* Security / Alerts */}
                <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <View style={styles.gridHeader}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
                        <Text style={[styles.gridLabel, { color: colors.text.secondary }]}>Security</Text>
                    </View>
                    <Text style={[styles.gridValue, { color: colors.text.primary }]}>
                        {stats.alertCount}
                    </Text>
                    <Text style={[styles.gridSubtext, { color: colors.text.secondary }]}>Active Alerts</Text>
                </View>

                {/* Power Load */}
                <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <View style={styles.gridHeader}>
                        <Ionicons name="flash-outline" size={18} color={Colors.accent} />
                        <Text style={[styles.gridLabel, { color: colors.text.secondary }]}>Load</Text>
                    </View>
                    <Text style={[styles.gridValue, { color: colors.text.primary }]}>
                        {(stats.powerUsage / 1000).toFixed(1)}kW
                    </Text>
                    <Text style={[styles.gridSubtext, { color: colors.text.secondary }]}>Current Usage</Text>
                </View>
            </View>

            {/* Action Button */}
            {stats.score < 100 && (
                <View style={[styles.actionBanner, { backgroundColor: Colors.error + '10', borderColor: Colors.error + '30' }]}>
                    <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
                    <Text style={[styles.actionText, { color: Colors.error }]}>
                        {stats.alertCount} issues need resolution
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.error} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: '800',
    },
    mainMetric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 2,
    },
    statusSubtext: {
        fontSize: 14,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
    },
    gridItem: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    gridLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    gridValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    gridSubtext: {
        fontSize: 11,
    },
    actionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        marginLeft: 8,
    },
});
