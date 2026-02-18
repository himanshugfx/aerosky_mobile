import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
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
    danger = false,
    theme
}: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    danger?: boolean;
    theme: any;
}) => (
    <TouchableOpacity
        style={[styles.menuItem, { borderBottomColor: theme.border }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.menuIcon, { backgroundColor: danger ? theme.error + '10' : theme.primary + '08' }]}>
            <FontAwesome name={icon as any} size={16} color={danger ? theme.error : theme.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, { color: danger ? theme.error : theme.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
        {showArrow && <FontAwesome name="chevron-right" size={10} color={theme.border} />}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
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

    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Change password state
    const [cpStep, setCpStep] = useState<1 | 2 | 3>(1);
    const [cpOtp, setCpOtp] = useState('');
    const [cpVerificationId, setCpVerificationId] = useState('');
    const [cpLoading, setCpLoading] = useState(false);

    // Missing password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
        fetchAll();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to sign out of your AeroSky account?',
            [
                { text: 'Wait, no', style: 'cancel' },
                {
                    text: 'Yes, Logout',
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
        if (!fullName || !email) {
            Alert.alert('Incomplete Profile', 'Full name and email are mandatory.');
            return;
        }
        setIsLoading(true);
        try {
            await apiClient.put('/api/mobile/profile', {
                email,
                fullName,
                phone,
            });
            updateUser({ email, fullName, phone });
            Alert.alert('Identity Synced', 'Your profile information has been successfully updated.');
            setEditProfileVisible(false);
        } catch (error: any) {
            Alert.alert('Sync Failed', error.response?.data?.error || 'Unable to update profile at this time.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!user?.email) {
            Alert.alert('Verification Blocked', 'No registered email found for this account.');
            return;
        }
        setCpLoading(true);
        try {
            await apiClient.post('/api/mobile/auth/send-otp', {
                email: user.email,
                purpose: 'CHANGE_PASSWORD',
            });
            Alert.alert('Authorization Sent', `A 6-digit authorization code has been dispatched to ${user.email}`);
            setCpStep(2);
        } catch (error: any) {
            Alert.alert('Courier Failed', error.response?.data?.error || 'Failed to dispatch verification code.');
        } finally {
            setCpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (cpOtp.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the complete 6-digit authorization code.');
            return;
        }
        setCpLoading(true);
        try {
            const response = await apiClient.post('/api/mobile/auth/verify-otp', {
                email: user?.email,
                otp: cpOtp,
                purpose: 'CHANGE_PASSWORD',
            });
            setCpVerificationId(response.data.verificationId);
            setCpStep(3);
        } catch (error: any) {
            Alert.alert('Access Denied', error.response?.data?.error || 'The code provided is invalid or expired.');
        } finally {
            setCpLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Empty Credentials', 'All password fields are required for security.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Integrity Mismatch', 'New password does not match the confirmation.');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Security Alert', 'Passwords must be at least 8 characters for platform safety.');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.patch('/api/mobile/profile', {
                currentPassword,
                newPassword,
                otpVerificationId: cpVerificationId,
            });
            Alert.alert('Vault Updated', 'Your security credentials have been successfully hardened.');
            setChangePasswordVisible(false);
            // Reset states
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setCpStep(1);
            setCpOtp('');
            setCpVerificationId('');
        } catch (error: any) {
            Alert.alert('Vault Error', error.response?.data?.error || 'Failed to update security credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitSupport = async () => {
        if (!supportSubject || !supportMessage) {
            Alert.alert('Inquiry Incomplete', 'Subject and detailed message are required.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/mobile/support', {
                subject: supportSubject,
                message: supportMessage,
            });
            Alert.alert('Ticket Logged', response.data.message);
            setHelpCenterVisible(false);
            setSupportSubject('');
            setSupportMessage('');
        } catch (error: any) {
            Alert.alert('System Error', error.response?.data?.error || 'Failed to log support ticket.');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleDisplay = (role: string) => {
        const names: Record<string, string> = {
            'SUPER_ADMIN': 'SYSTEM OVERSEER',
            'ADMIN': 'PLATFORM ADMIN',
            'OPERATIONS_MANAGER': 'OPERATIONS LEAD',
            'QA_MANAGER': 'COMPLIANCE OFFICER',
            'PILOT': 'REMOTE PILOT',
            'TECHNICIAN': 'AVIONICS TECH',
            'VIEWER': 'PLATFORM VIEWER',
        };
        return names[role] || role;
    };

    if (isFetching && !user) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={[styles.profileHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                        {user?.fullName || user?.username || 'Authenticated User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'user@aerosky.io'}</Text>

                    <View style={styles.roleBadgeContainer}>
                        <View style={[styles.roleBadge, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                            <Text style={[styles.roleBadgeText, { color: theme.primary }]}>{getRoleDisplay(user?.role || 'VIEWER')}</Text>
                        </View>
                        {user?.organizationName && (
                            <View style={[styles.roleBadge, { backgroundColor: theme.success + '15', borderColor: theme.success + '30' }]}>
                                <Text style={[styles.roleBadgeText, { color: theme.success }]}>{user.organizationName}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Quick Stats - Premium High-Fidelity Stat Cards */}
                <View style={[styles.statsRow, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{drones?.length || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>FLEET</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{teamMembers?.length || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TEAM</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>{calculateCompliance()}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>SAFETY</Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Identity & Security</Text>
                    <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <MenuItem
                            theme={theme}
                            icon="user-o"
                            title="Edit Profile"
                            subtitle="Manage your identity credentials"
                            onPress={() => setEditProfileVisible(true)}
                        />
                        <MenuItem
                            theme={theme}
                            icon="shield"
                            title="Security Protocol"
                            subtitle="Update authorization credentials"
                            onPress={() => {
                                setCpStep(1);
                                setCpOtp('');
                                setCpVerificationId('');
                                setChangePasswordVisible(true);
                            }}
                        />
                    </View>
                </View>

                {user?.role === 'SUPER_ADMIN' && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Systems Overseer</Text>
                        <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <MenuItem
                                theme={theme}
                                icon="th-large"
                                title="Organization Nexus"
                                subtitle="Centralized company administration"
                                onPress={() => router.push('/organizations')}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Platform Support</Text>
                    <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <MenuItem
                            theme={theme}
                            icon="life-ring"
                            title="AeroSky Liaison"
                            subtitle="Direct channel for assistance"
                            onPress={() => setHelpCenterVisible(true)}
                        />
                        <MenuItem
                            theme={theme}
                            icon="info-circle"
                            title="System Manifest"
                            subtitle="Version 1.2.5 [STABLE]"
                            showArrow={false}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <MenuItem
                            theme={theme}
                            icon="power-off"
                            title="Terminate Session"
                            onPress={handleLogout}
                            showArrow={false}
                            danger
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>AeroSky Flight OS</Text>
                    <Text style={[styles.footerSubtext, { color: theme.border }]}>© 2026 Aerosys Aviation India</Text>
                </View>
            </ScrollView>

            {/* Modals Overhaul */}
            <Modal visible={editProfileVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Profile Settings</Text>
                                <TouchableOpacity onPress={() => setEditProfileVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>FULL NAME</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Enter full name"
                                    placeholderTextColor={theme.textSecondary}
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                                <Text style={[styles.label, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Enter email"
                                    placeholderTextColor={theme.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <Text style={[styles.label, { color: theme.textSecondary }]}>CONTACT NUMBER</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="+91"
                                    placeholderTextColor={theme.textSecondary}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleUpdateProfile} disabled={isLoading}>
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>UPDATE IDENTITY</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal visible={changePasswordVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Security Vault</Text>
                                <TouchableOpacity onPress={() => setChangePasswordVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Multi-factor authorization for {user?.email}</Text>

                                <View style={styles.stepIndicator}>
                                    {[1, 2, 3].map((step) => (
                                        <View key={step} style={styles.stepRow}>
                                            <View style={[styles.stepDot, { backgroundColor: theme.inputBackground, borderColor: theme.border }, cpStep >= step && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                                                <Text style={[styles.stepDotText, cpStep >= step && { color: '#fff' }]}>{cpStep > step ? '✓' : step}</Text>
                                            </View>
                                            <Text style={[styles.stepLabel, { color: theme.textSecondary }, cpStep >= step && { color: theme.primary }]}>
                                                {step === 1 ? 'AUTH' : step === 2 ? 'VERIFY' : 'HARDEN'}
                                            </Text>
                                            {step < 3 && <View style={[styles.stepLine, { backgroundColor: theme.border }, cpStep > step && { backgroundColor: theme.primary }]} />}
                                        </View>
                                    ))}
                                </View>

                                {cpStep === 1 && (
                                    <View>
                                        <Text style={[styles.cpInfoText, { color: theme.textSecondary }]}>
                                            Authorize this credential update by requesting a secure 6-digit access token to your registered email.
                                        </Text>
                                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary, marginTop: 20 }]} onPress={handleSendOtp} disabled={cpLoading}>
                                            {cpLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>REQUEST ACCESS TOKEN</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {cpStep === 2 && (
                                    <View>
                                        <TextInput
                                            style={[styles.input, styles.otpInput, { backgroundColor: theme.inputBackground, borderColor: theme.primary, color: theme.text }]}
                                            value={cpOtp}
                                            onChangeText={setCpOtp}
                                            placeholder="000000"
                                            placeholderTextColor={theme.textSecondary}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleVerifyOtp} disabled={cpLoading}>
                                            {cpLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>AUTHORIZE ACCESS</Text>}
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleSendOtp} style={{ marginTop: 20, alignItems: 'center' }}>
                                            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>DISPATCH NEW TOKEN</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {cpStep === 3 && (
                                    <View>
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>CURRENT MASTER KEY</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                            placeholder="Required for security"
                                            placeholderTextColor={theme.textSecondary}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            secureTextEntry
                                        />
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>NEW MASTER KEY</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                            placeholder="Min. 8 characters"
                                            placeholderTextColor={theme.textSecondary}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry
                                        />
                                        <Text style={[styles.label, { color: theme.textSecondary }]}>RE-ENTER KEY</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                            placeholder="Verify integrity"
                                            placeholderTextColor={theme.textSecondary}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry
                                        />
                                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleChangePassword} disabled={isLoading}>
                                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>HARDEN SECURITY</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal visible={helpCenterVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Liaison Hub</Text>
                                <TouchableOpacity onPress={() => setHelpCenterVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary, textAlign: 'left', marginBottom: 20 }]}>
                                    {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                                        ? 'Direct encryption to developer support operations.'
                                        : 'Contact your organization administrator for protocol clearance.'}
                                </Text>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>SUBJECT</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Brief summary"
                                    placeholderTextColor={theme.textSecondary}
                                    value={supportSubject}
                                    onChangeText={setSupportSubject}
                                />
                                <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Explain your inquiry in detail..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={supportMessage}
                                    onChangeText={setSupportMessage}
                                    multiline
                                    numberOfLines={4}
                                />
                                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmitSupport} disabled={isLoading}>
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>TRANSMIT INQUIRY</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    content: { paddingBottom: 60 },
    profileHeader: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1.5 },
    avatarContainer: { position: 'relative', marginBottom: 20 },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: { fontSize: 44, fontWeight: '900', color: '#FFFFFF' },
    userName: { fontSize: 24, fontWeight: '900', marginBottom: 6, paddingHorizontal: 24, letterSpacing: -0.5 },
    userEmail: { fontSize: 14, fontWeight: '500', marginBottom: 20 },
    roleBadgeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
    roleBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1.2 },
    roleBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
    statsRow: { flexDirection: 'row', margin: 20, padding: 20, borderRadius: 24, borderWidth: 1.5 },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1.5, height: 35, alignSelf: 'center', opacity: 0.5 },
    statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 4 },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 12, marginLeft: 4, letterSpacing: 2 },
    menuGroup: { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1.5 },
    menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    menuContent: { flex: 1 },
    menuTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
    menuSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 3 },
    footer: { alignItems: 'center', paddingVertical: 40 },
    footerText: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
    footerSubtext: { fontSize: 10, fontWeight: '600', marginTop: 6, opacity: 0.8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    keyboardView: { width: '100%' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24, borderTopWidth: 1.5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    modalSubtitle: { fontSize: 14, fontWeight: '500', marginBottom: 24 },
    formContent: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '800', marginBottom: 10, marginTop: 12, letterSpacing: 1.5 },
    input: { borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '500', marginBottom: 16, borderWidth: 1.5 },
    textArea: { height: 120, textAlignVertical: 'top' },
    submitBtn: { padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 12, shadowOpacity: 0.2 },
    submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
    stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 30 },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    stepDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    stepDotText: { fontSize: 14, fontWeight: '900' },
    stepLabel: { fontSize: 9, fontWeight: '900', marginLeft: 8, letterSpacing: 1 },
    stepLine: { width: 25, height: 2.5, marginHorizontal: 10, borderRadius: 1 },
    cpInfoText: { fontSize: 14, lineHeight: 22, textAlign: 'center', fontWeight: '500' },
    otpInput: { fontSize: 28, fontWeight: '900', letterSpacing: 12, textAlign: 'center', paddingVertical: 24, borderRadius: 20 },
});
