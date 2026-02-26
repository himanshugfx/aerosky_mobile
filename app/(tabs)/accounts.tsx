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
    Modal,
    useColorScheme,
    Platform,
    KeyboardAvoidingView,
    ActionSheetIOS
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { reimbursementsApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function AccountsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [activeTab, setActiveTab] = useState<'my' | 'admin'>('my');
    const [reimbursements, setReimbursements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);


    const getEmptyForm = () => ({
        name: '',
        amount: '',
        category: 'Operational',
        date: new Date().toISOString().split('T')[0],
        billData: '',

    });

    const [formData, setFormData] = useState(getEmptyForm());

    const categories = ['Travel', 'Maintenance', 'Operational', 'Marketing', 'Office', 'Other'];

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // Tab-specific labels
    const isAdminTab = activeTab === 'admin';
    const modalTitle = isAdminTab ? 'Record Expense' : 'File Reimbursement';
    const submitLabel = isAdminTab ? 'RECORD EXPENSE' : 'SUBMIT REIMBURSEMENT';

    const fetchReimbursements = async () => {
        try {
            setLoading(true);
            const data = await reimbursementsApi.list();
            setReimbursements(data);
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

    // Open form — always clear fields first
    const openForm = () => {
        setFormData(getEmptyForm());
        setShowForm(true);
    };

    // Camera + Gallery picker with ActionSheet
    const handlePickImage = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) launchCamera();
                    else if (buttonIndex === 2) launchGallery();
                }
            );
        } else {
            // Android: show Alert-based ActionSheet
            Alert.alert(
                'Attach Receipt',
                'Choose how to attach your bill',
                [
                    { text: 'Take Photo', onPress: launchCamera },
                    { text: 'Choose from Gallery', onPress: launchGallery },
                    { text: 'Cancel', style: 'cancel' },
                ]
            );
        }
    };

    const launchCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64 = result.assets[0].base64;
            setFormData(prev => ({ ...prev, billData: `data:image/jpeg;base64,${base64}` }));
            Alert.alert('Success', 'Photo captured and attached.');
        }
    };

    const launchGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Gallery permission is needed to select images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const base64 = result.assets[0].base64;
            setFormData(prev => ({ ...prev, billData: `data:image/jpeg;base64,${base64}` }));
            Alert.alert('Success', 'Image selected and attached.');
        }
    };



    const handleSubmit = async () => {
        if (!formData.name || !formData.amount || !formData.billData) {
            Alert.alert('Required Information', 'Description, amount, and bill attachment are required.');
            return;
        }

        if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            Alert.alert('Input Error', 'Please specify a valid numeric amount.');
            return;
        }

        setSubmitting(true);
        try {
            await reimbursementsApi.submit(formData as any);
            Alert.alert('Filing Successful', isAdminTab
                ? 'Expense has been recorded successfully.'
                : 'Your reimbursement request has been logged for review.'
            );
            setShowForm(false);
            setFormData(getEmptyForm());
            fetchReimbursements();
        } catch (error: any) {
            const errorData = error.response?.data;
            const msg = errorData?.details ? `${errorData.error}: ${errorData.details}` : (errorData?.error || 'Synchronization failed.');
            Alert.alert('Filing Failed', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            await reimbursementsApi.updateStatus(id, newStatus);
            setReimbursements(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return theme.success;
            case 'Completed': return '#3b82f6';
            case 'Rejected': return theme.error;
            default: return theme.warning;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.reimbursementCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                    <FontAwesome name="money" size={14} color={theme.primary} />
                </View>
                <View style={styles.cardMainInfo}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                        {item.category && (
                            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '10' }]}>
                                <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.cardDate, { color: theme.textSecondary }]}>{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '15' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <Text style={[styles.amountText, { color: theme.text }]}>₹ {parseFloat(item.amount).toLocaleString()}</Text>
                {isAdmin && (
                    <View style={[styles.userBadge, { backgroundColor: theme.inputBackground }]}>
                        <FontAwesome name="user-o" size={10} color={theme.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={[styles.userLabel, { color: theme.textSecondary }]}>{item.user?.fullName?.split(' ')[0] || 'Member'}</Text>
                    </View>
                )}
            </View>

            {isAdmin && activeTab === 'admin' && (
                <View style={[styles.statusActions, { borderTopColor: theme.border }]}>
                    {['Pending', 'Approved', 'Completed'].map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusBtn,
                                {
                                    backgroundColor: item.status === s ? getStatusColor(s) + '20' : theme.inputBackground,
                                    borderColor: item.status === s ? getStatusColor(s) + '50' : theme.border,
                                }
                            ]}
                            onPress={() => handleStatusChange(item.id, s)}
                            disabled={item.status === s || updatingId === item.id}
                        >
                            {updatingId === item.id ? (
                                <ActivityIndicator size="small" color={theme.textSecondary} />
                            ) : (
                                <Text style={[
                                    styles.statusBtnText,
                                    { color: item.status === s ? getStatusColor(s) : theme.textSecondary }
                                ]}>{s.toUpperCase()}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style="light" />

            {isAdmin && (
                <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my' && { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
                        onPress={() => setActiveTab('my')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'my' ? theme.primary : theme.textSecondary }]}>PERSONNEL LEDGER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'admin' && { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}
                        onPress={() => setActiveTab('admin')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'admin' ? theme.primary : theme.textSecondary }]}>ADMINISTRATIVE HUB</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={reimbursements.filter(r => {
                        const isMine = String(r.userId) === String(user?.id);
                        return activeTab === 'admin' || isMine;
                    })}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconBox, { backgroundColor: theme.cardBackground }]}>
                                <FontAwesome name="file-text-o" size={40} color={theme.border} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Ledgers Found</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Your financial reimbursement filings will appear here.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={openForm}
            >
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal visible={showForm} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>{modalTitle}</Text>
                                <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="e.g. Flight Mission Logistics"
                                    placeholderTextColor={theme.textSecondary}
                                    value={formData.name}
                                    onChangeText={text => setFormData({ ...formData, name: text })}
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
                                <View style={styles.categoryContainer}>
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.catOption,
                                                {
                                                    backgroundColor: formData.category === cat ? theme.primary : theme.inputBackground,
                                                    borderColor: formData.category === cat ? theme.primary : theme.border
                                                }
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat })}
                                        >
                                            <Text style={[
                                                styles.catOptionText,
                                                { color: formData.category === cat ? '#fff' : theme.textSecondary }
                                            ]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Camera + Gallery Picker */}
                                <TouchableOpacity
                                    style={[styles.uploadBtn, { backgroundColor: (formData.billData ? theme.success : theme.accent) + '10', borderColor: (formData.billData ? theme.success : theme.accent) + '50' }]}
                                    onPress={handlePickImage}
                                >
                                    <FontAwesome name={formData.billData ? "check-circle" : "camera"} size={18} color={formData.billData ? theme.success : theme.accent} />
                                    <Text style={[styles.uploadBtnText, { color: formData.billData ? theme.success : theme.accent }]}>
                                        {formData.billData ? "Receipt attached" : "Capture or select receipt"}
                                    </Text>
                                </TouchableOpacity>



                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: theme.primary }, submitting && styles.disabledBtn]}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>{submitLabel}</Text>
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
    tabContainer: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
        borderBottomWidth: 1.5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    listContent: { padding: Spacing.md, paddingBottom: 110 },
    reimbursementCard: {
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
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        borderWidth: 1,
    },
    cardMainInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
    cardDate: { fontSize: 12, fontWeight: '500', marginTop: 3 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1.5,
    },
    amountText: { fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
    userBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    userLabel: { fontSize: 11, fontWeight: '600' },
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
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    keyboardView: { width: '100%' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    formContent: { marginBottom: 10 },
    label: { fontSize: 11, fontWeight: '800', marginBottom: 10, marginTop: 12, letterSpacing: 1.5 },
    input: { borderRadius: 16, padding: 16, fontSize: 15, fontWeight: '500', marginBottom: 16, borderWidth: 1.5 },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginVertical: 8,
        gap: 12,
    },

    uploadBtnText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
    submitBtn: { padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 12, shadowOpacity: 0.2 },
    disabledBtn: { opacity: 0.5 },
    submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    statusActions: {
        flexDirection: 'row',
        gap: 8,
        paddingTop: 14,
        marginTop: 14,
        borderTopWidth: 1.5,
    },
    statusBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    statusBtnText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    categoryText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
    catOptionText: { fontSize: 12, fontWeight: '700' },
});
