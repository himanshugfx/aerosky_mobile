import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Modal
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

// Helper to convert file URI to Base64 (simplified)
const fileToBase64 = async (uri: string) => {
    // In a real Expo app, we'd use expo-file-system
    // For now, mirroring the web logic as a mock/placeholder
    return "data:application/pdf;base64,JVBERi0xLjQKJ..."
};

export default function AccountsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'my' | 'admin'>('my');
    const [reimbursements, setReimbursements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        billData: ''
    });

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchReimbursements = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/reimbursements');
            setReimbursements(res.data);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReimbursements();
        setRefreshing(false);
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                // Mocking base64 conversion for this environment
                setFormData(prev => ({ ...prev, billData: 'data:image/png;base64,iVBORw0KGgo...' }));
                Alert.alert('Success', 'File attached successfully');
            }
        } catch (err) {
            console.error('Picker error:', err);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.amount || !formData.billData) {
            Alert.alert('Error', 'Please fill all fields and attach a bill');
            return;
        }

        setSubmitting(true);
        try {
            await apiClient.post('/api/reimbursements', formData);
            Alert.alert('Success', 'Reimbursement submitted');
            setShowForm(false);
            setFormData({
                name: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                billData: ''
            });
            fetchReimbursements();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.reimbursementCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <FontAwesome name="money" size={16} color={Colors.dark.primary} />
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.status === 'Approved' ? styles.statusApproved :
                        item.status === 'Rejected' ? styles.statusRejected : styles.statusPending
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.status === 'Approved' ? styles.statusTextApproved :
                            item.status === 'Rejected' ? styles.statusTextRejected : styles.statusTextPending
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.amountText}>₹ {item.amount.toLocaleString()}</Text>
                {isAdmin && (
                    <Text style={styles.userLabel}>{item.user?.fullName?.split(' ')[0] || 'User'}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Tab Switcher */}
            {isAdmin && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my' && styles.activeTab]}
                        onPress={() => setActiveTab('my')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Requests</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
                        onPress={() => setActiveTab('admin')}
                    >
                        <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>All Requests</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.dark.primary} />
                </View>
            ) : (
                <FlatList
                    data={reimbursements.filter(r => activeTab === 'admin' || r.userId === user?.id)}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome name="file-text-o" size={48} color={Colors.dark.textSecondary} />
                            <Text style={styles.emptyText}>No reimbursement records found</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowForm(true)}
            >
                <FontAwesome name="plus" size={24} color="#white" />
            </TouchableOpacity>

            {/* Submit Modal */}
            <Modal visible={showForm} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Reimbursement</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <FontAwesome name="close" size={20} color={Colors.dark.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContent}>
                            <Text style={styles.label}>Expense Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Hotel, Travel, etc."
                                placeholderTextColor={Colors.dark.textSecondary}
                                value={formData.name}
                                onChangeText={text => setFormData({ ...formData, name: text })}
                            />

                            <Text style={styles.label}>Amount (INR)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={Colors.dark.textSecondary}
                                keyboardType="numeric"
                                value={formData.amount}
                                onChangeText={text => setFormData({ ...formData, amount: text })}
                            />

                            <TouchableOpacity style={styles.uploadBtn} onPress={handlePickDocument}>
                                <FontAwesome name={formData.billData ? "check-circle" : "paperclip"} size={20} color="#fff" />
                                <Text style={styles.uploadBtnText}>
                                    {formData.billData ? "Bill Attached" : "Attach Bill (Image/PDF)"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Submit Request</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.dark.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    activeTab: {
        backgroundColor: Colors.dark.primary + '20',
    },
    tabText: {
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.dark.primary,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    reimbursementCard: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.dark.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardMainInfo: {
        flex: 1,
    },
    cardTitle: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '700',
    },
    cardDate: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusPending: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    statusApproved: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    statusRejected: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statusText: { fontSize: 10, fontWeight: '900' },
    statusTextPending: { color: Colors.dark.warning },
    statusTextApproved: { color: Colors.dark.success },
    statusTextRejected: { color: Colors.dark.error },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
    },
    amountText: {
        color: Colors.dark.text,
        fontSize: 18,
        fontWeight: '800',
    },
    userLabel: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Colors.dark.textSecondary,
        marginTop: 16,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.dark.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: Colors.dark.text,
        fontSize: 20,
        fontWeight: '800',
    },
    formContent: {
        marginBottom: 20,
    },
    label: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.dark.inputBackground,
        borderRadius: BorderRadius.md,
        padding: 12,
        color: Colors.dark.text,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.accent + '30',
        padding: 16,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.dark.accent,
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 10,
    },
    uploadBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: Colors.dark.primary,
        padding: 16,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
