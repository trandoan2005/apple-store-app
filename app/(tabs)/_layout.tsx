// app/(tabs)/_layout.tsx - PHONE STORE VERSION
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';
import { useCart } from '../../contexts/CartContext';
import { BlurView } from 'expo-blur';

// Cấu hình tabs cho cửa hàng điện thoại
const TAB_CONFIGS = {
  index: {
    active: '#d70018', // CellphoneS Red
    inactive: '#707070',
    iconActive: 'home' as const,
    iconInactive: 'home-outline' as const,
    label: 'Trang chủ',
  },
  store: {
    active: '#d70018',
    inactive: '#707070',
    iconActive: 'bag-handle' as const,
    iconInactive: 'bag-handle-outline' as const,
    label: 'Mua sắm',
  },
  cart: {
    active: '#d70018',
    inactive: '#707070',
    iconActive: 'cart' as const,
    iconInactive: 'cart-outline' as const,
    label: 'Giỏ hàng',
  },
  profile: {
    active: '#d70018',
    inactive: '#707070',
    iconActive: 'person' as const,
    iconInactive: 'person-outline' as const,
    label: 'Smember',
  },
} as const;

type TabRouteName = keyof typeof TAB_CONFIGS;

export default function TabLayout() {
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;

  return (
    <Tabs
      screenOptions={({ route }) => {
        const routeName = route.name as TabRouteName;
        const tabConfig = TAB_CONFIGS[routeName] || TAB_CONFIGS.index;

        return {
          headerShown: false,
          tabBarActiveTintColor: tabConfig.active,
          tabBarInactiveTintColor: tabConfig.inactive,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 16,
            left: 16,
            right: 16,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(0,0,0,0.5)', // Darker transparent
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            paddingBottom: 0,
            overflow: 'hidden',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              },
              android: {
                elevation: 10,
              },
              web: {
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(30px) saturate(140%)',
                borderStyle: 'solid',
              },
            }),
          },
          tabBarBackground: () => (
            Platform.OS !== 'web' && (
              <BlurView
                intensity={80}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 32,
                  overflow: 'hidden',
                }}
                tint="dark"
              />
            )
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <View style={{ alignItems: 'center' }}>
                <Ionicons
                  name={focused ? tabConfig.iconActive : tabConfig.iconInactive}
                  size={24}
                  color={color}
                />
                {routeName === 'cart' && itemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{itemCount}</Text>
                  </View>
                )}
              </View>
            );
          },
        };
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_CONFIGS.index.label,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: TAB_CONFIGS.store.label,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: TAB_CONFIGS.cart.label,
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_CONFIGS.profile.label,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#d70018',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
});