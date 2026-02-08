import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

interface Organization {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    createdAt: string;
}

export default function OrganizationsScreen() {
    const { user } = useAuthStore();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [manageModalVisible, setManageModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    // Form state for create
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for edit
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');

    const fetchOrganizations = async () => {
        try {
            const response = await apiClient.get('/api/mobile/organizations');
            setOrganizations(response.data);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
            Alert.alert('Error', 'Failed to load organizations');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchOrganizations();
    };

    const handleCreateOrg = async () => {
        if (!name) {
            Alert.alert('Error', 'Organization name is required');
            return;
        }
        if (!email) {
            Alert.alert('Error', 'Email is required (used as admin login)');
            return;
        }
        if (!phone) {
            Alert.alert('Error', 'Phone is required (used as admin password)');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/api/mobile/organizations', {
                name,
                email,
                phone
            });
            Alert.alert(
                'Organization Created!',
                `Admin Login:\nEmail: ${email}\nPassword: ${phone}`,
                [{ text: 'OK' }]
            );
            setModalVisible(false);
            setName('');
            setEmail('');
            setPhone('');
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManagePress = (org: Organization) => {
        setSelectedOrg(org);
        setManageModalVisible(true);
    };

    const handleEditPress = () => {
        if (selectedOrg) {
            setEditName(selectedOrg.name);
            setEditEmail(selectedOrg.email || '');
            setEditPhone(selectedOrg.phone || '');
            setManageModalVisible(false);
            setEditModalVisible(true);
        }
    };

    const handleUpdateOrg = async () => {
        if (!selectedOrg) return;

        if (!editName) {
            Alert.alert('Error', 'Organization name is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.put(`/api/mobile/organizations/${selectedOrg.id}`, {
                name: editName,
                email: editEmail,
                phone: editPhone
            });

            let message = 'Organization updated successfully!';
            if (editEmail !== selectedOrg.email) {
                message += '\n\nAdmin login email has been updated.';
            }
            if (editPhone !== selectedOrg.phone) {
                message += '\n\nAdmin password has been updated.';
            }

            Alert.alert('Success', message);
            setEditModalVisible(false);
            setSelectedOrg(null);
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePress = () => {
        if (!selectedOrg) return;

        Alert.alert(
            'Delete Organization',
            `Are you sure you want to delete "${selectedOrg.name}"?\n\nThis will also delete:\n• All admin users\n• All drones\n• All team members\n• All orders\n• All batteries\n\nThis action cannot be undone!`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async () => {
        if (!selectedOrg) return;

        setIsSubmitting(true);
        try {
            await apiClient.delete(`/api/mobile/organizations/${selectedOrg.id}`);
            Alert.alert('Success', 'Organization deleted successfully');
            setManageModalVisible(false);
            setSelectedOrg(null);
            fetchOrganizations();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete organization');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: Organization }) => (
        <View style={styles.orgCard}>
            <View style={styles.orgInfo}>
                <View style={styles.orgIconBox}>
                    <FontAwesome name="building" size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.orgTextContainer}>
                    <Text style={styles.orgName}>{item.name}</Text>
                    <Text style={styles.orgDetails}>{item.email || 'No email'} • {item.phone || 'No phone'}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.manageButton}
                onPress={() => handleManagePress(item)}
            >
                <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Organizations</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome name="plus" size={14} color="#fff" />
                    <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={organizations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="building-o" size={48} color={Colors.dark.border} />
                        <Text style={styles.emptyText}>No organizations found</Text>
                    </View>
                }
            />

            {/* Add Org Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Organization</Text>
                        <Text style={styles.modalSubtitle}>Admin credentials will be auto-created</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Organization Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. AeroSky India"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Email * (Admin Login)</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="contact@company.com"
                                placeholderTextColor={Colors.dark.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number * (Admin Password)</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="9876543210"
                                placeholderTextColor={Colors.dark.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleCreateOrg}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Manage Options Modal */}
            <Modal
                visible={manageModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setManageModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setManageModalVisible(false)}
                >
                    <View style={styles.manageModalContent}>
                        <Text style={styles.manageModalTitle}>{selectedOrg?.name}</Text>
                        <Text style={styles.manageModalSubtitle}>What would you like to do?</Text>

                        <TouchableOpacity
                            style={styles.manageOption}
                            onPress={handleEditPress}
                        >
                            <FontAwesome name="pencil" size={18} color={Colors.dark.primary} />
                            <Text style={styles.manageOptionText}>Edit Organization</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.manageOption, styles.deleteOption]}
                            onPress={handleDeletePress}
                        >
                            <FontAwesome name="trash" size={18} color="#EF4444" />
                            <Text style={[styles.manageOptionText, styles.deleteText]}>Delete Organization</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.manageCloseButton}
                            onPress={() => setManageModalVisible(false)}
                        >
                            <Text style={styles.manageCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Org Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Organization</Text>
                        <Text style={styles.modalSubtitle}>Changing email/phone updates admin credentials</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Organization Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="e.g. AeroSky India"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Email (Admin Login)</Text>
                            <TextInput
                                style={styles.input}
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="contact@company.com"
                                placeholderTextColor={Colors.dark.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number (Admin Password)</Text>
                            <TextInput
                                style={styles.input}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="9876543210"
                                placeholderTextColor={Colors.dark.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleUpdateOrg}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Update</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: Spacing.lg,
    },
    orgCard: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    orgInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    orgIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.dark.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    orgTextContainer: {
        flex: 1,
    },
    orgName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    orgDetails: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    manageButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.dark.inputBackground,
    },
    manageButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Colors.dark.textSecondary,
        fontSize: 16,
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    modalContent: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.dark.text,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: Spacing.lg,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: BorderRadius.md,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: Colors.dark.primary,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    // Manage Modal Styles
    manageModalContent: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    manageModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark.text,
        textAlign: 'center',
    },
    manageModalSubtitle: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    manageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        gap: 12,
    },
    manageOptionText: {
        fontSize: 16,
        color: Colors.dark.text,
        fontWeight: '500',
    },
    deleteOption: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    deleteText: {
        color: '#EF4444',
    },
    manageCloseButton: {
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    manageCloseText: {
        fontSize: 16,
        color: Colors.dark.textSecondary,
        fontWeight: '500',
    },
});
