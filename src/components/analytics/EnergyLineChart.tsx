import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Layout, Typography } from '../../theme';

export const EnergyLineChart = () => {
    const screenWidth = Dimensions.get('window').width;

    const data = [
        { value: 240, label: 'Mon' },
        { value: 300, label: 'Tue' },
        { value: 210, label: 'Wed' },
        { value: 280, label: 'Thu' },
        { value: 190, label: 'Fri' },
        { value: 250, label: 'Sat' },
        { value: 350, label: 'Sun' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Overall Energy Consumption (Last 7 Days)</Text>
            <View style={styles.chartContainer}>
                <LineChart
                    data={data}
                    color={Colors.primary}
                    thickness={3}
                    startFillColor={Colors.primary}
                    endFillColor={Colors.primary}
                    startOpacity={0.2}
                    endOpacity={0.0}
                    areaChart
                    yAxisThickness={0}
                    xAxisThickness={1}
                    xAxisColor={Colors.border}
                    yAxisTextStyle={{ color: Colors.text.secondary, fontSize: 12 }}
                    xAxisLabelTextStyle={{ color: Colors.text.secondary, fontSize: 12 }}
                    hideDataPoints={false}
                    dataPointsColor={Colors.primary}
                    curved
                    width={screenWidth - 80} // Adjust for padding
                    height={200}
                    initialSpacing={10}
                    spacing={45}
                    rulesColor={Colors.border}
                    rulesType="solid"
                />
            </View>
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
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
    },
});
