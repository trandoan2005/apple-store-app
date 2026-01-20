import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const emailInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Start animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();

    // Glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert('💖 Thiếu thông tin', 'Vui lòng nhập email của bạn');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('📧 Email không hợp lệ', 'Vui lòng nhập đúng định dạng email');
      return;
    }

    setLoading(true);
    console.log('📧 [ForgotPassword] Attempting to send reset email to:', email);

    try {
      // Gửi email reset password với Firebase
      await sendPasswordResetEmail(auth, email);
      console.log('✅ [ForgotPassword] Reset email sent successfully!');

      setIsEmailSent(true);

      // Success animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          })
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          })
        ])
      ]).start();

    } catch (error: any) {
      console.error('❌ [ForgotPassword] Error sending reset email:', error.code, error.message);

      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      let errorTitle = '⚠️ Lỗi';

      // Xử lý các lỗi Firebase cụ thể
      switch (error.code) {
        case 'auth/user-not-found':
          errorTitle = '👤 Không tìm thấy';
          errorMessage = 'Không tìm thấy tài khoản với email này.';
          break;
        case 'auth/invalid-email':
          errorTitle = '📧 Email không hợp lệ';
          errorMessage = 'Email không đúng định dạng.';
          break;
        case 'auth/too-many-requests':
          errorTitle = '⏳ Quá nhiều yêu cầu';
          errorMessage = 'Vui lòng thử lại sau ít phút.';
          break;
        case 'auth/network-request-failed':
          errorTitle = '📡 Lỗi kết nối';
          errorMessage = 'Vui lòng kiểm tra kết nối internet.';
          break;
        case 'auth/missing-continue-uri':
          errorTitle = '🔗 Thiếu URL';
          errorMessage = 'Cấu hình Firebase chưa đúng.';
          break;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  // Glow interpolation
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.3, 0.7, 1],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });


  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerBrand}>iCenter</Text>
                <View style={{ width: 44 }} />
              </View>

              {!isEmailSent ? (
                <>
                  <Text style={styles.title}>Quên mật khẩu</Text>
                  <Text style={styles.subtitle}>Chúng tôi sẽ giúp bạn lấy lại quyền truy cập</Text>

                  <GlassCard style={styles.formCard} intensity={30}>
                    <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputGroupFocused]}>
                      <Text style={styles.inputLabel}>ID APPLE (EMAIL)</Text>
                      <View style={styles.innerInput}>
                        <TextInput
                          style={styles.input}
                          placeholder="name@example.com"
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

                    <TouchableOpacity
                      style={[styles.submitButton, loading && styles.disabledBtn]}
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitButtonText}>Tiếp tục</Text>}
                    </TouchableOpacity>
                  </GlassCard>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Bạn đã nhớ mật khẩu? </Text>
                    <TouchableOpacity onPress={handleBackToLogin}>
                      <Text style={styles.linkText}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <GlassCard style={styles.successCard} intensity={40}>
                  <Animated.View style={[styles.successIconContainer, { transform: [{ scale: glowScale }] }]}>
                    <View style={styles.successIconBlur} />
                    <Ionicons name="mail-open" size={80} color="#FFF" />
                  </Animated.View>

                  <Text style={styles.successTitle}>Kiểm tra Email</Text>
                  <Text style={styles.successMessage}>
                    Chúng tôi đã gửi hướng dẫn lấy lại mật khẩu đến:
                  </Text>
                  <View style={styles.emailBadge}>
                    <Text style={styles.emailText}>{email}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.successButton}
                    onPress={() => router.replace('/(auth)/login')}
                  >
                    <Text style={styles.successButtonText}>Về trang đăng nhập</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsEmailSent(false)}>
                    <Text style={styles.resendText}>Gửi lại email</Text>
                  </TouchableOpacity>
                </GlassCard>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
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
  headerBrand: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  title: { fontSize: 36, fontWeight: '900', textAlign: 'center', color: '#FFFFFF', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 16, textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', marginBottom: 40, fontWeight: '600' },
  formCard: { padding: 32, borderRadius: 40, marginTop: 0 },
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
  submitButton: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: { color: '#000', fontSize: 18, fontWeight: '900' },
  disabledBtn: { opacity: 0.5 },
  footer: { flexDirection: 'column', alignItems: 'center', marginTop: 40, gap: 8 },
  footerText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 15, fontWeight: '600' },
  linkText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // Success Screen Styles
  successCard: { padding: 40, borderRadius: 44, alignItems: 'center', marginTop: 0 },
  successIconContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successIconBlur: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 12, textAlign: 'center' },
  successMessage: { fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  emailBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emailText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  successButton: { backgroundColor: '#FFF', borderRadius: 18, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 20 },
  successButtonText: { color: '#000', fontSize: 16, fontWeight: '900' },
  resendText: { color: 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' }
});
