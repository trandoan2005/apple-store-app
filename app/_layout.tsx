// app/_layout.tsx - PHIÊN BẢN ĐƠN GIẢN
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Ignore all warnings
LogBox.ignoreAllLogs();

// Tạo một component con để sử dụng useAuth
function AppContent() {
  const { loading } = useAuth(); // CHỈ dùng loading, KHÔNG dùng user để redirect

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
        {/* HIỂN THỊ CẢ HAI GROUP - ĐỂ LOGIN.TSX TỰ XỬ LÝ REDIRECT */}
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
      <StatusBar style="dark" />
    </>
  );
}

// Component chính bọc AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}