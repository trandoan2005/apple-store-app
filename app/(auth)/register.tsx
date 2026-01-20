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
  Easing,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

const { width, height } = Dimensions.get('window');



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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LiquidBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerBrand}>iCenter</Text>
              <View style={{ width: 44 }} />
            </View>

            <Text style={styles.title}>Tạo Apple ID</Text>
            <Text style={styles.subtitle}>Một tài khoản duy nhất cho tất cả</Text>

            <GlassCard style={styles.formCard} intensity={30}>
              <View style={[styles.inputGroup, focusedInput === 'displayName' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Apple User"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={displayName}
                    onChangeText={setDisplayName}
                    onFocus={() => setFocusedInput('displayName')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!loading}
                  />
                  <Ionicons name="person" size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'email' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>ID APPLE (EMAIL)</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <Ionicons name="mail" size={18} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'password' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>MẬT KHẨU</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Min 6 characters"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, focusedInput === 'confirmPassword' && styles.inputGroupFocused]}>
                <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU</Text>
                <View style={styles.innerInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận lại"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="rgba(255,255,255,0.3)" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.disabledBtn]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerBtnText}>Tiếp tục</Text>}
              </TouchableOpacity>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn đã có tài khoản ID Apple? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  animatedContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtn: {
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
  inputGroup: { marginBottom: 20 },
  inputGroupFocused: {},
  inputLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1.5, marginLeft: 4 },
  innerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  input: { flex: 1, height: 50, fontSize: 16, color: '#FFF', fontWeight: '600' },
  registerButton: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerBtnText: { color: '#000', fontSize: 18, fontWeight: '900' },
  disabledBtn: { opacity: 0.5 },
  footer: { flexDirection: 'column', alignItems: 'center', marginTop: 40, gap: 8 },
  footerText: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 15, fontWeight: '600' },
  linkText: { color: '#FFF', fontWeight: '800', fontSize: 15 },

  // Floating Input styles (legacy support)
  floatingInputContainer: { marginBottom: 20 },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 10,
    fontWeight: '500'
  },
  floatingInputWrapper: { borderRadius: 16, overflow: 'hidden' },
  floatingInputFocused: { borderColor: '#d70018' },
  floatingInputError: { borderColor: '#FF3B30' },
  inputInnerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60
  },
  inputIconContainer: { marginRight: 12 },
  floatingInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    height: '100%'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 16,
    gap: 6
  },
  errorText: { fontSize: 12, color: '#FF3B30' },
});
