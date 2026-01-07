// app/(tabs)/cart.tsx - CART PAGE (FIXED)
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { cartService, CartItem, formatPrice } from '../../services/cartService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const { user, cart, cartCount, setCart, updateCartCount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      if (user) {
        const result = await cartService.getCart(user.uid);
        if (result.success && result.data) {
          setCart(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user) return;
    
    try {
      setUpdating(itemId);
      const result = await cartService.updateCartItem(user.uid, itemId, newQuantity);
      
      if (result.success && result.cart) {
        setCart(result.cart);
        await updateCartCount();
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;
    
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cartService.removeFromCart(user.uid, itemId);
              
              if (result.success && result.cart) {
                setCart(result.cart);
                await updateCartCount();
                Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
              } else {
                Alert.alert('Lỗi', result.message);
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    if (!user) return;
    
    if (!cart || cart.items.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống');
      return;
    }
    
    Alert.alert(
      'Xóa giỏ hàng',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cartService.clearCart(user.uid);
              
              if (result.success) {
                setCart({
                  userId: user.uid,
                  items: [],
                  totalItems: 0,
                  totalPrice: 0,
                  updatedAt: new Date()
                });
                await updateCartCount();
                Alert.alert('Thành công', 'Đã xóa tất cả sản phẩm');
              } else {
                Alert.alert('Lỗi', result.message);
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          }
        }
      ]
    );
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã giảm giá');
      return;
    }
    
    // Simple promo code validation
    const validPromoCodes = ['APPLE10', 'WELCOME20', 'SAVE15'];
    
    if (validPromoCodes.includes(promoCode.toUpperCase())) {
      setAppliedPromo(true);
      Alert.alert('Thành công', 'Áp dụng mã giảm giá thành công!');
    } else {
      Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Đăng nhập',
        'Bạn cần đăng nhập để thanh toán',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    if (!cart || cart.items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán');
      return;
    }
    
    router.push({
      pathname: '/checkout',
      params: { cart: JSON.stringify(cart) }
    });
  };

  // Calculate cart summary
  const cartSummary = cart ? cartService.calculateCartSummary(cart) : {
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
    formattedSubtotal: '0đ',
    formattedShippingFee: '0đ',
    formattedTax: '0đ',
    formattedTotal: '0đ'
  };

  // Apply promo discount (10% off)
  const discount = appliedPromo ? cartSummary.total * 0.1 : 0;
  const finalTotal = cartSummary.total - discount;

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>Đăng nhập để xem giỏ hàng</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để xem sản phẩm trong giỏ hàng của bạn
        </Text>
        <Pressable 
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </Pressable>
      </View>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptyText}>
          Hãy thêm sản phẩm Apple yêu thích của bạn vào giỏ hàng
        </Text>
        <Pressable 
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <Text style={styles.itemCount}>{cartCount} sản phẩm</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              {/* Product Image */}
              <Image 
                source={{ uri: item.product.imageUrl }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              
              {/* Product Info */}
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Pressable 
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </Pressable>
                </View>
                
                {/* Color/Storage Selection */}
                {(item.selectedColor || item.selectedStorage) && (
                  <View style={styles.itemOptions}>
                    {item.selectedColor && (
                      <View style={styles.optionTag}>
                        <View 
                          style={[styles.colorDot, { backgroundColor: item.selectedColor }]} 
                        />
                        <Text style={styles.optionText}>{item.selectedColor}</Text>
                      </View>
                    )}
                    {item.selectedStorage && (
                      <View style={styles.optionTag}>
                        <Text style={styles.optionText}>{item.selectedStorage}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Price and Quantity */}
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price)}
                  </Text>
                  
                  <View style={styles.quantityContainer}>
                    <Pressable 
                      style={[
                        styles.quantityButton,
                        item.quantity <= 1 && styles.quantityButtonDisabled
                      ]}
                      onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                    >
                      <Ionicons 
                        name="remove" 
                        size={18} 
                        color={item.quantity <= 1 ? '#C7C7CC' : '#007AFF'} 
                      />
                    </Pressable>
                    
                    <View style={styles.quantityDisplay}>
                      {updating === item.id ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                      )}
                    </View>
                    
                    <Pressable 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                    >
                      <Ionicons name="add" size={18} color="#007AFF" />
                    </Pressable>
                  </View>
                </View>
                
                {/* Item Total */}
                <View style={styles.itemTotal}>
                  <Text style={styles.totalLabel}>Thành tiền:</Text>
                  <Text style={styles.itemTotalPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Nhập mã giảm giá"
              placeholderTextColor="#8E8E93"
              value={promoCode}
              onChangeText={setPromoCode}
              editable={!appliedPromo}
            />
            <Pressable 
              style={[
                styles.applyButton,
                appliedPromo && styles.appliedButton
              ]}
              onPress={appliedPromo ? () => setAppliedPromo(false) : handleApplyPromo}
              disabled={!promoCode.trim()}
            >
              <Text style={styles.applyButtonText}>
                {appliedPromo ? 'Đã áp dụng' : 'Áp dụng'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{cartSummary.formattedSubtotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{cartSummary.formattedShippingFee}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thuế VAT (10%)</Text>
            <Text style={styles.summaryValue}>{cartSummary.formattedTax}</Text>
          </View>
          
          {appliedPromo && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>
                Giảm giá (10%)
              </Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 1)']}
        style={styles.bottomBar}
      >
        <View style={styles.bottomBarContent}>
          <Pressable 
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.clearButtonText}>Xóa tất cả</Text>
          </Pressable>
          
          <View style={styles.checkoutInfo}>
            <Text style={styles.checkoutTotal}>{formatPrice(finalTotal)}</Text>
            <Text style={styles.checkoutLabel}>Tổng thanh toán</Text>
          </View>
          
          <Pressable 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  itemsSection: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  itemOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  promoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  appliedButton: {
    backgroundColor: '#32D74B',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#32D74B',
    fontWeight: '600',
  },
  discountValue: {
    color: '#32D74B',
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  bottomSpace: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF3B3010',
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  checkoutInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
  },
  checkoutLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});