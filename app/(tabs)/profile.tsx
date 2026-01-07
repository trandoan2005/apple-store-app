// app/(tabs)/profile.tsx - SIMPLIFIED VERSION
import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  Pressable, 
  StyleSheet, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, userProfile, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Hàm logout đơn giản
  const handleLogout = async () => {
    console.log('🚀 [Profile] Starting logout...');
    setIsLoggingOut(true);
    setShowConfirm(false);
    
    try {
      // 1. Gọi logout từ context
      await logout();
      console.log('✅ [Profile] Logout successful');
      
      // 2. Chuyển thẳng về login screen
      router.replace('/(auth)/login');
      
    } catch (error) {
      console.error('❌ [Profile] Logout error:', error);
      // Vẫn chuyển về login dù có lỗi
      router.replace('/(auth)/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tài khoản</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image 
          source={{ 
            uri: user 
              ? `https://ui-avatars.com/api/?name=${user.email}&background=007AFF&color=fff&size=150`
              : 'https://ui-avatars.com/api/?name=Guest&background=8E8E93&color=fff&size=150'
          }} 
          style={styles.avatar} 
        />
        
        <Text style={styles.name}>
          {user ? (userProfile?.displayName || user.email?.split('@')[0] || 'Người dùng') : 'Khách'}
        </Text>
        
        <Text style={styles.email}>
          {user ? user.email : 'Chưa đăng nhập'}
        </Text>
        
        <View style={styles.status}>
          <Ionicons 
            name={user ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={user ? "#34C759" : "#FF3B30"} 
          />
          <Text style={[styles.statusText, { color: user ? "#34C759" : "#FF3B30" }]}>
            {user ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!user ? (
          <Pressable 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
          </Pressable>
        ) : (
          <>
            <Pressable 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
            </Pressable>
            
            <Pressable 
              style={styles.logoutButton}
              onPress={() => setShowConfirm(true)}
              disabled={isLoggingOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Simple Menu */}
      <View style={styles.menu}>
        <Pressable style={styles.menuItem}>
          <Ionicons name="bag-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Đơn hàng của tôi</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </Pressable>
        
        <Pressable style={styles.menuItem}>
          <Ionicons name="heart-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </Pressable>
        
        <Pressable style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Trung tâm trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </Pressable>
      </View>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đăng xuất</Text>
            <Text style={styles.modalMessage}>Bạn có chắc muốn đăng xuất?</Text>
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Debug Button (tạm thời) */}
      {user && (
        <Pressable 
          style={styles.debugButton}
          onPress={() => {
            console.log('🔧 DEBUG: Current user:', user.email);
            // Force logout
            router.replace('/(auth)/login');
          }}
        >
          <Text style={styles.debugText}>DEBUG: Force to Login</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 12,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f0f8ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f7',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Debug
  debugButton: {
    margin: 20,
    padding: 12,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});