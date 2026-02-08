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
} from 'react-native';
import AddOrderModal from '../../components/AddOrderModal';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { useComplianceStore } from '../../lib/store';
import type { Order } from '../../lib/types';

const OrderCard = ({
    order,
    onEdit,
    onDelete,
}: {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={[styles.statusIcon, { backgroundColor: Colors.dark.primary + '20' }]}>
                <FontAwesome name="shopping-cart" size={24} color={Colors.dark.primary} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.contract}>{order.contractNumber}</Text>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => onEdit(order)} style={styles.iconBtn}>
                            <FontAwesome name="edit" size={16} color={Colors.dark.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(order.id)} style={styles.iconBtn}>
                            <FontAwesome name="trash" size={16} color={Colors.dark.error} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.client}>{order.clientName}</Text>
            </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Model</Text>
                <Text style={styles.value}>{order.droneModel}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Value</Text>
                <Text style={styles.value}>{order.currency} {order.contractValue.toLocaleString()}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{new Date(order.orderDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: order.manufacturingStage === 'Delivered' ? Colors.dark.success + '30' : Colors.dark.warning + '30' }]}>
                    <Text style={[styles.statusText, { color: order.manufacturingStage === 'Delivered' ? Colors.dark.success : Colors.dark.warning }]}>{order.manufacturingStage}</Text>
                </View>
            </View>
        </View>
    </View>
);

export default function OrdersScreen() {
    const { orders, loading, fetchOrders, addOrder, updateOrder, deleteOrder } = useComplianceStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

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

    const openEditModal = (order: Order) => {
        setEditingOrder(order);
        setIsModalVisible(true);
    };

    if (loading && orders.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <OrderCard order={item} onEdit={openEditModal} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>{orders.length} Active Orders</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name="shopping-cart" size={64} color={Colors.dark.border} />
                        <Text style={styles.emptyTitle}>No Orders Found</Text>
                        <Text style={styles.emptySubtitle}>Start by adding your first order</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
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
    container: { flex: 1, backgroundColor: Colors.dark.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.md, paddingBottom: 100 },
    listHeader: { marginBottom: Spacing.md },
    headerTitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, fontWeight: '600' },
    card: {
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    statusIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contract: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.dark.text },
    actionIcons: { flexDirection: 'row', gap: Spacing.sm },
    iconBtn: { padding: 4 },
    client: { fontSize: FontSizes.sm, color: Colors.dark.textSecondary, marginTop: 2 },
    cardDivider: { height: 1, backgroundColor: Colors.dark.border, marginVertical: Spacing.md },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    detailItem: { width: '47%' },
    label: { fontSize: FontSizes.xs, color: Colors.dark.textSecondary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: FontSizes.sm, color: Colors.dark.text, fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: FontSizes.xl, color: Colors.dark.text, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: FontSizes.md, color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 8 },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.dark.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
