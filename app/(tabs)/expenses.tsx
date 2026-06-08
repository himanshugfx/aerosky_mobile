import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import Colors, { BorderRadius, Spacing } from '../../constants/Colors';
import { useAuthStore, useComplianceStore } from '../../lib/store';
import type { Expense } from '../../lib/types';
import ProtectedRoute from '../../components/ProtectedRoute';

const categories = ['Travel', 'Maintenance', 'Operational', 'Marketing', 'Office', 'Other'];
const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Other'];
const paymentStatuses = ['unpaid', 'paid', 'partial'];

function ExpensesScreenContent() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuthStore();
    const { expenses, loading, fetchExpenses, addExpense, deleteExpense } = useComplianceStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Operational',
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
    });

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMINISTRATION';

    useEffect(() => {
        fetchExpenses();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExpenses();
        setRefreshing(false);
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: 'Operational',
            paymentMethod: 'UPI',
            paymentStatus: 'paid',
        });
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount) {
            Alert.alert('Required', 'Description and amount are required.');
            return;
        }

        if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            Alert.alert('Invalid', 'Please enter a valid amount.');
            return;
        }

        setSubmitting(true);
        try {
            await addExpense({
                ...formData,
                amount: parseFloat(formData.amount),
            } as any);
            Alert.alert('Success', 'Expense recorded successfully.');
            setShowForm(false);
            resetForm();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to record expense.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteExpense(id);
                    } catch {
                        Alert.alert('Error', 'Failed to delete expense');
                    }
                },
            },
        ]);
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Travel': return 'plane';
            case 'Maintenance': return 'wrench';
            case 'Operational': return 'cog';
            case 'Marketing': return 'bullhorn';
            case 'Office': return 'building';
            default: return 'tag';
        }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Travel': return '#3b82f6';
            case 'Maintenance': return '#f59e0b';
            case 'Operational': return theme.primary;
            case 'Marketing': return '#a855f7';
            case 'Office': return '#10b981';
            default: return theme.textSecondary;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return theme.success;
            case 'unpaid': return theme.error;
            case 'partial': return theme.warning;
            default: return theme.textSecondary;
        }
    };

    const filteredExpenses = activeFilter === 'All'
        ? expenses
        : expenses.filter(e => e.category === activeFilter);

    const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const renderItem = ({ item }: { item: Expense }) => (
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: getCategoryColor(item.category) + '12' }]}>
                    <FontAwesome name={getCategoryIcon(item.category) as any} size={16} color={getCategoryColor(item.category)} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.description}</Text>
                    <View style={styles.cardMeta}>
                        <View style={[styles.catBadge, { backgroundColor: getCategoryColor(item.category) + '12' }]}>
                            <Text style={[styles.catBadgeText, { color: getCategoryColor(item.category) }]}>{item.category.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                            {new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </Text>
                    </View>
                </View>
                {isAdmin && (
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <FontAwesome name="trash-o" size={14} color={theme.error + '80'} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.amountText, { color: theme.text }]}>₹ {item.amount?.toLocaleString()}</Text>
                <View style={styles.footerRight}>
                    {item.paymentMethod && (
                        <View style={[styles.methodBadge, { backgroundColor: theme.inputBackground }]}>
                            <Text style={[styles.methodText, { color: theme.textSecondary }]}>{item.paymentMethod}</Text>
                        </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(item.paymentStatus) + '15' }]}>
                        <Text style={[styles.statusText, { color: getPaymentStatusColor(item.paymentStatus) }]}>
                            {(item.paymentStatus || 'N/A').toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.summaryLeft}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>TOTAL EXPENSES</Text>
                    <Text style={[styles.summaryAmount, { color: theme.text }]}>₹ {totalAmount.toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRight, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.summaryCount, { color: theme.primary }]}>{filteredExpenses.length}</Text>
                    <Text style={[styles.summaryCountLabel, { color: theme.primary }]}>RECORDS</Text>
                </View>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                {['All', ...categories].map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: activeFilter === cat ? theme.primary : theme.cardBackground,
                                borderColor: activeFilter === cat ? theme.primary : theme.border,
                            }
                        ]}
                        onPress={() => setActiveFilter(cat)}
                    >
                        <Text style={[styles.filterChipText, { color: activeFilter === cat ? '#fff' : theme.textSecondary }]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading && expenses.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredExpenses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="line-chart" size={40} color={theme.border} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Expenses Found</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                {isAdmin ? 'Record your first expense to start tracking.' : 'No expense records available.'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            {isAdmin && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                    onPress={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <FontAwesome name="plus" size={22} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Add Expense Modal */}
            <Modal visible={showForm} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Record Expense</Text>
                                <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="e.g. Drone maintenance parts"
                                    placeholderTextColor={theme.textSecondary}
                                    value={formData.description}
                                    onChangeText={text => setFormData({ ...formData, description: text })}
                                />

                                <Text style={[styles.label, { color: theme.textSecondary }]}>AMOUNT (INR)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="0.00"
                                    placeholderTextColor={theme.textSecondary}
                                    keyboardType="numeric"
                                    value={formData.amount}
                                    onChangeText={text => setFormData({ ...formData, amount: text })}
                                />

                                <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
                                <View style={styles.chipContainer}>
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: formData.category === cat ? theme.primary : theme.inputBackground,
                                                    borderColor: formData.category === cat ? theme.primary : theme.border,
                                                }
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat })}
                                        >
                                            <Text style={[styles.chipText, { color: formData.category === cat ? '#fff' : theme.textSecondary }]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { color: theme.textSecondary }]}>PAYMENT METHOD</Text>
                                <View style={styles.chipContainer}>
                                    {paymentMethods.map(method => (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: formData.paymentMethod === method ? theme.primary : theme.inputBackground,
                                                    borderColor: formData.paymentMethod === method ? theme.primary : theme.border,
                                                }
                                            ]}
                                            onPress={() => setFormData({ ...formData, paymentMethod: method })}
                                        >
                                            <Text style={[styles.chipText, { color: formData.paymentMethod === method ? '#fff' : theme.textSecondary }]}>{method}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { color: theme.textSecondary }]}>PAYMENT STATUS</Text>
                                <View style={styles.chipContainer}>
                                    {paymentStatuses.map(status => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: formData.paymentStatus === status ? getPaymentStatusColor(status) : theme.inputBackground,
                                                    borderColor: formData.paymentStatus === status ? getPaymentStatusColor(status) : theme.border,
                                                }
                                            ]}
                                            onPress={() => setFormData({ ...formData, paymentStatus: status })}
                                        >
                                            <Text style={[styles.chipText, { color: formData.paymentStatus === status ? '#fff' : theme.textSecondary }]}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: theme.primary }, submitting && styles.disabledBtn]}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>RECORD EXPENSE</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 16,
        marginBottom: 0,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
    },
    summaryLeft: {},
    summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
    summaryAmount: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    summaryRight: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    summaryCount: { fontSize: 22, fontWeight: '900' },
    summaryCountLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
    filterScroll: { marginTop: 16, maxHeight: 44 },
    filterContent: { paddingHorizontal: 16, gap: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    filterChipText: { fontSize: 11, fontWeight: '700' },
    listContent: { padding: 16, paddingBottom: 100 },
    card: {
        borderRadius: 22,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3, marginBottom: 4 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    catBadgeText: { fontSize: 9, fontWeight: '800' },
    cardDate: { fontSize: 12, fontWeight: '500' },
    deleteBtn: { padding: 8 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1.5,
    },
    amountText: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    methodBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    methodText: { fontSize: 10, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    keyboardView: { width: '100%' },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        maxHeight: '85%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    formContent: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '800', marginBottom: 10, marginTop: 12, letterSpacing: 1.5 },
    input: { borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '500', marginBottom: 16, borderWidth: 1.5 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
    chipText: { fontSize: 12, fontWeight: '700' },
    submitBtn: { padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 12, shadowOpacity: 0.2 },
    disabledBtn: { opacity: 0.5 },
    submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});

export default function ExpensesScreen() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATION']}>
            <ExpensesScreenContent />
        </ProtectedRoute>
    );
}
