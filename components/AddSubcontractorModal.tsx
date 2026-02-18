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
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

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
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.header}>
                            <View>
                                <Text style={[styles.title, { color: theme.text }]}>
                                    {initialData ? 'Edit Partner' : 'New Subcontractor'}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Manage external service providers
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Company Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    placeholder="Enter legal company name"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Service Type</Text>
                                <View style={styles.typeRow}>
                                    {['Manufacturing', 'Design'].map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[
                                                styles.typeButton,
                                                { backgroundColor: theme.cardBackground, borderColor: theme.border },
                                                type === t && { backgroundColor: theme.primary, borderColor: theme.primary }
                                            ]}
                                            onPress={() => setType(t)}
                                        >
                                            <Text style={[
                                                styles.typeButtonText,
                                                { color: theme.textSecondary },
                                                type === t && { color: '#fff', fontWeight: '800' }
                                            ]}>
                                                {t}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Primary Contact Person</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={contactPerson}
                                    onChangeText={setContactPerson}
                                    placeholder="Representative Name"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={contactEmail}
                                        onChangeText={setContactEmail}
                                        placeholder="business@partner.com"
                                        keyboardType="email-address"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={contactPhone}
                                        onChangeText={setContactPhone}
                                        placeholder="+X-XXX..."
                                        keyboardType="phone-pad"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Agreement Effective Date</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={agreementDate}
                                    onChangeText={setAgreementDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: theme.primary, shadowColor: theme.primary },
                                    (!companyName.trim() || isLoading) && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading || !companyName.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {initialData ? 'Save Changes' : 'Onboard Subcontractor'}
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
        maxHeight: '90%',
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
    row: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
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
    typeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
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
