import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore, useComplianceStore } from '../../lib/store';

// Profile menu item component
const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    danger = false
}: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    danger?: boolean;
}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
            <FontAwesome name={icon as any} size={18} color={danger ? Colors.dark.error : Colors.dark.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {showArrow && <FontAwesome name="chevron-right" size={12} color={Colors.dark.textSecondary} />}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, updateUser } = useAuthStore();
    const { drones, teamMembers, fetchAll, calculateCompliance } = useComplianceStore();

    // Modal states
    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [helpCenterVisible, setHelpCenterVisible] = useState(false);

    // Form states
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Fetch fresh profile data on mount
    const fetchProfileData = async () => {
        setIsFetching(true);
        try {
            const response = await apiClient.get('/api/mobile/profile');
            const data = response.data;
            updateUser(data);
            setEmail(data.email || '');
            setFullName(data.fullName || '');
            setPhone(data.phone || '');
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
        fetchAll(); // Also refresh compliance data
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        try {
            await apiClient.put('/api/mobile/profile', {
                email,
                fullName,
                phone,
            });
            updateUser({ email, fullName, phone });
            Alert.alert('Success', 'Profile updated successfully');
            setEditProfileVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.patch('/api/mobile/profile', {
                currentPassword,
                newPassword,
            });
            Alert.alert('Success', 'Password changed successfully');
            setChangePasswordVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitSupport = async () => {
        if (!supportSubject || !supportMessage) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/mobile/support', {
                subject: supportSubject,
                message: supportMessage,
            });
            Alert.alert('Success', response.data.message);
            setHelpCenterVisible(false);
            setSupportSubject('');
            setSupportMessage('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    // Get role display name
    const getRoleDisplay = (role: string) => {
        const names: Record<string, string> = {
            'SUPER_ADMIN': 'Super Admin',
            'ADMIN': 'Administrator',
            'OPERATIONS_MANAGER': 'Operations Manager',
            'QA_MANAGER': 'QA Manager',
            'PILOT': 'Remote Pilot',
            'TECHNICIAN': 'Technician',
            'VIEWER': 'Viewer',
        };
        return names[role] || role;
    };

    if (isFetching && !user) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.fullName || user?.username || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                <View style={styles.roleBadgeContainer}>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{getRoleDisplay(user?.role || 'VIEWER')}</Text>
                    </View>
                    {user?.organizationName && (
                        <View style={[styles.roleBadge, { marginLeft: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                            <Text style={[styles.roleBadgeText, { color: '#10B981' }]}>{user.organizationName}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Quick Stats - Using dynamic data */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{drones?.length || 0}</Text>
                    <Text style={styles.statLabel}>Drones</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{teamMembers?.length || 0}</Text>
                    <Text style={styles.statLabel}>Staff</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{calculateCompliance()}</Text>
                    <Text style={styles.statLabel}>Compliance</Text>
                </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon="user"
                        title="Edit Profile"
                        subtitle="Update your name, email, and phone"
                        onPress={() => setEditProfileVisible(true)}
                    />
                    <MenuItem
                        icon="lock"
                        title="Change Password"
                        subtitle="Update your password"
                        onPress={() => setChangePasswordVisible(true)}
                    />
                </View>
            </View>

            {/* SUPER_ADMIN Section */}
            {user?.role === 'SUPER_ADMIN' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Platform Admin</Text>
                    <View style={styles.menuGroup}>
                        <MenuItem
                            icon="building"
                            title="Manage Organizations"
                            subtitle="View and add company accounts"
                            onPress={() => router.push('/organizations')}
                        />
                    </View>
                </View>
            )}

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon="info-circle"
                        title="About AeroSky"
                        subtitle="Version 1.2.0"
                        showArrow={false}
                    />
                </View>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon="question-circle"
                        title="Help Center"
                        subtitle={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                            ? 'Contact developer support'
                            : 'Contact your admin'}
                        onPress={() => setHelpCenterVisible(true)}
                    />
                </View>
            </View>

            {/* Logout */}
            <View style={styles.section}>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon="sign-out"
                        title="Logout"
                        onPress={handleLogout}
                        showArrow={false}
                        danger
                    />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>AeroSky Mobile Application</Text>
                <Text style={styles.footerSubtext}>© 2026 AeroSky Technologies</Text>
            </View>

            {/* Edit Profile Modal */}
            <Modal
                visible={editProfileVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditProfileVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditProfileVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleUpdateProfile}
                                disabled={isLoading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={changePasswordVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setChangePasswordVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setChangePasswordVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleChangePassword}
                                disabled={isLoading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'Changing...' : 'Change'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Help Center Modal */}
            <Modal
                visible={helpCenterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setHelpCenterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Help Center</Text>
                        <Text style={styles.modalSubtitle}>
                            {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                                ? 'Contact Developer Support'
                                : 'Contact Your Administrator'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Subject"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={supportSubject}
                            onChangeText={setSupportSubject}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your issue..."
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={supportMessage}
                            onChangeText={setSupportMessage}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setHelpCenterVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSubmitSupport}
                                disabled={isLoading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isLoading ? 'Sending...' : 'Send'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: Spacing.xxl,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        backgroundColor: Colors.dark.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    avatarText: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.dark.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: FontSizes.md,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.md,
    },
    roleBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    roleBadgeText: {
        fontSize: 12,
        color: Colors.dark.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.dark.cardBackground,
        margin: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.dark.border,
        alignSelf: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.dark.text,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    section: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.sm,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuGroup: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    menuIconDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    menuTitleDanger: {
        color: Colors.dark.error,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
    },
    footerSubtext: {
        fontSize: 10,
        color: Colors.dark.textSecondary,
        marginTop: 4,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.dark.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.dark.text,
        fontSize: 16,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.sm,
    },
    modalButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.dark.background,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    saveButton: {
        backgroundColor: Colors.dark.primary,
    },
    cancelButtonText: {
        color: Colors.dark.text,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
