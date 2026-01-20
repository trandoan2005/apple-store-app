import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';
import { ThemedText as Text } from '../components/ThemedText';

export default function EditProfileScreen() {
  const params = useLocalSearchParams();

  const [name, setName] = useState(params.currentName as string || '');
  const [email, setEmail] = useState(params.currentEmail as string || '');
  const [phone, setPhone] = useState(params.currentPhone as string || '');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentData();
  }, []);

  const loadCurrentData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('userName');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPhone = await AsyncStorage.getItem('userPhone');

      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      // Lưu thông tin vào AsyncStorage
      await AsyncStorage.setItem('userName', name.trim());
      await AsyncStorage.setItem('userEmail', email.trim());
      await AsyncStorage.setItem('userPhone', phone.trim());

      Alert.alert(
        'Thành công',
        'Thông tin đã được cập nhật',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <GlassCard style={styles.formCard} intensity={30}>
              <View style={styles.avatarOverview}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase() || 'U'}</Text>
                  <View style={styles.editBadge}>
                    <Ionicons name="camera" size={12} color="#000" />
                  </View>
                </View>
                <Text style={styles.avatarSub}>ID APPLE: {email}</Text>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'name' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Apple User"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!loading}
                  />
                  <Ionicons name="person" size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>EMAIL LIÊN HỆ</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@apple.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!loading}
                  />
                  <Ionicons name="mail" size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'phone' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="0987xxx"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!loading}
                  />
                  <Ionicons name="call" size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.disabledBtn]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>LƯU THÔNG TIN</Text>}
              </TouchableOpacity>
            </GlassCard>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ các thay đổi</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  saveHeaderBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 24, borderRadius: 40, marginTop: 0 },
  avatarOverview: { alignItems: 'center', marginBottom: 40 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  avatarInitial: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333'
  },
  avatarSub: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },

  inputGroup: { marginBottom: 24 },
  inputGroupFocused: {},
  inputLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: 1.5, marginLeft: 4 },
  innerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  input: { flex: 1, height: 54, fontSize: 16, color: '#FFF', fontWeight: '600' },

  saveBtn: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  cancelBtn: { marginTop: 32, alignItems: 'center' },
  cancelBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '700' },
  disabledBtn: { opacity: 0.5 },
});