import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '../components/useColorScheme';
import Colors, { BorderRadius, FontSizes, Spacing } from '../constants/Colors';
import { useAuthStore } from '../lib/store';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    if (!user || (!allowedRoles.includes('ALL') && !allowedRoles.includes(user.role))) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                        <FontAwesome name="lock" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Access Denied</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        You don't have the necessary permissions to view this module. Please contact your administrator if you believe this is a mistake.
                    </Text>
                </View>
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSizes.md,
        textAlign: 'center',
        lineHeight: 22,
    },
});
