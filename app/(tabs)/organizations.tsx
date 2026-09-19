import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';

export default function OrganizationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                    <FontAwesome name="building" size={36} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>AeroSys Aviation</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    This platform is configured exclusively for AeroSys Aviation operations. Multi-tenancy and organization management have been retired.
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Text style={styles.buttonText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconBox: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
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
        marginBottom: Spacing.xl,
    },
    button: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: FontSizes.md,
    },
});
