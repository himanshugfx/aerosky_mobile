import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../constants/Colors';
import { useComplianceStore } from '../lib/store';
import type { FlightLog } from '../lib/types';

interface SelectorProps {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    icon?: string;
}

const Selector = ({ label, value, placeholder, onPress, icon }: SelectorProps) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.selectorBox} onPress={onPress}>
            <View style={styles.selectorContent}>
                {icon && <FontAwesome name={icon as any} size={14} color={Colors.dark.textSecondary} style={{ marginRight: 8 }} />}
                <Text style={[styles.selectorText, !value && { color: Colors.dark.textSecondary }]}>
                    {value || placeholder}
                </Text>
            </View>
            <FontAwesome name="chevron-down" size={12} color={Colors.dark.textSecondary} />
        </TouchableOpacity>
    </View>
);

interface AddFlightLogModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<FlightLog>) => Promise<void>;
}

export default function AddFlightLogModal({ visible, onClose, onSubmit }: AddFlightLogModalProps) {
    const { drones, teamMembers, batteries } = useComplianceStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<FlightLog>>({
        date: new Date().toISOString().split('T')[0],
        takeoffTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: '',
        locationName: '',
        missionType: 'Commercial',
        picId: '',
        voId: '',
        droneId: '',
        serialNumber: '',
        uin: '',
        technicalFeedback: '',
        batteryId: '',
    });

    const [fetchingLocation, setFetchingLocation] = useState(false);

    const handleFetchLocation = () => {
        setFetchingLocation(true);
        // Fallback to manual for now if navigator.geolocation is unavailable
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        setFormData(prev => ({
                            ...prev,
                            locationCoords: coords,
                            locationName: data.display_name || coords
                        }));
                    } catch (error) {
                        setFormData(prev => ({ ...prev, locationCoords: coords, locationName: coords }));
                    } finally {
                        setFetchingLocation(false);
                    }
                },
                () => {
                    setFetchingLocation(false);
                    alert('Could not fetch location automatically.');
                }
            );
        } else {
            setFetchingLocation(false);
            alert('Location services not available.');
        }
    };

    const handleSave = async () => {
        if (!formData.droneId || !formData.picId || !formData.date || !formData.takeoffTime) {
            alert('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                takeoffTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                duration: '',
                locationName: '',
                missionType: 'Commercial',
                picId: '',
                voId: '',
                droneId: '',
                serialNumber: '',
                uin: '',
                technicalFeedback: '',
                batteryId: '',
            });
        } catch (error) {
            alert('Failed to save flight log');
        } finally {
            setLoading(false);
        }
    };

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerConfig, setPickerConfig] = useState<{
        title: string;
        items: { id: string; label: string; sublabel?: string }[];
        onSelect: (id: string) => void;
    } | null>(null);

    const openPicker = (title: string, items: { id: string; label: string; sublabel?: string }[], onSelect: (id: string) => void) => {
        setPickerConfig({ title, items, onSelect });
        setPickerVisible(true);
    };

    const selectedDrone = drones.find(d => d.id === formData.droneId);
    const selectedPic = teamMembers.find(m => m.id === formData.picId);
    const selectedBattery = batteries.find(b => b.id === formData.batteryId);
    const selectedUnit = selectedDrone?.manufacturedUnits.find(u => u.serialNumber === formData.serialNumber);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>New Operational Log</Text>
                            <Text style={styles.headerSubtitle}>COMPLIANCE RECORD</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <FontAwesome name="times" size={20} color={Colors.dark.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
                        {/* Section 1: Pilot Flight Log */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: Colors.dark.primary }]}>
                                    <FontAwesome name="user" size={14} color="#fff" />
                                </View>
                                <Text style={styles.sectionTitle}>1. Pilot Flight Log</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Date *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.date}
                                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={Colors.dark.textSecondary}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Takeoff Time *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.takeoffTime}
                                        onChangeText={(text) => setFormData({ ...formData, takeoffTime: text })}
                                        placeholder="HH:MM"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Duration *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.duration}
                                        onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                        placeholder="e.g. 25 mins"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Location *</Text>
                                    <TouchableOpacity onPress={handleFetchLocation} disabled={fetchingLocation}>
                                        <Text style={styles.fetchBtn}>
                                            {fetchingLocation ? 'Fetching...' : 'Fetch Location'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={formData.locationName}
                                    onChangeText={(text) => setFormData({ ...formData, locationName: text })}
                                    placeholder="Enter location"
                                    placeholderTextColor={Colors.dark.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mission Type *</Text>
                                <View style={styles.typeSelector}>
                                    {['Training', 'Commercial', 'Testing'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeBtn,
                                                formData.missionType === type && styles.typeBtnActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, missionType: type })}
                                        >
                                            <Text style={[
                                                styles.typeBtnText,
                                                formData.missionType === type && styles.typeBtnTextActive
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <Selector
                                label="PIC (Pilot in Command) *"
                                value={selectedPic?.name || ''}
                                placeholder="Select Pilot"
                                onPress={() => openPicker(
                                    "Select PIC",
                                    teamMembers.map(m => ({ id: m.id, label: m.name, sublabel: 'Pilot' })),
                                    (id) => setFormData({ ...formData, picId: id })
                                )}
                                icon="user"
                            />
                        </View>

                        {/* Section 2: Aircraft Log */}
                        <View style={[styles.section, { backgroundColor: Colors.dark.inputBackground }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: Colors.dark.text }]}>
                                    <FontAwesome name="plane" size={14} color={Colors.dark.background} />
                                </View>
                                <Text style={styles.sectionTitle}>2. Aircraft Log</Text>
                            </View>

                            <Selector
                                label="Drone Model *"
                                value={selectedDrone?.modelName || ''}
                                placeholder="Select Drone"
                                onPress={() => openPicker(
                                    "Select Drone",
                                    drones.map(d => ({ id: d.id, label: d.modelName })),
                                    (id) => setFormData({ ...formData, droneId: id, serialNumber: '', uin: '' })
                                )}
                                icon="plane"
                            />

                            {selectedDrone && (
                                <Selector
                                    label="Serial Number / UIN *"
                                    value={formData.serialNumber ? `SN: ${formData.serialNumber}` : ''}
                                    placeholder="Select Unit"
                                    onPress={() => openPicker(
                                        "Select Unit",
                                        selectedDrone.manufacturedUnits.map(u => ({ id: u.serialNumber, label: `SN: ${u.serialNumber}`, sublabel: `UIN: ${u.uin}` })),
                                        (sn) => {
                                            const unit = selectedDrone.manufacturedUnits.find(u => u.serialNumber === sn);
                                            setFormData({ ...formData, serialNumber: sn, uin: unit?.uin || '' });
                                        }
                                    )}
                                    icon="barcode"
                                />
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Technical Feedback</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.technicalFeedback}
                                    onChangeText={(text) => setFormData({ ...formData, technicalFeedback: text })}
                                    placeholder="Note any observations..."
                                    placeholderTextColor={Colors.dark.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Section 3: Battery Log */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: '#F97316' }]}>
                                    <FontAwesome name="bolt" size={14} color="#fff" />
                                </View>
                                <Text style={styles.sectionTitle}>3. Battery Management</Text>
                            </View>

                            <Selector
                                label="Battery Pair *"
                                value={selectedBattery ? `${selectedBattery.batteryNumberA} + ${selectedBattery.batteryNumberB}` : ''}
                                placeholder="Select Battery Pair"
                                onPress={() => openPicker(
                                    "Select Battery Pair",
                                    batteries.map(b => ({ id: b.id, label: `${b.batteryNumberA} + ${b.batteryNumberB}`, sublabel: b.ratedCapacity })),
                                    (id) => setFormData({ ...formData, batteryId: id })
                                )}
                                icon="bolt"
                            />
                        </View>
                    </ScrollView>

                    <Modal visible={pickerVisible} transparent animationType="fade">
                        <View style={styles.pickerOverlay}>
                            <View style={styles.pickerModal}>
                                <View style={styles.pickerHeader}>
                                    <Text style={styles.pickerTitle}>{pickerConfig?.title}</Text>
                                    <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                        <FontAwesome name="times" size={20} color={Colors.dark.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={{ maxHeight: 400 }}>
                                    {pickerConfig?.items.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                pickerConfig.onSelect(item.id);
                                                setPickerVisible(false);
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.pickerLabel}>{item.label}</Text>
                                                {item.sublabel && <Text style={styles.pickerSublabel}>{item.sublabel}</Text>}
                                            </View>
                                            <FontAwesome name="chevron-right" size={12} color={Colors.dark.border} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.discardBtn} onPress={onClose}>
                            <Text style={styles.discardBtnText}>Discard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <FontAwesome name="check-circle" size={18} color="#fff" />
                                    <Text style={styles.submitBtnText}>Save Log</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.dark.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '92%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: Colors.dark.primary,
        letterSpacing: 1,
        marginTop: 2,
    },
    closeBtn: {
        padding: 8,
    },
    scrollBody: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: 12,
        color: Colors.dark.text,
        fontSize: 14,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    fetchBtn: {
        fontSize: 12,
        color: Colors.dark.primary,
        fontWeight: '700',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBtn: {
        flex: 1,
        backgroundColor: Colors.dark.inputBackground,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    typeBtnActive: {
        backgroundColor: Colors.dark.primary + '20',
        borderColor: Colors.dark.primary,
    },
    typeBtnText: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    typeBtnTextActive: {
        color: Colors.dark.primary,
    },
    pickerScroll: {
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    pickerItem: {
        backgroundColor: Colors.dark.inputBackground,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    pickerItemActive: {
        backgroundColor: Colors.dark.primary,
        borderColor: Colors.dark.primary,
    },
    pickerItemTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    selectorBox: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectorText: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '500',
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    pickerModal: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    pickerLabel: {
        fontSize: 15,
        color: Colors.dark.text,
        fontWeight: '500',
    },
    pickerSublabel: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.xl,
        backgroundColor: Colors.dark.background,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
        gap: Spacing.md,
    },
    discardBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        backgroundColor: Colors.dark.inputBackground,
    },
    discardBtnText: {
        color: Colors.dark.textSecondary,
        fontWeight: '700',
    },
    submitBtn: {
        flex: 2,
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.primary,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
