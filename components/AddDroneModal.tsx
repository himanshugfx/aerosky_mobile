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

interface AddDroneModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (drone: any) => Promise<void>;
    initialData?: any;
}

export default function AddDroneModal({ visible, onClose, onSubmit, initialData }: AddDroneModalProps) {
    const [modelName, setModelName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    // Clear fields every time the modal opens
    useEffect(() => {
        if (visible) {
            setModelName(initialData?.modelName || '');
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!modelName.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                modelName: modelName.trim(),
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
                                    {initialData ? 'Edit Aircraft' : 'Register Aircraft'}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Add a new UAV to fleet registry
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Aircraft Model Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={modelName}
                                    onChangeText={setModelName}
                                    placeholder="e.g. DJI Matrice 300 RTK"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: theme.primary, shadowColor: theme.primary },
                                    (!modelName.trim() || isLoading) && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading || !modelName.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {initialData ? 'Update Aircraft' : 'Register Aircraft'}
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
