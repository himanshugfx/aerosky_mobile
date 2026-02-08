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

interface AddBatteryModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (battery: any) => Promise<void>;
    initialData?: any;
}

export default function AddBatteryModal({ visible, onClose, onSubmit, initialData }: AddBatteryModalProps) {
    const [model, setModel] = useState(initialData?.model || '');
    const [ratedCapacity, setRatedCapacity] = useState(initialData?.ratedCapacity || '');
    const [batteryNumberA, setBatteryNumberA] = useState(initialData?.batteryNumberA || '');
    const [batteryNumberB, setBatteryNumberB] = useState(initialData?.batteryNumberB || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setModel(initialData?.model || '');
            setRatedCapacity(initialData?.ratedCapacity || '');
            setBatteryNumberA(initialData?.batteryNumberA || '');
            setBatteryNumberB(initialData?.batteryNumberB || '');
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!model.trim() || !batteryNumberA.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                model: model.trim(),
                ratedCapacity: ratedCapacity.trim(),
                batteryNumberA: batteryNumberA.trim(),
                batteryNumberB: batteryNumberB.trim(),
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{initialData ? 'Edit Battery' : 'Add New Battery'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Battery Model *</Text>
                            <TextInput
                                style={styles.input}
                                value={model}
                                onChangeText={setModel}
                                placeholder="e.g. Tattu Plus 22000mAh"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rated Capacity</Text>
                            <TextInput
                                style={styles.input}
                                value={ratedCapacity}
                                onChangeText={setRatedCapacity}
                                placeholder="e.g. 22000 mAh 44.4V"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Battery Serial Number A *</Text>
                            <TextInput
                                style={styles.input}
                                value={batteryNumberA}
                                onChangeText={setBatteryNumberA}
                                placeholder="Enter serial A"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Battery Serial Number B</Text>
                            <TextInput
                                style={styles.input}
                                value={batteryNumberB}
                                onChangeText={setBatteryNumberB}
                                placeholder="Enter serial B (optional)"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, (!model.trim() || !batteryNumberA.trim()) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isLoading || !model.trim() || !batteryNumberA.trim()}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{initialData ? 'Update Battery' : 'Add Battery'}</Text>}
                        </TouchableOpacity>
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
        maxHeight: '90%',
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
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.dark.text,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    submitButton: {
        backgroundColor: Colors.dark.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
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
