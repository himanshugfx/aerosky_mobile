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
import AddFlightLogModal from '../../components/AddFlightLogModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { FlightLog } from '../../lib/types';

const FlightLogCard = ({
    log,
    onDelete,
}: {
    log: FlightLog;
    onDelete: (id: string) => void;
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: Colors.dark.accent + '20' }]}>
                    <FontAwesome name="send" size={20} color={Colors.dark.accent} />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{log.missionType} Flight</Text>
                        <TouchableOpacity onPress={() => onDelete(log.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>{new Date(log.date).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Text style={styles.timeText}>{log.takeoffTime}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>Drone</Text>
                    <Text style={styles.value} numberOfLines={1}>{log.drone?.modelName || 'Unknown'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>Duration</Text>
                    <Text style={styles.value}>{log.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.label}>PIC</Text>
                    <Text style={styles.value} numberOfLines={1}>{log.pic?.name || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.locationSection}>
                <FontAwesome name="map-marker" size={14} color={Colors.dark.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                    {log.locationName || 'No location recorded'}
                </Text>
            </View>
        </View>
    );
};

export default function FlightsScreen() {
    const { flightLogs, loading, fetchFlightLogs, addFlightLog, deleteFlightLog, fetchDrones, fetchTeamMembers, fetchBatteries } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        fetchFlightLogs();
        fetchDrones();
        fetchTeamMembers();
        fetchBatteries();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchFlightLogs();
        setRefreshing(false);
    }, []);

    const handleDelete = (id: string) => {
        Alert.alert('Delete Flight Log', 'Are you sure you want to delete this flight record?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteFlightLog(id);
                },
            },
        ]);
    };

    if (loading && flightLogs.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={flightLogs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FlightLogCard log={item} onDelete={handleDelete} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{flightLogs.length} Flight Records</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="send" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Flights Logged</Text>
                        <Text style={styles.emptySubtitle}>Your flight records will appear here after they are logged on the web dashboard.</Text>
                    </View>
                }
            />
            <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalVisible(true)}>
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddFlightLogModal
                visible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                onSubmit={addFlightLog}
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
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.dark.text },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    dateBadge: {
        backgroundColor: Colors.dark.primary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dateText: { fontSize: 10, color: Colors.dark.primary, fontWeight: 'bold' },
    timeBadge: {
        backgroundColor: Colors.dark.success + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    timeText: { fontSize: 10, color: Colors.dark.success, fontWeight: 'bold' },
    iconBtn: { padding: 4 },
    cardDivider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: Spacing.md },
    cardDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1 },
    label: { fontSize: 10, color: Colors.dark.textSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: FontSizes.sm, color: Colors.dark.text, fontWeight: '600' },
    locationSection: {
        marginTop: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.dark.inputBackground,
        padding: 8,
        borderRadius: 8
    },
    locationText: { fontSize: 12, color: Colors.dark.textSecondary, flex: 1 },
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
