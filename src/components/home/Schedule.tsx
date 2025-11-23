import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '../../theme';
import { Card } from '../ui/Card';

export const ScheduleWidget = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dates = [
        [29, 30, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24, 25, 26],
        [27, 28, 29, 30, 31, 1, 2],
    ];

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>Schedule</Text>

            <View style={styles.calendarHeader}>
                <TouchableOpacity>
                    <Ionicons name="chevron-back" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.month}>July 2025</Text>
                <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {/* Days Header */}
                <View style={styles.row}>
                    {days.map((day, index) => (
                        <Text key={index} style={styles.dayLabel}>{day}</Text>
                    ))}
                </View>

                {/* Dates */}
                {dates.map((week, wIndex) => (
                    <View key={wIndex} style={styles.row}>
                        {week.map((date, dIndex) => {
                            const isSelected = date === 27 && wIndex === 4;
                            const isNextMonth = (wIndex === 0 && date > 20) || (wIndex === 4 && date < 10);

                            return (
                                <View key={dIndex} style={[styles.dateCell, isSelected && styles.selectedDate]}>
                                    <Text style={[
                                        styles.dateText,
                                        isNextMonth && styles.fadedText,
                                        isSelected && styles.selectedDateText
                                    ]}>
                                        {date}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    title: {
        ...Typography.subHeader,
        marginBottom: 16,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    month: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    grid: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayLabel: {
        width: 32,
        textAlign: 'center',
        fontSize: 12,
        color: Colors.text.secondary,
    },
    dateCell: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    selectedDate: {
        backgroundColor: Colors.accent,
    },
    dateText: {
        fontSize: 14,
        color: Colors.text.primary,
    },
    selectedDateText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    fadedText: {
        color: Colors.text.secondary,
        opacity: 0.5,
    },
});
