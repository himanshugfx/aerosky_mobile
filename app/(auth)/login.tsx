import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Colors, { BorderRadius, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { auth } from '../../lib/auth';
import { useAuthStore } from '../../lib/store';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password state
    const [fpModalVisible, setFpModalVisible] = useState(false);
    const [fpStep, setFpStep] = useState<1 | 2 | 3>(1);
    const [fpEmail, setFpEmail] = useState('');
    const [fpOtp, setFpOtp] = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpConfirmPassword, setFpConfirmPassword] = useState('');
    const [fpVerificationId, setFpVerificationId] = useState('');
    const [fpLoading, setFpLoading] = useState(false);

    const handleLogin = async () => {
        // Clear fields as per user preference
        const emailValue = email.trim();
        const passwordValue = password;

        if (!emailValue || !passwordValue) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setEmail('');
        setPassword('');

        try {
            const result = await auth.login(emailValue, passwordValue);

            if (result.success && result.user) {
                setAuth(result.user);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Login Failed', result.error || 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <StatusBar style="light" />

            {/* Background Gradient Effect */}
            <View style={[styles.backgroundGradient, { backgroundColor: theme.primary }]} />

            <View style={styles.content}>
                {/* Logo and Header */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={{ width: 120, height: 120, borderRadius: 24 }}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Login Form */}
                <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Operator Identity</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                            placeholder="Email or Username"
                            placeholderTextColor={theme.textSecondary + '80'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Security Access</Text>
                        <View style={[styles.passwordContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.passwordInput, { color: theme.text }]}
                                placeholder="Access Key"
                                placeholderTextColor={theme.textSecondary + '80'}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <FontAwesome
                                    name={showPassword ? "eye" : "eye-slash"}
                                    size={18}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: theme.primary, shadowColor: theme.primary }, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Authorize</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => {
                            setFpModalVisible(true);
                            setFpStep(1);
                            setFpEmail('');
                            setFpOtp('');
                            setFpNewPassword('');
                            setFpConfirmPassword('');
                            setFpVerificationId('');
                        }}
                    >
                        <Text style={[styles.forgotPasswordText, { color: theme.primaryLight }]}>Reset Credentials</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        Restricted Access.{' '}
                        <Text style={[styles.footerLink, { color: theme.primaryLight }]}>Contact Control</Text>
                    </Text>
                </View>
            </View>

            <Modal
                visible={fpModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFpModalVisible(false)}
            >
                <View style={styles.fpOverlay}>
                    <View style={[styles.fpContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Text style={[styles.fpTitle, { color: theme.text }]}>Reset Protocol</Text>
                        <Text style={[styles.fpSubtitle, { color: theme.textSecondary }]}>Initialize credential reconstruction via security code.</Text>

                        {/* Step Indicator */}
                        <View style={styles.fpStepIndicator}>
                            {[1, 2, 3].map((step) => (
                                <View key={step} style={styles.fpStepRow}>
                                    <View style={[
                                        styles.fpStepDot,
                                        { backgroundColor: theme.inputBackground, borderColor: theme.border },
                                        fpStep >= step && [styles.fpStepDotActive, { backgroundColor: theme.primary, borderColor: theme.primary }],
                                    ]}>
                                        <Text style={[styles.fpStepDotText, { color: theme.textSecondary }, fpStep >= step && { color: '#fff' }]}>
                                            {fpStep > step ? '✓' : step}
                                        </Text>
                                    </View>
                                    {step < 3 && <View style={[styles.fpStepLine, { backgroundColor: theme.border }, fpStep > step && { backgroundColor: theme.primary }]} />}
                                </View>
                            ))}
                        </View>

                        {/* Step 1: Enter Email */}
                        {fpStep === 1 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={[styles.fpLabel, { color: theme.textSecondary }]}>Target Email</Text>
                                    <TextInput
                                        style={[styles.fpInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                        value={fpEmail}
                                        onChangeText={setFpEmail}
                                        placeholder="user@example.com"
                                        placeholderTextColor={theme.textSecondary + '80'}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.fpButton, { backgroundColor: theme.primary }, !fpEmail && styles.fpButtonDisabled]}
                                    onPress={async () => {
                                        if (!fpEmail) {
                                            Alert.alert('Protocol Error', 'Identity target required.');
                                            return;
                                        }
                                        setFpLoading(true);
                                        try {
                                            await apiClient.post('/api/mobile/auth/send-otp', {
                                                email: fpEmail,
                                                purpose: 'FORGOT_PASSWORD',
                                            });
                                            Alert.alert('Security Code Dispatched', `A 6-digit code has been sent to ${fpEmail}`);
                                            setFpStep(2);
                                        } catch (error: any) {
                                            Alert.alert('Dispatch Failure', error.response?.data?.error || 'Unable to send security code.');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Initialize</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 2: Enter OTP */}
                        {fpStep === 2 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={[styles.fpLabel, { color: theme.textSecondary }]}>Security Code</Text>
                                    <TextInput
                                        style={[styles.fpInput, styles.fpOtpInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                        value={fpOtp}
                                        onChangeText={setFpOtp}
                                        placeholder="000000"
                                        placeholderTextColor={theme.textSecondary + '80'}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.fpButton, { backgroundColor: theme.primary }, fpOtp.length !== 6 && styles.fpButtonDisabled]}
                                    onPress={async () => {
                                        if (fpOtp.length !== 6) {
                                            Alert.alert('Code Invalid', '6-digit authorization code required.');
                                            return;
                                        }
                                        setFpLoading(true);
                                        try {
                                            const response = await apiClient.post('/api/mobile/auth/verify-otp', {
                                                email: fpEmail,
                                                otp: fpOtp,
                                                purpose: 'FORGOT_PASSWORD',
                                            });
                                            setFpVerificationId(response.data.verificationId);
                                            setFpStep(3);
                                        } catch (error: any) {
                                            Alert.alert('Verification Failed', error.response?.data?.error || 'Invalid security code.');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Authorize</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        setFpLoading(true);
                                        try {
                                            await apiClient.post('/api/mobile/auth/send-otp', {
                                                email: fpEmail,
                                                purpose: 'FORGOT_PASSWORD',
                                            });
                                            Alert.alert('Code Re-dispatched', 'A new security code has been transmitted.');
                                        } catch (error: any) {
                                            Alert.alert('Re-dispatch Failed', error.response?.data?.error || 'Unable to re-send code.');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    style={{ marginTop: 20, alignItems: 'center' }}
                                >
                                    <Text style={{ color: theme.primaryLight, fontSize: 13, fontWeight: '700' }}>Re-transmit Code</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 3: New Password */}
                        {fpStep === 3 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={[styles.fpLabel, { color: theme.textSecondary }]}>New Access Key</Text>
                                    <TextInput
                                        style={[styles.fpInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                        value={fpNewPassword}
                                        onChangeText={setFpNewPassword}
                                        placeholder="Minimum 4 characters"
                                        placeholderTextColor={theme.textSecondary + '80'}
                                        secureTextEntry
                                    />
                                </View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={[styles.fpLabel, { color: theme.textSecondary }]}>Confirm Access Key</Text>
                                    <TextInput
                                        style={[styles.fpInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                        value={fpConfirmPassword}
                                        onChangeText={setFpConfirmPassword}
                                        placeholder="Re-enter to verify"
                                        placeholderTextColor={theme.textSecondary + '80'}
                                        secureTextEntry
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.fpButton, { backgroundColor: theme.primary }]}
                                    onPress={async () => {
                                        if (!fpNewPassword || fpNewPassword.length < 4) {
                                            Alert.alert('Security Weak', 'Key must be at least 4 characters.');
                                            return;
                                        }
                                        if (fpNewPassword !== fpConfirmPassword) {
                                            Alert.alert('Mismatch', 'Access keys do not match.');
                                            return;
                                        }
                                        setFpLoading(true);
                                        try {
                                            await apiClient.post('/api/mobile/auth/reset-password', {
                                                email: fpEmail,
                                                newPassword: fpNewPassword,
                                                verificationId: fpVerificationId,
                                            });
                                            Alert.alert(
                                                'Protocol Complete',
                                                'Credential reconstruction successful. You may now proceed to login.',
                                                [{ text: 'PROCEED', onPress: () => setFpModalVisible(false) }]
                                            );
                                        } catch (error: any) {
                                            Alert.alert('Finalization Failed', error.response?.data?.error || 'Unable to update credentials.');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Commit Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.fpCancelButton}
                            onPress={() => setFpModalVisible(false)}
                        >
                            <Text style={[styles.fpCancelText, { color: theme.textSecondary }]}>Abort Protocol</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        opacity: 0.1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logoEmoji: { fontSize: 44 },
    title: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    formContainer: {
        borderRadius: 32,
        padding: 24,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    inputContainer: { marginBottom: 20 },
    label: {
        fontSize: 11,
        fontWeight: '900',
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    input: {
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 15,
        fontWeight: '600',
        borderWidth: 1.5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1.5,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 15,
        fontWeight: '600',
    },
    eyeButton: { paddingHorizontal: 18 },
    loginButton: {
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 12,
        shadowOpacity: 0.3,
        elevation: 6,
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerLink: { fontWeight: '800' },
    fpOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    fpContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        borderTopWidth: 1.5,
    },
    fpTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    fpSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 32,
        lineHeight: 20,
    },
    fpStepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    fpStepRow: { flexDirection: 'row', alignItems: 'center' },
    fpStepDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fpStepDotActive: { borderStyle: 'solid' },
    fpStepDotText: { fontSize: 14, fontWeight: '900' },
    fpStepLine: { width: 30, height: 2, marginHorizontal: 10, borderRadius: 1 },
    fpInputGroup: { marginBottom: 20 },
    fpLabel: {
        fontSize: 11,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    fpInput: {
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        fontWeight: '600',
        borderWidth: 1.5,
    },
    fpOtpInput: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 12,
        textAlign: 'center',
        paddingVertical: 20,
    },
    fpButton: {
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    fpButtonDisabled: { opacity: 0.6 },
    fpButtonText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    fpCancelButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 12,
    },
    fpCancelText: { fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
});
