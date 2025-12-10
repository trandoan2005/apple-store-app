// app/(auth)/forgot-password.tsx - PHIÊN BẢN ĐƠN GIẢN
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email của bạn');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    // Validate password
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    
    // Giả lập đổi mật khẩu (có thể thay bằng API thật)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đổi thành công!',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
    }, 1500);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable 
              onPress={handleBackToLogin} 
              style={styles.backButton}
              accessibilityLabel="Quay lại đăng nhập"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email và mật khẩu mới cho tài khoản của bạn
            </Text>
          </View>

          {/* Form */}
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
                  accessibilityLabel="Email"
                  accessibilityHint="Nhập email của bạn"
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordInputRef.current?.focus()}
                />
                {email.length > 0 && (
                  <Pressable 
                    onPress={() => setEmail('')} 
                    style={styles.clearButton}
                    accessibilityLabel="Xóa email"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close-circle" size={20} color="#8E8E93" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'newPassword' && styles.inputFocused
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  ref={newPasswordInputRef}
                  style={styles.input}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  placeholderTextColor="#8E8E93"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  onFocus={() => setFocusedInput('newPassword')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!loading}
                  accessibilityLabel="Mật khẩu mới"
                  accessibilityHint="Nhập mật khẩu mới, ít nhất 6 ký tự"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                />
                <Pressable 
                  onPress={() => setShowNewPassword(!showNewPassword)} 
                  style={styles.eyeButton}
                  accessibilityLabel={showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
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
                  ref={confirmPasswordInputRef}
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#8E8E93"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!loading}
                  accessibilityLabel="Xác nhận mật khẩu"
                  accessibilityHint="Nhập lại mật khẩu mới để xác nhận"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <Pressable 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeButton}
                  accessibilityLabel={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </Pressable>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword.length >= 6 ? "#34C759" : "#8E8E93"} 
                />
                <Text 
                  style={[
                    styles.requirementText,
                    newPassword.length >= 6 && styles.requirementMet
                  ]}
                  accessibilityLabel={`Độ dài mật khẩu: ${newPassword.length >= 6 ? 'Đạt (6+ ký tự)' : 'Chưa đạt (cần 6+ ký tự)'}`}
                >
                  Ít nhất 6 ký tự
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? "#34C759" : "#8E8E93"} 
                />
                <Text 
                  style={[
                    styles.requirementText,
                    newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet
                  ]}
                  accessibilityLabel={`Mật khẩu khớp: ${newPassword === confirmPassword && newPassword.length > 0 ? 'Có' : 'Không'}`}
                >
                  Mật khẩu khớp nhau
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <Pressable 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleResetPassword}
              disabled={loading}
              accessibilityLabel="Đặt lại mật khẩu"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <Text style={styles.submitButtonText}>ĐANG XỬ LÝ...</Text>
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.submitButtonText}>ĐẶT LẠI MẬT KHẨU</Text>
                </>
              )}
            </Pressable>

            {/* Thông tin hướng dẫn */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Sau khi đặt lại mật khẩu, bạn có thể đăng nhập bằng email và mật khẩu mới.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Quay lại {' '}
              <Text 
                style={styles.footerLink}
                onPress={handleBackToLogin}
                accessibilityLabel="Đăng nhập"
                accessibilityRole="link"
              >
                đăng nhập
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  },
  header: {
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: -8,
    top: -10,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
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
  passwordRequirements: {
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#34C759',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 14,
    marginTop: 24,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#cccccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F2F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  footerLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});