import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Layout, Typography } from '../../theme';

export const UsageHeatmap = () => {
    const hours = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Mock Data: 7 days x 12 time slots. 0=Low, 1=Med, 2=High
    const generateRow = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 3));
    const data = Array.from({ length: 7 }, generateRow);

    const getColor = (intensity: number) => {
        switch (intensity) {
            case 0: return '#E3F2FD'; // Light Blue
            case 1: return '#90CAF9'; // Blue
            case 2: return '#E57373'; // Red
            default: return '#E3F2FD';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Peak Usage Hours</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <View style={styles.dayLabelPlaceholder} />
                        {hours.map(hour => (
                            <Text key={hour} style={styles.headerText}>{hour}</Text>
                        ))}
                    </View>

                    {/* Data Rows */}
                    {days.map((day, dayIndex) => (
                        <View key={dayIndex} style={styles.row}>
                            <Text style={styles.dayLabel}>{day}</Text>
                            {data[dayIndex].map((intensity, hourIndex) => (
                                <View
                                    key={hourIndex}
                                    style={[styles.cell, { backgroundColor: getColor(intensity) }]}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: Layout.borderRadius,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        ...Typography.subHeader,
        fontSize: 16,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    dayLabelPlaceholder: {
        width: 24,
        marginRight: 8,
    },
    headerText: {
        width: 24,
        textAlign: 'center',
        fontSize: 12,
        color: Colors.text.secondary,
        marginRight: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'center',
    },
    dayLabel: {
        width: 24,
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginRight: 8,
        textAlign: 'center',
    },
    cell: {
        width: 24,
        height: 24,
        borderRadius: 4,
        marginRight: 4,
    },
});
