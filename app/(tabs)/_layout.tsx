// app/(tabs)/_layout.tsx - PREMIUM LIQUID GLASS WITH 3D EFFECTS
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Animated, View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import Svg, { RadialGradient, Defs, Rect, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Premium Liquid Glass colors with metallic gradients
const TAB_COLORS = {
  index: {
    active: '#007AFF',
    inactive: '#8E8E93',
    gradient: ['#007AFF', '#5856D6', '#007AFF'], // Blue metallic
    glassGradient: ['rgba(0, 122, 255, 0.15)', 'rgba(88, 86, 214, 0.25)', 'rgba(0, 122, 255, 0.15)'],
    glow: 'rgba(0, 122, 255, 0.4)',
    iconActive: 'home',
    iconInactive: 'home-outline',
    label: 'Trang chủ',
    depth: 2 // 3D depth effect
  },
  store: {
    active: '#34C759',
    inactive: '#8E8E93',
    gradient: ['#34C759', '#32D74B', '#34C759'], // Green metallic
    glassGradient: ['rgba(52, 199, 89, 0.15)', 'rgba(50, 215, 75, 0.25)', 'rgba(52, 199, 89, 0.15)'],
    glow: 'rgba(52, 199, 89, 0.4)',
    iconActive: 'bag-handle',
    iconInactive: 'bag-handle-outline',
    label: 'Cửa hàng',
    depth: 3
  },
  cart: {
    active: '#FF9500',
    inactive: '#8E8E93',
    gradient: ['#FF9500', '#FF9F0A', '#FF9500'], // Orange metallic
    glassGradient: ['rgba(255, 149, 0, 0.15)', 'rgba(255, 159, 10, 0.25)', 'rgba(255, 149, 0, 0.15)'],
    glow: 'rgba(255, 149, 0, 0.4)',
    iconActive: 'cart',
    iconInactive: 'cart-outline',
    label: 'Giỏ hàng',
    depth: 4
  },
  profile: {
    active: '#AF52DE',
    inactive: '#8E8E93',
    gradient: ['#AF52DE', '#BF5AF2', '#AF52DE'], // Purple metallic
    glassGradient: ['rgba(175, 82, 222, 0.15)', 'rgba(191, 90, 242, 0.25)', 'rgba(175, 82, 222, 0.15)'],
    glow: 'rgba(175, 82, 222, 0.4)',
    iconActive: 'person-circle',
    iconInactive: 'person-circle-outline',
    label: 'Cá nhân',
    depth: 2
  }
};

export default function TabLayout() {
  const tabPosition = useRef(new Animated.Value(0)).current;
  
  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          // Animate tab position
          const routeName = e.target?.split('-')[0];
          const tabIndex = Object.keys(TAB_COLORS).indexOf(routeName || 'index');
          Animated.spring(tabPosition, {
            toValue: (width / Object.keys(TAB_COLORS).length) * tabIndex,
            useNativeDriver: true,
            tension: 100,
            friction: 15,
          }).start();
        },
      }}
      screenOptions={({ route }) => {
        const tabConfig = TAB_COLORS[route.name as keyof typeof TAB_COLORS] || TAB_COLORS.index;
        
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
          tabBarBackground: () => <LiquidGlassBackground />,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginBottom: Platform.OS === 'ios' ? 10 : 6,
            fontFamily: 'System',
            letterSpacing: -0.2,
            textShadowColor: 'rgba(0, 0, 0, 0.1)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 1,
          },
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <LiquidGlassIcon 
                focused={focused}
                name={focused ? tabConfig.iconActive : tabConfig.iconInactive}
                color={color}
                size={size}
                config={tabConfig}
                routeName={route.name}
              />
            );
          },
        };
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: TAB_COLORS.index.label,
        }} 
      />
      <Tabs.Screen 
        name="store" 
        options={{
          title: TAB_COLORS.store.label,
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{
          title: TAB_COLORS.cart.label,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: TAB_COLORS.profile.label,
        }} 
      />
    </Tabs>
  );
}

// LIQUID GLASS BACKGROUND WITH 3D DEPTH
function LiquidGlassBackground() {
  const waveAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const translateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20]
  });
  
  const opacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3]
  });
  
  return (
    <View style={styles.backgroundContainer}>
      {/* Base Glass Layer */}
      <BlurView
        intensity={98}
        tint="systemUltraThinMaterial"
        style={styles.glassBase}
      >
        {/* Liquid Waves */}
        <Animated.View
          style={[
            styles.liquidWaves,
            {
              transform: [{ translateY }],
              opacity,
            }
          ]}
        >
          <Svg height="100%" width="100%">
            <Defs>
              <RadialGradient id="liquidGradient" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#liquidGradient)" />
          </Svg>
        </Animated.View>
        
        {/* Glass Reflections */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'transparent', 'rgba(255, 255, 255, 0.1)']}
          style={styles.glassReflection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        {/* 3D Edge Lighting */}
        <View style={styles.topEdgeLight} />
        <View style={styles.bottomEdgeShadow} />
      </BlurView>
      
      {/* Floating Particles */}
      <FloatingParticles />
    </View>
  );
}

// LIQUID GLASS ICON WITH 3D EFFECTS
function LiquidGlassIcon({ focused, name, color, size, config, routeName }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const depthAnim = useRef(new Animated.Value(0)).current;
  const liquidAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (focused) {
      // Complex 3D animation sequence
      Animated.parallel([
        // Scale with bounce
        Animated.spring(scaleAnim, {
          toValue: 1.25,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }),
        
        // 3D rotation
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(rotateAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Depth movement (3D parallax)
        Animated.spring(depthAnim, {
          toValue: config.depth * 2,
          tension: 150,
          friction: 10,
          useNativeDriver: true,
        }),
        
        // Liquid fill animation
        Animated.timing(liquidAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
      
      // Continuous subtle rotation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 0.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -0.1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          tension: 150,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.spring(depthAnim, {
          toValue: 0,
          tension: 150,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [focused]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg']
  });
  
  const rotateX = depthAnim.interpolate({
    inputRange: [0, 8],
    outputRange: ['0deg', '15deg']
  });
  
  const translateY = depthAnim.interpolate({
    inputRange: [0, 8],
    outputRange: [0, -4]
  });
  
  const liquidHeight = liquidAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });
  
  const shadowOpacity = depthAnim.interpolate({
    inputRange: [0, 8],
    outputRange: [0.1, 0.4]
  });
  
  const shadowRadius = depthAnim.interpolate({
    inputRange: [0, 8],
    outputRange: [3, 10]
  });
  
  return (
    <View style={styles.iconContainer}>
      {/* 3D Shadow */}
      <Animated.View
        style={[
          styles.iconShadow,
          {
            opacity: shadowOpacity,
            shadowRadius: shadowRadius,
            backgroundColor: config.glow,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      />
      
      {/* Glass Container */}
      <Animated.View
        style={[
          styles.glassContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate },
              { rotateX },
              { translateY },
            ],
          }
        ]}
      >
        {/* Outer Glass Ring */}
        <LinearGradient
          colors={config.glassGradient}
          style={styles.glassRing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Inner Glass Circle */}
          <View style={styles.glassInner}>
            {/* Liquid Fill Effect */}
            <Animated.View
              style={[
                styles.liquidFill,
                {
                  height: liquidHeight,
                  backgroundColor: config.active,
                }
              ]}
            />
            
            {/* Glass Overlay */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
              style={styles.glassOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Icon with Gradient */}
            <LinearGradient
              colors={config.gradient}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={name} 
                size={size * 0.8} 
                color="#FFFFFF" 
                style={styles.icon}
              />
            </LinearGradient>
            
            {/* Glass Reflection */}
            <View style={styles.iconReflection} />
          </View>
        </LinearGradient>
        
        {/* Floating Particles around icon */}
        <IconParticles active={focused} color={config.active} />
      </Animated.View>
      
      {/* Active Glow Ring */}
      {focused && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              borderColor: config.glow,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        />
      )}
    </View>
  );
}

// FLOATING PARTICLES EFFECT
function FloatingParticles() {
  const particles = Array.from({ length: 15 });
  
  return (
    <>
      {particles.map((_, index) => (
        <FloatingParticle key={index} index={index} />
      ))}
    </>
  );
}

function FloatingParticle({ index }: { index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const size = 1 + Math.random() * 3;
  const delay = index * 200;
  const duration = 3000 + Math.random() * 2000;
  
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);
  
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30]
  });
  
  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 0]
  });
  
  const left = `${10 + Math.random() * 80}%`;
  
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left,
          opacity,
          transform: [{ translateY }],
        }
      ]}
    />
  );
}

// ICON PARTICLES
function IconParticles({ active, color }: { active: boolean; color: string }) {
  const particles = Array.from({ length: 8 });
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      tension: 200,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [active]);
  
  return (
    <>
      {particles.map((_, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const radius = 30;
        
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * radius]
        });
        
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * radius]
        });
        
        const opacity = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.6]
        });
        
        const scale = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        });
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.iconParticle,
              {
                backgroundColor: color,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              }
            ]}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glassBase: {
    flex: 1,
    position: 'relative',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  liquidWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  topEdgeLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bottomEdgeShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    bottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    position: 'relative',
  },
  iconShadow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  },
  glassContainer: {
    width: 40,
    height: 40,
    position: 'relative',
    zIndex: 10,
  },
  glassRing: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 3,
    overflow: 'hidden',
  },
  glassInner: {
    flex: 1,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
  },
  liquidFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 17,
  },
  iconGradient: {
    flex: 1,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconReflection: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  glowRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    zIndex: 5,
  },
  iconParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: '50%',
    left: '50%',
    marginLeft: -2,
    marginTop: -2,
  },
});