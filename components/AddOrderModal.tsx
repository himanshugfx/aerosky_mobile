import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../constants/Colors';

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
    const [isLoading, setIsLoading] = useState(false);

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
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                contractNumber: contractNumber.trim(),
                clientName: clientName.trim(),
                clientSegment,
                droneModel: droneModel.trim(),
                droneType,
                weightClass,
                contractValue: parseFloat(contractValue) || 0,
                orderDate: new Date(orderDate).toISOString(),
                manufacturingStage,
                dgcaFaaCertificationStatus,
                bomReadiness,
                currency: 'INR',
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderPicker = (label: string, value: string, options: string[], setter: (val: string) => void) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.optionRow}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, value === opt && styles.optionButtonActive]}
                        onPress={() => setter(opt)}
                    >
                        <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{initialData ? 'Edit Order' : 'Create New Order'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contract Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={contractNumber}
                                onChangeText={setContractNumber}
                                placeholder="e.g. AS-2024-001"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Client Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={clientName}
                                onChangeText={setClientName}
                                placeholder="Enter client name"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        {renderPicker('Client Segment', clientSegment, ['Commercial', 'Defense', 'Govt'], setClientSegment)}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Drone Model *</Text>
                            <TextInput
                                style={styles.input}
                                value={droneModel}
                                onChangeText={setDroneModel}
                                placeholder="e.g. AeroX-1"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        {renderPicker('Drone Type', droneType, ['Multi-rotor', 'Fixed-wing', 'Hybrid'], setDroneType)}
                        {renderPicker('Weight Class', weightClass, ['Nano', 'Micro', 'Small', 'Medium'], setWeightClass)}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contract Value (INR)</Text>
                            <TextInput
                                style={styles.input}
                                value={contractValue}
                                onChangeText={setContractValue}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Order Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={orderDate}
                                onChangeText={setOrderDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        {renderPicker('Manufacturing Stage', manufacturingStage, ['In Design', 'Assembling', 'Testing', 'Delivered'], setManufacturingStage)}
                        {renderPicker('BOM Readiness', bomReadiness, ['Not Ready', 'Processing', 'Ready'], setBomReadiness)}
                        {renderPicker('Certification Status', dgcaFaaCertificationStatus, ['Pending', 'In Progress', 'Certified'], setDgcaFaaCertificationStatus)}

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!contractNumber.trim() || !clientName.trim() || !droneModel.trim()) && styles.disabledButton
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading || !contractNumber.trim() || !clientName.trim() || !droneModel.trim()}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{initialData ? 'Update Order' : 'Create Order'}</Text>}
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.dark.cardBackground,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        maxHeight: '95%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    closeButton: {
        fontSize: 24,
        color: Colors.dark.textSecondary,
    },
    form: {
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xs,
        fontWeight: '600',
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.dark.text,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    optionButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        marginBottom: Spacing.xs,
    },
    optionButtonActive: {
        backgroundColor: Colors.dark.primary,
        borderColor: Colors.dark.primary,
    },
    optionText: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: Colors.dark.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: 'bold',
    },
});
