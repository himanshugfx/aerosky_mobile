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

interface AddSubcontractorModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (sub: any) => Promise<void>;
    initialData?: any;
}

export default function AddSubcontractorModal({ visible, onClose, onSubmit, initialData }: AddSubcontractorModalProps) {
    const [companyName, setCompanyName] = useState(initialData?.companyName || '');
    const [type, setType] = useState(initialData?.type || 'Manufacturing');
    const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
    const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || '');
    const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
    const [agreementDate, setAgreementDate] = useState(initialData?.agreementDate || new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setCompanyName(initialData?.companyName || '');
            setType(initialData?.type || 'Manufacturing');
            setContactPerson(initialData?.contactPerson || '');
            setContactEmail(initialData?.contactEmail || '');
            setContactPhone(initialData?.contactPhone || '');
            setAgreementDate(initialData?.agreementDate || new Date().toISOString().split('T')[0]);
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!companyName.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                companyName: companyName.trim(),
                type,
                contactPerson: contactPerson.trim(),
                contactEmail: contactEmail.trim(),
                contactPhone: contactPhone.trim(),
                agreementDate,
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
                        <Text style={styles.title}>{initialData ? 'Edit Subcontractor' : 'Add Subcontractor'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={companyName}
                                onChangeText={setCompanyName}
                                placeholder="Enter company name"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeRow}>
                                {['Manufacturing', 'Design'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeButton, type === t && styles.activeTypeButton]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[styles.typeButtonText, type === t && styles.activeTypeButtonText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Person</Text>
                            <TextInput
                                style={styles.input}
                                value={contactPerson}
                                onChangeText={setContactPerson}
                                placeholder="Enter name"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Email</Text>
                            <TextInput
                                style={styles.input}
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                placeholder="Enter email"
                                keyboardType="email-address"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={contactPhone}
                                onChangeText={setContactPhone}
                                placeholder="Enter phone"
                                keyboardType="phone-pad"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Agreement Date</Text>
                            <TextInput
                                style={styles.input}
                                value={agreementDate}
                                onChangeText={setAgreementDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, !companyName.trim() && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isLoading || !companyName.trim()}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{initialData ? 'Update' : 'Add Subcontractor'}</Text>}
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
    typeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    typeButton: {
        flex: 1,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        alignItems: 'center',
    },
    activeTypeButton: {
        backgroundColor: Colors.dark.primary,
        borderColor: Colors.dark.primary,
    },
    typeButtonText: {
        color: Colors.dark.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    activeTypeButtonText: {
        color: '#fff',
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
