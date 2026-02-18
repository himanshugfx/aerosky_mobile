import FontAwesome from '@expo/vector-icons/FontAwesome';
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
    useColorScheme
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
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

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
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.header}>
                            <View>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    {initialData ? 'Edit Battery Pair' : 'New Battery Pair'}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Configure aircraft power systems
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Pair ID / Number *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={pairNumber}
                                    onChangeText={setPairNumber}
                                    placeholder="e.g. 01"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Rated Capacity *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={ratedCapacity}
                                    onChangeText={setRatedCapacity}
                                    placeholder="e.g. 22000 mAh"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: theme.primary, shadowColor: theme.primary },
                                    (!pairNumber.trim() || isLoading) && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading || !pairNumber.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {initialData ? 'Update System' : 'Register Battery Pair'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: Spacing.xl,
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 4,
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
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: Spacing.md,
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
    submitButton: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.lg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
