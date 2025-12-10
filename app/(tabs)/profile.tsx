import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  Pressable, 
  StyleSheet, 
  Alert,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Default user data
        setUser({
          name: 'Nguyễn Văn A',
          email: 'user@example.com',
          phone: '0987654321',
          address: 'Hà Nội, Việt Nam',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      title: 'Đơn hàng của tôi',
      icon: 'bag-outline',
      color: '#007AFF',
      onPress: () => Alert.alert('Đơn hàng', 'Danh sách đơn hàng')
    },
    {
      id: '2',
      title: 'Địa chỉ giao hàng',
      icon: 'location-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Địa chỉ', 'Quản lý địa chỉ giao hàng')
    },
    {
      id: '3',
      title: 'Phương thức thanh toán',
      icon: 'card-outline',
      color: '#32D74B',
      onPress: () => Alert.alert('Thanh toán', 'Quản lý phương thức thanh toán')
    },
    {
      id: '4',
      title: 'Yêu thích',
      icon: 'heart-outline',
      color: '#FF2D55',
      onPress: () => Alert.alert('Yêu thích', 'Sản phẩm yêu thích')
    },
    {
      id: '5',
      title: 'Cài đặt thông báo',
      icon: 'notifications-outline',
      color: '#5856D6',
      onPress: () => Alert.alert('Thông báo', 'Cài đặt thông báo')
    },
    {
      id: '6',
      title: 'Trung tâm trợ giúp',
      icon: 'help-circle-outline',
      color: '#5AC8FA',
      onPress: () => Alert.alert('Trợ giúp', 'Trung tâm trợ giúp')
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        </Pressable>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: user?.avatar }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
        </View>
        <Pressable 
          style={styles.editButton}
          onPress={() => Alert.alert('Chỉnh sửa', 'Chỉnh sửa thông tin cá nhân')}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Yêu thích</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
        {menuItems.map((item) => (
          <Pressable 
            key={item.id} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </Pressable>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={22} color="#5856D6" />
            <Text style={styles.settingText}>Chế độ tối</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#5856D6' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={22} color="#FF9500" />
            <Text style={styles.settingText}>Thông báo</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#FF9500' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Phiên bản 1.0.0</Text>
        <Text style={styles.appCopyright}>© 2024 Apple Store. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  logoutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e5e5e7',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
  },
});