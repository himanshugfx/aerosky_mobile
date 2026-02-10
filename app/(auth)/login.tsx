import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { auth } from '../../lib/auth';
import { useAuthStore } from '../../lib/store';

export default function LoginScreen() {
    const router = useRouter();
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
            style={styles.container}
        >
            <StatusBar style="light" />

            {/* Background Gradient Effect */}
            <View style={styles.backgroundGradient} />

            <View style={styles.content}>
                {/* Logo and Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>✈️</Text>
                    </View>
                    <Text style={styles.title}>AeroSky</Text>
                    <Text style={styles.subtitle}>Drone Compliance Platform</Text>
                </View>

                {/* Login Form */}
                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Username / Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter username or email"
                            placeholderTextColor={Colors.dark.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.dark.textSecondary}
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
                                <Text style={styles.eyeIcon}>
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
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
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?{' '}
                        <Text style={styles.footerLink}>Contact Admin</Text>
                    </Text>
                </View>
            </View>

            {/* Forgot Password Modal */}
            <Modal
                visible={fpModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFpModalVisible(false)}
            >
                <View style={styles.fpOverlay}>
                    <View style={styles.fpContent}>
                        <Text style={styles.fpTitle}>Reset Password</Text>
                        <Text style={styles.fpSubtitle}>Verify your email with OTP to reset your password</Text>

                        {/* Step Indicator */}
                        <View style={styles.fpStepIndicator}>
                            {[1, 2, 3].map((step) => (
                                <View key={step} style={styles.fpStepRow}>
                                    <View style={[
                                        styles.fpStepDot,
                                        fpStep >= step && styles.fpStepDotActive,
                                    ]}>
                                        <Text style={[styles.fpStepDotText, fpStep >= step && styles.fpStepDotTextActive]}>
                                            {fpStep > step ? '✓' : step}
                                        </Text>
                                    </View>
                                    {step < 3 && <View style={[styles.fpStepLine, fpStep > step && styles.fpStepLineActive]} />}
                                </View>
                            ))}
                        </View>

                        {/* Step 1: Enter Email */}
                        {fpStep === 1 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={styles.fpLabel}>Email Address</Text>
                                    <TextInput
                                        style={styles.fpInput}
                                        value={fpEmail}
                                        onChangeText={setFpEmail}
                                        placeholder="Enter your registered email"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.fpButton, !fpEmail && styles.fpButtonDisabled]}
                                    onPress={async () => {
                                        if (!fpEmail) {
                                            Alert.alert('Error', 'Please enter your email');
                                            return;
                                        }
                                        setFpLoading(true);
                                        try {
                                            await apiClient.post('/api/mobile/auth/send-otp', {
                                                email: fpEmail,
                                                purpose: 'FORGOT_PASSWORD',
                                            });
                                            Alert.alert('OTP Sent', `A 6-digit code has been sent to ${fpEmail}`);
                                            setFpStep(2);
                                        } catch (error: any) {
                                            Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Send OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 2: Enter OTP */}
                        {fpStep === 2 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={styles.fpLabel}>Enter 6-digit OTP</Text>
                                    <TextInput
                                        style={[styles.fpInput, styles.fpOtpInput]}
                                        value={fpOtp}
                                        onChangeText={setFpOtp}
                                        placeholder="000000"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.fpButton, fpOtp.length !== 6 && styles.fpButtonDisabled]}
                                    onPress={async () => {
                                        if (fpOtp.length !== 6) {
                                            Alert.alert('Error', 'Please enter the 6-digit OTP');
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
                                            Alert.alert('Error', error.response?.data?.error || 'Invalid OTP');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Verify OTP</Text>
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
                                            Alert.alert('OTP Resent', 'A new OTP has been sent to your email');
                                        } catch (error: any) {
                                            Alert.alert('Error', error.response?.data?.error || 'Failed to resend OTP');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    style={{ marginTop: 12, alignItems: 'center' }}
                                >
                                    <Text style={{ color: Colors.dark.primaryLight, fontSize: 13 }}>Resend OTP</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Step 3: New Password */}
                        {fpStep === 3 && (
                            <View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={styles.fpLabel}>New Password</Text>
                                    <TextInput
                                        style={styles.fpInput}
                                        value={fpNewPassword}
                                        onChangeText={setFpNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                        secureTextEntry
                                    />
                                </View>
                                <View style={styles.fpInputGroup}>
                                    <Text style={styles.fpLabel}>Confirm Password</Text>
                                    <TextInput
                                        style={styles.fpInput}
                                        value={fpConfirmPassword}
                                        onChangeText={setFpConfirmPassword}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={Colors.dark.textSecondary}
                                        secureTextEntry
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.fpButton}
                                    onPress={async () => {
                                        if (!fpNewPassword || fpNewPassword.length < 4) {
                                            Alert.alert('Error', 'Password must be at least 4 characters');
                                            return;
                                        }
                                        if (fpNewPassword !== fpConfirmPassword) {
                                            Alert.alert('Error', 'Passwords do not match');
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
                                                'Success',
                                                'Password reset successfully! You can now log in with your new password.',
                                                [{ text: 'OK', onPress: () => setFpModalVisible(false) }]
                                            );
                                        } catch (error: any) {
                                            Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
                                        } finally {
                                            setFpLoading(false);
                                        }
                                    }}
                                    disabled={fpLoading}
                                >
                                    {fpLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.fpButtonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.fpCancelButton}
                            onPress={() => setFpModalVisible(false)}
                        >
                            <Text style={styles.fpCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: Colors.dark.primary,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    logoIcon: {
        fontSize: 40,
    },
    title: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.dark.textSecondary,
    },
    formContainer: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.dark.inputBorder,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        fontSize: FontSizes.md,
        color: Colors.dark.text,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.dark.inputBorder,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        fontSize: FontSizes.md,
        color: Colors.dark.text,
    },
    eyeButton: {
        paddingHorizontal: Spacing.md,
    },
    eyeIcon: {
        fontSize: 20,
    },
    loginButton: {
        backgroundColor: Colors.dark.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    forgotPasswordText: {
        color: Colors.dark.primaryLight,
        fontSize: FontSizes.sm,
    },
    footer: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        fontSize: FontSizes.sm,
        color: Colors.dark.textSecondary,
    },
    footerLink: {
        color: Colors.dark.primaryLight,
        fontWeight: '600',
    },
    // Forgot Password Modal Styles
    fpOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    fpContent: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.dark.inputBorder,
    },
    fpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: 4,
    },
    fpSubtitle: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.lg,
    },
    fpStepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    fpStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fpStepDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.dark.inputBackground,
        borderWidth: 1,
        borderColor: Colors.dark.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fpStepDotActive: {
        backgroundColor: Colors.dark.primary,
        borderColor: Colors.dark.primary,
    },
    fpStepDotText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.dark.textSecondary,
    },
    fpStepDotTextActive: {
        color: '#fff',
    },
    fpStepLine: {
        width: 40,
        height: 2,
        backgroundColor: Colors.dark.inputBorder,
        marginHorizontal: 8,
    },
    fpStepLineActive: {
        backgroundColor: Colors.dark.primary,
    },
    fpInputGroup: {
        marginBottom: Spacing.md,
    },
    fpLabel: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    fpInput: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.dark.text,
        borderWidth: 1,
        borderColor: Colors.dark.inputBorder,
    },
    fpOtpInput: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 8,
        textAlign: 'center',
    },
    fpButton: {
        backgroundColor: Colors.dark.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    fpButtonDisabled: {
        opacity: 0.5,
    },
    fpButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    fpCancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    fpCancelText: {
        color: Colors.dark.textSecondary,
        fontWeight: '500',
        fontSize: 15,
    },
});
