import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
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
import Svg, { Path, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { BlurView } from 'expo-blur';

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

  // Handle input focus animation
  useEffect(() => {
    Animated.timing(inputFocusAnim, {
      toValue: focusedInput ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
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
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
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
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Pink Gradient Background */}
        <Svg width={width} height={height} style={styles.gradient}>
          <Defs>
            <RadialGradient id="loadingGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#FF69B4" stopOpacity="0.7" />
            </RadialGradient>
          </Defs>
          <Path d={`M0 0H${width}V${height}H0z`} fill="url(#loadingGrad)" />
        </Svg>
        
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Đang chuẩn bị trải nghiệm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <LinearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </LinearGradient>
            </Defs>
            <Path d={`M0 0H${width}V${height}H0z`} fill="url(#grad)" />
            <Path d={`M0 0H${width}V${height}H0z`} fill="url(#overlay)" opacity="0.3" />
          </Svg>
          
          {/* Glassmorphism Effect */}
          <BlurView intensity={40} tint="light" style={styles.blurView} />
        </View>

        {/* Floating Particles */}
        <Animated.View style={[styles.particles, { opacity: glowOpacity }]}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  backgroundColor: i % 3 === 0 ? '#FF69B4' : i % 3 === 1 ? '#FFB6C1' : '#FFFFFF',
                  opacity: Math.random() * 0.3 + 0.1,
                }
              ]}
            />
          ))}
        </Animated.View>

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
            {/* Apple Logo with Glow Effect */}
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: glowScale }] }]}>
              <View style={styles.logoGlow} />
              <Ionicons name="logo-apple" size={52} color="#FF69B4" />
            </Animated.View>

            <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để khám phá thế giới Apple</Text>

            {/* Email Input with Animation */}
            <Animated.View 
              style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputFocused,
                {
                  transform: [
                    {
                      scale: focusedInput === 'email' ? 
                        inputFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.03]
                        }) : 1
                    }
                  ]
                }
              ]}
            >
              <Ionicons 
                name="mail-outline" 
                size={24} 
                color={focusedInput === 'email' ? "#FF69B4" : "#FF8EC6"} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#FF8EC6"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!isLoading}
                selectionColor="#FF69B4"
              />
            </Animated.View>

            {/* Password Input with Animation */}
            <Animated.View 
              style={[
                styles.inputContainer,
                focusedInput === 'password' && styles.inputFocused,
                {
                  transform: [
                    {
                      scale: focusedInput === 'password' ? 
                        inputFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.03]
                        }) : 1
                    }
                  ]
                }
              ]}
            >
              <Ionicons 
                name="lock-closed-outline" 
                size={24} 
                color={focusedInput === 'password' ? "#FF69B4" : "#FF8EC6"} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#FF8EC6"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                selectionColor="#FF69B4"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color={focusedInput === 'password' ? "#FF69B4" : "#FF8EC6"} 
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Forgot Password with Animation */}
            <Animated.View style={{ opacity: glowOpacity }}>
              <TouchableOpacity 
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
                disabled={isLoading}
              >
                <Ionicons name="key-outline" size={16} color="#FF69B4" style={styles.forgotIcon} />
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Button with Animation */}
            <Animated.View style={{ 
              transform: [{ scale: scaleAnim }],
              opacity: glowOpacity 
            }}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {/* Button Glow Effect */}
                <Animated.View style={[
                  styles.buttonGlow,
                  { opacity: glowOpacity }
                ]} />
                
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={22} color="#FF69B4" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={22} color="#FF69B4" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-twitter" size={22} color="#FF69B4" />
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerContainer}
              onPress={() => router.push('/(auth)/register')}
              disabled={isLoading}
            >
              <Text style={styles.registerText}>
                Chưa có tài khoản?{' '}
                <Text style={styles.registerHighlight}>Đăng ký ngay</Text>
              </Text>
              <Ionicons name="arrow-forward-circle" size={20} color="#FF69B4" />
            </TouchableOpacity>

            {/* Privacy Notice */}
            <Text style={styles.privacyText}>
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Text style={styles.privacyLink}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.privacyLink}>Chính sách bảo mật</Text>
            </Text>

            {/* Debug Button */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔧 [Login] Debug info:', { email, hasPassword: !!password });
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.debugText}>🎀 DEBUG: Skip to Home</Text>
              </TouchableOpacity>
            )}
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE6F2',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF69B4',
    opacity: 0.2,
    blurRadius: 20,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FF4081',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.2)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#FF69B4',
    borderWidth: 2,
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FF4081',
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 32,
    padding: 10,
    backgroundColor: 'rgba(255, 105, 180, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  forgotIcon: {
    marginRight: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF69B4',
    borderRadius: 18,
    paddingVertical: 20,
    gap: 12,
    marginBottom: 24,
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
  loginButtonDisabled: {
    backgroundColor: '#FF8EC6',
    opacity: 0.8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 105, 180, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.2)',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    padding: 12,
  },
  registerText: {
    fontSize: 15,
    color: '#FF69B4',
    opacity: 0.8,
  },
  registerHighlight: {
    color: '#FF4081',
    fontWeight: '700',
  },
  privacyText: {
    fontSize: 12,
    color: '#FF8EC6',
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyLink: {
    color: '#FF69B4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  debugButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  debugText: {
    fontSize: 12,
    color: '#FF69B4',
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: 'rgba(255, 105, 180, 0.3)',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF4081',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  modalMessage: {
    fontSize: 16,
    color: '#FF69B4',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});