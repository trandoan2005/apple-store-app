import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';
import { formatPrice } from '../../services/productService';
import { useRouter } from 'expo-router';

interface Order {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    items: any[];
    total: number;
    address: string;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    createdAt: string;
}

const STATUS_CONFIG = {
    pending: { label: 'Chờ duyệt', color: '#F59E0B', icon: 'time-outline' },
    confirmed: { label: 'Đã xác nhận', color: '#8B5CF6', icon: 'checkmark-circle-outline' },
    shipping: { label: 'Đang giao', color: '#3B82F6', icon: 'bicycle-outline' },
    delivered: { label: 'Đã giao', color: '#10B981', icon: 'checkmark-done-circle-outline' },
    cancelled: { label: 'Đã hủy', color: '#EF4444', icon: 'close-circle-outline' },
};

export default function ManageOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const handleStatusPress = (order: Order) => {
        Alert.alert(
            'Cập nhật trạng thái',
            `Đơn hàng #${order.id.slice(-6).toUpperCase()}`,
            [
                { text: 'Chờ duyệt', onPress: () => updateStatus(order.id, 'pending') },
                { text: 'Đã xác nhận', onPress: () => updateStatus(order.id, 'confirmed') },
                { text: 'Đang giao', onPress: () => updateStatus(order.id, 'shipping') },
                { text: 'Đã giao', onPress: () => updateStatus(order.id, 'delivered') },
                { text: 'Hủy đơn', style: 'destructive', onPress: () => updateStatus(order.id, 'cancelled') },
                { text: 'Bỏ qua', style: 'cancel' }
            ]
        );
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

        return (
            <GlassCard style={styles.orderCard} intensity={25}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}
                        onPress={() => handleStatusPress(item)}
                    >
                        <Ionicons name={status.icon as any} size={14} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.customerInfo}>
                    <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.customerDetail}>{item.userName} • {item.userPhone}</Text>
                </View>

                <View style={styles.addressLine}>
                    <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.itemCount}>{item.items.length} sản phẩm</Text>
                    <Text style={styles.totalAmount}>{formatPrice(item.total)}</Text>
                </View>
            </GlassCard>
        );
    };

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Quản lý Đơn hàng</Text>
                    <View style={{ width: 44 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={<Text style={styles.sectionTitle}>Đơn hàng gần đây ({orders.length})</Text>}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={64} color="rgba(255,255,255,0.1)" />
                                <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    listContent: { padding: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },

    orderCard: {
        padding: 20,
        borderRadius: 32,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderId: { fontSize: 15, fontWeight: '900', color: '#FFF' },
    orderDate: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '700' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        gap: 6,
    },
    statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    customerDetail: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    addressLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    addressText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, flex: 1, fontWeight: '600' },

    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    itemCount: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '700' },
    totalAmount: { fontSize: 18, fontWeight: '900', color: '#FFF' },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        fontWeight: '700'
    }
});
