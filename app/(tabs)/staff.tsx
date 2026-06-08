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
import AddStaffModal from '../../components/AddStaffModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { TeamMember } from '../../lib/types';

const TeamMemberCard = ({
    member,
    onEdit,
    onDelete,
    theme
}: {
    member: TeamMember;
    onEdit: (member: TeamMember) => void;
    onDelete: (id: string) => void;
    theme: any;
}) => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                <FontAwesome name="user" size={24} color={theme.primary} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: theme.text }]}>{member.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => onEdit(member)} style={[styles.iconBtn, { backgroundColor: theme.background }]}>
                            <FontAwesome name="edit" size={14} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(member.id)} style={[styles.iconBtn, { backgroundColor: theme.error + '15' }]}>
                            <FontAwesome name="trash" size={14} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.badgeContainer}>
                    <View style={[styles.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.typeText, { color: theme.primary }]}>{member.position || 'Team Member'}</Text>
                    </View>
                    {member.accessId && (
                        <Text style={[styles.accessIdText, { color: theme.textSecondary }]}>ID: {member.accessId}</Text>
                    )}
                </View>
            </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                <Text style={[styles.value, { color: theme.text }]}>{member.email || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
                <Text style={[styles.value, { color: theme.text }]}>{member.phone || 'N/A'}</Text>
            </View>
        </View>
    </View>
);

export default function StaffScreen() {
    const { teamMembers, loading, fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

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
        Alert.alert('Revoke Access', 'Permanently remove this member from the organization?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
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
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={teamMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TeamMemberCard member={item} onEdit={openEditModal} onDelete={handleDelete} theme={theme} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
                            {teamMembers.length} PERSONNEL
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="users" size={48} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Personnel Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Initialize organizational growth by onboarding your first team member.
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
                            onPress={() => { setEditingMember(null); setIsModalVisible(true); }}
                        >
                            <Text style={styles.emptyAddBtnText}>Onboard Member</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
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
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: { marginBottom: Spacing.md, marginTop: Spacing.xs },
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
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    accessIdText: { fontSize: 12, fontWeight: '700' },
    cardDivider: { height: 1.5, marginVertical: Spacing.lg, opacity: 0.5 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
    detailItem: { width: '46%' },
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
