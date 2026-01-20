import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../services/productService';

const STATUS_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ duyệt' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'cancelled', label: 'Đã hủy' }
];

export default function MyOrdersScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Note: For complex filtering like 'status == activeTab AND userId == user.uid',
        // Firestore requires a composite index. We'll filter client-side for simplicity/speed 
        // in this prototype unless the list is huge.
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(allOrders);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status === activeTab);

    if (!user) return null;

    const renderOrderItem = ({ item }: { item: any }) => {
        let statusColor = '#F59E0B';
        let statusLabel = 'Chờ xử lý';

        switch (item.status) {
            case 'confirmed': statusColor = '#8B5CF6'; statusLabel = 'Đã xác nhận'; break;
            case 'shipping': statusColor = '#3B82F6'; statusLabel = 'Đang giao hàng'; break;
            case 'delivered': statusColor = '#10B981'; statusLabel = 'Giao thành công'; break;
            case 'cancelled': statusColor = '#EF4444'; statusLabel = 'Đã hủy'; break;
        }

        return (
            <TouchableOpacity onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item.id } })} activeOpacity={0.8}>
                <GlassCard style={styles.orderCard} intensity={25}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.orderId}>Đơn hàng #{item.id.slice(-6).toUpperCase()}</Text>
                            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {item.items.slice(0, 2).map((prod: any, idx: number) => (
                        <View key={idx} style={styles.productRow}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {prod.quantity}x {prod.name}
                            </Text>
                        </View>
                    ))}
                    {item.items.length > 2 && (
                        <Text style={styles.moreItems}>+ {item.items.length - 2} sản phẩm khác</Text>
                    )}

                    <View style={styles.cardFooter}>
                        <Text style={styles.totalLabel}>Tổng tiền:</Text>
                        <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đơn mua</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.tabsContainer}>
                    <FlatList
                        horizontal
                        data={STATUS_TABS}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.tabItem, activeTab === item.id && styles.tabActive]}
                                onPress={() => setActiveTab(item.id)}
                            >
                                <Text style={[styles.tabText, activeTab === item.id && styles.tabTextActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                    />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#d70018" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyView}>
                                <Ionicons name="documents-outline" size={64} color="rgba(255,255,255,0.2)" />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    tabsContainer: {
        height: 50,
        marginBottom: 8,
    },
    tabsContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 8,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tabActive: {
        backgroundColor: '#d70018',
        borderColor: '#d70018',
    },
    tabText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#FFF',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    orderCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
    },
    orderDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    productRow: {
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    moreItems: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 4,
        fontStyle: 'italic',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    totalLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d70018',
    },
    emptyView: {
        alignItems: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
    }
});
