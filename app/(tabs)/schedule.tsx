import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// --- DATABASE UTILITY CLASS ---
class ScheduleDB {
  // Use a loose type because the expo-sqlite runtime object exposes WebSQL-style
  // transaction methods that the static typing may not cover.
  private db: any;
  private tableName = 'schedules';

  constructor() {
    // Correctly open the database file using expo-sqlite API
    // Prefer the typed openDatabaseSync (present in the local d.ts); at runtime
    // fall back to openDatabase if available.
    if (typeof (SQLite as any).openDatabaseSync === 'function') {
      this.db = (SQLite as any).openDatabaseSync('iot_local_config.db');
    } else if (typeof (SQLite as any).openDatabase === 'function') {
      this.db = (SQLite as any).openDatabase('iot_local_config.db');
    } else {
      throw new Error('expo-sqlite: no openDatabase function available');
    }
    this.initDB();
  }

  private initDB() {
    // Define a TS interface for a schedule row (used for clarity / future typing)
    interface ScheduleRow {
      id?: number;
      device_id?: string | null;
      title: string;
      action: string;
      time: string;
      days_json?: string | null;
      date?: string | null;
      enabled: number;
    }

    this.db.transaction((tx: any) => {
      // Create the schedules table with necessary columns
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} (
              id INTEGER PRIMARY KEY NOT NULL,
              device_id TEXT,
              title TEXT NOT NULL,
              action TEXT NOT NULL,
              time TEXT NOT NULL,
              days_json TEXT,
              date TEXT,
              enabled INTEGER NOT NULL
          );`,
        [],
        (_tx: any, _result?: any) => {
          console.log('DB table created successfully');
        },
        (_tx: any, error?: any) => {
          console.log('DB table creation error: ', error);
          return true;
        }
      );
    });
  }

  async getSchedules() {
    return new Promise<any[]>((resolve, reject) => {
      return new Promise<any[]>((resolve, reject) => {
        // Local TS interfaces for the WebSQL-style result objects exposed by expo-sqlite
        interface SQLResultSetRowList {
          _array: any[];
          item?: (index: number) => any;
          length?: number;
        }
        interface SQLResultSet {
          rows: SQLResultSetRowList;
        }
        interface SQLTransaction {
          executeSql(
            sqlStatement: string,
            args?: any[],
            success?: (tx: SQLTransaction, result: SQLResultSet) => void,
            error?: (tx: SQLTransaction, error?: any) => boolean | void
          ): void;
        }

        this.db.transaction((tx: SQLTransaction) => {
          tx.executeSql(
            `SELECT * FROM ${this.tableName};`,
            [],
            // The result rows need to be mapped via rows._array
            (_tx: SQLTransaction, result: SQLResultSet) => resolve(result.rows._array),
            (_tx: SQLTransaction, error?: any) => {
              reject(error);
              return true;
            }
          );
        });
      });
    });
  }

  async saveSchedule(schedule: any, isUpdate: boolean) {
    const { id, device_id, title, action, time, days_json, date, enabled } = schedule;
    const enabledInt = enabled ? 1 : 0;

    if (isUpdate) {
      return new Promise<void>((resolve, reject) => {
        return new Promise<void>((resolve, reject) => {
          // Local TS types for the WebSQL-style objects used by expo-sqlite
          type SQLResultSetRowList = {
            _array: any[];
            item?: (index: number) => any;
            length?: number;
          };
          type SQLResultSet = {
            rows: SQLResultSetRowList;
          };
          type SQLTransaction = {
            executeSql(
              sqlStatement: string,
              args?: any[],
              success?: (tx: SQLTransaction, result: SQLResultSet) => void,
              error?: (tx: SQLTransaction, error?: any) => boolean | void
            ): void;
          };

          this.db.transaction((tx: SQLTransaction) => {
            tx.executeSql(
              `UPDATE ${this.tableName} SET title=?, action=?, time=?, days_json=?, date=?, enabled=? WHERE id=?;`,
              [title, action, time, days_json, date, enabledInt, id],
              (_tx: SQLTransaction, _result?: SQLResultSet) => resolve(),
              (_tx: SQLTransaction, error?: any) => {
                reject(error);
                return true;
              }
            );
          });
        });
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        return new Promise<void>((resolve, reject) => {
          // Local TS interfaces for the WebSQL-style objects used by expo-sqlite
          interface SQLResultSetRowList {
            _array: any[];
            item?: (index: number) => any;
            length?: number;
          }
          interface SQLResultSet {
            rows: SQLResultSetRowList;
          }
          interface SQLTransaction {
            executeSql(
              sqlStatement: string,
              args?: any[],
              success?: (tx: SQLTransaction, result: SQLResultSet) => void,
              error?: (tx: SQLTransaction, error?: any) => boolean | void
            ): void;
          }

          interface InsertScheduleRow {
            device_id?: string | null;
            title: string;
            action: string;
            time: string;
            days_json?: string | null;
            date?: string | null;
            enabled: number;
          }

          const insertValues: (string | number | null)[] = [
            (device_id as string) || 'mock-device-id',
            title,
            action,
            time,
            days_json,
            date,
            enabledInt,
          ];

          this.db.transaction((tx: SQLTransaction) => {
            tx.executeSql(
              `INSERT INTO ${this.tableName} (device_id, title, action, time, days_json, date, enabled) VALUES (?, ?, ?, ?, ?, ?, ?);`,
              insertValues,
              (_tx: SQLTransaction, _result?: SQLResultSet) => resolve(),
              (_tx: SQLTransaction, error?: any) => {
                reject(error);
                return true;
              }
            );
          });
        });
      });
    }
  }

  async deleteSchedule(id: number) {
    return new Promise<void>((resolve, reject) => {
      type SQLResultSetRowList = {
        _array: any[];
        item?: (index: number) => any;
        length?: number;
      };
      type SQLResultSet = {
        rows: SQLResultSetRowList;
      };
      type SQLTransaction = {
        executeSql(
          sqlStatement: string,
          args?: any[],
          success?: (tx: SQLTransaction, result: SQLResultSet) => void,
          error?: (tx: SQLTransaction, error?: any) => boolean | void
        ): void;
      };

      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `DELETE FROM ${this.tableName} WHERE id = ?;`,
          [id],
          (_tx: SQLTransaction, _result?: SQLResultSet) => resolve(),
          (_tx: SQLTransaction, error?: any) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }
}

const dbInstance = new ScheduleDB();

// --- TYPE DEFINITIONS ---
type Action = 'On' | 'Off';

interface LocalScheduleItem {
  id: string;
  title: string;
  action: Action;
  time: string;
  days?: string[];
  date?: string;
  enabled: boolean;
}

type DayLabel = { short: string; full: string };

// --- MAIN COMPONENT ---
export default function ScheduleScreen() {
  const DARK_BLUE = '#0D2C54';
  const WHITE = '#fff';
  const containerWidth = useWindowDimensions().width >= 768 ? '60%' : '100%';

  const dayLabels: DayLabel[] = [
    { short: 'S', full: 'Sunday' },
    { short: 'M', full: 'Monday' },
    { short: 'Tu', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'Th', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'Sa', full: 'Saturday' },
  ];

  const [scheduleData, setScheduleData] = useState<LocalScheduleItem[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<Action>('On');
  const [time, setTime] = useState<Date>(new Date());
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const loadSchedules = useCallback(async () => {
    try {
      const rawSchedules = await dbInstance.getSchedules();
      // Map raw DB data to the frontend structure
      const formattedSchedules = rawSchedules.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        action: item.action as Action,
        time: item.time,
        days: item.days_json ? JSON.parse(item.days_json) : undefined,
        date: item.date || undefined,
        enabled: item.enabled === 1,
      }));
      setScheduleData(formattedSchedules);
    } catch (e) {
      console.error('Failed to load schedules from SQLite. Initializing DB.', e);
      setScheduleData([]);
    }
  }, []);

  useEffect(() => {
    // Add a small delay to ensure the native module is fully loaded (common fix for 'is not a function')
    const timer = setTimeout(() => {
      loadSchedules();
    }, 100);
    return () => clearTimeout(timer);
  }, [loadSchedules]);

  // --- CRUD OPERATIONS ---

  const resetForm = () => {
    setEditingId(null);
    setSelectedDevice('');
    setSelectedAction('On');
    setTime(new Date());
    setRepeatDays([]);
    setDate(new Date());
  };

  const handleScheduleTask = async () => {
    if (!selectedDevice) {
      Alert.alert('Validation Error', 'Please select a device.');
      return;
    }

    const isUpdate = editingId !== null;
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const deviceTitle = selectedDevice;

    const schedulePayload = {
      id: isUpdate ? Number(editingId) : undefined,
      device_id: 'mock-device-id',
      title: deviceTitle,
      action: selectedAction,
      time: timeString,
      days_json: repeatDays.length > 0 ? JSON.stringify(repeatDays) : null,
      date: repeatDays.length === 0 ? date.toISOString().split('T')[0] : null,
      enabled: true,
    };

    try {
      await dbInstance.saveSchedule(schedulePayload, isUpdate);
      Alert.alert('Success', isUpdate ? 'Changes saved.' : 'Task scheduled.');

      loadSchedules();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task to local database.');
    }
  };

  const handleEditTask = (id: string) => {
    const item = scheduleData.find(s => s.id === id);
    if (item) {
      setEditingId(item.id);
      const deviceValue = item.title.includes('Motor')
        ? 'motor'
        : item.title.includes('Lights')
          ? 'lights'
          : item.title;
      setSelectedDevice(deviceValue);
      setSelectedAction(item.action);
      const [hours, minutes] = item.time.split(':').map(Number);
      const newTime = new Date();
      newTime.setHours(hours || 0, minutes || 0, 0, 0);
      setTime(newTime);
      setRepeatDays(item.days || []);
      setDate(item.date ? new Date(item.date) : new Date());
    }
  };

  const handleDeleteTask = (id: string, title: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbInstance.deleteSchedule(Number(id));
              Alert.alert('Success', 'Task deleted locally.');
              loadSchedules();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task locally.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleEnabled = async (id: string) => {
    const currentItem = scheduleData.find(i => i.id === id);
    if (!currentItem) return;

    const payload = {
      ...currentItem,
      id: Number(id),
      enabled: !currentItem.enabled,
      days_json: currentItem.days ? JSON.stringify(currentItem.days) : null,
      device_id: 'mock-device-id',
    };

    try {
      await dbInstance.saveSchedule(payload, true);
      loadSchedules();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle status.');
    }
  };

  const toggleDayInSchedule = async (id: string, day: string) => {
    const currentItem = scheduleData.find(i => i.id === id);
    if (!currentItem) return;

    const existingDays = currentItem.days || [];
    const newDays = existingDays.includes(day)
      ? existingDays.filter(d => d !== day)
      : [...existingDays, day];

    const payload = {
      ...currentItem,
      id: Number(id),
      days: newDays,
      days_json: JSON.stringify(newDays),
      device_id: 'mock-device-id',
    };

    try {
      await dbInstance.saveSchedule(payload, true);
      loadSchedules();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle day.');
    }
  };

  const toggleRepeatDay = (day: string) => {
    setRepeatDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setTime(selectedDate);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { width: containerWidth }]}
      style={styles.container}
    >
      <Text style={styles.header}>Current Schedules</Text>

      {scheduleData.length === 0 ? (
        <Text style={styles.noTasksMessage}>
          No running tasks. Start by scheduling a new one below! 📝
        </Text>
      ) : (
        scheduleData.map(item => {
          const isActive = item.id === editingId;

          return (
            <View
              key={item.id}
              style={[
                styles.card,
                !item.enabled && styles.disabledCard,
                isActive && styles.editingCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.icons}>
                  <TouchableOpacity onPress={() => handleEditTask(item.id)}>
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={isActive ? DARK_BLUE : '#6c757d'}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteTask(item.id, item.title)}>
                    <MaterialIcons name="delete" size={18} color="#dc3545" style={styles.icon} />
                  </TouchableOpacity>
                  <Switch value={item.enabled} onValueChange={() => toggleEnabled(item.id)} />
                </View>
              </View>
              <Text style={styles.cardSubText}>
                Turn <Text style={styles.bold}>{item.action}</Text> at{' '}
                <Text style={styles.bold}>{item.time}</Text>
              </Text>
              {item.date ? (
                <Text style={styles.dateText}>On {item.date}</Text>
              ) : (
                <View style={styles.dayContainer}>
                  {dayLabels.map(day => {
                    const dayIsActive = Array.isArray(item.days) && item.days.includes(day.short);

                    return (
                      <TouchableOpacity
                        key={day.short}
                        onPress={() => toggleDayInSchedule(item.id, day.short)}
                        style={[styles.day, dayIsActive ? styles.activeDay : styles.inactiveDay]}
                      >
                        <Text style={[styles.dayText, { color: dayIsActive ? WHITE : DARK_BLUE }]}>
                          {day.short}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })
      )}

      <Text style={styles.header}>{editingId !== null ? 'Edit Task' : 'New Task'}</Text>
      <View style={styles.newTask}>
        <Text style={styles.label}>Device</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedDevice}
            onValueChange={itemValue => setSelectedDevice(itemValue as string)}
            style={styles.picker}
            dropdownIconColor={DARK_BLUE}
          >
            <Picker.Item label="Select a device to control" value="" />
            <Picker.Item label="Main Conveyor Motor" value="motor" />
            <Picker.Item label="Workshop Lights" value="lights" />
            <Picker.Item label="HVAC Unit 1" value="HVAC Unit 1" />
            <Picker.Item label="Assembly Line 2" value="Assembly Line 2" />
          </Picker>
        </View>

        <Text style={styles.label}>Action</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedAction}
            onValueChange={itemValue => setSelectedAction(itemValue as Action)}
            style={styles.picker}
            dropdownIconColor={DARK_BLUE}
          >
            <Picker.Item label="Turn On" value="On" />
            <Picker.Item label="Turn Off" value="Off" />
          </Picker>
        </View>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
          <Text>
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Text style={styles.label}>Repeat Task</Text>
        <View style={styles.dayContainer}>
          {dayLabels.map(day => {
            const isActive = repeatDays.includes(day.short);
            const dayTextColor = isActive ? WHITE : DARK_BLUE;

            return (
              <TouchableOpacity
                key={day.short}
                onPress={() => toggleRepeatDay(day.short)}
                style={[styles.day, isActive ? styles.activeDay : styles.inactiveDay]}
              >
                <Text style={[styles.dayText, { color: dayTextColor }]}>{day.short}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {repeatDays.length === 0 && (
          <>
            <Text style={styles.label}>Date (One-time Schedule)</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleScheduleTask} style={styles.scheduleButton}>
            <Text style={styles.scheduleText}>
              {editingId !== null ? 'Save Changes' : 'Schedule Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D2C54',
    marginBottom: 12,
    textAlign: 'center',
  },
  noTasksMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  editingCard: {
    borderColor: '#0D2C54',
    borderWidth: 2,
  },
  disabledCard: {
    backgroundColor: '#e9e9e9',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0D2C54',
  },
  cardSubText: {
    marginTop: 6,
    color: '#6c757d',
  },
  bold: {
    fontWeight: 'bold',
    color: '#0D2C54',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 8,
  },
  dayContainer: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  day: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeDay: {
    backgroundColor: '#0D2C54',
  },
  inactiveDay: {
    backgroundColor: '#e9ecef',
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  newTask: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#0D2C54',
  },
  pickerWrapper: {
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    justifyContent: 'center',
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0D2C54',
  },
  cancelText: {
    color: '#0D2C54',
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#0D2C54',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  scheduleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#6c757d',
    marginTop: 6,
  },
});
