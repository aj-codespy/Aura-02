import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Node, Repository, Schedule } from '../../src/database/repository';
import { HardwareService } from '../../src/services/hardware';
import { Colors, Layout } from '../../src/theme';
import { HapticsService } from '../../src/utils/haptics';

// Types
interface ScheduleWithNode extends Schedule {
    nodeName?: string;
}

export default function ScheduleScreen() {
    const [schedules, setSchedules] = useState<ScheduleWithNode[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    // Form State
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [action, setAction] = useState<'on' | 'off'>('on');
    const [time, setTime] = useState('08:00');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [loadedSchedules, loadedNodes] = await Promise.all([
            Repository.getSchedules(),
            Repository.getAllNodes(),
        ]);

        // Map node names to schedules
        const enrichedSchedules = loadedSchedules.map(s => ({
            ...s,
            nodeName: loadedNodes.find(n => n.id === s.node_id)?.name || 'Unknown Device',
        }));

        setSchedules(enrichedSchedules);
        setNodes(loadedNodes);
        setLoading(false);
    };

    const handleAdd = () => {
        setEditingSchedule(null);
        setSelectedNodeId(nodes.length > 0 ? nodes[0].id : null);
        setAction('on');
        setTime('08:00');
        setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
        setModalVisible(true);
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setSelectedNodeId(schedule.node_id);
        setAction(schedule.action);
        setTime(schedule.time);
        try {
            setSelectedDays(JSON.parse(schedule.days));
        } catch {
            HapticsService.error();
            setSelectedDays([]);
        }
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        RNAlert.alert('Delete Schedule', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await Repository.deleteSchedule(id);
                    // Try to delete from hardware (best effort)
                    // In a real app we'd need the IP. For now assuming main server or mock.
                    const servers = await Repository.getServers();
                    if (servers.length > 0) {
                        try {
                            await HardwareService.deleteSchedule(servers[0].ip_address, String(id));
                        } catch (e) { console.log('Hardware delete failed', e); }
                    }
                    loadData();
                    HapticsService.success();
                },
            },
        ]);
    };

    const handleSave = async () => {
        if (!selectedNodeId) return;

        // Basic Time Validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            RNAlert.alert('Invalid Time', 'Please use HH:MM format (e.g., 14:30)');
            return;
        }

        try {
            if (editingSchedule) {
                await Repository.updateSchedule(editingSchedule.id, action, time, selectedDays, 1);
                // Hardware update (best effort)
                const servers = await Repository.getServers();
                if (servers.length > 0) {
                    await HardwareService.updateSchedule(servers[0].ip_address, String(editingSchedule.id), {
                        nodeId: selectedNodeId, action, time, repeat: selectedDays
                    });
                }
            } else {
                await Repository.createSchedule(selectedNodeId, action, time, selectedDays);
                // Hardware create (best effort)
                const servers = await Repository.getServers();
                if (servers.length > 0) {
                    await HardwareService.createSchedule(servers[0].ip_address, {
                        nodeId: selectedNodeId, action, time, repeat: selectedDays
                    });
                }
            }
            setModalVisible(false);
            loadData();
            HapticsService.success();
        } catch (error) {
            console.error(error);
            RNAlert.alert('Error', 'Failed to save schedule');
        }
    };

    const toggleDay = (day: string) => {
        HapticsService.light();
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const renderItem = ({ item }: { item: ScheduleWithNode }) => {
        let daysDisplay = '';
        try {
            const days = JSON.parse(item.days);
            daysDisplay = days.length === 7 ? 'Every Day' : days.join(', ');
        } catch (e) { daysDisplay = item.days; }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.deviceText}>{item.nodeName}</Text>
                        <View style={styles.timeRow}>
                            <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
                            <Text style={styles.timeText}>{item.time}</Text>
                            <View style={[styles.actionBadge, { backgroundColor: item.action === 'on' ? Colors.success + '20' : Colors.text.secondary + '20' }]}>
                                <Text style={[styles.actionText, { color: item.action === 'on' ? Colors.success : Colors.text.secondary }]}>
                                    TURN {item.action.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.daysText}>{daysDisplay}</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                            <Ionicons name="pencil" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Schedules</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={schedules}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshing={loading}
                onRefresh={loadData}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={Colors.text.secondary} />
                        <Text style={styles.emptyText}>No schedules yet</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingSchedule ? 'Edit Schedule' : 'New Schedule'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Device Selector */}
                        <Text style={styles.label}>Device</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceScroll}>
                            {nodes.map(node => (
                                <TouchableOpacity
                                    key={node.id}
                                    style={[styles.deviceChip, selectedNodeId === node.id && styles.deviceChipSelected]}
                                    onPress={() => setSelectedNodeId(node.id)}
                                >
                                    <Text style={[styles.deviceChipText, selectedNodeId === node.id && styles.deviceChipTextSelected]}>
                                        {node.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Action */}
                        <Text style={styles.label}>Action</Text>
                        <View style={styles.segmentControl}>
                            <TouchableOpacity
                                style={[styles.segment, action === 'on' && styles.segmentActive]}
                                onPress={() => setAction('on')}
                            >
                                <Text style={[styles.segmentText, action === 'on' && styles.segmentTextActive]}>Turn ON</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segment, action === 'off' && styles.segmentActive]}
                                onPress={() => setAction('off')}
                            >
                                <Text style={[styles.segmentText, action === 'off' && styles.segmentTextActive]}>Turn OFF</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time */}
                        <Text style={styles.label}>Time (HH:MM)</Text>
                        <TextInput
                            style={styles.input}
                            value={time}
                            onChangeText={setTime}
                            placeholder="08:00"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                        />

                        {/* Days */}
                        <Text style={styles.label}>Repeat</Text>
                        <View style={styles.daysRow}>
                            {DAYS.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayCircle, selectedDays.includes(day) && styles.dayCircleActive]}
                                    onPress={() => toggleDay(day)}
                                >
                                    <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextActive]}>
                                        {day.charAt(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.padding,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.primary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: Layout.padding,
        gap: 12,
    },
    card: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    deviceText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    actionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
    },
    daysText: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        padding: 8,
        backgroundColor: Colors.background,
        borderRadius: 8,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    cancelText: {
        fontSize: 16,
        color: Colors.primary,
    },
    form: {
        padding: 20,
        gap: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 8,
    },
    deviceScroll: {
        flexGrow: 0,
        marginBottom: 8,
    },
    deviceChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8,
    },
    deviceChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    deviceChipText: {
        color: Colors.text.primary,
    },
    deviceChipTextSelected: {
        color: '#FFF',
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    segmentActive: {
        backgroundColor: Colors.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    segmentText: {
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    segmentTextActive: {
        color: Colors.text.primary,
    },
    input: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 18,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dayCircleActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dayText: {
        color: Colors.text.primary,
        fontWeight: '600',
    },
    dayTextActive: {
        color: '#FFF',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
