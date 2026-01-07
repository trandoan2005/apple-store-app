// app/(tabs)/_layout.tsx - ĐÃ SỬA LỖI
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Animated, View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

// Premium Liquid Glass colors với type an toàn
const TAB_CONFIGS = {
  index: {
    active: '#007AFF',
    inactive: '#8E8E93',
    gradient: ['#007AFF', '#5856D6', '#007AFF'],
    glassGradient: ['rgba(0, 122, 255, 0.15)', 'rgba(88, 86, 214, 0.25)', 'rgba(0, 122, 255, 0.15)'],
    glow: 'rgba(0, 122, 255, 0.4)',
    iconActive: 'home' as const,
    iconInactive: 'home-outline' as const,
    label: 'Trang chủ',
    depth: 2
  },
  store: {
    active: '#34C759',
    inactive: '#8E8E93',
    gradient: ['#34C759', '#32D74B', '#34C759'],
    glassGradient: ['rgba(52, 199, 89, 0.15)', 'rgba(50, 215, 75, 0.25)', 'rgba(52, 199, 89, 0.15)'],
    glow: 'rgba(52, 199, 89, 0.4)',
    iconActive: 'bag-handle' as const,
    iconInactive: 'bag-handle-outline' as const,
    label: 'Cửa hàng',
    depth: 3
  },
  cart: {
    active: '#FF9500',
    inactive: '#8E8E93',
    gradient: ['#FF9500', '#FF9F0A', '#FF9500'],
    glassGradient: ['rgba(255, 149, 0, 0.15)', 'rgba(255, 159, 10, 0.25)', 'rgba(255, 149, 0, 0.15)'],
    glow: 'rgba(255, 149, 0, 0.4)',
    iconActive: 'cart' as const,
    iconInactive: 'cart-outline' as const,
    label: 'Giỏ hàng',
    depth: 4
  },
  profile: {
    active: '#AF52DE',
    inactive: '#8E8E93',
    gradient: ['#AF52DE', '#BF5AF2', '#AF52DE'],
    glassGradient: ['rgba(175, 82, 222, 0.15)', 'rgba(191, 90, 242, 0.25)', 'rgba(175, 82, 222, 0.15)'],
    glow: 'rgba(175, 82, 222, 0.4)',
    iconActive: 'person-circle' as const,
    iconInactive: 'person-circle-outline' as const,
    label: 'Cá nhân',
    depth: 2
  }
} as const;

// Type cho route name
type TabRouteName = keyof typeof TAB_CONFIGS;

export default function TabLayout() {
  const tabPosition = useRef(new Animated.Value(0)).current;
  
  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0] as TabRouteName;
          const tabKeys = Object.keys(TAB_CONFIGS) as TabRouteName[];
          const tabIndex = tabKeys.indexOf(routeName || 'index');
          Animated.spring(tabPosition, {
            toValue: (width / tabKeys.length) * tabIndex,
            useNativeDriver: true,
            tension: 100,
            friction: 15,
          }).start();
        },
      }}
      screenOptions={({ route }) => {
        const routeName = route.name as TabRouteName;
        const tabConfig = TAB_CONFIGS[routeName] || TAB_CONFIGS.index;
        
        return {
          headerShown: false,
          tabBarActiveTintColor: tabConfig.active,
          tabBarInactiveTintColor: tabConfig.inactive,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === 'ios' ? 96 : 80,
            position: 'absolute',
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            paddingTop: 12,
            overflow: 'hidden',
          },
          tabBarBackground: () => <GlassBackground />, // Đơn giản hóa
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginBottom: Platform.OS === 'ios' ? 10 : 6,
            letterSpacing: -0.2,
          },
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabIcon 
                focused={focused}
                name={focused ? tabConfig.iconActive : tabConfig.iconInactive}
                color={color}
                size={size}
                config={tabConfig}
              />
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

// ĐƠN GIẢN HÓA BACKGROUND (bỏ Svg phức tạp)
function GlassBackground() {
  return (
    <BlurView
      intensity={90}
      tint="systemUltraThinMaterial"
      style={{
        flex: 1,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Top reflection line */}
      <View style={{
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
      }} />
    </BlurView>
  );
}

// TAB ICON ĐƠN GIẢN HÓA
function TabIcon({ focused, name, color, size, config }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow effect khi active */}
      {focused && (
        <Animated.View
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: config.glow,
            opacity: 0.4,
            transform: [{ scale: scaleAnim }],
          }}
        />
      )}
      
      {/* Icon container */}
      <Animated.View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: focused ? config.active : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Ionicons 
          name={name} 
          size={size * 0.9} 
          color={focused ? '#FFFFFF' : color}
        />
      </Animated.View>
    </View>
  );
}