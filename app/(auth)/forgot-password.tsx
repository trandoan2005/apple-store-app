import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';

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
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
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

    try {
      // Gửi email reset password với Firebase
      await sendPasswordResetEmail(auth, email);
      
      setIsEmailSent(true);
      
      // Success animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ])
      ]).start();
      
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      
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

  // Nếu đã gửi email thành công
  if (isEmailSent) {
    return (
      <View style={styles.successContainer}>
        {/* Background Gradient */}
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="successGrad" cx="50%" cy="50%" rx="70%" ry="70%">
              <Stop offset="0%" stopColor="#FFE6F2" stopOpacity="0.95" />
              <Stop offset="40%" stopColor="#FFD1E8" stopOpacity="0.9" />
              <Stop offset="70%" stopColor="#FFB6D9" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#FF8EC6" stopOpacity="0.8" />
            </RadialGradient>
          </Defs>
          <Path d={`M0 0H${width}V${height}H0z`} fill="url(#successGrad)" />
        </Svg>
        
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        
        <Animated.View 
          style={[
            styles.successContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Animated.View style={[styles.successIconContainer, { transform: [{ scale: glowScale }] }]}>
            <View style={styles.successIconGlow} />
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </Animated.View>
          
          <Text style={styles.successTitle}>🎉 Thành công!</Text>
          <Text style={styles.successMessage}>
            Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.successInstruction}>
            Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.
          </Text>
          
          <Animated.View style={{ opacity: glowOpacity }}>
            <Pressable 
              style={styles.successButton}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.successButtonText}>Về trang đăng nhập</Text>
            </Pressable>
          </Animated.View>
          
          <Text style={styles.helpText}>
            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
            <Text style={styles.resendText} onPress={() => setIsEmailSent(false)}>
              gửi lại
            </Text>
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Background Gradient */}
        <View style={styles.background}>
          <Svg width={width} height={height} style={styles.gradient}>
            <Defs>
              <RadialGradient id="grad" cx="50%" cy="50%" rx="70%" ry="70%">
                <Stop offset="0%" stopColor="#FFE6F2" stopOpacity="0.95" />
                <Stop offset="40%" stopColor="#FFD1E8" stopOpacity="0.9" />
                <Stop offset="70%" stopColor="#FFB6D9" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#FF8EC6" stopOpacity="0.8" />
              </RadialGradient>
            </Defs>
            <Path d={`M0 0H${width}V${height}H0z`} fill="url(#grad)" />
          </Svg>
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        </View>

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
            {/* Header */}
            <View style={styles.header}>
              <Pressable 
                onPress={handleBackToLogin} 
                style={styles.backButton}
                accessibilityLabel="Quay lại đăng nhập"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={24} color="#FF69B4" />
              </Pressable>
              
              {/* Apple Logo with Glow */}
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: glowScale }] }]}>
                <View style={styles.logoGlow} />
                <Ionicons name="logo-apple" size={48} color="#FF69B4" />
              </Animated.View>
              
              <Text style={styles.title}>🔐 Quên mật khẩu</Text>
              <Text style={styles.subtitle}>
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 Email đăng ký</Text>
                <Animated.View 
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputFocused,
                    {
                      transform: [
                        {
                          scale: focusedInput === 'email' ? 
                            glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.02]
                            }) : 1
                        }
                      ]
                    }
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color="#FF8EC6" style={styles.inputIcon} />
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="example@apple.com"
                    placeholderTextColor="#FF8EC6"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!loading}
                    accessibilityLabel="Email"
                    accessibilityHint="Nhập email đã đăng ký tài khoản"
                    returnKeyType="send"
                    onSubmitEditing={handleResetPassword}
                    selectionColor="#FF69B4"
                  />
                  {email.length > 0 && (
                    <Pressable 
                      onPress={() => setEmail('')} 
                      style={styles.clearButton}
                      accessibilityLabel="Xóa email"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close-circle" size={20} color="#FF8EC6" />
                    </Pressable>
                  )}
                </Animated.View>
              </View>

              {/* Instructions */}
              <Animated.View style={[styles.instructionsBox, { opacity: glowOpacity }]}>
                <Ionicons name="information-circle-outline" size={22} color="#FF69B4" />
                <View style={styles.instructionsContent}>
                  <Text style={styles.instructionsTitle}>📨 Bạn sẽ nhận được gì?</Text>
                  <Text style={styles.instructionsText}>
                    Một email chứa liên kết đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.
                  </Text>
                </View>
              </Animated.View>

              {/* Submit Button */}
              <Animated.View style={{ opacity: glowOpacity, transform: [{ scale: glowScale }] }}>
                <Pressable 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                  onPress={handleResetPassword}
                  disabled={loading}
                  accessibilityLabel="Gửi liên kết đặt lại mật khẩu"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loading }}
                >
                  {/* Button Glow Effect */}
                  <Animated.View style={[
                    styles.buttonGlow,
                    { opacity: glowOpacity }
                  ]} />
                  
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={22} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.submitButtonText}>GỬI LIÊN KẾT ĐẶT LẠI</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>

              {/* Security Notice */}
              <View style={styles.securityBox}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#FF69B4" />
                <Text style={styles.securityText}>
                  🔒 Liên kết bảo mật • ⏳ Hết hạn sau 1 giờ
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💖 Nhớ mật khẩu?{' '}
                <Text 
                  style={styles.footerLink}
                  onPress={handleBackToLogin}
                  accessibilityLabel="Đăng nhập"
                  accessibilityRole="link"
                >
                  Đăng nhập ngay
                </Text>
              </Text>
            </View>

            {/* Apple Support Info */}
            <View style={styles.supportBox}>
              <Ionicons name="headset-outline" size={16} color="#FF8EC6" />
              <Text style={styles.supportText}>
                🆘 Cần trợ giúp? Liên hệ{' '}
                <Text style={styles.supportLink}>Apple Support</Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE6F2',
  },
  keyboardView: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF69B4',
    opacity: 0.2,
    blurRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF4081',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4081',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputFocused: {
    borderColor: '#FF69B4',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FF4081',
    height: '100%',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  instructionsContent: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4081',
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14,
    color: '#FF69B4',
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    height: 56,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#FF8EC6',
  },
  buttonIcon: {
    marginRight: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#FF8EC6',
    fontWeight: '500',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#FF69B4',
  },
  footerLink: {
    color: '#FF4081',
    fontWeight: '700',
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  supportText: {
    fontSize: 12,
    color: '#FF8EC6',
  },
  supportLink: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.3)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  successIconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    opacity: 0.2,
    blurRadius: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF4081',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF4081',
    marginBottom: 20,
    textAlign: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 12,
    width: '100%',
  },
  successInstruction: {
    fontSize: 14,
    color: '#FF8EC6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 14,
    color: '#FF8EC6',
    textAlign: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#FF4081',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});