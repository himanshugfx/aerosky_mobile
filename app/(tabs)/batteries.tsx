import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import AddBatteryModal from '../../components/AddBatteryModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Battery } from '../../lib/types';

const BatteryCard = ({
    battery,
    onDelete,
    theme
}: {
    battery: Battery;
    onDelete: (id: string) => void;
    theme: any;
}) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EAB30820', borderColor: '#EAB30840' }]}>
                <FontAwesome name="bolt" size={24} color="#EAB308" />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: theme.text }]}>{battery.model || `Pair ${battery.batteryNumberA?.replace(/[A-Z]/g, '')}`}</Text>
                    <TouchableOpacity onPress={() => onDelete(battery.id)} style={[styles.iconBtn, { backgroundColor: theme.error + '10' }]}>
                        <FontAwesome name="trash" size={14} color={theme.error} />
                    </TouchableOpacity>
                </View>
                <View style={styles.badgeContainer}>
                    <View style={[styles.typeBadge, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                        <Text style={[styles.typeText, { color: theme.textSecondary }]}>POWER UNIT PAIR</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                    <Text style={[styles.statusText, { color: theme.success }]}>Active</Text>
                </View>
            </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

        <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Unit A</Text>
                <Text style={[styles.value, { color: theme.text }]}>{battery.batteryNumberA || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Unit B</Text>
                <Text style={[styles.value, { color: theme.text }]}>{battery.batteryNumberB || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Capacity</Text>
                <Text style={[styles.value, { color: theme.text }]}>{battery.ratedCapacity || 'N/A'}</Text>
            </View>
        </View>
    </View>
);

export default function BatteriesScreen() {
    const { batteries, loading, fetchBatteries, addBattery, deleteBattery } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    useEffect(() => {
        fetchBatteries();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchBatteries();
        setRefreshing(false);
    }, []);

    const handleAddBattery = async (batteryData: Partial<Battery>) => {
        try {
            await addBattery(batteryData);
        } catch (error) {
            console.error('Error adding battery:', error);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Deregister Power Unit', 'Remove this power unit pair from the tracking registry? This action is irreversible.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    await deleteBattery(id);
                },
            },
        ]);
    };

    if (loading && batteries.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={batteries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <BatteryCard battery={item} onDelete={handleDelete} theme={theme} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
                            {batteries.length} POWER UNITS REGISTERED
                        </Text>
                        <TouchableOpacity style={styles.headerAction}>
                            <FontAwesome name="sort-amount-desc" size={14} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="bolt" size={48} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Power Units</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Register your power unit pairs to begin tracking and compliance management.
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Text style={styles.emptyAddBtnText}>Add Power Unit Pair</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={() => setIsAddModalVisible(true)}
            >
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddBatteryModal
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onSubmit={handleAddBattery}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
    },
    headerTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    headerAction: { padding: 4 },
    card: {
        borderRadius: 24,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
    iconBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
    statusText: { fontSize: 12, fontWeight: '700' },
    cardDivider: { height: 1.5, marginVertical: Spacing.lg, opacity: 0.5 },
    cardDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1 },
    label: { fontSize: 11, marginBottom: 4, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    value: { fontSize: 14, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
    emptyAddBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.xl, marginTop: 24 },
    emptyAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
