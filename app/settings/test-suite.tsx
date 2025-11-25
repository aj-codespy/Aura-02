import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TestResult, TestRunner } from '../../src/services/testRunner';
import { Colors, Layout, Typography } from '../../src/theme';

export default function TestSuiteScreen() {
    const router = useRouter();
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runAllTests = async () => {
        setIsRunning(true);
        setResults([]);

        const tests = [
            TestRunner.testDatabase,
            TestRunner.testLogging,
            TestRunner.testNotifications,
            TestRunner.testDeviceLogic,
            TestRunner.testAnalytics,
        ];

        const newResults: TestResult[] = [];

        for (const test of tests) {
            // Add pending state
            // (Simplified for this demo, we just await sequentially)
            const result = await test();
            newResults.push(result);
            setResults([...newResults]);
            // Small delay for visual effect
            await new Promise(r => setTimeout(r, 500));
        }

        setIsRunning(false);
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'passed': return Colors.success;
            case 'failed': return Colors.error;
            default: return Colors.text.secondary;
        }
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'passed': return 'checkmark-circle';
            case 'failed': return 'close-circle';
            default: return 'ellipse-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>System Diagnostics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardText}>
                        Run a full system check to verify that the Database, Notifications, Device Logic, and Analytics modules are functioning correctly.
                    </Text>

                    <TouchableOpacity
                        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
                        onPress={runAllTests}
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="play" size={20} color="#FFF" />
                                <Text style={styles.runButtonText}>Run Diagnostics</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.resultsContainer}>
                    {results.map((result, index) => (
                        <View key={index} style={styles.resultItem}>
                            <View style={styles.resultHeader}>
                                <Ionicons
                                    name={getStatusIcon(result.status)}
                                    size={24}
                                    color={getStatusColor(result.status)}
                                />
                                <View style={styles.resultInfo}>
                                    <Text style={styles.moduleName}>{result.module}</Text>
                                    <Text style={styles.testName}>{result.name}</Text>
                                </View>
                                {result.duration && (
                                    <Text style={styles.duration}>{result.duration}ms</Text>
                                )}
                            </View>
                            {result.message && (
                                <Text style={[
                                    styles.resultMessage,
                                    { color: result.status === 'failed' ? Colors.error : Colors.text.secondary }
                                ]}>
                                    {result.message}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
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
        alignItems: 'center',
        padding: Layout.padding,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    title: {
        ...Typography.header,
        fontSize: 20,
    },
    content: {
        padding: Layout.padding,
        gap: 24,
    },
    card: {
        backgroundColor: Colors.card,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
    },
    cardText: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    runButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    runButtonDisabled: {
        opacity: 0.7,
    },
    runButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    resultsContainer: {
        gap: 12,
    },
    resultItem: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resultInfo: {
        flex: 1,
    },
    moduleName: {
        fontSize: 12,
        color: Colors.text.secondary,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    testName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    duration: {
        fontSize: 12,
        color: Colors.text.secondary,
        fontFamily: 'monospace',
    },
    resultMessage: {
        marginTop: 8,
        marginLeft: 36,
        fontSize: 14,
    },
});
