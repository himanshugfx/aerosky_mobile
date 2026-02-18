import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Colors, { BorderRadius, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

// Interfaces
interface SupportTicket {
    id: string;
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    hasNewReply: boolean;
    updatedAt: string;
    organization?: {
        name: string;
    };
    _count?: {
        messages: number;
    };
}

const statusColors: Record<string, string> = {
    OPEN: '#EF4444',
    IN_PROGRESS: '#F97316',
    RESOLVED: '#10B981',
    CLOSED: '#6B7280'
};

const priorityColors: Record<string, string> = {
    LOW: '#3B82F6',
    NORMAL: '#10B981',
    HIGH: '#F59E0B',
    URGENT: '#EF4444'
};

export default function SupportScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuthStore();

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchTickets = async () => {
        try {
            const response = await apiClient.get('/api/mobile/support');
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
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
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/api/mobile/support', {
                subject,
                priority,
                message,
            });
            setModalVisible(false);
            setSubject('');
            setMessage('');
            setPriority('NORMAL');
            fetchTickets();
            Alert.alert('Success', 'Ticket created successfully');
        } catch (error) {
            console.error('Failed to create ticket:', error);
            Alert.alert('Error', 'Failed to create ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openTicketChat = (ticket: SupportTicket) => {
        router.push(`/support/${ticket.id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return time;
        }
        return date.toLocaleDateString();
    };

    const renderTicket = ({ item }: { item: SupportTicket }) => {
        return (
            <TouchableOpacity
                style={[styles.ticketCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => openTicketChat(item)}
                activeOpacity={0.7}
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
                    <Text style={[styles.ticketSubject, { color: theme.text }]}>{item.subject}</Text>
                    {!isSuperAdmin && item.hasNewReply && (
                        <View style={[styles.unreadDot, { backgroundColor: theme.error }]} />
                    )}
                </View>

                {isSuperAdmin && item.organization && (
                    <View style={styles.orgInfo}>
                        <FontAwesome name="building" size={14} color={theme.textSecondary} />
                        <Text style={[styles.orgName, { color: theme.textSecondary }]}>{item.organization.name}</Text>
                    </View>
                )}

                <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

                <View style={styles.ticketFooter}>
                    <View style={[styles.timeBox, { backgroundColor: theme.inputBackground }]}>
                        <FontAwesome name="clock-o" size={12} color={theme.textSecondary} />
                        <Text style={[styles.ticketTime, { color: theme.textSecondary }]}>{formatDate(item.updatedAt)}</Text>
                    </View>
                    <View style={styles.messageCount}>
                        <View style={[styles.msgIconBox, { backgroundColor: theme.primary + '15' }]}>
                            <FontAwesome name="comments" size={12} color={theme.primary} />
                        </View>
                        <Text style={[styles.messageCountText, { color: theme.text }]}>{item._count?.messages || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {isSuperAdmin ? 'Support Center' : 'Help & Support'}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {isSuperAdmin ? 'Platform-wide tickets' : 'Get assistance with your operations'}
                    </Text>
                </View>
                {!isSuperAdmin && (
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
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
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconBox, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="ticket" size={40} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Tickets Found</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            {isSuperAdmin
                                ? 'No support tickets from organizations yet'
                                : 'Need help? Create a support ticket and our team will assist you.'
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
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Contact Support</Text>
                                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>We'll respond as soon as possible</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="times" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Subject *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={subject}
                                onChangeText={setSubject}
                                placeholder="Brief description of your issue"
                                placeholderTextColor={theme.textSecondary + '60'}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Priority Level</Text>
                            <View style={styles.priorityOptions}>
                                {(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityOption,
                                            { backgroundColor: theme.cardBackground, borderColor: theme.border },
                                            priority === p && {
                                                backgroundColor: priorityColors[p] + '15',
                                                borderColor: priorityColors[p]
                                            }
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={[
                                            styles.priorityOptionText,
                                            { color: theme.textSecondary },
                                            priority === p && { color: priorityColors[p], fontWeight: '800' }
                                        ]}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Message Details *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Describe your issue in detail..."
                                placeholderTextColor={theme.textSecondary + '60'}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                            onPress={handleCreateTicket}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Support Ticket</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.lg,
        gap: 8,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    ticketCard: {
        borderRadius: 20,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    ticketHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    ticketSubject: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        letterSpacing: -0.3,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    orgInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    orgName: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardDivider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
        opacity: 0.5,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    ticketTime: {
        fontSize: 11,
        fontWeight: '600',
    },
    messageCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    msgIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageCountText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        borderRadius: 24,
        padding: Spacing.xl,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    modalSubtitle: {
        fontSize: 13,
        marginTop: 4,
        fontWeight: '500',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        fontSize: 15,
        fontWeight: '500',
    },
    textArea: {
        minHeight: 120,
    },
    priorityOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    priorityOptionText: {
        fontSize: 10,
        fontWeight: '700',
    },
    submitButton: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.sm,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancelBtn: {
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        fontWeight: '700',
        fontSize: 14,
    },
});
