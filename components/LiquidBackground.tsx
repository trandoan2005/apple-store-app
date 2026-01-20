import React from 'react';
import { StyleSheet, ImageBackground, ViewProps, View } from 'react-native';
import { BlurView } from 'expo-blur';

export const LiquidBackground: React.FC<ViewProps> = ({ children, style, ...props }) => {
    return (
        <View style={[styles.container, style]}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
            >
                {/* Multi-layered premium overlay */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2, 6, 23, 0.6)' }]} />
                <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]} />

                {/* Subtle vignette effect */}
                <View style={[StyleSheet.absoluteFill, {
                    backgroundColor: 'transparent',
                    opacity: 0.3,
                }]} />
            </ImageBackground>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#020617',
    },
});
