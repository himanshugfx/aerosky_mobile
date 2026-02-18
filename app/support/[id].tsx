import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuthStore();
    const flatListRef = useRef<FlatList>(null);

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchTicket = async () => {
        try {
            const response = await apiClient.get(`/api/mobile/support/${id}`);
            setTicket(response.data);
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
            Alert.alert('System Error', 'Unable to retrieve transmission logs.');
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
            fetchTicket();
        } catch (error: any) {
            Alert.alert('Transmission Failed', error.response?.data?.error || 'Unable to dispatch message.');
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await apiClient.put(`/api/mobile/support/${id}`, { status: newStatus });
            setStatusModalVisible(false);
            fetchTicket();
            Alert.alert('Protocol Updated', `Ticket status transitioned to ${newStatus}`);
        } catch (error: any) {
            Alert.alert('Update Failed', error.response?.data?.error || 'Unable to update ticket state.');
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
            return 'TODAY';
        }
        return date.toLocaleDateString().toUpperCase();
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
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.textSecondary }]}>Communications log not found.</Text>
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
                    {isSuperAdmin && (
                        <TouchableOpacity
                            style={styles.resolveButton}
                            onPress={() => setStatusModalVisible(true)}
                        >
                            <FontAwesome
                                name="ellipsis-v"
                                size={14}
                                color="#fff"
                            />
                            <Text style={styles.resolveButtonText}>
                                Status
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

                {/* Status Selection Modal */}
                <Modal
                    visible={statusModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setStatusModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setStatusModalVisible(false)}
                    >
                        <View style={styles.statusModalContent}>
                            <Text style={styles.modalTitle}>Update Status</Text>
                            {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.statusOption,
                                        ticket.status === s && styles.statusOptionActive
                                    ]}
                                    onPress={() => handleStatusChange(s)}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: statusColors[s] }]} />
                                    <Text style={[
                                        styles.statusOptionText,
                                        ticket.status === s && styles.statusOptionTextActive
                                    ]}>
                                        {s.replace('_', ' ')}
                                    </Text>
                                    {ticket.status === s && (
                                        <FontAwesome name="check" size={14} color={Colors.dark.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, fontWeight: '600' },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1.5 },
    ticketInfo: { flex: 1, marginRight: 16 },
    ticketSubject: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
    ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    orgText: { fontSize: 12, fontWeight: '600' },
    resolveButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    statusModalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24, borderTopWidth: 1.5 },
    modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },
    statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 18, gap: 14, marginBottom: 10 },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    statusOptionText: { flex: 1, fontSize: 16, fontWeight: '600' },
    statusOptionTextActive: { fontWeight: '800' },
    messageList: { padding: 16, flexGrow: 1, paddingBottom: 30 },
    dateHeader: { alignItems: 'center', marginVertical: 20 },
    dateHeaderText: { fontSize: 11, fontWeight: '900', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, letterSpacing: 1.5 },
    messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: 12 },
    myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    theirMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1.5 },
    messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    myMessageText: { color: '#fff' },
    messageTime: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end', fontWeight: '600' },
    myMessageTime: { color: 'rgba(255,255,255,0.8)' },
    emptyMessages: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    emptyText: { fontSize: 15, fontWeight: '600', marginTop: 16 },
    inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1.5, alignItems: 'flex-end', gap: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
    input: { flex: 1, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, fontWeight: '500', maxHeight: 120, borderWidth: 1.5 },
    sendButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    closedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderTopWidth: 1.5, gap: 10 },
    closedText: { fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    theirMessageText: { color: Colors.dark.text },
    theirMessageTime: { color: Colors.dark.textSecondary },
    resolveButtonText: { color: '#fff', fontWeight: 'bold' },
    sendButtonDisabled: { opacity: 0.5 },
    statusOptionActive: { backgroundColor: Colors.dark.primaryLight + '20' },
});
