import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { ThemedText as Text } from './ThemedText';
import { GlassCard } from './GlassCard';
import { aiChatService, AiAction } from '../services/aiChatService';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

interface AiChatModalProps {
    visible: boolean;
    onClose: () => void;
    onActionSuccess?: (message: string) => void;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ visible, onClose, onActionSuccess }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Xin chào! Tôi là trợ lý AI Apple Store. Tôi có thể giúp gì cho bạn?', sender: 'ai', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const { addToCart } = useCart();
    const router = useRouter();

    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: Platform.OS !== 'web',
                friction: 8,
                tension: 40
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: Platform.OS !== 'web'
            }).start();
        }
    }, [visible]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiChatService.processMessage(userMsg.text);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.message,
                sender: 'ai',
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMsg]);

            // Execute actions based on AI response
            if (response.type === 'ADD_TO_CART' && response.data) {
                await addToCart(response.data);
                // Optionally add an AI follow-up message
                const followUp: Message = {
                    id: (Date.now() + 2).toString(),
                    text: `Đã thêm ${response.data.name} vào giỏ hàng của bạn. Bạn muốn tiếp tục mua sắm hay thanh toán luôn ạ?`,
                    sender: 'ai',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, followUp]);
                onActionSuccess?.('Đã thêm sản phẩm vào giỏ hàng!');
            } else if (response.type === 'CHECKOUT') {
                setTimeout(() => {
                    onClose();
                    router.push('/checkout' as any);
                }, 1000);
            } else if (response.type === 'SEARCH' && response.data) {
                const searchHint: Message = {
                    id: (Date.now() + 2).toString(),
                    text: `Bạn có thể tìm thấy các sản phẩm này tại mục Cửa hàng.`,
                    sender: 'ai',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, searchHint]);
                onActionSuccess?.(`Đã tìm thấy ${response.data.length} sản phẩm phù hợp!`);
            }

        } catch (error) {
            console.error('AI Processing error:', error);
        } finally {
            setLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <TouchableOpacity activeOpacity={1} style={styles.dismissArea} onPress={onClose} />
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <ExpoBlurView intensity={80} tint="dark" style={styles.blurContainer}>
                        <View style={styles.header}>
                            <View style={styles.headerIndicator} />
                            <Text style={styles.headerTitle}>AI Personal Assistant</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#999" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            ref={scrollRef}
                            style={styles.chatList}
                            contentContainerStyle={styles.chatContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map(msg => (
                                <View key={msg.id} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}>
                                    {msg.sender === 'ai' && (
                                        <View style={styles.aiAvatar}>
                                            <Ionicons name="sparkles" size={12} color="#FFF" />
                                        </View>
                                    )}
                                    <View style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                                        <Text style={styles.messageText}>{msg.text}</Text>
                                    </View>
                                </View>
                            ))}
                            {loading && (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator color="#FFF" size="small" />
                                    <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
                                </View>
                            )}
                        </ScrollView>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={20}>
                            <View style={styles.inputArea}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hỏi AI: tìm iPhone 15, thêm vào giỏ..."
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={input}
                                    onChangeText={setInput}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, !input.trim() && styles.disabledSend]}
                                    onPress={handleSend}
                                    disabled={!input.trim() || loading}
                                >
                                    <Ionicons name="send" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </ExpoBlurView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    dismissArea: { flex: 1 },
    modalContent: {
        height: height * 0.7,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(20, 20, 20, 0.8)'
    },
    blurContainer: { flex: 1 },
    header: {
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    headerIndicator: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 10 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    closeBtn: { position: 'absolute', right: 20, top: 15 },
    chatList: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 40 },
    messageRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
    userRow: { alignSelf: 'flex-end' },
    aiRow: { alignSelf: 'flex-start' },
    aiAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4
    },
    bubble: { padding: 12, borderRadius: 20 },
    userBubble: { backgroundColor: '#007AFF', borderTopRightRadius: 4 },
    aiBubble: { backgroundColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 4 },
    messageText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
    loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        gap: 10
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: '#FFF',
        fontSize: 15,
        maxHeight: 100
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    disabledSend: { opacity: 0.4 }
});
