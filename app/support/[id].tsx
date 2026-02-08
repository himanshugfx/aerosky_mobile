import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Colors, { BorderRadius, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

interface Message {
    id: string;
    senderId: string;
    message: string;
    createdAt: string;
}

interface Ticket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
    organization?: {
        name: string;
    };
    messages: Message[];
}

const statusColors: Record<string, string> = {
    OPEN: '#EF4444',
    IN_PROGRESS: '#F97316',
    RESOLVED: '#10B981',
    CLOSED: '#6B7280'
};

export default function SupportChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const flatListRef = useRef<FlatList>(null);

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchTicket = async () => {
        try {
            const response = await apiClient.get(`/api/mobile/support/${id}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
            Alert.alert('Error', 'Failed to load ticket');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTicket();
        }
    }, [id]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            await apiClient.post(`/api/mobile/support/${id}/messages`, {
                message: newMessage.trim()
            });
            setNewMessage('');
            fetchTicket(); // Refresh to get new message
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await apiClient.put(`/api/mobile/support/${id}`, { status: newStatus });
            fetchTicket();
            Alert.alert('Success', `Ticket marked as ${newStatus}`);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        return date.toLocaleDateString();
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMine = item.senderId === user?.id;
        const showDateHeader = index === 0 ||
            formatDate(item.createdAt) !== formatDate(ticket!.messages[index - 1].createdAt);

        return (
            <>
                {showDateHeader && (
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>{formatDate(item.createdAt)}</Text>
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isMine ? styles.myMessage : styles.theirMessage
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMine ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.message}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isMine ? styles.myMessageTime : styles.theirMessageTime
                    ]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Ticket not found</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Support Chat',
                    headerStyle: { backgroundColor: Colors.dark.background },
                    headerTintColor: Colors.dark.text,
                    headerBackTitle: 'Back'
                }}
            />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                {/* Ticket Header */}
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                        <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                        <View style={styles.ticketMeta}>
                            <View style={[styles.statusBadge, { backgroundColor: statusColors[ticket.status] + '20' }]}>
                                <Text style={[styles.statusText, { color: statusColors[ticket.status] }]}>
                                    {ticket.status.replace('_', ' ')}
                                </Text>
                            </View>
                            {isSuperAdmin && ticket.organization && (
                                <Text style={styles.orgText}>{ticket.organization.name}</Text>
                            )}
                        </View>
                    </View>
                    {isSuperAdmin && ticket.status !== 'CLOSED' && (
                        <TouchableOpacity
                            style={styles.resolveButton}
                            onPress={() => handleStatusChange(ticket.status === 'RESOLVED' ? 'CLOSED' : 'RESOLVED')}
                        >
                            <FontAwesome
                                name={ticket.status === 'RESOLVED' ? 'archive' : 'check'}
                                size={14}
                                color="#fff"
                            />
                            <Text style={styles.resolveButtonText}>
                                {ticket.status === 'RESOLVED' ? 'Close' : 'Resolve'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={ticket.messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        <View style={styles.emptyMessages}>
                            <FontAwesome name="comments-o" size={48} color={Colors.dark.border} />
                            <Text style={styles.emptyText}>No messages yet</Text>
                        </View>
                    }
                />

                {/* Input */}
                {ticket.status !== 'CLOSED' ? (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            placeholderTextColor={Colors.dark.textSecondary}
                            multiline
                            maxLength={2000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={isSending || !newMessage.trim()}
                        >
                            {isSending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <FontAwesome name="send" size={18} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.closedBanner}>
                        <FontAwesome name="lock" size={14} color={Colors.dark.textSecondary} />
                        <Text style={styles.closedText}>This ticket is closed</Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </>
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
    errorText: {
        color: Colors.dark.textSecondary,
        fontSize: 16,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.dark.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    ticketInfo: {
        flex: 1,
        marginRight: Spacing.md,
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
        marginBottom: 4,
    },
    ticketMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    orgText: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
    },
    resolveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.success,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    resolveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    messageList: {
        padding: Spacing.md,
        flexGrow: 1,
    },
    dateHeader: {
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    dateHeaderText: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        backgroundColor: Colors.dark.inputBackground,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.dark.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.dark.cardBackground,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: Colors.dark.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirMessageTime: {
        color: Colors.dark.textSecondary,
    },
    emptyMessages: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Colors.dark.textSecondary,
        marginTop: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.dark.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        color: Colors.dark.text,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.dark.border,
    },
    closedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.dark.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
        gap: 8,
    },
    closedText: {
        color: Colors.dark.textSecondary,
        fontSize: 14,
    },
});
