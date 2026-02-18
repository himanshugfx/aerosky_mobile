import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    useColorScheme,
} from 'react-native';
import AddOrderModal from '../../components/AddOrderModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Order } from '../../lib/types';
import { generateOrderPDF } from '../../lib/pdf-generator';

const OrderCard = ({
    order,
    onEdit,
    onDelete,
    onDownload,
}: {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onDownload: (order: Order) => void;
}) => {
    const isDelivered = order.manufacturingStage === 'Delivered';
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    // Stage based colors (matching web dashboard logic)
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Delivered': return theme.success;
            case 'Testing': return theme.accent;
            case 'Assembling': return theme.warning;
            case 'In Design': return theme.primaryLight;
            default: return theme.textSecondary;
        }
    };

    const stageColor = getStageColor(order.manufacturingStage);

    return (
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderTopColor: stageColor, borderTopWidth: 4 }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusIcon, { backgroundColor: stageColor + '15' }]}>
                    <FontAwesome name="shopping-cart" size={24} color={stageColor} />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.contract, { color: theme.text }]}>{order.contractNumber}</Text>
                        <View style={styles.actionIcons}>
                            <TouchableOpacity onPress={() => onDownload(order)} style={styles.iconBtn}>
                                <FontAwesome name="download" size={16} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onEdit(order)} style={styles.iconBtn}>
                                <FontAwesome name="edit" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDelete(order.id)} style={styles.iconBtn}>
                                <FontAwesome name="trash" size={16} color={theme.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={[styles.client, { color: theme.textSecondary }]}>{order.clientName}</Text>
                </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border + '30' }]} />

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Model</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{order.droneModel}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Weight</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{order.weightClass}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Value</Text>
                    <Text style={[styles.value, { color: theme.text }]}>₹{order.contractValue.toLocaleString()}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{new Date(order.orderDate).toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border + '30' }]}>
                <View style={[styles.statusBadge, { backgroundColor: stageColor + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: stageColor }]} />
                    <Text style={[styles.statusText, { color: stageColor }]}>
                        {order.manufacturingStage}
                    </Text>
                </View>
                <View style={styles.docCount}>
                    <FontAwesome name="paperclip" size={12} color={theme.textSecondary} />
                    <Text style={[styles.docText, { color: theme.textSecondary }]}>{order.uploads?.length || 0} Docs</Text>
                </View>
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const { orders, loading, fetchOrders, addOrder, updateOrder, deleteOrder } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    }, []);

    const handleAddOrder = async (orderData: Partial<Order>) => {
        if (editingOrder) {
            await updateOrder(editingOrder.id, orderData);
        } else {
            await addOrder(orderData);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Order', 'Are you sure you want to delete this order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteOrder(id);
                },
            },
        ]);
    };

    const handleDownload = async (order: Order) => {
        try {
            await generateOrderPDF(order);
        } catch (error) {
            Alert.alert('Export Failed', 'Could not generate PDF. Please try again.');
        }
    };

    const openEditModal = (order: Order) => {
        setEditingOrder(order);
        setIsModalVisible(true);
    };

    if (loading && orders.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>{orders.length} Active Orders</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome name="shopping-cart" size={40} color={theme.border} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Orders Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Start by adding your first order</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={() => {
                    setEditingOrder(null);
                    setIsModalVisible(true);
                }}
            >
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>

            <AddOrderModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleAddOrder}
                initialData={editingOrder}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: { marginBottom: Spacing.md, marginTop: Spacing.sm },
    headerTitle: { fontSize: FontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.md,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    statusIcon: {
        width: 54,
        height: 54,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contract: { fontSize: FontSizes.lg, fontWeight: '800', letterSpacing: -0.5 },
    actionIcons: { flexDirection: 'row', gap: Spacing.md },
    iconBtn: { padding: 4 },
    client: { fontSize: FontSizes.md, marginTop: 1, fontWeight: '500' },
    cardDivider: { height: 1, marginVertical: Spacing.xl },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
    detailItem: { width: '45%' },
    label: { fontSize: FontSizes.xs, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
    value: { fontSize: FontSizes.md, fontWeight: '600' },
    cardFooter: {
        marginTop: Spacing.xl,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    docCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    docText: { fontSize: 11, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    emptyTitle: { fontSize: FontSizes.xl, fontWeight: '800', marginTop: 10 },
    emptySubtitle: { fontSize: FontSizes.md, textAlign: 'center', marginTop: 6, opacity: 0.8 },
    fab: {
        position: 'absolute',
        right: Spacing.xl,
        bottom: Spacing.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
