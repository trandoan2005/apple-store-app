// app/_layout.tsx - PHIÊN BẢN ĐƠN GIẢN
import { Stack } from 'expo-router';
import { ActivityIndicator, View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ignore all warnings
LogBox.ignoreAllLogs();

import { DynamicIsland, DynamicIslandRef } from '../components/DynamicIsland';
import { AiChatModal } from '../components/AiChatModal';
import { useRef, useState } from 'react';

// Tạo một component con để sử dụng useAuth
function AppContent() {
  const { loading } = useAuth();
  const islandRef = useRef<DynamicIslandRef>(null);
  const [aiVisible, setAiVisible] = useState(false);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff'
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>

      {/* Global AI Floating Button */}
      {!loading && (
        <TouchableOpacity
          style={styles.aiFloatingBtn}
          onPress={() => setAiVisible(true)}
          activeOpacity={0.8}
        >
          <ExpoBlurView intensity={60} tint="dark" style={styles.aiBlurBtn}>
            <Ionicons name="sparkles" size={24} color="#FFF" />
          </ExpoBlurView>
        </TouchableOpacity>
      )}

      {/* Global Components */}
      <AiChatModal
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        onActionSuccess={(msg) => islandRef.current?.show(msg)}
      />
      <DynamicIsland ref={islandRef} />

      <StatusBar style="dark" />
    </>
  );
}

// Component chính bọc AuthProvider
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <GestureHandlerRootView style={styles.container}>
          <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <View style={[
              { flex: 1, backgroundColor: '#fff', overflow: 'hidden' },
              Platform.OS === 'web' && {
                width: '100%',
              }
            ]}>
              <AppContent />
            </View>
          </View>
        </GestureHandlerRootView>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  aiFloatingBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 999,
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(0, 122, 255, 0.4)' },
      default: { elevation: 8 }
    })
  },
  aiBlurBtn: {
    flex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});