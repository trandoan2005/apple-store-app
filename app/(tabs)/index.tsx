import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { productService, Product, Category, formatPrice } from '../../services/productService';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 100;
const SEARCH_HEIGHT = 56;

// Pink Glass Theme
const THEME = {
  primary: '#FF2D55',
  primaryLight: '#FF6B8B',
  primaryDark: '#E91E63',
  secondary: '#FF4081',
  background: '#FFF5F7',
  card: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.25)',
  glassDark: 'rgba(255, 255, 255, 0.15)',
  text: '#1D1D1F',
  textSecondary: '#8E8E93',
  textLight: '#B8B8C0',
  success: '#32D74B',
  warning: '#FF9500',
  error: '#FF3B30',
  gradient: ['#FF2D55', '#FF4081', '#FF6B8B'],
  gradientLight: ['rgba(255, 45, 85, 0.1)', 'rgba(255, 107, 139, 0.05)']
};

// Featured Categories with emojis
const CATEGORIES = [
  { id: 'iphone', name: 'iPhone', icon: '📱', color: THEME.primary, gradient: ['#FF2D55', '#FF6B8B'] },
  { id: 'ipad', name: 'iPad', icon: '💻', color: '#FF9500', gradient: ['#FF9500', '#FFB347'] },
  { id: 'mac', name: 'Mac', icon: '🖥️', color: '#007AFF', gradient: ['#007AFF', '#5AC8FA'] },
  { id: 'watch', name: 'Watch', icon: '⌚', color: '#32D74B', gradient: ['#32D74B', '#4CD964'] },
  { id: 'airpods', name: 'AirPods', icon: '🎧', color: '#5856D6', gradient: ['#5856D6', '#AF52DE'] },
  { id: 'accessories', name: 'Phụ kiện', icon: '🔌', color: '#FF3B30', gradient: ['#FF3B30', '#FF9500'] },
];

// Quick Actions
const QUICK_ACTIONS = [
  { id: 1, icon: 'flash', label: 'Flash Sale', color: THEME.primary },
  { id: 2, icon: 'gift', label: 'Quà tặng', color: THEME.warning },
  { id: 3, icon: 'star', label: 'Ưu đãi', color: '#FFD700' },
  { id: 4, icon: 'card', label: 'Trả góp', color: '#32D74B' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.95)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_HEIGHT, 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Hero parallax
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // Initialize
  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(heroScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Auto scroll hero
    const interval = setInterval(() => {
      setActiveHero(prev => (prev + 1) % Math.max(heroProducts.length, 1));
    }, 3500);
    
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  // Search animation
  useEffect(() => {
    Animated.spring(searchOpacity, {
      toValue: showSearchBar ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [showSearchBar]);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [featuredResult, categoriesResult, allResult] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getAllCategories(),
        productService.getAllProducts()
      ]);

      if (featuredResult.success && featuredResult.data) {
        setFeaturedProducts(featuredResult.data);
        setHeroProducts(featuredResult.data.slice(0, 3));
      }
      
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      
      if (allResult.success && allResult.data) {
        const latest = [...allResult.data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);
        setLatestProducts(latest);
      }
      
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
  };

  const handleProductPress = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleCategoryPress = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/store',
      params: { categoryId: category.id, categoryName: category.name }
    });
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/(tabs)/store',
        params: { search: searchText }
      });
    }
  };

  const getUserName = () => {
    const name = user?.displayName || user?.email?.split('@')[0] || 'Bạn';
    return name.length > 12 ? name.substring(0, 12) + '...' : name;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={THEME.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContent}>
          <Animated.View style={[styles.loadingLogo, { opacity: fadeAnim }]}>
            <BlurView intensity={80} tint="light" style={styles.glassLogo}>
              <Ionicons name="logo-apple" size={64} color={THEME.primary} />
            </BlurView>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.loadingTitle}>Apple Store</Text>
            <Text style={styles.loadingSubtitle}>Chuẩn bị trải nghiệm tuyệt vời...</Text>
          </Animated.View>
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 32 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background */}
      <LinearGradient
        colors={['#FFF5F7', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Fixed Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            height: headerHeight,
            opacity: headerOpacity,
          }
        ]}
      >
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        
        <View style={styles.headerContent}>
          {/* Left: Greeting */}
          <View style={styles.greetingWrapper}>
            <View style={styles.greetingIcon}>
              <Ionicons name="sunny" size={20} color={THEME.warning} />
            </View>
            <View>
              <Text style={styles.greetingText}>Xin chào</Text>
              <Text style={styles.userName}>{getUserName()} 👋</Text>
            </View>
          </View>

          {/* Right: Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={THEME.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <View style={styles.cartWrapper}>
                <Ionicons name="cart-outline" size={22} color={THEME.text} />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Fixed Search Bar - Always Visible */}
      <Animated.View 
        style={[
          styles.searchBarContainer,
          {
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              })
            }],
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0.95],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        
        <View style={styles.searchBar}>
          <TouchableOpacity 
            style={styles.searchIcon}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color={THEME.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={THEME.textLight}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          
          {searchText.length > 0 ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Ionicons name="close-circle" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.voiceButton}
              onPress={() => Alert.alert('Tính năng sắp ra mắt', 'Tìm kiếm bằng giọng nói')}
            >
              <Ionicons name="mic-outline" size={18} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.primary}
            colors={[THEME.primary]}
          />
        }
      >
        {/* Hero Banner */}
        <Animated.View 
          style={[
            styles.heroContainer,
            {
              transform: [{ translateY: heroTranslateY }],
              opacity: fadeAnim,
            }
          ]}
        >
          {heroProducts.length > 0 ? (
            <View style={styles.heroWrapper}>
              <Image
                source={{ uri: heroProducts[activeHero]?.imageUrl || 'https://images.unsplash.com/photo-1546054451-aa5b470bcc71' }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              
              <LinearGradient
                colors={['rgba(255, 45, 85, 0.85)', 'rgba(255, 107, 139, 0.75)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              <View style={styles.heroContent}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>NEW</Text>
                </View>
                
                <Text style={styles.heroTitle}>
                  {heroProducts[activeHero]?.name || 'iPhone 15 Pro Max'}
                </Text>
                
                <Text style={styles.heroDescription}>
                  {heroProducts[activeHero]?.description?.substring(0, 60) + '...' || 'Thiết kế Titanium siêu nhẹ, camera 48MP chuyên nghiệp'}
                </Text>
                
                <View style={styles.heroPriceRow}>
                  <Text style={styles.heroPrice}>
                    {heroProducts[activeHero] ? formatPrice(heroProducts[activeHero].price) : '29.990.000đ'}
                  </Text>
                  {heroProducts[activeHero]?.originalPrice && (
                    <Text style={styles.heroOldPrice}>
                      {formatPrice(heroProducts[activeHero].originalPrice)}
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.heroButton}
                  onPress={() => heroProducts[activeHero] && handleProductPress(heroProducts[activeHero])}
                >
                  <LinearGradient
                    colors={['#FFFFFF', 'rgba(255,255,255,0.9)']}
                    style={styles.heroButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.heroButtonText}>Mua ngay</Text>
                    <Ionicons name="arrow-forward" size={18} color={THEME.primary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <LinearGradient
                colors={THEME.gradient}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Apple Store Premium</Text>
                <Text style={styles.heroDescription}>Trải nghiệm công nghệ đỉnh cao</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Dịch vụ nhanh</Text>
          
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickItem}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Animated.View 
                  style={[
                    styles.quickIconWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[`${action.color}20`, `${action.color}10`]}
                    style={styles.quickIconGradient}
                  >
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories - 2 Rows */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => router.push('/(tabs)/store')}
            >
              <Text style={styles.moreText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category as any)}
              >
                <Animated.View 
                  style={[
                    styles.categoryIconContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={category.gradient}
                    style={styles.categoryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="star" size={20} color={THEME.warning} />
              <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => router.push('/(tabs)/store')}
            >
              <Text style={styles.moreText}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
          >
            {featuredProducts.slice(0, 6).map((product, index) => (
              <TouchableOpacity
                key={product.id}
                style={styles.featuredCard}
                onPress={() => handleProductPress(product)}
              >
                <Animated.View 
                  style={[
                    styles.productImageWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [index * 30, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                  
                  {product.badge && (
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>{product.badge}</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.wishlistButton}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Ionicons name="heart-outline" size={20} color={THEME.primary} />
                  </TouchableOpacity>
                </Animated.View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productCategory}>
                    {product.categoryName}
                  </Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price)}
                    </Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Text style={styles.originalPrice}>
                        {formatPrice(product.originalPrice)}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {product.rating?.toFixed(1) || '4.8'} ({product.reviewCount || 128})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Arrivals */}
        <View style={styles.newArrivalsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flash" size={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Mới về</Text>
            </View>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => router.push('/(tabs)/store')}
            >
              <Text style={styles.moreText}>Tất cả mới</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.newArrivalsGrid}>
            {latestProducts.slice(0, 4).map((product, index) => (
              <TouchableOpacity
                key={product.id}
                style={styles.newArrivalCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.newImageContainer}>
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.newImage}
                    resizeMode="cover"
                  />
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
                
                <View style={styles.newInfo}>
                  <Text style={styles.newName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.newPrice}>
                    {formatPrice(product.price)}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={THEME.gradientLight}
            style={styles.footerGradient}
          >
            <View style={styles.footerLogo}>
              <Ionicons name="logo-apple" size={32} color={THEME.primary} />
              <Text style={styles.footerTitle}>Apple Store</Text>
            </View>
            
            <Text style={styles.footerTagline}>
              Chính hãng • Bảo hành 1 năm • Giao hàng miễn phí
            </Text>
            
            <View style={styles.footerStats}>
              <View style={styles.stat}>
                <Ionicons name="checkmark-done" size={16} color={THEME.success} />
                <Text style={styles.statText}>100% Chính hãng</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="shield-checkmark" size={16} color={THEME.primary} />
                <Text style={styles.statText}>Bảo hành 12 tháng</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="rocket" size={16} color={THEME.warning} />
                <Text style={styles.statText}>Giao nhanh 2h</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    marginBottom: 24,
  },
  glassLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
  },
  // Search Bar
  searchBarContainer: {
    position: 'absolute',
    top: HEADER_HEIGHT - 20,
    left: 20,
    right: 20,
    height: SEARCH_HEIGHT,
    zIndex: 999,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
    fontWeight: '500',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  voiceButton: {
    padding: 4,
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT + SEARCH_HEIGHT + 10,
    paddingBottom: 100,
  },
  // Hero
  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    height: 380,
  },
  heroWrapper: {
    flex: 1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  heroTagText: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 22,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  heroPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroOldPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'line-through',
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  heroButtonText: {
    color: THEME.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick Actions
  quickSection: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  quickIconWrapper: {
    marginBottom: 8,
  },
  quickIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
  },
  // Categories
  categoriesSection: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 60) / 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
  },
  // Featured Products
  featuredSection: {
    marginBottom: 28,
  },
  featuredScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 220,
    backgroundColor: THEME.card,
    borderRadius: 24,
    marginRight: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  productImageWrapper: {
    height: 160,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  productBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: THEME.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  productCategory: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: THEME.textSecondary,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  // New Arrivals
  newArrivalsSection: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  newArrivalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  newArrivalCard: {
    width: (width - 60) / 2,
    backgroundColor: THEME.card,
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newImageContainer: {
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  newImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  newInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginRight: 8,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Footer
  footer: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    height: 180,
  },
  footerGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginLeft: 8,
  },
  footerTagline: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});