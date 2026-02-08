import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
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
import AddDroneModal from '../../components/AddDroneModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Drone } from '../../lib/types';

const DroneCard = ({
    drone,
    onDelete,
}: {
    drone: Drone;
    onDelete: (id: string) => void;
}) => {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/drone/${drone.id}`)}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: Colors.dark.primary + '20' }]}>
                    <FontAwesome name="fighter-jet" size={24} color={Colors.dark.primary} />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{drone.modelName}</Text>
                        <TouchableOpacity onPress={() => onDelete(drone.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>DGCA TYPE CERTIFIED</Text>
                        </View>
                        <View style={[styles.statusIndicator, { backgroundColor: Colors.dark.success }]} />
                    </View>
                </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>Units</Text>
                    <Text style={styles.value}>{drone.manufacturedUnits?.length || 0}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>Added On</Text>
                    <Text style={styles.value}>{new Date(drone.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>Compliance</Text>
                    <Text style={[styles.value, { color: Colors.dark.success }]}>Active</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/drone/${drone.id}`)}
                >
                    <Text style={styles.actionButtonText}>View Checklist</Text>
                    <FontAwesome name="chevron-right" size={12} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function DronesScreen() {
    const { drones, loading, fetchDrones, addDrone, deleteDrone } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        fetchDrones();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchDrones();
        setRefreshing(false);
    }, []);

    const handleAddDrone = async (droneData: Partial<Drone>) => {
        try {
            await addDrone(droneData);
        } catch (error) {
            console.error('Error adding drone:', error);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Drone', 'Are you sure you want to delete this drone configuration?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteDrone(id);
                },
            },
        ]);
    };

    if (loading && drones.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={drones}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <DroneCard drone={item} onDelete={handleDelete} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{drones.length} Drones Registered</Text>
                        <TouchableOpacity style={styles.filterBtn}>
                            <FontAwesome name="filter" size={14} color={Colors.dark.primary} />
                            <Text style={styles.filterBtnText}>Sort</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="fighter-jet" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Drones Registered</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first drone model</Text>
                        <TouchableOpacity
                            style={styles.emptyAddBtn}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <Text style={styles.emptyAddBtnText}>+ Add Drone</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalVisible(true)}>
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddDroneModal
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onSubmit={handleAddDrone}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerTitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, fontWeight: '600' },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    filterBtnText: { fontSize: 14, color: Colors.dark.primary, fontWeight: '600' },
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
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    typeBadge: {
        backgroundColor: Colors.dark.inputBackground,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeText: { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: 'bold' },
    statusIndicator: { width: 8, height: 8, borderRadius: 4 },
    iconBtn: { padding: 4 },
    cardDivider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: Spacing.md },
    cardDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1 },
    label: { fontSize: FontSizes.xs, color: Colors.dark.textSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: FontSizes.sm, color: Colors.dark.text, fontWeight: '600' },
    cardActions: { marginTop: Spacing.md },
    actionButton: {
        backgroundColor: Colors.dark.primary,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButtonText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: FontSizes.xl, color: Colors.dark.text, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8 },
    emptyAddBtn: { backgroundColor: Colors.dark.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 24 },
    emptyAddBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: 'bold' },
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
