import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../constants/Colors';
import * as DocumentPicker from 'expo-document-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AddOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (order: any) => Promise<void>;
    initialData?: any;
}

export default function AddOrderModal({ visible, onClose, onSubmit, initialData }: AddOrderModalProps) {
    const [contractNumber, setContractNumber] = useState(initialData?.contractNumber || '');
    const [clientName, setClientName] = useState(initialData?.clientName || '');
    const [clientSegment, setClientSegment] = useState(initialData?.clientSegment || 'Commercial');
    const [droneModel, setDroneModel] = useState(initialData?.droneModel || '');
    const [droneType, setDroneType] = useState(initialData?.droneType || 'Multi-rotor');
    const [weightClass, setWeightClass] = useState(initialData?.weightClass || 'Small');
    const [contractValue, setContractValue] = useState(initialData?.contractValue?.toString() || '');
    const [orderDate, setOrderDate] = useState(initialData?.orderDate ? initialData.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [manufacturingStage, setManufacturingStage] = useState(initialData?.manufacturingStage || 'In Design');
    const [dgcaFaaCertificationStatus, setDgcaFaaCertificationStatus] = useState(initialData?.dgcaFaaCertificationStatus || 'Pending');
    const [bomReadiness, setBomReadiness] = useState(initialData?.bomReadiness || 'Not Ready');
    const [uploads, setUploads] = useState<{ fileData: string, fileName: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    useEffect(() => {
        if (visible) {
            setContractNumber(initialData?.contractNumber || '');
            setClientName(initialData?.clientName || '');
            setClientSegment(initialData?.clientSegment || 'Commercial');
            setDroneModel(initialData?.droneModel || '');
            setDroneType(initialData?.droneType || 'Multi-rotor');
            setWeightClass(initialData?.weightClass || 'Small');
            setContractValue(initialData?.contractValue?.toString() || '');
            setOrderDate(initialData?.orderDate ? initialData.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]);
            setManufacturingStage(initialData?.manufacturingStage || 'In Design');
            setDgcaFaaCertificationStatus(initialData?.dgcaFaaCertificationStatus || 'Pending');
            setBomReadiness(initialData?.bomReadiness || 'Not Ready');
            setUploads([]);
        }
    }, [visible, initialData]);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const newDoc = {
                    fileData: 'data:image/png;base64,iVBORw0KGgo...', // Placeholder
                    fileName: result.assets[0].name
                };
                setUploads(prev => [...prev, newDoc]);
            }
        } catch (err) {
            console.error('Picker error:', err);
        }
    };

    const handleSubmit = async () => {
        if (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) {
            Alert.alert('Required Fields', 'Please fill in all fields marked with *');
            return;
        }

        setIsLoading(true);
        try {
            const dateObj = new Date(orderDate);
            if (isNaN(dateObj.getTime())) {
                Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format');
                setIsLoading(false);
                return;
            }

            await onSubmit({
                contractNumber: contractNumber.trim(),
                clientName: clientName.trim(),
                clientSegment,
                droneModel: droneModel.trim(),
                droneType,
                weightClass,
                contractValue: parseFloat(contractValue) || 0,
                orderDate: dateObj.toISOString(),
                manufacturingStage,
                dgcaFaaCertificationStatus,
                bomReadiness,
                currency: 'INR',
                uploads: uploads
            });
            Alert.alert('Success', 'Order created successfully');
            onClose();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to create order.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPicker = (label: string, value: string, options: string[], setter: (val: string) => void) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <View style={styles.optionRow}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionButton,
                            { borderColor: theme.border, backgroundColor: theme.cardBackground },
                            value === opt && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setter(opt)}
                    >
                        <Text style={[
                            styles.optionText,
                            { color: theme.textSecondary },
                            value === opt && { color: '#fff' }
                        ]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: theme.text }]}>{initialData ? 'Edit Order' : 'New Order'}</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter manufacturing details below</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="times" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Contract Number *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={contractNumber}
                                onChangeText={setContractNumber}
                                placeholder="e.g. AS-2024-001"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Client Name *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={clientName}
                                onChangeText={setClientName}
                                placeholder="Enter client name"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Client Segment', clientSegment, ['Commercial', 'Defense', 'Govt'], setClientSegment)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Drone Model *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={droneModel}
                                onChangeText={setDroneModel}
                                placeholder="e.g. AeroX-1"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        {renderPicker('Drone Type', droneType, ['Multi-rotor', 'Fixed-wing', 'Hybrid'], setDroneType)}
                        {renderPicker('Weight Class', weightClass, ['Nano', 'Micro', 'Small', 'Medium'], setWeightClass)}

                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Value (INR)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={contractValue}
                                    onChangeText={setContractValue}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={orderDate}
                                    onChangeText={setOrderDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>
                        </View>

                        {renderPicker('Manufacturing Stage', manufacturingStage, ['In Design', 'Assembling', 'Testing', 'Delivered'], setManufacturingStage)}
                        {renderPicker('BOM Readiness', bomReadiness, ['Not Ready', 'Processing', 'Ready'], setBomReadiness)}
                        {renderPicker('Certification Status', dgcaFaaCertificationStatus, ['Pending', 'In Progress', 'Certified'], setDgcaFaaCertificationStatus)}

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Documentation</Text>
                            <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={handlePickDocument}>
                                <FontAwesome name="plus-circle" size={16} color={theme.primary} />
                                <Text style={[styles.uploadBtnText, { color: theme.primary }]}>Upload Images or PDF</Text>
                            </TouchableOpacity>
                            <View style={styles.uploadList}>
                                {uploads.map((u, i) => (
                                    <View key={i} style={[styles.uploadItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                        <View style={styles.uploadInfo}>
                                            <FontAwesome name="file-text" size={14} color={theme.textSecondary} />
                                            <Text style={[styles.uploadItemText, { color: theme.text }]} numberOfLines={1}>{u.fileName}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setUploads(prev => prev.filter((_, idx) => idx !== i))}>
                                            <FontAwesome name="minus-circle" size={18} color={theme.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: theme.primary, shadowColor: theme.primary },
                                (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) && { backgroundColor: theme.border }
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading || !contractNumber.trim() || !clientName.trim() || !droneModel.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {initialData ? 'Save Changes' : 'Create Manufacturing Order'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Discard Changes</Text>
                        </TouchableOpacity>
                        <View style={{ height: 60 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl * 1.5,
        borderTopRightRadius: BorderRadius.xl * 1.5,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        height: '92%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        marginTop: 2,
        fontWeight: '500',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    inputRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        fontSize: 15,
        fontWeight: '500',
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1.5,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitButton: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.sm,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancelBtn: {
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        fontWeight: '700',
        fontSize: 14,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        gap: 10,
    },
    uploadBtnText: {
        fontWeight: '800',
        fontSize: 14,
    },
    uploadList: {
        marginTop: 10,
    },
    uploadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: BorderRadius.md,
        marginBottom: 6,
        borderWidth: 1,
    },
    uploadInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    uploadItemText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
    },
});
