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
} from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';

interface SelectorProps {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    icon?: string;
}

const Selector = ({ label, value, placeholder, onPress, icon }: SelectorProps) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.selectorBox} onPress={onPress}>
            <View style={styles.selectorContent}>
                {icon && <FontAwesome name={icon as any} size={14} color={Colors.dark.textSecondary} style={{ marginRight: 8 }} />}
                <Text style={[styles.selectorText, !value && { color: Colors.dark.textSecondary }]}>
                    {value || placeholder}
                </Text>
            </View>
            <FontAwesome name="chevron-down" size={12} color={Colors.dark.textSecondary} />
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
        fetchSubcontractors
    } = useComplianceStore();

    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [inModalVisible, setInModalVisible] = useState(false);
    const [outModalVisible, setOutModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        componentId: '',
        quantity: '',
        subcontractorId: '',
        takenOutFor: '',
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
            Alert.alert('Error', 'Please fill in all required fields');
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
            Alert.alert('Success', `Stock ${type === 'IN' ? 'added' : 'usage recorded'} successfully`);
        } catch (error) {
            Alert.alert('Error', 'Failed to process transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedComponent = components.find(c => c.id === formData.componentId);
    const selectedSubcontractor = subcontractors.find(s => s.id === formData.subcontractorId);

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={styles.transactionCard}>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'IN' ? '#E8F5E9' : '#FFF3E0' }]}>
                <FontAwesome5
                    name={item.type === 'IN' ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={item.type === 'IN' ? '#2E7D32' : '#E65100'}
                />
                <Text style={[styles.typeText, { color: item.type === 'IN' ? '#2E7D32' : '#E65100' }]}>{item.type}</Text>
            </View>
            <View style={styles.transMain}>
                <Text style={styles.compName}>{item.component.name}</Text>
                <Text style={styles.transDetails}>
                    {item.type === 'IN' ? `From: ${item.subcontractor?.companyName || 'N/A'}` : `For: ${item.takenOutFor || 'N/A'}`}
                </Text>
            </View>
            <View style={styles.transRight}>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    if (loading && components.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search stock history..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            <View style={styles.stockSummary}>
                <Text style={styles.sectionTitle}>Current Stock</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stockScroll}>
                    {components.map(comp => (
                        <View key={comp.id} style={styles.stockCard}>
                            <FontAwesome5 name="box" size={20} color={Colors.dark.primary} />
                            <Text style={styles.stockQty}>{comp.quantity}</Text>
                            <Text style={styles.stockName} numberOfLines={1}>{comp.name}</Text>
                        </View>
                    ))}
                    {components.length === 0 && <Text style={styles.emptyText}>No components found</Text>}
                </ScrollView>
            </View>

            <Text style={[styles.sectionTitle, { marginHorizontal: Spacing.md }]}>Recent Activity</Text>
            <FlatList
                data={inventoryTransactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
            />

            <View style={styles.fabContainer}>
                <TouchableOpacity style={[styles.fab, { backgroundColor: '#2E7D32' }]} onPress={() => setInModalVisible(true)}>
                    <FontAwesome5 name="plus" size={20} color="white" />
                    <Text style={styles.fabText}>IN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fab, { backgroundColor: '#E65100' }]} onPress={() => setOutModalVisible(true)}>
                    <FontAwesome5 name="minus" size={20} color="white" />
                    <Text style={styles.fabText}>OUT</Text>
                </TouchableOpacity>
            </View>

            {/* Stock IN Modal */}
            <Modal visible={inModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Stock Arrival</Text>

                        <Selector
                            label="Component"
                            value={selectedComponent?.name || ''}
                            placeholder="Select Component"
                            onPress={() => openPicker(
                                "Select Component",
                                components.map(c => ({ id: c.id, label: c.name, sublabel: `Stock: ${c.quantity}` })),
                                (id) => setFormData({ ...formData, componentId: id })
                            )}
                            icon="box"
                        />

                        <Selector
                            label="Subcontractor"
                            value={selectedSubcontractor?.companyName || ''}
                            placeholder="Select Subcontractor"
                            onPress={() => openPicker(
                                "Select Subcontractor",
                                subcontractors.map(s => ({ id: s.id, label: s.companyName })),
                                (id) => setFormData({ ...formData, subcontractorId: id })
                            )}
                            icon="truck"
                        />

                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            keyboardType="numeric"
                            value={formData.quantity}
                            onChangeText={text => setFormData({ ...formData, quantity: text })}
                            placeholderTextColor="#999"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setInModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={() => handleTransaction('IN')} disabled={submitting}>
                                <Text style={styles.submitBtnText}>{submitting ? '...' : 'Record'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Stock OUT Modal */}
            <Modal visible={outModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Record Usage</Text>

                        <Selector
                            label="Component"
                            value={selectedComponent ? `${selectedComponent.name} (${selectedComponent.quantity})` : ''}
                            placeholder="Select Component"
                            onPress={() => openPicker(
                                "Select Component",
                                components.map(c => ({ id: c.id, label: c.name, sublabel: `Stock: ${c.quantity}` })),
                                (id) => setFormData({ ...formData, componentId: id })
                            )}
                            icon="box"
                        />

                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            keyboardType="numeric"
                            value={formData.quantity}
                            onChangeText={text => setFormData({ ...formData, quantity: text })}
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.label}>Taken Out For</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Flight #123"
                            value={formData.takenOutFor}
                            onChangeText={text => setFormData({ ...formData, takenOutFor: text })}
                            placeholderTextColor="#999"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setOutModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#E65100' }]} onPress={() => handleTransaction('OUT')} disabled={submitting}>
                                <Text style={styles.submitBtnText}>{submitting ? '...' : 'Record'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={pickerVisible} transparent animationType="fade">
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerModal}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>{pickerConfig?.title}</Text>
                            <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                <FontAwesome name="times" size={20} color={Colors.dark.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {pickerConfig?.items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        pickerConfig.onSelect(item.id);
                                        setPickerVisible(false);
                                    }}
                                >
                                    <View>
                                        <Text style={styles.pickerLabel}>{item.label}</Text>
                                        {item.sublabel && <Text style={styles.pickerSublabel}>{item.sublabel}</Text>}
                                    </View>
                                    <FontAwesome name="chevron-right" size={12} color={Colors.dark.border} />
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
    container: { flex: 1, backgroundColor: Colors.dark.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: Spacing.md, backgroundColor: Colors.dark.cardBackground, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.inputBackground, borderRadius: BorderRadius.md, paddingHorizontal: 12 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 44, fontSize: FontSizes.sm, color: Colors.dark.text },
    stockSummary: { paddingVertical: Spacing.md },
    sectionTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.sm, marginLeft: Spacing.md },
    stockScroll: { paddingLeft: Spacing.md },
    stockCard: { width: 120, height: 100, backgroundColor: Colors.dark.cardBackground, borderRadius: BorderRadius.lg, padding: Spacing.md, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center', justifyContent: 'center' },
    stockQty: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.dark.text, marginVertical: 4 },
    stockName: { fontSize: 10, color: Colors.dark.textSecondary, textAlign: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    transactionCard: { flexDirection: 'row', backgroundColor: Colors.dark.cardBackground, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
    typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
    typeText: { fontSize: 10, fontWeight: 'bold' },
    transMain: { flex: 1, marginLeft: 12 },
    compName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.dark.text },
    transDetails: { fontSize: 10, color: Colors.dark.textSecondary, marginTop: 2 },
    transRight: { alignItems: 'flex-end' },
    qtyText: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.dark.text },
    dateText: { fontSize: 10, color: Colors.dark.textSecondary, marginTop: 2 },
    fabContainer: { position: 'absolute', bottom: 20, right: 20, gap: 10 },
    fab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, gap: 8 },
    fabText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.dark.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: Colors.dark.border },
    modalTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', marginBottom: 20, color: Colors.dark.text },
    label: { fontSize: 12, fontWeight: '600', color: Colors.dark.textSecondary, marginBottom: 8, marginTop: 10, textTransform: 'uppercase' },
    inputGroup: { marginBottom: 15 },
    input: { backgroundColor: Colors.dark.inputBackground, borderRadius: BorderRadius.md, padding: 12, fontSize: FontSizes.md, color: Colors.dark.text, borderWidth: 1, borderColor: Colors.dark.border },
    selectorBox: { backgroundColor: Colors.dark.inputBackground, borderRadius: BorderRadius.md, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
    selectorContent: { flexDirection: 'row', alignItems: 'center' },
    selectorText: { color: Colors.dark.text, fontSize: 14, fontWeight: '500' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
    pickerModal: { backgroundColor: Colors.dark.cardBackground, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.dark.border },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    pickerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.dark.text },
    pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
    pickerLabel: { fontSize: 15, color: Colors.dark.text, fontWeight: '500' },
    pickerSublabel: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
    pickerContainer: { height: 44, marginBottom: 10 },
    pickerItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.dark.inputBackground, marginRight: 8, justifyContent: 'center', borderWidth: 1, borderColor: Colors.dark.border },
    pickerSelectedItem: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
    pickerText: { fontSize: 12, color: Colors.dark.textSecondary },
    pickerSelectedText: { color: 'white', fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 30 },
    cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.dark.border },
    cancelBtnText: { color: Colors.dark.textSecondary, fontWeight: '600' },
    submitBtn: { flex: 1, height: 50, backgroundColor: Colors.dark.primary, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.md },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    emptyText: { color: Colors.dark.textSecondary, fontSize: 12, fontStyle: 'italic', paddingLeft: 10 },
});
