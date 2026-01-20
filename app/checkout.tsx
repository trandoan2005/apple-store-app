import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// import { useStripe } from '@stripe/stripe-react-native'; // REMOVED FOR EXPO GO COMPATIBILITY
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../services/productService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';
import { ThemedText as Text } from '../components/ThemedText';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('123 Đường Nguyễn Văn Linh, Q.7, TP.HCM');
  const [phone, setPhone] = useState('0909000111');
  const [name, setName] = useState(user?.displayName || 'Nguyễn Văn A');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('cod');
  const [showQR, setShowQR] = useState(false);

  // const { initPaymentSheet, presentPaymentSheet } = useStripe(); // REMOVED

  const handleOrder = async () => {
    if (!user || !cart) return;

    if (!address || !phone || !name) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (paymentMethod === 'qr' && !showQR) {
      setShowQR(true);
      return;
    }

    setLoading(true);

    // SIMULATED PAYMENT FLOW FOR EXPO GO
    setTimeout(async () => {
      try {
        const orderData = {
          userId: user?.uid || 'guest',
          userName: name,
          userPhone: phone,
          items: cart.items,
          total: cart.total,
          address,
          status: paymentMethod === 'qr' ? 'paid' : 'pending',
          paymentMethod: paymentMethod === 'qr' ? 'vietqr' : 'cod',
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'orders'), orderData);
        await clearCart();

        setLoading(false);
        setShowQR(false);
        Alert.alert('Thành công!', 'Đơn hàng của bạn đã được ghi nhận.', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
      } catch (error: any) {
        console.error(error);
        setLoading(false);
        if (error.code === 'permission-denied') {
          Alert.alert('Lỗi Quyền Truy Cập', 'Không thể tạo đơn hàng. Vui lòng kiểm tra "Security Rules" của Firestore và cho phép ghi vào collection "orders".');
        } else {
          Alert.alert('Lỗi', 'Không thể lưu đơn hàng. Vui lòng thử lại.');
        }
      }
    }, 1500);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <LiquidBackground>
        <SafeAreaView style={styles.center}>
          <Text style={{ fontSize: 18, color: '#666' }}>Giỏ hàng trống</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#d70018', fontWeight: 'bold' }}>Quay lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LiquidBackground>
    )
  }

  const qrImageUrl = `https://img.vietqr.io/image/MB-0968602005-compact.png?amount=${cart.total}&addInfo=Thanh+toan+don+hang+${user?.uid?.slice(-5)}&accountName=iCenter+Store`;

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <GlassCard style={styles.iconButton} intensity={40}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </GlassCard>
          </TouchableOpacity>
          <Text style={styles.title}>Thanh toán</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.content}>
          <GlassCard style={styles.section} intensity={40}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <TextInput style={styles.input} placeholder="Họ tên" value={name} onChangeText={setName} placeholderTextColor="#ccc" />
            <TextInput style={styles.input} placeholder="Số điện thoại" value={phone} keyboardType="phone-pad" onChangeText={setPhone} placeholderTextColor="#ccc" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Địa chỉ" multiline value={address} onChangeText={setAddress} placeholderTextColor="#ccc" />
          </GlassCard>

          <GlassCard style={styles.section} intensity={40}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <TouchableOpacity
              style={[styles.methodItem, paymentMethod === 'cod' && styles.methodActive]}
              onPress={() => setPaymentMethod('cod')}
            >
              <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? '#FFF' : '#999'} />
              <Text style={[styles.methodText, paymentMethod === 'cod' && styles.methodTextActive]}>Thanh toán khi nhận hàng (COD)</Text>
              {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={24} color="#34C759" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodItem, paymentMethod === 'qr' && styles.methodActive]}
              onPress={() => setPaymentMethod('qr')}
            >
              <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'qr' ? '#FFF' : '#999'} />
              <Text style={[styles.methodText, paymentMethod === 'qr' && styles.methodTextActive]}>Chuyển khoản VietQR</Text>
              {paymentMethod === 'qr' && <Ionicons name="checkmark-circle" size={24} color="#34C759" />}
            </TouchableOpacity>
          </GlassCard>

          {paymentMethod === 'qr' && showQR && (
            <GlassCard style={styles.section} intensity={60}>
              <Text style={styles.sectionTitle}>Quét mã VietQR</Text>
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <img src={qrImageUrl} style={{ width: '100%', borderRadius: 12 }} alt="VietQR" />
                </View>
                <Text style={styles.qrHint}>Vui lòng quét mã trên bằng ứng dụng ngân hàng của bạn để thanh toán.</Text>
                <View style={styles.totalRowSmall}>
                  <Text style={styles.totalLabelSmall}>Số tiền: </Text>
                  <Text style={styles.totalValueSmall}>{formatPrice(cart.total)}</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <GlassCard style={styles.section} intensity={40}>
            <Text style={styles.sectionTitle}>Sản phẩm ({cart.itemCount})</Text>
            {cart.items.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.quantity}x {item.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.section} intensity={40}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(cart.total)}</Text>
            </View>
          </GlassCard>
        </ScrollView>

        <GlassCard style={styles.footer} intensity={80}>
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderText}>XÁC NHẬN ĐẶT HÀNG</Text>}
          </TouchableOpacity>
        </GlassCard>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  section: { padding: 20, borderRadius: 28, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#FFFFFF' },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF'
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12
  },
  methodActive: {
    backgroundColor: 'rgba(215, 0, 24, 0.15)',
    borderColor: '#d70018',
  },
  methodText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600'
  },
  methodTextActive: {
    color: '#FFF',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  qrWrapper: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
  },
  qrHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10
  },
  totalRowSmall: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  totalLabelSmall: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  totalValueSmall: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  itemName: { flex: 1, color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 },
  itemPrice: { fontWeight: '700', color: '#FFFFFF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  orderBtn: {
    backgroundColor: '#d70018',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 12px 24px rgba(215, 0, 24, 0.3)' },
      default: {
        shadowColor: '#d70018',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6
      }
    })
  },
  orderText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 }
});