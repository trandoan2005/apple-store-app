// app/(auth)/register.tsx - SỬA LẠI
import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      try {
        // CHỈ lưu thông tin đăng ký, KHÔNG lưu token
        // Trong thực tế, bạn sẽ gửi API đăng ký đến server
        // Ở đây chỉ fake đăng ký thành công
        
        Alert.alert(
          'Đăng ký thành công!',
          'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => {
                // XÓA form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                // QUAY VỀ trang đăng nhập
                router.replace('/(auth)/login');
              }
            }
          ]
        );
        
      } catch (error) {
        Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm</Text>
        </View>

        <View style={styles.formContainer}>
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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'password' && styles.inputFocused
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8E8E93" 
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'confirmPassword' && styles.inputFocused
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#8E8E93"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
                returnKeyType="done"
              />
              <Pressable 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8E8E93" 
                />
              </Pressable>
            </View>
          </View>

          {/* Register Button */}
          <Pressable 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <View style={styles.gradientButton}>
              {loading ? (
                <>
                  <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                  <Text style={styles.registerButtonText}>ĐANG XỬ LÝ...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.registerButtonText}>TẠO TÀI KHOẢN</Text>
                </>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} disabled={loading}>
            <Text style={styles.loginLink}>Đăng nhập ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  formContainer: {
    marginBottom: 30,
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
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  registerButton: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
    backgroundColor: '#34C759',
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
  },
});