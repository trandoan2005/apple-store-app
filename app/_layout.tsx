// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Platform } from 'react-native';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Ignore all warnings
LogBox.ignoreAllLogs();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token found:', token);
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#fff'
        }}
        accessible={true}
        accessibilityLabel="Loading screen"
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          // Thêm options để tránh aria-hidden issues
          ...Platform.select({
            web: {
              // Tắt tính năng tự động thêm aria-hidden
              // presentation: 'transparentModal'
            }
          })
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="(auth)" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        {/* Thêm modal screen nếu có */}
        <Stack.Screen 
          name="modal" 
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            // Quan trọng: Không để hệ thống tự động thêm aria-hidden
            ...Platform.select({
              web: {
                gestureEnabled: false,
              }
            })
          }} 
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}