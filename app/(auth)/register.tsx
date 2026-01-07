// app/(auth)/register.tsx - GLASSMORPHISM & 3D EFFECTS (FIXED VERSION)
import { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Glass effect component với animation
const GlassCard = ({ children, style, intensity = 20, borderRadius = 20 }: any) => {
  return (
    <View style={[styles.glassContainer, { borderRadius }, style]}>
      <View style={[styles.glassBackground, { backgroundColor: `rgba(255, 255, 255, ${0.8 + intensity/100})` }]} />
      {children}
    </View>
  );
};

// Custom component cho gradient icon
const GradientIcon = ({ name, size = 60, colors = ['#007AFF', '#5856D6', '#FF2D55'] }: any) => {
  return (
    <View style={styles.gradientIconContainer}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientIconBackground}
      >
        <Ionicons name={name} size={size} color="#FFFFFF" />
      </LinearGradient>
    </View>
  );
};

// Animated gradient button với 3D effect
const AnimatedGradientButton = ({ 
  title, 
  onPress, 
  icon, 
  loading = false,
  colors = ['#007AFF', '#5856D6']
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
    }).start();
  };

  // Rotation animation cho loading
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.gradientButton}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButtonBackground}
        >
          <View style={styles.buttonContent}>
            {loading ? (
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <Ionicons name="refresh" size={22} color="#fff" />
              </Animated.View>
            ) : (
              <Ionicons name={icon} size={22} color="#fff" />
            )}
            <Text style={styles.gradientButtonText}>{title}</Text>
          </View>
          
          {/* 3D shadow effect */}
          <View style={styles.buttonShadow} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// Animated input với label floating
const FloatingInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  focused,
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: any) => {
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: value || focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, focused]);

  const labelStyle = {
    transform: [{
      translateY: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -30]
      })
    }],
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14]
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#8E8E93', focused ? '#007AFF' : '#000000']
    })
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={styles.floatingInputContainer}>
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>
        {label}
      </Animated.Text>
      
      <GlassCard 
        style={[
          styles.floatingInputWrapper,
          (focused || isFocused) && styles.floatingInputFocused,
          error && styles.floatingInputError
        ]}
        intensity={15}
      >
        <View style={styles.inputInnerWrapper}>
          {icon && (
            <View style={styles.inputIconContainer}>
              <Ionicons 
                name={icon} 
                size={22} 
                color={(focused || isFocused) ? '#007AFF' : '#8E8E93'} 
              />
            </View>
          )}
          
          <TextInput
            style={styles.floatingInput}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
            {...props}
          />
        </View>
      </GlassCard>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(email, password, displayName);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          '🎉 Thành công!',
          'Tài khoản của bạn đã được tạo thành công.',
          [
            {
              text: 'Đăng nhập ngay',
              onPress: () => {
                // Xóa form
                setDisplayName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                router.replace('/(auth)/login');
              }
            }
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('❌ Lỗi', result.message || 'Đăng ký thất bại');
      }
      
    } catch (error: any) {
      console.error('🔥 Registration error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const testEmail = `test${Math.floor(Math.random() * 10000)}@apple.com`;
    setDisplayName('Apple User');
    setEmail(testEmail);
    setPassword('12345678');
    setConfirmPassword('12345678');
    setErrors({});
  };

  const handleInputFocus = (field: string) => {
    setFocusedInput(field);
    // Clear error for this field when focused
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={['#F5F5F7', '#E5E5E7', '#F5F5F7']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Floating circles decoration */}
      <View style={styles.floatingCircle1} />
      <View style={styles.floatingCircle2} />
      <View style={styles.floatingCircle3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header với hiệu ứng glass */}
          <GlassCard style={styles.headerCard}>
            <View style={styles.headerContent}>
              <Pressable 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }} 
                style={styles.backButton}
              >
                <GlassCard style={styles.backButtonInner}>
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </GlassCard>
              </Pressable>
              
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Đăng ký tài khoản</Text>
                <Text style={styles.subtitle}>Tham gia cộng đồng Apple</Text>
              </View>
            </View>
            
            {/* Apple logo gradient */}
            <GradientIcon 
              name="logo-apple" 
              size={60}
              colors={['#007AFF', '#5856D6', '#FF2D55']}
            />
          </GlassCard>

          {/* Form container với hiệu ứng glass */}
          <GlassCard style={styles.formCard} intensity={25}>
            <View style={styles.formContent}>
              {/* Display Name */}
              <FloatingInput
                label="Tên hiển thị"
                value={displayName}
                onChangeText={setDisplayName}
                icon="person-outline"
                focused={focusedInput === 'displayName'}
                onFocus={() => handleInputFocus('displayName')}
                onBlur={() => setFocusedInput(null)}
                error={errors.displayName}
                editable={!loading}
                autoCapitalize="words"
                returnKeyType="next"
              />

              {/* Email */}
              <FloatingInput
                label="Email Apple"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                focused={focusedInput === 'email'}
                onFocus={() => handleInputFocus('email')}
                onBlur={() => setFocusedInput(null)}
                error={errors.email}
                editable={!loading}
                autoCapitalize="none"
                returnKeyType="next"
              />

              {/* Password */}
              <View style={styles.passwordContainer}>
                <FloatingInput
                  label="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  icon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  focused={focusedInput === 'password'}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => setFocusedInput(null)}
                  error={errors.password}
                  editable={!loading}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <Pressable 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPassword(!showPassword);
                  }}
                  style={styles.eyeButtonAbsolute}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color={focusedInput === 'password' ? '#007AFF' : '#8E8E93'} 
                  />
                </Pressable>
              </View>

              {/* Confirm Password */}
              <View style={styles.passwordContainer}>
                <FloatingInput
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="shield-checkmark-outline"
                  secureTextEntry={!showConfirmPassword}
                  focused={focusedInput === 'confirmPassword'}
                  onFocus={() => handleInputFocus('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  error={errors.confirmPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <Pressable 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  style={styles.eyeButtonAbsolute}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color={focusedInput === 'confirmPassword' ? '#007AFF' : '#8E8E93'} 
                  />
                </Pressable>
              </View>

              {/* Password requirements */}
              <GlassCard style={styles.requirementsCard} intensity={10}>
                <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password.length >= 6 ? '#32D74B' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.requirementText,
                      password.length >= 6 && styles.requirementTextMet
                    ]}>
                      Ít nhất 6 ký tự
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password === confirmPassword && password.length > 0 ? '#32D74B' : '#8E8E93'} 
                    />
                    <Text style={[
                      styles.requirementText,
                      password === confirmPassword && password.length > 0 && styles.requirementTextMet
                    ]}>
                      Mật khẩu khớp
                    </Text>
                  </View>
                </View>
              </GlassCard>

              {/* Register Button */}
              <AnimatedGradientButton
                title={loading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN APPLE"}
                onPress={handleRegister}
                icon="checkmark-circle"
                loading={loading}
                colors={['#007AFF', '#5856D6']}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Test Data Button */}
              {__DEV__ && (
                <Pressable 
                  style={styles.testButton}
                  onPress={fillTestData}
                  disabled={loading}
                >
                  <GlassCard style={styles.testButtonInner} intensity={10}>
                    <View style={styles.testButtonContent}>
                      <Ionicons name="sparkles" size={20} color="#007AFF" />
                      <Text style={styles.testButtonText}>Dùng dữ liệu test</Text>
                    </View>
                  </GlassCard>
                </Pressable>
              )}

              {/* Terms */}
              <Text style={styles.termsText}>
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text> của Apple
              </Text>
            </View>
          </GlassCard>

          {/* Login link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản Apple? </Text>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(auth)/login');
              }} 
              disabled={loading}
            >
              <Text style={styles.loginLink}>Đăng nhập ngay →</Text>
            </Pressable>
          </View>

          {/* Security info */}
          <GlassCard style={styles.securityCard} intensity={15}>
            <View style={styles.securityContent}>
              <Ionicons name="shield-checkmark" size={24} color="#32D74B" />
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Bảo mật Apple ID</Text>
                <Text style={styles.securitySubtitle}>
                  Tất cả thông tin của bạn được mã hóa và bảo vệ bởi Apple
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  animatedContainer: {
    flex: 1,
  },
  // Glass effect
  glassContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Background decorations
  floatingCircle1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(88, 86, 214, 0.05)',
  },
  floatingCircle3: {
    position: 'absolute',
    top: '50%',
    left: '70%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 45, 85, 0.05)',
  },
  // Gradient Icon
  gradientIconContainer: {
    position: 'absolute',
    top: -20,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientIconBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  headerCard: {
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'visible',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  // Form
  formCard: {
    borderRadius: 25,
    padding: 24,
    marginBottom: 20,
  },
  formContent: {
    gap: 20,
  },
  // Floating Input
  floatingInputContainer: {
    marginBottom: 8,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 10,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  floatingInputWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  floatingInputFocused: {
    borderColor: '#007AFF',
  },
  floatingInputError: {
    borderColor: '#FF3B30',
  },
  inputInnerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  floatingInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    height: '100%',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButtonAbsolute: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 16,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  // Requirements
  requirementsCard: {
    borderRadius: 16,
    padding: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  requirementTextMet: {
    color: '#32D74B',
    fontWeight: '500',
  },
  // Button
  gradientButton: {
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientButtonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  // Test Button
  testButton: {
    marginTop: 5,
  },
  testButtonInner: {
    borderRadius: 16,
    padding: 16,
  },
  testButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Terms
  termsText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  // Login link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
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
  // Security card
  securityCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
});