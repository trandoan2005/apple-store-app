import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';
import { ThemedText as Text } from '../components/ThemedText';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Simulate "Notifications" by querying order status updates
        // In a real app, this would be a separate 'notifications' collection triggered by cloud functions.
        // For this demo/project, we'll list orders that have changed status recently.
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('status', 'in', ['shipping', 'delivered', 'cancelled', 'confirmed']), // Exclude 'pending' as it's just created
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => {
                const data = doc.data();
                let title = 'Cập nhật đơn hàng';
                let message = `Đơn hàng #${doc.id.slice(-6).toUpperCase()} của bạn đang được xử lý.`;
                let icon = 'cube-outline';
                let color = '#3B82F6';

                if (data.status === 'confirmed') {
                    title = 'Đơn hàng đã được xác nhận';
                    message = `Đơn hàng #${doc.id.slice(-6).toUpperCase()} đã được xác nhận và đang được chuẩn bị.`;
                    icon = 'checkmark-circle-outline';
                    color = '#8B5CF6';
                } else if (data.status === 'shipping') {
                    title = 'Đơn hàng đang giao';
                    message = `Đơn hàng #${doc.id.slice(-6).toUpperCase()} đang trên đường giao đến bạn.`;
                    icon = 'bicycle';
                    color = '#3B82F6';
                } else if (data.status === 'delivered') {
                    title = 'Giao hàng thành công';
                    message = `Đơn hàng #${doc.id.slice(-6).toUpperCase()} đã được giao thành công. Cảm ơn bạn đã mua sắm!`;
                    icon = 'checkmark-circle';
                    color = '#10B981';
                } else if (data.status === 'cancelled') {
                    title = 'Đơn hàng đã hủy';
                    message = `Đơn hàng #${doc.id.slice(-6).toUpperCase()} đã bị hủy.`;
                    icon = 'close-circle';
                    color = '#EF4444';
                }

                return {
                    id: doc.id,
                    type: 'order_update',
                    title,
                    message,
                    icon,
                    color,
                    createdAt: data.createdAt,
                    read: false // Simulation
                };
            });
            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông báo</Text>
                    <View style={{ width: 44 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#d70018" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => router.push(`/orders/${item.id}`)}>
                                <GlassCard style={styles.notifCard} intensity={25}>
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <View style={styles.notifContent}>
                                        <Text style={styles.notifTitle}>{item.title}</Text>
                                        <Text style={styles.notifMessage}>{item.message}</Text>
                                        <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                                    </View>
                                    {!item.read && <View style={styles.dot} />}
                                </GlassCard>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="notifications-off-outline" size={64} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    listContent: { padding: 16 },
    notifCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'flex-start'
    },
    iconBox: {
        width: 48, height: 48, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16
    },
    notifContent: { flex: 1 },
    notifTitle: {
        fontSize: 15, fontWeight: 'bold', color: '#FFF',
        marginBottom: 4
    },
    notifMessage: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 18
    },
    notifTime: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11
    },
    dot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#d70018',
        marginTop: 6
    },
    emptyContainer: { alignItems: 'center', marginTop: 100, gap: 10 },
    emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 }
});
