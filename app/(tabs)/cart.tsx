import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { CartItem } from '../../services/cartService';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

export default function CartScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, loading, updateQuantity, removeFromCart } = useCart();

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity === 0) {
            Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?', [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => removeFromCart(itemId)
                }
            ]);
            return;
        }
        await updateQuantity(itemId, newQuantity);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <GlassCard style={styles.cartItem} intensity={40}>
            <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemVariant}>Màu: {item.selectedColor || 'Mặc định'}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    <View style={styles.qtyControl}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                            <Ionicons name="remove" size={16} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                            <Ionicons name="add" size={16} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </GlassCard>
    );

    if (!user) {
        return (
            <View style={styles.center}>
                <Text>Vui lòng đăng nhập để xem giỏ hàng</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
                    <Text style={styles.loginText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Giỏ hàng</Text>
                    {cart && cart.itemCount > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{cart.itemCount}</Text>
                        </View>
                    )}
                </View>

                {!user ? (
                    <View style={styles.center}>
                        <Ionicons name="lock-closed-outline" size={64} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.loginHint}>Vui lòng đăng nhập để xem giỏ hàng</Text>
                        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
                            <Text style={styles.loginText}>ĐĂNG NHẬP NGAY</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cart?.items || []}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listConfig}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={cart?.items.length ? <Text style={styles.sectionTitle}>DANH SÁCH SẢN PHẨM</Text> : null}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="cart-outline" size={60} color="rgba(255,255,255,0.2)" />
                                    </View>
                                    <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
                                    <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)/store')}>
                                        <Text style={styles.shopNowText}>TIẾP TỤC MUA SẮM</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />

                        {cart && cart.items.length > 0 && (
                            <GlassCard style={styles.footer} intensity={80}>
                                <View style={styles.priceContainer}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Tạm tính (chưa phí ship)</Text>
                                        <Text style={styles.totalPrice}>{formatPrice(cart.total)}</Text>
                                    </View>
                                    <View style={styles.shippingRow}>
                                        <Text style={styles.shippingLabel}>Giao hàng miễn phí</Text>
                                        <Text style={styles.shippingValue}>0đ</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
                                    <Text style={styles.checkoutText}>TIẾN HÀNH THANH TOÁN</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#000" style={styles.arrowIcon} />
                                </TouchableOpacity>
                            </GlassCard>
                        )}
                    </>
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
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    countText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

    listConfig: { padding: 20, paddingBottom: 200 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 20, marginLeft: 4 },

    cartItem: {
        flexDirection: 'row',
        borderRadius: 32,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        marginRight: 16,
        backgroundColor: '#FFF',
    },
    itemInfo: { flex: 1, justifyContent: 'space-between', height: 100 },
    itemTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    itemVariant: { fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', fontWeight: '700', marginTop: 2 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
    itemPrice: { fontSize: 16, fontWeight: '900', color: '#FFF' },

    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 4,
    },
    qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    qtyText: { paddingHorizontal: 12, fontWeight: '800', color: '#FFF', fontSize: 14 },

    footer: {
        position: 'absolute',
        bottom: 0,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 24,
        borderTopLeftRadius: 44,
        borderTopRightRadius: 44,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    priceContainer: { marginBottom: 20 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    totalLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', fontWeight: '700' },
    totalPrice: { fontSize: 22, fontWeight: '900', color: '#FFF' },
    shippingRow: { flexDirection: 'row', justifyContent: 'space-between' },
    shippingLabel: { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
    shippingValue: { fontSize: 13, color: '#10B981', fontWeight: '800' },

    checkoutBtn: {
        backgroundColor: '#FFF',
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    checkoutText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    arrowIcon: { marginLeft: 4 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loginHint: { fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32, fontWeight: '600' },
    loginBtn: { backgroundColor: '#FFF', paddingHorizontal: 32, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    loginText: { color: '#000', fontWeight: '900', fontSize: 14 },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 40, fontWeight: '700' },
    shopNowBtn: { paddingHorizontal: 32, height: 54, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    shopNowText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
});
