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
} from 'react-native';
import AddBatteryModal from '../../components/AddBatteryModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Battery } from '../../lib/types';

const BatteryCard = ({
    battery,
    onEdit,
    onDelete,
}: {
    battery: Battery;
    onEdit: (battery: Battery) => void;
    onDelete: (id: string) => void;
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: Colors.dark.warning + '20' }]}>
                <FontAwesome name="bolt" size={24} color={Colors.dark.warning} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{battery.model}</Text>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => onDelete(battery.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.capacity}>{battery.ratedCapacity}</Text>
            </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Serial Number A</Text>
                <Text style={styles.value}>{battery.batteryNumberA}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Serial Number B</Text>
                <Text style={styles.value}>{battery.batteryNumberB || 'N/A'}</Text>
            </View>
        </View>
    </View>
);

export default function BatteriesScreen() {
    const { batteries, loading, fetchBatteries, addBattery, deleteBattery } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchBatteries();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchBatteries();
        setRefreshing(false);
    }, []);

    const handleAddBattery = async (batteryData: Partial<Battery>) => {
        await addBattery(batteryData);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Battery', 'Are you sure you want to delete this battery from inventory?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteBattery(id);
                },
            },
        ]);
    };

    if (loading && batteries.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={batteries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BatteryCard battery={item} onEdit={() => { }} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{batteries.length} Batteries in Inventory</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="bolt" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>Inventory Empty</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first battery</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddBatteryModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleAddBattery}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: { marginBottom: Spacing.md },
    headerTitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, fontWeight: '600' },
    card: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.dark.text },
    actionIcons: { flexDirection: 'row', gap: Spacing.sm },
    iconBtn: { padding: 4 },
    capacity: { fontSize: FontSizes.sm, color: Colors.dark.success, marginTop: 2, fontWeight: '600' },
    cardDivider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: Spacing.md },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1 },
    label: { fontSize: FontSizes.xs, color: Colors.dark.textSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: FontSizes.sm, color: Colors.dark.text, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: FontSizes.xl, color: Colors.dark.text, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8 },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
