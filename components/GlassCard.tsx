import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { ModernTheme } from '../constants/ModernTheme';

interface GlassCardProps extends ViewProps {
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = ModernTheme.glass.intensity, ...props }) => {
    const flatStyle = StyleSheet.flatten(style);
    const borderRadius = flatStyle?.borderRadius || ModernTheme.radiusMd;

    if (Platform.OS === 'web') {
        const blurAmount = (intensity / 100) * 60; // Increased blur for web
        const opacity = (intensity / 100) * 0.15 + 0.02;

        return (
            <View
                style={[
                    styles.webGlass,
                    {
                        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                        // @ts-ignore
                        backdropFilter: intensity > 0 ? `blur(${blurAmount}px) saturate(180%) brightness(1.1)` : 'none',
                        borderRadius,
                    },
                    style,
                ]}
                {...props}
            >
                {/* Inner Border Gradient Simulation */}
                <View style={[styles.innerBorder, { borderRadius }]} />
                {children}
            </View>
        );
    }

    return (
        <View style={[styles.container, { borderRadius }, style]} {...props}>
            <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[styles.innerBorder, { borderRadius }]} />
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.2,
                shadowRadius: 40,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }
        })
    },
    webGlass: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        position: 'relative',
        overflow: 'hidden'
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        opacity: 0.5,
    },
    content: {
        zIndex: 1,
    }
});
