// app/(auth)/login.tsx - ĐÃ CẬP NHẬT CHỨC NĂNG QUÊN MẬT KHẨU
import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    
    // Hiệu ứng loading
    setTimeout(async () => {
      try {
        // Fake login - cho phép đăng nhập với bất kỳ tài khoản nào
        const fakeToken = 'fake-token-' + Date.now();
        await AsyncStorage.setItem('userToken', fakeToken);
        
        // Thêm thông tin user
        await AsyncStorage.setItem('userEmail', email);
        
        // Chuyển đến trang chính
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  // CẬP NHẬT: Chuyển đến màn hình quên mật khẩu
  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo và Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="logo-apple" size={80} color="#000" />
              <Text style={styles.logoText}>Store</Text>
            </View>
            <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>
          </View>

          {/* Form đăng nhập */}
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
                />
                {email.length > 0 && (
                  <Pressable onPress={() => setEmail('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color="#8E8E93" />
                  </Pressable>
                )}
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
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#8E8E93"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!loading}
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
              {/* Nút Quên mật khẩu - ĐÃ CẬP NHẬT */}
              <Pressable onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Pressable 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <View style={styles.gradientButton}>
                {loading ? (
                  <>
                    <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                    <Text style={styles.loginButtonText}>ĐANG XỬ LÝ...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
                  </>
                )}
              </View>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtonsContainer}>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000" />
                <Text style={styles.socialButtonText}>Apple ID</Text>
              </Pressable>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <Pressable onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerLink}>Tạo tài khoản mới</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc tiếp tục, bạn đồng ý với{' '}
              <Text style={styles.footerLink}>Điều khoản dịch vụ</Text>
              {' '}và{' '}
              <Text style={styles.footerLink}>Chính sách bảo mật</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    marginLeft: 8,
    color: '#000',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
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
  clearButton: {
    padding: 4,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#007AFF',
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E7',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E93',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  registerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  registerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
});