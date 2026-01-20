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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';
import { ThemedText as Text } from '../components/ThemedText';

const { width } = Dimensions.get('window');

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const toastAnim = useRef(new Animated.Value(-100)).current;
    const toastWidth = useRef(new Animated.Value(120)).current;
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
    }, []);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)/profile' as any);
        }
    };

    const showSuccessToast = () => {
        setShowToast(true);
        // Reset values
        toastAnim.setValue(-100);
        toastWidth.setValue(120);

        Animated.sequence([
            // Slide down and expand
            Animated.parallel([
                Animated.spring(toastAnim, {
                    toValue: Platform.OS === 'ios' ? 20 : 40,
                    useNativeDriver: false,
                    bounciness: 12
                }),
                Animated.spring(toastWidth, {
                    toValue: width * 0.8,
                    useNativeDriver: false,
                    bounciness: 10
                })
            ]),
            // Wait
            Animated.delay(2500),
            // Shrink and slide up
            Animated.parallel([
                Animated.spring(toastAnim, {
                    toValue: -100,
                    useNativeDriver: false,
                }),
                Animated.spring(toastWidth, {
                    toValue: 120,
                    useNativeDriver: false,
                })
            ])
        ]).start(() => {
            setShowToast(false);
            router.replace('/(tabs)/profile' as any);
        });
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error('Không tìm thấy thông tin người dùng');

            // 1. Re-authenticate
            console.log('🔄 [ChangePassword] Re-authenticating user:', user.email);
            const credential = EmailAuthProvider.credential(user.email.trim(), currentPassword);
            await reauthenticateWithCredential(user, credential);
            console.log('✅ [ChangePassword] Re-authentication successful');

            // 2. Update password
            await updatePassword(user, newPassword);

            // Show dynamic island toast instead of alert
            showSuccessToast();

        } catch (error: any) {
            console.error('❌ [ChangePassword] Error:', error.code, error.message);
            let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                msg = 'Mật khẩu hiện tại không chính xác';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
            } else if (error.code === 'auth/user-token-expired') {
                msg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            }

            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.safeArea}>
                {/* Dynamic Island Toast */}
                {showToast && (
                    <Animated.View
                        style={[
                            styles.toastContainer,
                            {
                                top: toastAnim,
                                width: toastWidth,
                            }
                        ]}
                    >
                        <View style={styles.toastContent}>
                            <View style={styles.toastIcon}>
                                <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                            </View>
                            <Text style={styles.toastText}>Mật khẩu đã được cập nhật!</Text>
                        </View>
                    </Animated.View>
                )}

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Đổi mật khẩu</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                            <GlassCard style={styles.formCard} intensity={25}>
                                {/* Current Password */}
                                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                                <View style={[styles.inputContainer, focusedInput === 'current' && styles.inputFocused]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mật khẩu cũ"
                                        placeholderTextColor="#999"
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        secureTextEntry={!showPasswords.current}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setFocusedInput('current')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                                        <Ionicons name={showPasswords.current ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                    </TouchableOpacity>
                                </View>

                                {/* New Password */}
                                <Text style={styles.label}>Mật khẩu mới</Text>
                                <View style={[styles.inputContainer, focusedInput === 'new' && styles.inputFocused]}>
                                    <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tối thiểu 6 ký tự"
                                        placeholderTextColor="#999"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPasswords.new}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setFocusedInput('new')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                                        <Ionicons name={showPasswords.new ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                    </TouchableOpacity>
                                </View>

                                {/* Confirm Password */}
                                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                                <View style={[styles.inputContainer, focusedInput === 'confirm' && styles.inputFocused]}>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập lại mật khẩu mới"
                                        placeholderTextColor="#999"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPasswords.confirm}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setFocusedInput('confirm')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                    <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                                        <Ionicons name={showPasswords.confirm ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.disabledBtn]}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>CẬP NHẬT MẬT KHẨU</Text>}
                                </TouchableOpacity>
                            </GlassCard>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    scrollContent: { padding: 20 },
    formCard: { padding: 24, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    label: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputFocused: { borderColor: '#d70018', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#FFF', fontSize: 16 },
    submitButton: {
        backgroundColor: '#d70018',
        borderRadius: 20,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        ...Platform.select({
            web: { boxShadow: '0 8px 16px rgba(215, 0, 24, 0.3)' },
            default: { elevation: 4 }
        })
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledBtn: { opacity: 0.5 },
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#000',
        borderRadius: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        ...Platform.select({
            web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' },
            default: { elevation: 10 }
        })
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        justifyContent: 'center'
    },
    toastIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    toastText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    }
});
