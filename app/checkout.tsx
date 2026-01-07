// app/checkout.tsx - CHECKOUT PAGE
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { cartService, Cart, formatPrice } from '../services/cartService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CheckoutScreen() {
  const { user, userProfile, cart, updateCartCount, refreshCart } = useAuth();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking' | 'card'>('cod');
  const [notes, setNotes] = useState('');
  
  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setPhoneNumber(userProfile.phoneNumber || '');
      setShippingAddress(userProfile.address || '');
    }
  }, [userProfile]);

  // Validate form
  const validateForm = () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
      return false;
    }
    
    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    
    const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return false;
    }
    
    return true;
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!user || !cart || cart.items.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    if (paymentMethod === 'cod') {
      // COD - Direct order placement
      placeOrder();
    } else {
      // Show payment modal for online payment
      setShowPaymentModal(true);
    }
  };

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      
      // TODO: Implement actual order creation with Firestore
      // For now, just simulate order placement
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart after successful order
      if (user) {
        await cartService.clearCart(user.uid);
        await refreshCart();
        await updateCartCount();
      }
      
      setShowPaymentModal(false);
      
      Alert.alert(
        'Đặt hàng thành công',
        'Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Calculate order summary
  const orderSummary = cart ? cartService.calculateCartSummary(cart) : {
    subtotal: 0,
    shippingFee: 30000,
    tax: 0,
    total: 0,
    formattedSubtotal: '0đ',
    formattedShippingFee: '30.000đ',
    formattedTax: '0đ',
    formattedTotal: '30.000đ'
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={80} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>Đăng nhập để thanh toán</Text>
        <Text style={styles.emptyText}>
          Bạn cần đăng nhập để tiến hành thanh toán
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
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
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
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Shipping Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên"
              placeholderTextColor="#8E8E93"
              value={userProfile?.displayName || user.displayName || ''}
              editable={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor="#8E8E93"
              value={user.email || ''}
              editable={false}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#8E8E93"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập địa chỉ giao hàng chi tiết"
              placeholderTextColor="#8E8E93"
              value={shippingAddress}
              onChangeText={setShippingAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#FF9500" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          
          <Pressable 
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="cash-outline" size={24} color="#32D74B" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDescription}>
                Thanh toán bằng tiền mặt khi nhận hàng
              </Text>
            </View>
            {paymentMethod === 'cod' && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </Pressable>
          
          <Pressable 
            style={[
              styles.paymentOption,
              paymentMethod === 'banking' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('banking')}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="business-outline" size={24} color="#5856D6" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
              <Text style={styles.paymentDescription}>
                Thanh toán qua Internet Banking
              </Text>
            </View>
            {paymentMethod === 'banking' && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </Pressable>
          
          <Pressable 
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="card" size={24} color="#FF2D55" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Thẻ tín dụng/Ghi nợ</Text>
              <Text style={styles.paymentDescription}>
                Thanh toán qua thẻ Visa/Mastercard
              </Text>
            </View>
            {paymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </Pressable>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={24} color="#FF2D55" />
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính ({cart.totalItems} sản phẩm)</Text>
            <Text style={styles.summaryValue}>{orderSummary.formattedSubtotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{orderSummary.formattedShippingFee}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Thuế VAT (10%)</Text>
            <Text style={styles.summaryValue}>{orderSummary.formattedTax}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{orderSummary.formattedTotal}</Text>
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#5856D6" />
            <Text style={styles.sectionTitle}>Ghi chú đơn hàng (tùy chọn)</Text>
          </View>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ví dụ: Giao hàng giờ hành chính, để hàng ở cổng, ..."
            placeholderTextColor="#8E8E93"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Bằng cách đặt hàng, bạn đồng ý với{' '}
            <Text style={styles.linkText}>Điều khoản dịch vụ</Text>{' '}
            và <Text style={styles.linkText}>Chính sách bảo mật</Text> của Apple Store.
          </Text>
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
          <View style={styles.totalContainer}>
            <Text style={styles.bottomTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.bottomTotalValue}>{orderSummary.formattedTotal}</Text>
          </View>
          
          <Pressable 
            style={[
              styles.placeOrderButton,
              placingOrder && styles.placeOrderButtonDisabled
            ]}
            onPress={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thanh toán trực tuyến</Text>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </Pressable>
            </View>
            
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmountLabel}>Số tiền thanh toán</Text>
              <Text style={styles.paymentAmount}>{orderSummary.formattedTotal}</Text>
              
              <Text style={styles.paymentInfo}>
                {paymentMethod === 'banking' 
                  ? 'Vui lòng chuyển khoản đến:\nNgân hàng: Techcombank\nSố tài khoản: 1903 6819 6868\nChủ tài khoản: APPLE STORE VIETNAM'
                  : 'Vui lòng nhập thông tin thẻ của bạn'}
              </Text>
            </View>
            
            {paymentMethod === 'card' && (
              <View style={styles.cardInputs}>
                <TextInput
                  style={styles.cardInput}
                  placeholder="Số thẻ"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
                <View style={styles.cardRow}>
                  <TextInput
                    style={[styles.cardInput, styles.cardInputHalf]}
                    placeholder="MM/YY"
                    placeholderTextColor="#8E8E93"
                  />
                  <TextInput
                    style={[styles.cardInput, styles.cardInputHalf]}
                    placeholder="CVV"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.confirmButton,
                  placingOrder && styles.confirmButtonDisabled
                ]}
                onPress={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  textArea: {
    minHeight: 100,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPayment: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
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
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
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
  termsSection: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
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
  totalContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  bottomTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 8,
  },
  paymentDetails: {
    padding: 20,
    alignItems: 'center',
  },
  paymentAmountLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 20,
  },
  paymentInfo: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardInputs: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cardInput: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardInputHalf: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});