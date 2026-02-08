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
import AddStaffModal from '../../components/AddStaffModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { TeamMember } from '../../lib/types';

const StaffCard = ({
    member,
    onEdit,
    onDelete,
}: {
    member: TeamMember;
    onEdit: (member: TeamMember) => void;
    onDelete: (id: string) => void;
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.dark.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: Colors.dark.primary }]}>
                    {member.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{member.name}</Text>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => onEdit(member)} style={styles.iconBtn}>
                            <FontAwesome name="edit" size={16} color={Colors.dark.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(member.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.position}>{member.position || 'No Position'}</Text>
            </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Access ID</Text>
                <Text style={styles.value}>{member.accessId}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{member.phone || 'N/A'}</Text>
            </View>
            <View style={styles.detailItemFull}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{member.email || 'N/A'}</Text>
            </View>
        </View>
    </View>
);

export default function StaffScreen() {
    const { teamMembers, loading, fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchTeamMembers();
        setRefreshing(false);
    }, []);

    const handleAddMember = async (memberData: Partial<TeamMember>) => {
        if (editingMember) {
            await updateTeamMember(editingMember.id, memberData);
        } else {
            await addTeamMember(memberData);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Member', 'Are you sure you want to delete this team member?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteTeamMember(id);
                },
            },
        ]);
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setIsModalVisible(true);
    };

    if (loading && teamMembers.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={teamMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <StaffCard member={item} onEdit={openEditModal} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{teamMembers.length} Team Members</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="users" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Team Members Found</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first team member</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setEditingMember(null);
                    setIsModalVisible(true);
                }}
            >
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddStaffModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleAddMember}
                initialData={editingMember}
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
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: { fontSize: 20, fontWeight: 'bold' },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.dark.text },
    actionIcons: { flexDirection: 'row', gap: Spacing.sm },
    iconBtn: { padding: 4 },
    position: { fontSize: FontSizes.sm, color: Colors.dark.primary, marginTop: 2, fontWeight: '500' },
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
