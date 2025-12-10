// app/(tabs)/edit-profile.tsx
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'name' && styles.inputFocused
            ]}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'email' && styles.inputFocused
            ]}>
              <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@apple.com"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'phone' && styles.inputFocused
            ]}>
              <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0987654321"
                placeholderTextColor="#8E8E93"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.noteText}>
              Thông tin này sẽ được hiển thị trong hồ sơ của bạn
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.saveButtonText}>ĐANG LƯU...</Text>
            ) : (
              <Text style={styles.saveButtonText}>LƯU THAY ĐỔI</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerPlaceholder: {
    width: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    paddingHorizontal: 16,
    height: 56,
  },
  inputFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f7',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});