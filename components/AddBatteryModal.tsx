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
    const [pairNumber, setPairNumber] = useState(initialData?.batteryNumberA?.replace(/[A-Z]/g, '') || '');
    const [ratedCapacity, setRatedCapacity] = useState(initialData?.ratedCapacity || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setPairNumber(initialData?.batteryNumberA?.replace(/[A-Z]/g, '') || '');
            setRatedCapacity(initialData?.ratedCapacity || '');
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!pairNumber.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                model: `Pair ${pairNumber.trim()}`,
                ratedCapacity: ratedCapacity.trim(),
                batteryNumberA: `${pairNumber.trim()}A`,
                batteryNumberB: `${pairNumber.trim()}B`,
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
                            <Text style={styles.label}>Pair Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={pairNumber}
                                onChangeText={setPairNumber}
                                placeholder="e.g. 1"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rated Capacity *</Text>
                            <TextInput
                                style={styles.input}
                                value={ratedCapacity}
                                onChangeText={setRatedCapacity}
                                placeholder="e.g. 22000 mAh"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, !pairNumber.trim() && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isLoading || !pairNumber.trim()}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{initialData ? 'Update Pair' : 'Save Battery Pair'}</Text>}
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
