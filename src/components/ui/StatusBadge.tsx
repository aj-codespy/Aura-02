import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme';

type StatusType = 'online' | 'offline' | 'unreachable' | 'live';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
}

const StatusBadgeComponent = ({ status, label }: StatusBadgeProps) => {
    const getStyle = () => {
        switch (status) {
            case 'online':
            case 'live':
                return { bg: 'rgba(46, 204, 113, 0.1)', text: Colors.success };
            case 'offline':
                return { bg: 'rgba(108, 117, 125, 0.1)', text: Colors.text.secondary };
            case 'unreachable':
                return { bg: 'rgba(231, 76, 60, 0.1)', text: Colors.error };
            default:
                return { bg: Colors.background, text: Colors.text.primary };
        }
    };

    const style = getStyle();

    return (
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
            {status === 'live' && <View style={styles.dot} />}
            <Text style={[styles.text, { color: style.text }]}>
                {label || status.toUpperCase()}
            </Text>
        </View>
    );
};

// Memoize to prevent unnecessary re-renders
export const StatusBadge = React.memo(StatusBadgeComponent);

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.success,
    },
});
