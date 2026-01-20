import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';
import { productService } from '../../services/productService';
import { Alert, ActivityIndicator } from 'react-native';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ products: 0, orders: 0, members: 1200 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Real-time products count
        const qProducts = query(collection(db, 'products'));
        const unsubProducts = onSnapshot(qProducts, (snap) => {
            setStats(prev => ({ ...prev, products: snap.size }));
        });

        // Real-time orders count
        const qOrders = query(collection(db, 'orders'));
        const unsubOrders = onSnapshot(qOrders, (snap) => {
            setStats(prev => ({ ...prev, orders: snap.size }));
        });

        return () => {
            unsubProducts();
            unsubOrders();
        };
    }, []);

    const handleResetData = () => {
        Alert.alert(
            'Cảnh báo nguy hiểm',
            'Hành động này sẽ XÓA TẤT CẢ sản phẩm hiện tại và khởi tạo lại toàn bộ dữ liệu mẫu (bao gồm cả danh mục). Bạn có chắc chắn?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'XÓA & KHỞI TẠO LẠI',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await productService.resetAndSeedData();
                            Alert.alert('Thành công', 'Dữ liệu đã được khởi tạo lại khớp với hệ thống!');
                        } catch (e) {
                            Alert.alert('Lỗi', 'Không thể khởi tạo lại dữ liệu');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const menuItems = [
        {
            title: 'Quản lý Sản phẩm',
            icon: 'cube-outline',
            description: 'Thêm, sửa, xóa sản phẩm trong kho',
            onPress: () => router.push('/admin/manage-products'),
            color: '#d70018'
        },
        {
            title: 'Quản lý Danh mục',
            icon: 'grid-outline',
            description: 'Quản lý các danh mục sản phẩm',
            onPress: () => router.push('/admin/manage-categories'),
            color: '#F59E0B'
        },
        {
            title: 'Quản lý Đơn hàng',
            icon: 'receipt-outline',
            description: 'Theo dõi và cập nhật trạng thái đơn hàng',
            onPress: () => router.push('/admin/manage-orders'),
            color: '#3B82F6'
        },
        {
            title: 'Báo cáo Doanh thu',
            icon: 'bar-chart-outline',
            description: 'Xem thống kê bán hàng theo thời gian',
            onPress: () => { },
            color: '#10B981'
        },
        {
            title: 'Quản lý Khách hàng',
            icon: 'people-outline',
            description: 'Danh sách người dùng và Smember',
            onPress: () => { },
            color: '#8B5CF6'
        },
        {
            title: 'Khởi tạo lại Dữ liệu',
            icon: 'refresh-circle-outline',
            description: 'Xóa toàn bộ và nạp lại dữ liệu mẫu chuẩn',
            onPress: handleResetData,
            color: '#FF3B30'
        }
    ];

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} style={styles.backButton}>
                        <GlassCard style={styles.iconButton} intensity={30}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </GlassCard>
                    </TouchableOpacity>
                    <Text style={styles.title}>Quản trị hệ thống</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <GlassCard style={styles.statsOverview} intensity={40}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Sản phẩm</Text>
                                <Text style={styles.statValue}>{stats.products}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Đơn hàng</Text>
                                <Text style={styles.statValue}>{stats.orders}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Smember</Text>
                                <Text style={styles.statValue}>{stats.members > 1000 ? (stats.members / 1000).toFixed(1) + 'k' : stats.members}</Text>
                            </View>
                        </View>
                    </GlassCard>

                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity key={index} onPress={item.onPress} style={styles.menuWrapper} disabled={loading}>
                                <GlassCard style={styles.menuCard} intensity={25}>
                                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon as any} size={32} color={item.color} />
                                    </View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuDesc}>{item.description}</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#d70018" />
                            <Text style={styles.loadingText}>Đang làm mới dữ liệu...</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    backButton: {},
    scrollContent: { padding: 20 },
    statsOverview: {
        padding: 24,
        borderRadius: 32,
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        fontWeight: '600'
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF'
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    menuCard: {
        padding: 20,
        borderRadius: 28,
        alignItems: 'flex-start',
        height: 180,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    menuDesc: {
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 14,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
        zIndex: 100
    },
    loadingText: {
        color: '#FFF',
        marginTop: 16,
        fontWeight: 'bold'
    }
});
