import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

interface Organization {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: string;
}

export default function OrganizationsScreen() {
    const { user } = useAuthStore();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [manageModalVisible, setManageModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    // Form state for create
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for edit
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Change password state
    const [cpStep, setCpStep] = useState<1 | 2 | 3>(1);
    const [cpOtp, setCpOtp] = useState('');
    const [cpNewPassword, setCpNewPassword] = useState('');
    const [cpConfirmPassword, setCpConfirmPassword] = useState('');
    const [cpVerificationId, setCpVerificationId] = useState('');
    const [cpLoading, setCpLoading] = useState(false);

    const fetchOrganizations = async () => {
        try {
            const response = await apiClient.get('/api/mobile/organizations');
            setOrganizations(response.data);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
            Alert.alert('Error', 'Failed to load organizations');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchOrganizations();
    };

    const handleCreateOrg = async () => {
        if (!name) {
            Alert.alert('Error', 'Organization name is required');
            return;
        }
        if (!email) {
            Alert.alert('Error', 'Email is required (used as admin login)');
            return;
        }
        if (!phone) {
            Alert.alert('Error', 'Phone is required (used as admin password)');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/api/mobile/organizations', {
                name,
                email,
                phone
            });
            Alert.alert(
                'Organization Created!',
                `Admin Login:\nEmail: ${email}\nPassword: ${phone}`,
                [{ text: 'OK' }]
            );
            setModalVisible(false);
            setName('');
            setEmail('');
            setPhone('');
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManagePress = (org: Organization) => {
        setSelectedOrg(org);
        setManageModalVisible(true);
    };

    const handleEditPress = () => {
        if (selectedOrg) {
            setEditName(selectedOrg.name);
            setEditEmail(selectedOrg.email || '');
            setEditPhone(selectedOrg.phone || '');
            setManageModalVisible(false);
            setEditModalVisible(true);
        }
    };

    const handleUpdateOrg = async () => {
        if (!selectedOrg) return;

        if (!editName) {
            Alert.alert('Error', 'Organization name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.put(`/api/mobile/organizations/${selectedOrg.id}`, {
                name: editName,
                email: editEmail,
            });

            let message = 'Organization updated successfully!';
            if (editEmail !== selectedOrg.email) {
                message += '\n\nAdmin login email has been updated.';
            }

            Alert.alert('Success', message);
            setEditModalVisible(false);
            setSelectedOrg(null);
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePasswordPress = () => {
        if (selectedOrg) {
            setManageModalVisible(false);
            setCpStep(1);
            setCpOtp('');
            setCpNewPassword('');
            setCpConfirmPassword('');
            setCpVerificationId('');
            setChangePasswordModalVisible(true);
        }
    };

    const handleSendOtp = async () => {
        if (!selectedOrg?.email) {
            Alert.alert('Error', 'This organization has no email configured');
            return;
        }
        setCpLoading(true);
        try {
            await apiClient.post('/api/mobile/auth/send-otp', {
                email: selectedOrg.email,
                purpose: 'CHANGE_PASSWORD',
            });
            Alert.alert('OTP Sent', `A 6-digit code has been sent to ${selectedOrg.email}`);
            setCpStep(2);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
        } finally {
            setCpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (cpOtp.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }
        setCpLoading(true);
        try {
            const response = await apiClient.post('/api/mobile/auth/verify-otp', {
                email: selectedOrg?.email,
                otp: cpOtp,
                purpose: 'CHANGE_PASSWORD',
            });
            setCpVerificationId(response.data.verificationId);
            setCpStep(3);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Invalid OTP');
        } finally {
            setCpLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!cpNewPassword || cpNewPassword.length < 4) {
            Alert.alert('Error', 'Password must be at least 4 characters');
            return;
        }
        if (cpNewPassword !== cpConfirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        setCpLoading(true);
        try {
            await apiClient.post('/api/mobile/auth/reset-password', {
                email: selectedOrg?.email,
                newPassword: cpNewPassword,
                verificationId: cpVerificationId,
            });
            Alert.alert('Success', 'Password changed successfully!\n\nThe new password is now active.');
            setChangePasswordModalVisible(false);
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
        } finally {
            setCpLoading(false);
        }
    };

    const handleDeletePress = () => {
        if (!selectedOrg) return;

        Alert.alert(
            'Delete Organization',
            `Are you sure you want to delete "${selectedOrg.name}"?\n\nThis will also delete:\n• All admin users\n• All drones\n• All team members\n• All orders\n• All batteries\n\nThis action cannot be undone!`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async () => {
        if (!selectedOrg) return;

        setIsSubmitting(true);
        try {
            await apiClient.delete(`/api/mobile/organizations/${selectedOrg.id}`);
            Alert.alert('Success', 'Organization deleted successfully');
            setManageModalVisible(false);
            setSelectedOrg(null);
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: Organization }) => {
        const theme = Colors[useColorScheme() ?? 'dark'];
        return (
            <View style={[styles.orgCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.orgInfo}>
                    <View style={[styles.orgIconBox, { backgroundColor: theme.primary + '15' }]}>
                        <FontAwesome name="building" size={20} color={theme.primary} />
                    </View>
                    <View style={styles.orgTextContainer}>
                        <Text style={[styles.orgName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.orgDetails, { color: theme.textSecondary }]}>{item.email || 'No email'} • {item.phone || 'No phone'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                    onPress={() => handleManagePress(item)}
                >
                    <Text style={[styles.manageButtonText, { color: theme.text }]}>Manage</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>All Organizations</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome name="plus" size={14} color="#fff" />
                    <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={organizations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconBox, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="building-o" size={40} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No organizations found</Text>
                    </View>
                }
            />

            {/* Add Org Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Add Organization</Text>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Admin credentials will be auto-created</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Organization Name *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. AeroSky India"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Business Email * (Admin Login)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="contact@company.com"
                                placeholderTextColor={theme.textSecondary + '60'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number * (Admin Password)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="9876543210"
                                placeholderTextColor={theme.textSecondary + '60'}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                            onPress={handleCreateOrg}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Organization</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Discard Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Manage Options Modal */}
            <Modal
                visible={manageModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setManageModalVisible(false)}
            >
                <TouchableOpacity
                    style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                    activeOpacity={1}
                    onPress={() => setManageModalVisible(false)}
                >
                    <View style={[styles.manageModalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.manageHeader}>
                            <Text style={[styles.manageModalTitle, { color: theme.text }]}>{selectedOrg?.name}</Text>
                            <Text style={[styles.manageModalSubtitle, { color: theme.textSecondary }]}>What would you like to do?</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.manageOption, { borderBottomColor: theme.border }]}
                            onPress={handleEditPress}
                        >
                            <View style={[styles.optIconBox, { backgroundColor: theme.primary + '10' }]}>
                                <FontAwesome name="pencil" size={16} color={theme.primary} />
                            </View>
                            <Text style={[styles.manageOptionText, { color: theme.text }]}>Edit Organization</Text>
                            <FontAwesome name="chevron-right" size={12} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.manageOption, { borderBottomColor: theme.border }]}
                            onPress={handleChangePasswordPress}
                        >
                            <View style={[styles.optIconBox, { backgroundColor: theme.accent + '10' }]}>
                                <FontAwesome name="lock" size={16} color={theme.accent} />
                            </View>
                            <Text style={[styles.manageOptionText, { color: theme.text }]}>Change Password</Text>
                            <FontAwesome name="chevron-right" size={12} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.manageOption, styles.deleteOption]}
                            onPress={handleDeletePress}
                        >
                            <View style={[styles.optIconBox, { backgroundColor: theme.error + '10' }]}>
                                <FontAwesome name="trash" size={16} color={theme.error} />
                            </View>
                            <Text style={[styles.manageOptionText, styles.deleteText]}>Delete Organization</Text>
                            <FontAwesome name="chevron-right" size={12} color={theme.error} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.manageCloseButton}
                            onPress={() => setManageModalVisible(false)}
                        >
                            <Text style={[styles.manageCloseText, { color: theme.textSecondary }]}>Close Menu</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Org Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Organization</Text>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>To change password, use the specified option</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Organization Name *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="e.g. AeroSky India"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Business Email (Admin Login)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="contact@company.com"
                                placeholderTextColor={theme.textSecondary + '60'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                            onPress={handleUpdateOrg}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Update Organization</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Discard Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={changePasswordModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setChangePasswordModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                                    OTP will be sent to {selectedOrg?.email || 'N/A'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setChangePasswordModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            {[1, 2, 3].map((step) => (
                                <View key={step} style={styles.stepRow}>
                                    <View style={[
                                        styles.stepDot,
                                        { backgroundColor: theme.cardBackground, borderColor: theme.border },
                                        cpStep >= step && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}>
                                        <Text style={[styles.stepDotText, { color: theme.textSecondary }, cpStep >= step && { color: '#fff' }]}>
                                            {cpStep > step ? '✓' : step}
                                        </Text>
                                    </View>
                                    <Text style={[styles.stepLabel, { color: theme.textSecondary }, cpStep >= step && { color: theme.text, fontWeight: '700' }]}>
                                        {step === 1 ? 'OTP' : step === 2 ? 'Verify' : 'New'}
                                    </Text>
                                    {step < 3 && <View style={[styles.stepLine, { backgroundColor: theme.border }, cpStep > step && { backgroundColor: theme.primary }]} />}
                                </View>
                            ))}
                        </View>

                        {/* Step 1: Send OTP */}
                        {cpStep === 1 && (
                            <View>
                                <Text style={[styles.cpInfoText, { color: theme.textSecondary }]}>
                                    A 6-digit verification code will be sent to the organization's registered email address.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary, marginTop: 16 }]}
                                    onPress={handleSendOtp}
                                    disabled={cpLoading}
                                >
                                    {cpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Send Verification Code</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 2: Verify OTP */}
                        {cpStep === 2 && (
                            <View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Enter 6-digit OTP</Text>
                                    <TextInput
                                        style={[styles.input, styles.otpInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.primary }]}
                                        value={cpOtp}
                                        onChangeText={setCpOtp}
                                        placeholder="000000"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                                    onPress={handleVerifyOtp}
                                    disabled={cpLoading}
                                >
                                    {cpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Verify OTP</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSendOtp} style={{ marginTop: 20, alignItems: 'center' }}>
                                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>Resend Code</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 3: New Password */}
                        {cpStep === 3 && (
                            <View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={cpNewPassword}
                                        onChangeText={setCpNewPassword}
                                        placeholder="Min 4 characters"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                        secureTextEntry
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                        value={cpConfirmPassword}
                                        onChangeText={setCpConfirmPassword}
                                        placeholder="Re-enter password"
                                        placeholderTextColor={theme.textSecondary + '60'}
                                        secureTextEntry
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                                    onPress={handleResetPassword}
                                    disabled={cpLoading}
                                >
                                    {cpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Set New Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: 20 }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.lg,
        gap: 8,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    orgCard: {
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    orgInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    orgIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    orgTextContainer: {
        flex: 1,
    },
    orgName: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    orgDetails: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    manageButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    manageButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        borderRadius: 24,
        padding: Spacing.xl,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    modalSubtitle: {
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
    inputGroup: {
        marginBottom: Spacing.lg,
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
    manageModalContent: {
        borderRadius: 28,
        padding: Spacing.xl,
        borderWidth: 1,
        width: '90%',
        alignSelf: 'center',
    },
    manageHeader: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    manageModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    manageModalSubtitle: {
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
    manageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        gap: 16,
    },
    optIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    manageOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    deleteOption: {
        borderBottomWidth: 0,
    },
    deleteText: {
        color: '#EF4444',
    },
    manageCloseButton: {
        marginTop: Spacing.lg,
        paddingVertical: 16,
        alignItems: 'center',
    },
    manageCloseText: {
        fontSize: 15,
        fontWeight: '700',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    stepDotText: {
        fontSize: 12,
        fontWeight: '800',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    stepLine: {
        width: 20,
        height: 1.5,
        marginHorizontal: 12,
    },
    cpInfoText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 10,
        fontWeight: '500',
    },
    otpInput: {
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 10,
        fontWeight: '800',
        paddingVertical: 16,
    },
});
