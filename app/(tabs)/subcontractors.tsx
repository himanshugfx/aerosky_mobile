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
import AddSubcontractorModal from '../../components/AddSubcontractorModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Subcontractor } from '../../lib/types';

const SubcontractorCard = ({
    sub,
    onEdit,
    onDelete,
}: {
    sub: Subcontractor;
    onEdit: (sub: Subcontractor) => void;
    onDelete: (id: string) => void;
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F9731620' }]}>
                <FontAwesome name="building" size={24} color="#F97316" />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{sub.companyName}</Text>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => onEdit(sub)} style={styles.iconBtn}>
                            <FontAwesome name="edit" size={16} color={Colors.dark.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(sub.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{sub.type}</Text>
                </View>
            </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Contact Person</Text>
                <Text style={styles.value}>{sub.contactPerson || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{sub.contactPhone || 'N/A'}</Text>
            </View>
            <View style={styles.detailItemFull}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{sub.contactEmail || 'N/A'}</Text>
            </View>
            <View style={styles.detailItemFull}>
                <Text style={styles.label}>Agreement Date</Text>
                <Text style={styles.value}>{sub.agreementDate || 'N/A'}</Text>
            </View>
        </View>
    </View>
);

export default function SubcontractorsScreen() {
    const { subcontractors, loading, fetchSubcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSub, setEditingSub] = useState<Subcontractor | null>(null);

    useEffect(() => {
        fetchSubcontractors();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchSubcontractors();
        setRefreshing(false);
    }, []);

    const handleAddSub = async (subData: Partial<Subcontractor>) => {
        if (editingSub) {
            await updateSubcontractor(editingSub.id, subData);
        } else {
            await addSubcontractor(subData);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Subcontractor', 'Are you sure you want to delete this subcontractor?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteSubcontractor(id);
                },
            },
        ]);
    };

    const openEditModal = (sub: Subcontractor) => {
        setEditingSub(sub);
        setIsModalVisible(true);
    };

    if (loading && subcontractors.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={subcontractors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubcontractorCard sub={item} onEdit={openEditModal} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{subcontractors.length} Subcontractors</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="building" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Subcontractors</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first partner</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setEditingSub(null);
                    setIsModalVisible(true);
                }}
            >
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddSubcontractorModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleAddSub}
                initialData={editingSub}
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
    typeBadge: {
        backgroundColor: Colors.dark.inputBackground,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    typeText: { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
    cardDivider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: Spacing.md },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    detailItem: { width: '47%' },
    detailItemFull: { width: '100%' },
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
