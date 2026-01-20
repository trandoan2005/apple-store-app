import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText as Text } from './ThemedText';

const { width } = Dimensions.get('window');

export interface DynamicIslandRef {
    show: (message: string, icon?: string, color?: string, duration?: number) => void;
}

export const DynamicIsland = forwardRef<DynamicIslandRef>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [icon, setIcon] = useState('shield-checkmark');
    const [iconColor, setIconColor] = useState('#34C759');

    const toastAnim = useRef(new Animated.Value(-100)).current;
    const toastWidth = useRef(new Animated.Value(120)).current;

    useImperativeHandle(ref, () => ({
        show: (msg, ic = 'shield-checkmark', col = '#34C759', duration = 2500) => {
            setMessage(msg);
            setIcon(ic);
            setIconColor(col);
            setVisible(true);

            // Reset
            toastAnim.setValue(-100);
            toastWidth.setValue(120);

            Animated.sequence([
                // Slide down and expand
                Animated.parallel([
                    Animated.spring(toastAnim, {
                        toValue: Platform.OS === 'ios' ? 10 : 30,
                        useNativeDriver: Platform.OS !== 'web',
                        bounciness: 12
                    }),
                    Animated.spring(toastWidth, {
                        toValue: width * 0.85,
                        useNativeDriver: Platform.OS !== 'web',
                        bounciness: 10
                    })
                ]),
                // Wait
                Animated.delay(duration),
                // Shrink and slide up
                Animated.parallel([
                    Animated.spring(toastAnim, {
                        toValue: -100,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.spring(toastWidth, {
                        toValue: 120,
                        useNativeDriver: Platform.OS !== 'web',
                    })
                ])
            ]).start(() => {
                setVisible(false);
            });
        }
    }));

    if (!visible) return null;

    return (
        <SafeAreaView
            style={[
                styles.container,
                { pointerEvents: 'none' } as any
            ]}
        >
            <Animated.View
                style={[
                    styles.island,
                    {
                        top: toastAnim,
                        width: toastWidth,
                    }
                ]}
            >
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                        <Ionicons name={icon as any} size={18} color={iconColor} />
                    </View>
                    <Text style={styles.text} numberOfLines={1}>{message}</Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        alignItems: 'center',
    },
    island: {
        backgroundColor: '#000',
        borderRadius: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' },
            default: { elevation: 10 }
        })
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        width: '100%',
        justifyContent: 'center'
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    text: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    }
});
