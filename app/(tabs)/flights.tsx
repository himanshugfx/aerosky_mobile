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
import AddFlightLogModal from '../../components/AddFlightLogModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { FlightLog } from '../../lib/types';

const FlightLogCard = ({
    log,
    onDelete,
    theme
}: {
    log: FlightLog;
    onDelete: (id: string) => void;
    theme: any;
}) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }]}>
                    <FontAwesome name="send" size={18} color={theme.accent} />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]}>{log.missionType} Mission</Text>
                        <TouchableOpacity onPress={() => onDelete(log.id)} style={[styles.iconBtn, { backgroundColor: theme.error + '10' }]}>
                            <FontAwesome name="trash" size={14} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.dateBadge, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.dateText, { color: theme.primary }]}>{new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</Text>
                        </View>
                        <View style={[styles.timeBadge, { backgroundColor: theme.success + '15' }]}>
                            <Text style={[styles.timeText, { color: theme.success }]}>{log.takeoffTime}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Platform</Text>
                    <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>{log.drone?.modelName || 'UAV'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Airtime</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{log.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Commanding PIC</Text>
                    <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>{log.pic?.name || 'N/A'}</Text>
                </View>
            </View>

            <View style={[styles.locationSection, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <FontAwesome name="map-marker" size={14} color={theme.primary} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {log.locationName || 'Deployment coordinates not recorded'}
                </Text>
            </View>
        </View>
    );
};

export default function FlightsScreen() {
    const { flightLogs, loading, fetchFlightLogs, addFlightLog, deleteFlightLog, fetchDrones, fetchTeamMembers, fetchBatteries } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

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
        Alert.alert('Purge Flight Record', 'Are you sure you want to remove this mission record from logs?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Purge Record',
                style: 'destructive',
                onPress: async () => {
                    await deleteFlightLog(id);
                },
            },
        ]);
    };

    if (loading && flightLogs.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={flightLogs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FlightLogCard log={item} onDelete={handleDelete} theme={theme} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
                            {flightLogs.length} LOGGED MISSIONS
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="paper-plane" size={48} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Flight Data</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Your flight telemetry and logs will be indexed here after mission completion.
                        </Text>
                    </View>
                }
            />
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={() => setIsAddModalVisible(true)}>
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
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: {
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
    },
    headerTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
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
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    dateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    dateText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    timeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    timeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    iconBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardDivider: { height: 1.5, marginVertical: Spacing.lg, opacity: 0.5 },
    cardDetails: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1 },
    label: { fontSize: 11, marginBottom: 4, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    value: { fontSize: 14, fontWeight: '600' },
    locationSection: {
        marginTop: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    locationText: { fontSize: 12, fontWeight: '500', flex: 1 },
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
