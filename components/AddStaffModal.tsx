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
import { Role, ROLE_DISPLAY_NAMES } from '../lib/permissions';
import { useAuthStore } from '../lib/store';

interface AddStaffModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (member: any) => Promise<void>;
    initialData?: any;
}

const ASSIGNABLE_ROLES: { value: Role; label: string }[] = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
    { value: 'QA_MANAGER', label: 'QA Manager' },
    { value: 'PILOT', label: 'Remote Pilot' },
    { value: 'TECHNICIAN', label: 'Technician' },
    { value: 'VIEWER', label: 'Viewer (Read-only)' },
];

export default function AddStaffModal({ visible, onClose, onSubmit, initialData }: AddStaffModalProps) {
    const { user } = useAuthStore();
    const [name, setName] = useState(initialData?.name || '');
    const [accessId, setAccessId] = useState(initialData?.accessId || '');
    const [position, setPosition] = useState(initialData?.position || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [role, setRole] = useState<Role>(initialData?.role || 'VIEWER');
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const canAssignRoles = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

    useEffect(() => {
        if (visible) {
            setName(initialData?.name || '');
            setAccessId(initialData?.accessId || '');
            setPosition(initialData?.position || '');
            setEmail(initialData?.email || '');
            setPhone(initialData?.phone || '');
            setRole(initialData?.role || 'VIEWER');
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!name.trim() || !accessId.trim()) return;
        setIsLoading(true);
        try {
            await onSubmit({
                name: name.trim(),
                accessId: accessId.trim(),
                position: position.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role: role,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleLabel = (roleValue: Role) => {
        const found = ASSIGNABLE_ROLES.find(r => r.value === roleValue);
        return found?.label || ROLE_DISPLAY_NAMES[roleValue] || roleValue;
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
                                    {initialData ? 'Edit Personnel' : 'New Personnel'}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Manage team members and access
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter full name"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Access / Employee ID *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={accessId}
                                    onChangeText={setAccessId}
                                    placeholder="e.g. SKY-001"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Position</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                    value={position}
                                    onChangeText={setPosition}
                                    placeholder="e.g. Chief Remote Pilot"
                                    placeholderTextColor={theme.textSecondary + '60'}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="email@skynet.com"
                                        keyboardType="email-address"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="+91..."
                                        keyboardType="phone-pad"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                    />
                                </View>
                            </View>

                            {canAssignRoles && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Platform Role</Text>
                                    <TouchableOpacity
                                        style={[styles.dropdown, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                                        onPress={() => setShowRolePicker(!showRolePicker)}
                                    >
                                        <Text style={[styles.dropdownText, { color: theme.text }]}>{getRoleLabel(role)}</Text>
                                        <FontAwesome name={showRolePicker ? "chevron-up" : "chevron-down"} size={12} color={theme.textSecondary} />
                                    </TouchableOpacity>

                                    {showRolePicker && (
                                        <View style={[styles.rolePickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                            {ASSIGNABLE_ROLES.map((option) => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    style={[
                                                        styles.roleOption,
                                                        { borderBottomColor: theme.border },
                                                        role === option.value && { backgroundColor: theme.primary + '15' }
                                                    ]}
                                                    onPress={() => {
                                                        setRole(option.value);
                                                        setShowRolePicker(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.roleOptionText,
                                                        { color: theme.text },
                                                        role === option.value && { color: theme.primary, fontWeight: '700' }
                                                    ]}>
                                                        {option.label}
                                                    </Text>
                                                    {role === option.value && (
                                                        <FontAwesome name="check" size={14} color={theme.primary} />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    { backgroundColor: theme.primary, shadowColor: theme.primary },
                                    (!name.trim() || !accessId.trim() || isLoading) && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading || !name.trim() || !accessId.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{initialData ? 'Update Record' : 'Add to Team'}</Text>
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
    dropdown: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 15,
        fontWeight: '500',
    },
    rolePickerContainer: {
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.xs,
        borderWidth: 1,
        overflow: 'hidden',
    },
    roleOption: {
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    roleOptionText: {
        fontSize: 14,
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
