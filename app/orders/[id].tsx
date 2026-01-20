import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from '../../services/productService';
import { LinearGradient } from 'expo-linear-gradient';

const TIMELINE_STEPS = [
    { key: 'placed', label: 'Đặt hàng', icon: 'cart-outline' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: 'checkmark-circle-outline' },
    { key: 'shipping', label: 'Đang giao', icon: 'bicycle-outline' },
    { key: 'delivered', label: 'Hoàn thành', icon: 'gift-outline' }
];

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const unsub = onSnapshot(doc(db, 'orders', id as string), (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    const handleCancelOrder = async () => {
        Alert.alert('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy đơn hàng này?', [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Hủy đơn',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await updateDoc(doc(db, 'orders', id as string), { status: 'cancelled' });
                        Alert.alert('Thành công', 'Đã hủy đơn hàng.');
                    } catch (e) {
                        Alert.alert('Lỗi', 'Không thể hủy đơn hàng.');
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <LiquidBackground style={styles.center}>
                <ActivityIndicator color="#d70018" size="large" />
            </LiquidBackground>
        );
    }

    if (!order) {
        return (
            <LiquidBackground style={styles.center}>
                <Text>Không tìm thấy đơn hàng</Text>
            </LiquidBackground>
        );
    }

    // Determine current step index for timeline
    let currentStepIndex = 0;
    if (order.status === 'shipping') currentStepIndex = 2;
    else if (order.status === 'delivered') currentStepIndex = 3;
    else if (order.status === 'cancelled') currentStepIndex = -1; // Special case
    else if (order.status !== 'pending') currentStepIndex = 1; // Assuming any other status besides pending implies confirmed at least

    // Refined logic: 'pending' = step 0 done.
    // If status is specific, we map it.
    // Let's force mapping:
    // status: pending -> index 0 (0 active, 1,2,3 inactive)
    // status: confirmed (if we had it, but we map pending->confirmed manually in admin usually) -> index 1
    // Admin uses: 'pending' (Chờ duyệt) -> 'shipping' (Đang giao) -> 'delivered' (Đã giao)
    // So 'pending' matches Step 0 (Placed). Admin verification moves it to... well, usually 'processing' or 'confirmed'. 
    // In our simplified admin, we might just jump to shipping. 
    // Let's assume:
    // pending -> step 0 active.
    // (if admin marks confirmed - we don't have that status in manage-orders yet, but let's assume existence) -> step 1 active.
    // shipping -> step 2 active.
    // delivered -> step 3 active.

    // Adjust index based on actual status values in DB
    if (order.status === 'pending') currentStepIndex = 0;
    else if (order.status === 'confirmed') currentStepIndex = 1; // Future proofing
    else if (order.status === 'shipping') currentStepIndex = 2;
    else if (order.status === 'delivered') currentStepIndex = 3;

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Status Card & Timeline */}
                    <GlassCard style={styles.statusCard} intensity={20}>
                        <View style={styles.statusHeader}>
                            <Text style={styles.statusLabel}>Trạng thái đơn hàng</Text>
                            <Text style={[styles.statusValue, {
                                color: order.status === 'cancelled' ? '#EF4444' : '#10B981'
                            }]}>
                                {order.status === 'pending' ? 'Chờ xác nhận' :
                                    order.status === 'shipping' ? 'Đang giao hàng' :
                                        order.status === 'delivered' ? 'Giao thành công' :
                                            order.status === 'cancelled' ? 'Đã hủy' : order.status}
                            </Text>
                        </View>

                        {order.status !== 'cancelled' ? (
                            <View style={styles.timeline}>
                                {TIMELINE_STEPS.map((step, index) => {
                                    const isActive = index <= currentStepIndex;
                                    const isLast = index === TIMELINE_STEPS.length - 1;
                                    return (
                                        <View key={step.key} style={styles.stepContainer}>
                                            <View style={[styles.stepCircle, isActive && styles.stepCircleActive]}>
                                                <Ionicons name={step.icon as any} size={16} color={isActive ? '#FFF' : 'rgba(255,255,255,0.3)'} />
                                            </View>
                                            {!isLast && (
                                                <View style={[styles.stepLine, index < currentStepIndex && styles.stepLineActive]} />
                                            )}
                                            <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]} numberOfLines={1}>{step.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.cancelledBox}>
                                <Ionicons name="close-circle" size={48} color="#EF4444" />
                                <Text style={styles.cancelledText}>Đơn hàng đã bị hủy</Text>
                            </View>
                        )}
                    </GlassCard>

                    {/* Address Section */}
                    <GlassCard style={styles.sectionCard} intensity={25}>
                        <View style={styles.row}>
                            <Ionicons name="location" size={20} color="#3B82F6" style={styles.icon} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                                <Text style={styles.infoText}>{order.userName}</Text>
                                <Text style={styles.infoText}>{order.userPhone}</Text>
                                <Text style={styles.infoText}>{order.address}</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Products Section */}
                    <GlassCard style={styles.sectionCard} intensity={25}>
                        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
                        <View style={styles.divider} />
                        {order.items.map((item: any, idx: number) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemVariant}>Số lượng: x{item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                            </View>
                        ))}
                    </GlassCard>

                    {/* Payment Section */}
                    <GlassCard style={styles.sectionCard} intensity={25}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Phương thức thanh toán</Text>
                            <Text style={styles.paymentValue}>{order.paymentMethod === 'vietqr' ? 'Chuyển khoản QR' : 'Thanh toán khi nhận hàng (COD)'}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Tổng tiền hàng</Text>
                            <Text style={styles.paymentValue}>{formatPrice(order.total)}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Phí vận chuyển</Text>
                            <Text style={styles.paymentValue}>0đ</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.paymentTotalRow}>
                            <Text style={styles.paymentTotalLabel}>Thành tiền</Text>
                            <Text style={styles.paymentTotalValue}>{formatPrice(order.total)}</Text>
                        </View>
                    </GlassCard>

                    {/* Actions */}
                    {order.status === 'pending' && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
                            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    content: { padding: 16, gap: 16 },
    statusCard: { padding: 20, borderRadius: 24 },
    statusHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statusLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    statusValue: { fontWeight: 'bold', fontSize: 16 },

    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 10,
        paddingHorizontal: 10
    },
    stepContainer: { alignItems: 'center', width: '25%', position: 'relative' },
    stepCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
        zIndex: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    stepCircleActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        shadowColor: '#10B981',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    stepLine: {
        position: 'absolute',
        top: 16,
        left: '50%',
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 1,
    },
    stepLineActive: { backgroundColor: '#10B981' },
    stepLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
    stepLabelActive: { color: '#FFF', fontWeight: 'bold' },

    cancelledBox: { alignItems: 'center', gap: 10, paddingVertical: 10 },
    cancelledText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },

    sectionCard: { padding: 20, borderRadius: 24 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    icon: { marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
    infoText: { color: 'rgba(255,255,255,0.8)', marginBottom: 4, lineHeight: 20 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },

    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    itemInfo: { flex: 1 },
    itemName: { color: '#FFF', fontWeight: '600', marginBottom: 4 },
    itemVariant: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    itemPrice: { color: '#FFF', fontWeight: 'bold' },

    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    paymentLabel: { color: 'rgba(255,255,255,0.6)' },
    paymentValue: { color: '#FFF', fontWeight: '600' },
    paymentTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    paymentTotalLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    paymentTotalValue: { color: '#d70018', fontWeight: '900', fontSize: 20 },

    cancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EF4444',
        marginBottom: 20
    },
    cancelButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
