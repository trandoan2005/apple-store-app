import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const { login, user, loading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Kiểm tra nếu đã login thì chuyển trang
  useEffect(() => {
    if (user && !loading) {
      console.log('✅ [Login] User already logged in, redirecting...');
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  // Start animations on mount
  useEffect(() => {
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

  // Handle input focus animation
  useEffect(() => {
    Animated.timing(inputFocusAnim, {
      toValue: focusedInput ? 1 : 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [focusedInput]);

  const showCustomAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showCustomAlert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email');
      return;
    }

    console.log('🚀 [Login] Attempting login...');
    setIsLoading(true);

    // Animation for button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('✅ [Login] Login successful!');

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

        if (result.message) {
          showCustomAlert(
            '🎉 Đăng nhập thành công',
            `Chào mừng trở lại!\n${result.message}\n\nBạn sẽ được chuyển đến trang chủ...`
          );
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 2000);
        } else {
          showCustomAlert(
            '✨ Thành công',
            'Đăng nhập thành công!\nĐang chuyển hướng...'
          );
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1500);
        }

      } else {
        console.log('❌ [Login] Login failed:', result.message);

        // Shake animation for error
        const shakeAnim = new Animated.Value(0);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        showCustomAlert(
          '💔 Đăng nhập thất bại',
          `${result.message || 'Có lỗi xảy ra'}\n\nVui lòng kiểm tra lại thông tin.`
        );
      }

    } catch (error: any) {
      console.error('🔥 [Login] Error:', error);
      showCustomAlert(
        '⚠️ Lỗi hệ thống',
        'Đã xảy ra lỗi không mong muốn.\nVui lòng thử lại sau.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
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
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
              {/* Apple Logo with Enhanced Glow */}
              {/* Branding Logo */}
              <View style={styles.logoWrapper}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: glowScale }] }]}>
                  <View style={styles.logoBlur} />
                  <Text style={styles.brandLogo}>iCenter</Text>
                </Animated.View>
              </View>

              <Text style={styles.welcomeText}>Chào mừng bạn</Text>
              <Text style={styles.subtitle}>Đăng nhập để khám phá vũ trụ công nghệ</Text>

              <GlassCard style={styles.formCard} intensity={30}>
                {/* Email Input */}
                <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputGroupFocused]}>
                  <Text style={styles.inputLabel}>ID APPLE</Text>
                  <View style={styles.innerInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email (ID Apple)"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                    <Ionicons name="mail" size={18} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>

                {/* Password Input */}
                <View style={[styles.inputGroup, focusedInput === 'password' && styles.inputGroupFocused]}>
                  <Text style={styles.inputLabel}>MẬT KHẨU</Text>
                  <View style={styles.innerInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Bạn quên ID Apple hoặc mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.disabledBtn]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginBtnText}>Đăng nhập</Text>}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.divLine} />
                  <Text style={styles.divText}>HAY</Text>
                  <View style={styles.divLine} />
                </View>

                {/* Social Login Mockups */}
                <View style={styles.socialGrid}>
                  <TouchableOpacity style={styles.socialBtn}>
                    <GlassCard intensity={15} style={styles.socialCard}>
                      <Ionicons name="logo-google" size={20} color="#FFF" />
                    </GlassCard>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialBtn}>
                    <GlassCard intensity={15} style={styles.socialCard}>
                      <Ionicons name="logo-apple" size={20} color="#FFF" />
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              </GlassCard>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Bạn chưa có ID Apple? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Tạo Tài Khoản Mới</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>

          {/* Custom Alert Modal */}
          <Modal
            visible={showAlert}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAlert(false)}
            statusBarTranslucent
          >
            <BlurView intensity={60} tint="light" style={styles.modalOverlay}>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Ionicons
                    name={
                      alertTitle.includes('✨') || alertTitle.includes('🎉')
                        ? "sparkles"
                        : alertTitle.includes('💔')
                          ? "heart-dislike"
                          : "information-circle"
                    }
                    size={52}
                    color={
                      alertTitle.includes('✨') || alertTitle.includes('🎉')
                        ? "#FF69B4"
                        : alertTitle.includes('💔')
                          ? "#FF4757"
                          : "#FFB6C1"
                    }
                  />
                </View>

                <Text style={styles.modalTitle}>{alertTitle}</Text>
                <Text style={styles.modalMessage}>{alertMessage}</Text>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowAlert(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Tuyệt vời!</Text>
                </TouchableOpacity>
              </Animated.View>
            </BlurView>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logoWrapper: { alignItems: 'center', marginBottom: 24 },
  logoContainer: { justifyContent: 'center', alignItems: 'center' },
  logoBlur: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.1)', filter: 'blur(20px)' },
  brandLogo: { fontSize: 48, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  welcomeText: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
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
  forgotBtn: { alignSelf: 'center', marginBottom: 32 },
  forgotText: { color: 'rgba(56, 189, 248, 0.8)', fontWeight: '700', fontSize: 14 },
  loginButton: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnText: { color: '#000', fontSize: 18, fontWeight: '900' },
  disabledBtn: { opacity: 0.5 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  divText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '900', marginHorizontal: 12 },

  socialGrid: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1 },
  socialCard: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 0 },

  footer: { flexDirection: 'column', alignItems: 'center', marginTop: 40, gap: 8 },
  footerText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 15, fontWeight: '600' },
  linkText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: 'rgba(255,255,255,0.95)', width: '100%', padding: 40, borderRadius: 40, alignItems: 'center' },
  modalHeader: { marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#000', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center', lineHeight: 24 },
  modalButton: { backgroundColor: '#000', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20 },
  modalButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
