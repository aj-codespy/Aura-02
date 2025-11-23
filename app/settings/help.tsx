import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { Layout } from '../../src/theme';

export default function HelpScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const faqs = [
        { question: 'How do I add a device?', answer: 'Go to the Devices tab and tap the + button. You can scan a QR code or manually enter device details.' },
        { question: 'How do I create a schedule?', answer: 'Navigate to the Schedule tab, tap the + button, select a device, set the time and days, and save.' },
        { question: 'What does the "Live" badge mean?', answer: 'It indicates that the app is connected to the local server and receiving real-time updates.' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Frequently Asked Questions</Text>
                    {faqs.map((faq, index) => (
                        <View key={index} style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.question, { color: colors.text.primary }]}>{faq.question}</Text>
                            <Text style={[styles.answer, { color: colors.text.secondary }]}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Contact Us</Text>
                    <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        <Text style={[styles.contactButtonText, { color: colors.primary }]}>Email Support</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: Layout.padding,
        paddingVertical: 16,
        gap: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    content: {
        padding: Layout.padding,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    faqItem: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
