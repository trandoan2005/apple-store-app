import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatPrice, productService } from '../../services/productService';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme } from '../../constants/ModernTheme';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      setIndexError(false);
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('index')) {
        setIndexError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  if (!user) {
    return (
      <LiquidBackground style={styles.center}>
        <GlassCard intensity={30} style={styles.loginCard}>
          <Ionicons name="person-circle-outline" size={80} color="rgba(255,255,255,0.2)" />
          <Text style={styles.loginTitle}>Chào mừng bạn quay lại</Text>
          <Text style={styles.loginSub}>Vui lòng đăng nhập để tiếp tục</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </GlassCard>
      </LiquidBackground>
    );
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header Profile */}
          <View style={styles.header}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{user.email?.[0].toUpperCase()}</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
              <View style={styles.memberBadge}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.badgeText}>S-MEMBER PLATINUM</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="pencil" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Premium Membership Card (Apple Card Style) */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <GlassCard style={styles.membershipCard} intensity={50}>
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardInfo}>
                <View>
                  <Text style={styles.cardBrand}>iCenter Card</Text>
                  <Text style={styles.cardHolder}>{user.email?.split('@')[0]}</Text>
                </View>
                <Ionicons name="card" size={32} color="rgba(255,255,255,0.8)" />
              </View>

              <View style={styles.cardBottom}>
                <View style={{ flex: 1 }}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressTitle}>Tiến trình lên hạng VIP</Text>
                    <Text style={styles.progressPercent}>75%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <LinearGradient
                      colors={['#E11D48', '#BE123C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ width: '75%', height: '100%', borderRadius: 4 }}
                    />
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin' as any)}>
              <GlassCard style={styles.actionCard} intensity={15}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#38BDF8" />
                </View>
                <Text style={styles.actionLabel}>Quản trị</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/change-password' as any)}>
              <GlassCard style={styles.actionCard} intensity={15}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                  <Ionicons name="lock-closed-outline" size={22} color="#A855F7" />
                </View>
                <Text style={styles.actionLabel}>Bảo mật</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <GlassCard style={styles.actionCard} intensity={15}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                  <Ionicons name="location-outline" size={22} color="#F97316" />
                </View>
                <Text style={styles.actionLabel}>Địa chỉ</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <GlassCard style={styles.actionCard} intensity={15}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="headset-outline" size={22} color="#10B981" />
                </View>
                <Text style={styles.actionLabel}>Hỗ trợ</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Order History */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={{ color: '#E11D48', fontWeight: 'bold' }}>See All</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color="#E11D48" style={{ marginTop: 20 }} />
            ) : indexError ? (
              <GlassCard style={styles.errorCard} intensity={30}>
                <Ionicons name="warning-outline" size={32} color="#E11D48" />
                <Text style={styles.errorText}>Tính năng xem lịch sử yêu cầu Index Firestore.</Text>
                <TouchableOpacity onPress={loadOrders} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </GlassCard>
            ) : orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
              </View>
            ) : (
              orders.slice(0, 3).map((order, idx) => (
                <Animated.View key={order.id} entering={FadeInRight.delay(idx * 100)}>
                  <TouchableOpacity onPress={() => router.push(`/orders/${order.id}`)} activeOpacity={0.9}>
                    <GlassCard style={styles.orderCard} intensity={15}>
                      <View style={styles.orderTop}>
                        <View>
                          <Text style={styles.orderId}>ORDER #{order.id.slice(0, 8).toUpperCase()}</Text>
                          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
                        </View>
                        <View style={[styles.statusBadge, {
                          backgroundColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                            order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          borderColor: order.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                            order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                        }]}>
                          <Text style={[styles.statusText, {
                            color: order.status === 'pending' ? '#F59E0B' :
                              order.status === 'cancelled' ? '#EF4444' : '#10B981'
                          }]}>
                            {order.status === 'pending' ? 'Đang xử lý' :
                              order.status === 'cancelled' ? 'Đã hủy' :
                                order.status === 'shipping' ? 'Đang giao' : 'Hoàn thành'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.orderDivider} />
                      <View style={styles.orderBottom}>
                        <Text style={styles.orderMethod}>{order.paymentMethod === 'vietqr' ? 'Thanh toán QR' : 'COD'}</Text>
                        <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginCard: { padding: 32, width: '100%', alignItems: 'center', borderRadius: 40 },
  loginTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 24, marginBottom: 8 },
  loginSub: { fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 32 },
  loginBtn: { backgroundColor: '#FFF', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20 },
  loginText: { color: '#000', fontWeight: '800', fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    marginBottom: 32,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 40,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  email: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 6, letterSpacing: -0.5 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  badgeText: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },

  membershipCard: {
    marginHorizontal: 24,
    height: 200,
    borderRadius: 32,
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrand: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2 },
  cardHolder: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 4, letterSpacing: -0.5 },
  cardBottom: { gap: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  progressPercent: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 24 },
  actionItem: { width: '50%', padding: 8 },
  actionCard: { padding: 20, alignItems: 'flex-start', borderRadius: 28, marginTop: 0 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },

  orderCard: { padding: 20, borderRadius: 28, marginBottom: 16, marginTop: 0 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  orderDate: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  orderDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMethod: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  orderTotal: { color: '#E11D48', fontWeight: '900', fontSize: 18 },

  logoutBtn: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 32,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  logoutText: { color: 'rgba(255,255,255,0.6)', fontWeight: '800', fontSize: 15 },

  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  errorCard: { padding: 24, borderRadius: 28, alignItems: 'center' },
  errorText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginVertical: 16, fontWeight: '600' },
  retryBtn: { backgroundColor: '#E11D48', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  retryText: { color: '#fff', fontWeight: '800' }
});
