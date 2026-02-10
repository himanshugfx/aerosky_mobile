import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

interface SupportTicket {
    id: string;
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    organization?: {
        id: string;
        name: string;
    };
    _count?: {
        messages: number;
    };
    hasNewReply?: boolean;
}

const statusColors: Record<string, string> = {
    OPEN: '#EF4444',
    IN_PROGRESS: '#F97316',
    RESOLVED: '#10B981',
    CLOSED: '#6B7280'
};

const priorityColors: Record<string, string> = {
    LOW: '#6B7280',
    NORMAL: '#3B82F6',
    HIGH: '#F97316',
    URGENT: '#EF4444'
};

export default function SupportScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state for new ticket
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchTickets = async () => {
        try {
            const response = await apiClient.get('/api/mobile/support');
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            Alert.alert('Error', 'Failed to load support tickets');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchTickets();
    };

    const handleCreateTicket = async () => {
        if (!subject.trim()) {
            Alert.alert('Error', 'Subject is required');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Error', 'Message is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/api/mobile/support', {
                subject,
                message,
                priority
            });
            Alert.alert('Success', 'Support ticket created successfully');
            setModalVisible(false);
            setSubject('');
            setMessage('');
            setPriority('NORMAL');
            fetchTickets();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openTicketChat = (ticket: SupportTicket) => {
        router.push(`/support/${ticket.id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const renderTicket = ({ item }: { item: SupportTicket }) => (
        <TouchableOpacity
            style={styles.ticketCard}
            onPress={() => openTicketChat(item)}
        >
            <View style={styles.ticketHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
                    <Text style={[styles.priorityText, { color: priorityColors[item.priority] }]}>
                        {item.priority}
                    </Text>
                </View>
            </View>

            <View style={styles.subjectRow}>
                <Text style={styles.ticketSubject}>{item.subject}</Text>
                {!isSuperAdmin && item.hasNewReply && (
                    <View style={styles.unreadDot} />
                )}
            </View>

            {isSuperAdmin && item.organization && (
                <View style={styles.orgInfo}>
                    <FontAwesome name="building" size={12} color={Colors.dark.textSecondary} />
                    <Text style={styles.orgName}>{item.organization.name}</Text>
                </View>
            )}

            <View style={styles.ticketFooter}>
                <Text style={styles.ticketTime}>{formatDate(item.updatedAt)}</Text>
                <View style={styles.messageCount}>
                    <FontAwesome name="comments" size={12} color={Colors.dark.textSecondary} />
                    <Text style={styles.messageCountText}>{item._count?.messages || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
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
                <Text style={styles.title}>
                    {isSuperAdmin ? 'All Support Tickets' : 'My Support Tickets'}
                </Text>
                {!isSuperAdmin && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <FontAwesome name="plus" size={14} color="#fff" />
                        <Text style={styles.addButtonText}>New Ticket</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={tickets}
                renderItem={renderTicket}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="ticket" size={48} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Tickets</Text>
                        <Text style={styles.emptyText}>
                            {isSuperAdmin
                                ? 'No support tickets from organizations yet'
                                : 'Need help? Create a support ticket'
                            }
                        </Text>
                    </View>
                }
            />

            {/* Create Ticket Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Contact Support</Text>
                        <Text style={styles.modalSubtitle}>We'll respond as soon as possible</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject *</Text>
                            <TextInput
                                style={styles.input}
                                value={subject}
                                onChangeText={setSubject}
                                placeholder="Brief description of your issue"
                                placeholderTextColor={Colors.dark.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityOptions}>
                                {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityOption,
                                            priority === p && {
                                                backgroundColor: priorityColors[p] + '30',
                                                borderColor: priorityColors[p]
                                            }
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={[
                                            styles.priorityOptionText,
                                            priority === p && { color: priorityColors[p] }
                                        ]}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Describe your issue in detail..."
                                placeholderTextColor={Colors.dark.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
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
                                onPress={handleCreateTicket}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
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
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.sm,
    },
    ticketCard: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    ticketHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    orgInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    orgName: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    ticketTime: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
    },
    messageCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    messageCountText: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark.text,
        marginTop: 16,
    },
    emptyText: {
        color: Colors.dark.textSecondary,
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
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
    textArea: {
        minHeight: 100,
    },
    priorityOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        alignItems: 'center',
    },
    priorityOptionText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.dark.textSecondary,
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
});
