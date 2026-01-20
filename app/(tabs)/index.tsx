import { StyleSheet, View, Text as RNText, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText as AppText } from '../../components/ThemedText';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { Product, productService, formatPrice } from '../../services/productService';
import { LiquidBackground } from '../../components/LiquidBackground';
import { WebAwareImage } from '../../components/WebAwareImage';
import { categoryService, Category } from '../../services/categoryService';
import { useCart } from '../../contexts/CartContext';
import { GlassCard } from '../../components/GlassCard';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// High-Res curated visuals
const COLLECTIONS = [
  {
    id: 'c1',
    title: 'iPhone 15 Pro',
    subtitle: 'Titanium. Mạnh mẽ. Nhẹ nhàng.',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop',
    align: 'left'
  },
  {
    id: 'c2',
    title: 'MacBook Air 15"',
    subtitle: 'Lớn ấn tượng. Mỏng không tưởng.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop',
    align: 'center'
  },
  {
    id: 'c3',
    title: 'iPad Pro',
    subtitle: 'Siêu năng lực. Siêu thực.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1920&auto=format&fit=crop',
    align: 'right'
  }
];

// Visual Categories Data
const CATEGORIES_VISUAL = [
  { id: 'cat_iphone', name: 'iPhone', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2600&auto=format&fit=crop' },
  { id: 'cat_mac', name: 'Mac', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=2526&auto=format&fit=crop' },
  { id: 'cat_ipad', name: 'iPad', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2000&auto=format&fit=crop' },
  { id: 'cat_watch', name: 'Watch', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=2671&auto=format&fit=crop' },
];

const TRENDING_PRODUCTS = [
  { id: 't1', name: 'AirPods Max', price: 13990000, image: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070&auto=format&fit=crop' },
  { id: 't2', name: 'Apple Vision Pro', price: 89990000, image: 'https://images.unsplash.com/photo-1709532696508-08018dc334b0?q=80&w=1932&auto=format&fit=crop' },
  { id: 't3', name: 'iPad mini', price: 14990000, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2568&auto=format&fit=crop' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const cartItemCount = cart?.itemCount || 0;
  const scrollY = useSharedValue(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts(activeCategory);
    }, [activeCategory])
  );

  const loadCategories = async () => {
    const res = await categoryService.getAllCategories();
    if (res.success && res.data) {
      // Filter out potential duplicates by name
      const uniqueCats = res.data.reduce((acc: Category[], current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);
      setCategories(uniqueCats);
    }
  };

  const loadProducts = async (catId: string | null) => {
    try {
      setLoading(true);
      let res;
      if (catId) {
        res = await productService.getProductsByCategory(catId);
      } else {
        // Showcase only 6 products
        res = await productService.getAllProducts(6);
      }

      if (res.success && res.data) {
        setProducts(res.data);
      } else if (!catId && res.success && (!res.data || res.data.length === 0)) {
        await productService.seedInitialData();
        loadProducts(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  // Animations
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolate.CLAMP);
    return {
      opacity,
      borderBottomWidth: interpolate(scrollY.value, [0, 100], [0, 0.5]),
      borderBottomColor: 'rgba(255,255,255,0.1)'
    };
  });

  const bigTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60], [1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 60], [0, -20], Extrapolate.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const renderCollectionItem = (item: any, index: number) => (
    <View key={item.id} style={styles.collectionCard}>
      <WebAwareImage source={{ uri: item.image }} style={styles.collectionImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />
      <Animated.View
        entering={FadeInDown.delay(index * 200).duration(1000)}
        style={[styles.collectionTextBase,
        item.align === 'center' ? { alignItems: 'center' } :
          item.align === 'right' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }
        ]}
      >
        <AppText style={styles.collectionTitle}>{item.title}</AppText>
        <AppText style={styles.collectionSubtitle}>{item.subtitle}</AppText>
        <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)/store')}>
          <AppText style={styles.shopNowText}>Mua ngay</AppText>
          <Ionicons name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderProduct = (item: Product, index: number) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(index * 50).duration(800)}
      style={styles.productItem}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/product/${item.id}` as any)}
      >
        <GlassCard intensity={15} style={styles.productGlassCard}>
          <View style={styles.productImgWrapper}>
            <WebAwareImage source={{ uri: item.thumbnail }} style={styles.productImg} resizeMode="contain" />
          </View>
          <View style={styles.productMeta}>
            <AppText style={styles.prodName} numberOfLines={1}>{item.name}</AppText>
            <AppText style={styles.prodPrice}>{formatPrice(item.price)}</AppText>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LiquidBackground>

        {/* Sticky Header */}
        <Animated.View style={[styles.stickyHeader, headerStyle]}>
          <BlurView intensity={60} tint="dark" style={styles.headerBlur} />
          <SafeAreaView edges={['top']} style={styles.stickyHeaderContent}>
            <View style={styles.brandRow}>
              <AppText style={styles.brandName}>iCenter</AppText>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
                <GlassCard intensity={10} style={{ padding: 6, borderRadius: 20, marginTop: 0 }}>
                  <Ionicons name="person-outline" size={24} color="#FFF" />
                </GlassCard>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cart' as any)}>
                <GlassCard intensity={10} style={{ padding: 6, borderRadius: 20, marginTop: 0 }}>
                  <Ionicons name="bag-outline" size={24} color="#FFF" />
                  {cartItemCount > 0 && (
                    <View style={styles.badge}><AppText style={styles.badgeTxt}>{cartItemCount}</AppText></View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>


        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <SafeAreaView edges={['top']} style={styles.topSpace}>
            {/* Big Title Area */}
            <Animated.View style={[styles.headerArea, bigTitleStyle]}>
              <View>
                <AppText style={styles.greeting}>Chào mừng đến với</AppText>
                <AppText style={styles.pageTitle}>iCenter</AppText>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cart' as any)} style={styles.bigHeaderIcon}>
                <Ionicons name="bag-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </Animated.View>

            {/* Collections Carousel (Horizontal) */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={width}
              style={{ marginHorizontal: -20, marginBottom: 40 }}
            >
              {COLLECTIONS.map((item, index) => (
                <View key={item.id} style={{ width: width }}>
                  {renderCollectionItem(item, index)}
                </View>
              ))}
            </ScrollView>

            {/* Visual Categories Row (New) */}
            <View style={{ marginBottom: 40 }}>
              <AppText style={[styles.sectionTitle, { marginBottom: 16, paddingHorizontal: 4 }]}>DANH MỤC</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingHorizontal: 0 }}>
                {CATEGORIES_VISUAL.map((cat, index) => (
                  <TouchableOpacity key={cat.id} onPress={() => router.push({ pathname: '/(tabs)/store', params: { category: cat.id } } as any)}>
                    <GlassCard intensity={20} style={styles.catCard}>
                      <WebAwareImage source={{ uri: cat.image }} style={styles.catImage} resizeMode="cover" />
                      <LinearGradient colors={['transparent', '#000']} style={styles.catGradient} />
                      <AppText style={styles.catName}>{cat.name}</AppText>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Promo Banner (New) */}
            <GlassCard style={styles.promoBanner} intensity={30}>
              <View style={styles.promoContent}>
                <AppText style={styles.promoTitle}>Thu cũ đổi mới</AppText>
                <AppText style={styles.promoText}>Nâng cấp iPhone 15 Pro với giá ưu đãi cực khủng.</AppText>
                <TouchableOpacity onPress={() => router.push('/(tabs)/store')}>
                  <AppText style={styles.promoLink}>Xem định giá ngay {'>'}</AppText>
                </TouchableOpacity>
              </View>
              <WebAwareImage
                source={{ uri: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2581&auto=format&fit=crop' }}
                style={styles.promoImage}
                resizeMode="contain"
              />
            </GlassCard>

            {/* Trending / New Arrivals (New) */}
            <View style={{ marginBottom: 40 }}>
              <AppText style={[styles.sectionTitle, { marginBottom: 16, paddingHorizontal: 4 }]}>MỚI VỀ HÀNG</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingHorizontal: 0 }}>
                {TRENDING_PRODUCTS.map((item, index) => (
                  <TouchableOpacity key={item.id} onPress={() => router.push('/(tabs)/store')}>
                    <GlassCard intensity={25} style={styles.trendingCard}>
                      <WebAwareImage source={{ uri: item.image }} style={styles.trendingImg} resizeMode="contain" />
                      <View style={{ padding: 12 }}>
                        <AppText style={styles.trendingName}>{item.name}</AppText>
                        <AppText style={styles.trendingPrice}>{formatPrice(item.price)}</AppText>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Featured Title Row */}
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>SẢN PHẨM NỔI BẬT</AppText>
              <TouchableOpacity onPress={() => router.push('/(tabs)/store')}>
                <AppText style={styles.seeAllText}>Xem tất cả</AppText>
              </TouchableOpacity>
            </View>

            {/* Products Grid - Minimal Showcase */}
            {loading ? (
              <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 40 }} />
            ) : (
              <View>
                <View style={styles.grid}>
                  {products.map((item, index) => renderProduct(item, index))}
                </View>

                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => router.push('/(tabs)/store')}
                >
                  <AppText style={styles.exploreText}>Khám phá Kho sản phẩm</AppText>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            )}

          </SafeAreaView>

        </Animated.ScrollView>
      </LiquidBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
  },
  stickyHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topSpace: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1.5,
  },
  bigHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Collection Card
  collectionCard: {
    width: width - 40,
    height: 480,
    marginHorizontal: 20,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  collectionTextBase: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    right: 40,
  },
  collectionTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  collectionSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    marginRight: 6,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
    marginTop: 10,
    marginBottom: 40,
  },
  exploreText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },

  // Products
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  productItem: {
    width: (width - 56) / 2,
    marginBottom: 24,
  },
  productGlassCard: {
    padding: 0,
    borderRadius: 28,
    marginTop: 0,
    borderWidth: 0, // Let internal logic handle border
  },
  productImgWrapper: {
    width: '100%',
    aspectRatio: 0.9,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImg: {
    width: '90%',
    height: '90%',
  },
  productMeta: {
    padding: 16,
    gap: 4,
  },
  prodName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  prodPrice: {
    color: '#38BDF8', // Cyan/Sky accent for prices
    fontSize: 16,
    fontWeight: '900',
  },

  // Badge
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#020617',
  },
  badgeTxt: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '900',
  },

  // Visual Categories Styles
  catCard: {
    width: 100,
    height: 100,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    marginTop: 0,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catGradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '50%',
  },
  catName: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    textAlign: 'center',
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Promo Banner Styles
  promoBanner: {
    flexDirection: 'row',
    height: 160,
    borderRadius: 32,
    padding: 24,
    marginTop: 0,
    marginBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    lineHeight: 20,
  },
  promoLink: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
  },
  promoImage: {
    width: 120,
    height: 180,
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '15deg' }],
  },

  // Trending Styles
  trendingCard: {
    width: 160,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    marginTop: 0,
  },
  trendingImg: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  trendingName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendingPrice: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
});