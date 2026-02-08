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
import { Role, ROLE_DISPLAY_NAMES } from '../lib/permissions';
import { useAuthStore } from '../lib/store';

interface AddStaffModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (member: any) => Promise<void>;
    initialData?: any;
}

// Available roles for staff (excludes SUPER_ADMIN which is reserved)
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

    // Check if current user can assign roles
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{initialData ? 'Edit Staff Member' : 'Add New Staff Member'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter name"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Access ID *</Text>
                            <TextInput
                                style={styles.input}
                                value={accessId}
                                onChangeText={setAccessId}
                                placeholder="e.g. EMP001"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Position</Text>
                            <TextInput
                                style={styles.input}
                                value={position}
                                onChangeText={setPosition}
                                placeholder="e.g. Senior Pilot"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email"
                                keyboardType="email-address"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter phone"
                                keyboardType="phone-pad"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        {/* Role Dropdown - Only for SUPER_ADMIN and ADMIN */}
                        {canAssignRoles && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Role</Text>
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => setShowRolePicker(!showRolePicker)}
                                >
                                    <Text style={styles.dropdownText}>{getRoleLabel(role)}</Text>
                                    <Text style={styles.dropdownArrow}>{showRolePicker ? '▲' : '▼'}</Text>
                                </TouchableOpacity>

                                {showRolePicker && (
                                    <View style={styles.rolePickerContainer}>
                                        {ASSIGNABLE_ROLES.map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.roleOption,
                                                    role === option.value && styles.roleOptionSelected
                                                ]}
                                                onPress={() => {
                                                    setRole(option.value);
                                                    setShowRolePicker(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.roleOptionText,
                                                    role === option.value && styles.roleOptionTextSelected
                                                ]}>
                                                    {option.label}
                                                </Text>
                                                {role === option.value && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, (!name.trim() || !accessId.trim()) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isLoading || !name.trim() || !accessId.trim()}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{initialData ? 'Update Member' : 'Add Member'}</Text>}
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
    dropdown: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: Colors.dark.text,
        fontSize: FontSizes.md,
    },
    dropdownArrow: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
    },
    rolePickerContainer: {
        backgroundColor: Colors.dark.background,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        overflow: 'hidden',
    },
    roleOption: {
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    roleOptionSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    roleOptionText: {
        color: Colors.dark.text,
        fontSize: FontSizes.md,
    },
    roleOptionTextSelected: {
        color: Colors.dark.primary,
        fontWeight: '600',
    },
    checkmark: {
        color: Colors.dark.primary,
        fontSize: 16,
        fontWeight: 'bold',
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
