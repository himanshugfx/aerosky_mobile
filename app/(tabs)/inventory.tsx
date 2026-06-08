import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';

interface SelectorProps {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    icon?: string;
    theme: any;
}

const Selector = ({ label, value, placeholder, onPress, icon, theme }: SelectorProps) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <TouchableOpacity
            style={[styles.selectorBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
            onPress={onPress}
        >
            <View style={styles.selectorContent}>
                {icon && <FontAwesome name={icon as any} size={14} color={theme.primary} style={{ marginRight: 8 }} />}
                <Text style={[styles.selectorText, { color: value ? theme.text : theme.textSecondary }]}>
                    {value || placeholder}
                </Text>
            </View>
            <FontAwesome name="chevron-down" size={12} color={theme.textSecondary} />
        </TouchableOpacity>
    </View>
);

export default function InventoryScreen() {
    const {
        components,
        inventoryTransactions,
        subcontractors,
        loading,
        fetchInventory,
        addInventoryTransaction,
        addComponentType,
        fetchSubcontractors
    } = useComplianceStore();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'STOCKS' | 'LEDGER'>('STOCKS');

    const [inModalVisible, setInModalVisible] = useState(false);
    const [outModalVisible, setOutModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        componentId: '',
        quantity: '',
        subcontractorId: '',
        takenOutFor: '',
    });

    const [compFormData, setCompFormData] = useState({
        name: '',
        description: '',
        category: 'Operational'
    });

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerConfig, setPickerConfig] = useState<{
        title: string;
        items: { id: string; label: string; sublabel?: string }[];
        onSelect: (id: string) => void;
    } | null>(null);

    const openPicker = (title: string, items: { id: string; label: string; sublabel?: string }[], onSelect: (id: string) => void) => {
        setPickerConfig({ title, items, onSelect });
        setPickerVisible(true);
    };

    useEffect(() => {
        fetchInventory(searchTerm);
        fetchSubcontractors();
    }, [searchTerm]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchInventory(searchTerm);
        setRefreshing(false);
    };

    const handleTransaction = async (type: 'IN' | 'OUT') => {
        if (!formData.componentId || !formData.quantity) {
            Alert.alert('Incomplete Data', 'Component selection and quantity are mandatory.');
            return;
        }

        setSubmitting(true);
        try {
            await addInventoryTransaction({
                ...formData,
                quantity: parseInt(formData.quantity),
                type,
            });

            setInModalVisible(false);
            setOutModalVisible(false);
            setFormData({ componentId: '', quantity: '', subcontractorId: '', takenOutFor: '' });
            Alert.alert('Success', `Inventory ledger updated successfully.`);
        } catch (error) {
            Alert.alert('Transaction Failed', 'Unable to persist changes to the database.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddComponent = async () => {
        if (!compFormData.name) {
            Alert.alert('Error', 'Asset name is required');
            return;
        }

        setSubmitting(true);
        try {
            await addComponentType(compFormData);
            setAddModalVisible(false);
            setCompFormData({ name: '', description: '', category: 'Operational' });
            Alert.alert('Success', 'Asset type registered successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to register asset type');
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Manufacturing': return '#3b82f6';
            case 'Marketing': return '#a855f7';
            case 'Operational': return theme.primary;
            default: return theme.textSecondary;
        }
    };

    const selectedComponent = components.find(c => c.id === formData.componentId);
    const selectedSubcontractor = subcontractors.find(s => s.id === formData.subcontractorId);

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={[styles.transactionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'IN' ? theme.success + '15' : theme.warning + '15' }]}>
                <FontAwesome5
                    name={item.type === 'IN' ? 'arrow-up' : 'arrow-down'}
                    size={10}
                    color={item.type === 'IN' ? theme.success : theme.warning}
                />
                <Text style={[styles.typeText, { color: item.type === 'IN' ? theme.success : theme.warning }]}>{item.type}</Text>
            </View>
            <View style={styles.transMain}>
                <Text style={[styles.compName, { color: theme.text }]}>{item.component.name}</Text>
                <Text style={[styles.transDetails, { color: theme.textSecondary }]}>
                    {item.type === 'IN' ? `Supplier: ${item.subcontractor?.companyName || 'Internal'}` : `Allocation: ${item.takenOutFor || 'Unspecified'}`}
                </Text>
            </View>
            <View style={styles.transRight}>
                <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</Text>
            </View>
        </View>
    );

    if (loading && components.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <View style={styles.headerTop}>
                    <View style={styles.segmentContainer}>
                        <TouchableOpacity
                            style={[styles.segment, viewMode === 'STOCKS' && { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}
                            onPress={() => setViewMode('STOCKS')}
                        >
                            <Text style={[styles.segmentText, { color: viewMode === 'STOCKS' ? theme.primary : theme.textSecondary }]}>STOCKS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segment, viewMode === 'LEDGER' && { backgroundColor: theme.primary + '15', borderColor: theme.primary + '40' }]}
                            onPress={() => setViewMode('LEDGER')}
                        >
                            <Text style={[styles.segmentText, { color: viewMode === 'LEDGER' ? theme.primary : theme.textSecondary }]}>LEDGER</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: theme.inputBackground }]}
                        onPress={() => setAddModalVisible(true)}
                    >
                        <Ionicons name="add" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, marginTop: 12 }]}>
                    <Ionicons name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder={viewMode === 'STOCKS' ? "Find specific models..." : "Filter ledger history..."}
                        value={viewMode === 'STOCKS' ? stockSearchTerm : searchTerm}
                        onChangeText={viewMode === 'STOCKS' ? setStockSearchTerm : setSearchTerm}
                        placeholderTextColor={theme.textSecondary}
                    />
                </View>

                {viewMode === 'STOCKS' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingRight: 20 }}>
                        {['All', 'Manufacturing', 'Marketing', 'Operational'].map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catTab, activeCategory === cat && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => setActiveCategory(cat)}
                            >
                                <Text style={[styles.catTabText, { color: activeCategory === cat ? '#fff' : theme.textSecondary }]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {viewMode === 'STOCKS' ? (
                <FlatList
                    data={components
                        .filter(c => activeCategory === 'All' || c.category === activeCategory)
                        .filter(c => c.name.toLowerCase().includes(stockSearchTerm.toLowerCase()))
                    }
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[styles.stockListItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={[styles.stockIconBoxLarge, { backgroundColor: getCategoryColor(item.category) + '10' }]}>
                                <FontAwesome5 name="box-open" size={20} color={getCategoryColor(item.category)} />
                            </View>
                            <View style={styles.stockMain}>
                                <Text style={[styles.stockNameLarge, { color: theme.text }]}>{item.name}</Text>
                                <View style={styles.catRow}>
                                    <View style={[styles.catMiniBadge, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                                        <Text style={[styles.catMiniText, { color: getCategoryColor(item.category) }]}>{item.category.toUpperCase()}</Text>
                                    </View>
                                    {item.quantity <= 5 && (
                                        <View style={[styles.catMiniBadge, { backgroundColor: theme.error + '10' }]}>
                                            <Text style={[styles.catMiniText, { color: theme.error }]}>LOW STOCK</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={styles.stockRight}>
                                <Text style={[styles.stockQtyLarge, { color: theme.text }]}>{item.quantity}</Text>
                                <Text style={[styles.stockUnit, { color: theme.textSecondary }]}>UNITS</Text>
                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="boxes" size={48} color={theme.border} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Stocks Found</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Try adjusting your filters or category choice.</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={inventoryTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="history" size={48} color={theme.border} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Activity</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Stock arrival and usage records will appear here.</Text>
                        </View>
                    }
                />
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.success, shadowColor: theme.success }]}
                    onPress={() => setInModalVisible(true)}
                >
                    <FontAwesome5 name="plus" size={16} color="white" />
                    <Text style={styles.fabText}>STOCK IN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.warning, shadowColor: theme.warning }]}
                    onPress={() => setOutModalVisible(true)}
                >
                    <FontAwesome5 name="minus" size={16} color="white" />
                    <Text style={styles.fabText}>USAGE OUT</Text>
                </TouchableOpacity>
            </View>

            {/* Stock IN Modal */}
            <Modal visible={inModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Stock Intake</Text>
                                <TouchableOpacity onPress={() => setInModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Selector
                                label="Inventory Item"
                                value={selectedComponent?.name || ''}
                                placeholder="Select Asset Type"
                                onPress={() => openPicker(
                                    "Inventory Asset",
                                    components.map(c => ({ id: c.id, label: c.name, sublabel: `Current: ${c.quantity}` })),
                                    (id) => setFormData({ ...formData, componentId: id })
                                )}
                                icon="box"
                                theme={theme}
                            />

                            <Selector
                                label="Sourcing Partner"
                                value={selectedSubcontractor?.companyName || ''}
                                placeholder="Select Subcontractor"
                                onPress={() => openPicker(
                                    "Supply Partner",
                                    subcontractors.map(s => ({ id: s.id, label: s.companyName })),
                                    (id) => setFormData({ ...formData, subcontractorId: id })
                                )}
                                icon="truck"
                                theme={theme}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity Received</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Enter quantity"
                                    keyboardType="numeric"
                                    value={formData.quantity}
                                    onChangeText={text => setFormData({ ...formData, quantity: text })}
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.success }]}
                                onPress={() => handleTransaction('IN')}
                                disabled={submitting}
                            >
                                <Text style={styles.submitBtnText}>{submitting ? 'Updating Ledger...' : 'Commit to Inventory'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Stock OUT Modal */}
            <Modal visible={outModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Stock Deployment</Text>
                                <TouchableOpacity onPress={() => setOutModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Selector
                                label="Inventory Item"
                                value={selectedComponent ? `${selectedComponent.name}` : ''}
                                placeholder="Select Asset Type"
                                onPress={() => openPicker(
                                    "Inventory Asset",
                                    components.map(c => ({ id: c.id, label: c.name, sublabel: `Available: ${c.quantity}` })),
                                    (id) => setFormData({ ...formData, componentId: id })
                                )}
                                icon="box"
                                theme={theme}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity Dispatched</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="Units to remove"
                                    keyboardType="numeric"
                                    value={formData.quantity}
                                    onChangeText={text => setFormData({ ...formData, quantity: text })}
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Allocation / usage ref</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="e.g. Flight Mission #402"
                                    value={formData.takenOutFor}
                                    onChangeText={text => setFormData({ ...formData, takenOutFor: text })}
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.warning }]}
                                onPress={() => handleTransaction('OUT')}
                                disabled={submitting}
                            >
                                <Text style={styles.submitBtnText}>{submitting ? 'Processing Dispatch...' : 'Record Dispatch'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Register Asset Modal */}
            <Modal visible={addModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Register Asset</Text>
                                <TouchableOpacity onPress={() => setAddModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme.inputBackground }]}>
                                    <FontAwesome name="times" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Asset Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                    placeholder="e.g. Flight Controller Pro"
                                    value={compFormData.name}
                                    onChangeText={text => setCompFormData({ ...compFormData, name: text })}
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <Selector
                                label="Primary Categorization"
                                value={compFormData.category}
                                placeholder="Choose Category"
                                onPress={() => openPicker(
                                    "Logistics Category",
                                    ['Manufacturing', 'Marketing', 'Operational'].map(c => ({ id: c, label: c })),
                                    (id) => setCompFormData({ ...compFormData, category: id })
                                )}
                                icon="tag"
                                theme={theme}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, height: 80 }]}
                                    placeholder="Technical details..."
                                    multiline
                                    value={compFormData.description || ''}
                                    onChangeText={text => setCompFormData({ ...compFormData, description: text })}
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                onPress={handleAddComponent}
                                disabled={submitting}
                            >
                                <Text style={styles.submitBtnText}>{submitting ? 'Creating...' : 'Register Asset Type'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal visible={pickerVisible} transparent animationType="fade">
                <View style={styles.pickerOverlay}>
                    <View style={[styles.pickerModal, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.pickerTitle, { color: theme.text }]}>{pickerConfig?.title}</Text>
                            <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                <FontAwesome name="times" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {pickerConfig?.items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.pickerOption, { borderBottomColor: theme.border }]}
                                    onPress={() => {
                                        pickerConfig.onSelect(item.id);
                                        setPickerVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={[styles.pickerLabel, { color: theme.text }]}>{item.label}</Text>
                                        {item.sublabel && <Text style={[styles.pickerSublabel, { color: theme.textSecondary }]}>{item.sublabel}</Text>}
                                    </View>
                                    <FontAwesome name="chevron-right" size={12} color={theme.border} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    segmentContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4, gap: 4 },
    segment: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
    segmentText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 48 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
    catScroll: { marginTop: 12 },
    catTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    catTabText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    listContent: { padding: 16, paddingBottom: 100 },
    stockListItem: { flexDirection: 'row', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1.5, alignItems: 'center' },
    stockIconBoxLarge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    stockMain: { flex: 1 },
    stockNameLarge: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
    catRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    catMiniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    catMiniText: { fontSize: 8, fontWeight: '900' },
    stockRight: { alignItems: 'flex-end' },
    stockQtyLarge: { fontSize: 22, fontWeight: '900', letterSpacing: -1 },
    stockUnit: { fontSize: 8, fontWeight: '700', marginTop: -2 },
    transactionCard: { flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 12 },
    typeText: { fontSize: 10, fontWeight: '900' },
    transMain: { flex: 1 },
    compName: { fontSize: 15, fontWeight: '700' },
    transDetails: { fontSize: 12, marginTop: 2, fontWeight: '500' },
    transRight: { alignItems: 'flex-end' },
    qtyText: { fontSize: 16, fontWeight: '800' },
    dateText: { fontSize: 10, fontWeight: '600', marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
    emptySubtitle: { fontSize: 13, textAlign: 'center', fontWeight: '500', marginTop: 4, paddingHorizontal: 40 },
    fabContainer: { position: 'absolute', bottom: 30, left: 16, right: 16, flexDirection: 'row', gap: 12 },
    fab: { flex: 1, height: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabText: { color: 'white', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    keyboardView: { width: '100%' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderTopWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800' },
    closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    input: { height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', borderWidth: 1 },
    selectorBox: { height: 52, borderRadius: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1 },
    selectorContent: { flexDirection: 'row', alignItems: 'center' },
    selectorText: { fontSize: 15, fontWeight: '600' },
    submitBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    pickerModal: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    pickerTitle: { fontSize: 18, fontWeight: '800' },
    pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    pickerLabel: { fontSize: 16, fontWeight: '700' },
    pickerSublabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },
});
