// app/(tabs)/index.tsx - APPLE STORE PREMIUM HOME
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Apple Store chính hãng data
const HERO_BANNER = {
  image: 'https://www.apple.com/v/home/bf/images/heroes/iphone-15-pro/hero_iphone15pro__e9yu2lf3gc8i_large.jpg',
  title: 'iPhone 15 Pro',
  subtitle: 'Titanium. So strong. So light. So Pro.',
  cta: 'Buy'
};

const LATEST_PRODUCTS = [
  {
    id: 'macbook-m3',
    title: 'MacBook Air M3',
    subtitle: 'Supercharged by Apple silicon.',
    image: 'https://www.apple.com/v/home/bf/images/promos/macbook-air-m3/promo_macbookair__fywl7i82fueu_large.jpg',
    color: '#FF9500'
  },
  {
    id: 'watch-series9',
    title: 'Apple Watch Series 9',
    subtitle: 'Smarter. Brighter. Mightier.',
    image: 'https://www.apple.com/v/home/bf/images/promos/apple-watch-series-9/promo_applewatchseries9__cq5b24io4yoi_large.jpg',
    color: '#FF2D55'
  },
  {
    id: 'ipad-air',
    title: 'iPad Air',
    subtitle: 'Powerful. Colorful. Wonderful.',
    image: 'https://www.apple.com/v/home/bf/images/promos/ipad-air/promo_ipadair__gl982t3rqkq6_large.jpg',
    color: '#5856D6'
  },
  {
    id: 'airpods-pro',
    title: 'AirPods Pro',
    subtitle: 'Adaptive Audio. Now playing.',
    image: 'https://www.apple.com/v/home/bf/images/promos/airpods-pro/promo_airpodspro__b7p0hhqn2hde_large.jpg',
    color: '#32D74B'
  },
];

const CATEGORIES = [
  {
    id: 'iphone',
    name: 'iPhone',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_iphone__d0wnev4y6a8m_large.png',
    color: '#007AFF'
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_ipad__e5m3xn31teyu_large.png',
    color: '#5856D6'
  },
  {
    id: 'mac',
    name: 'Mac',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_mac__covlxbvash4i_large.png',
    color: '#FF9500'
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_watch__csqqcayzqueu_large.png',
    color: '#FF2D55'
  },
  {
    id: 'airpods',
    name: 'AirPods',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_airpods__b20u3tqx9kau_large.png',
    color: '#32D74B'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_accessories__cx2e9gs7q3rm_large.png',
    color: '#5AC8FA'
  },
];

const ACCESSORIES_DATA = {
  image: 'https://www.apple.com/v/accessories/bf/images/overview/all_accessories__b1qhukn6ufue_large.jpg',
  title: 'All kinds of accessories.'
};

const HELP_DATA = {
  image: 'https://www.apple.com/v/home/bf/images/home/bts-apple-support/hero_bts_support__f5tg3z2t7c2y_large.jpg',
  title: 'Get help from Apple Specialists.'
};

const FEATURED_PRODUCTS = [
  {
    id: 'iphone15',
    name: 'iPhone 15',
    price: 'Từ 24.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1692923777976',
    badge: 'New'
  },
  {
    id: 'macbookpro',
    name: 'MacBook Pro',
    price: 'Từ 52.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-spacegray-select-202310?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1697317663516',
    badge: null
  },
  {
    id: 'ipadpro',
    name: 'iPad Pro',
    price: 'Từ 25.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-202210?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1664579027556',
    badge: 'M2'
  },
  {
    id: 'watchultra',
    name: 'Apple Watch Ultra',
    price: 'Từ 18.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-202409_GEO_VN?wid=512&hei=512&fmt=jpeg&qlt=90&.v=1723562242804',
    badge: 'New'
  },
];

export default function HomeScreen() {
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUserData();
    loadCartCount();
  }, []);

  const loadUserData = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const name = email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCartCount = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userEmail');
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleAddToCart = async (product: any) => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : [];
      
      const existingIndex = cart.findIndex((item: any) => item.id === product.id);
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      await loadCartCount();
      
      Alert.alert(
        'Thêm thành công',
        `${product.name} đã được thêm vào giỏ hàng`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: '/product/[id]',
      params: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
  };

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/(tabs)/store',
      params: { category: category.name }
    });
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({
        pathname: '/(tabs)/store',
        params: { search: searchText }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Background */}
      <View style={styles.statusBar} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.headerTitle}>Apple Store</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.headerIcon}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <View style={styles.cartContainer}>
                <Ionicons name="cart-outline" size={22} color="#000" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
            
            <Pressable 
              style={styles.headerIcon}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={22} color="#000" />
            </Pressable>
          </View>
        </View>
        
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>
          Xin chào, {userName || 'Khách'} 👋
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm Apple Store..."
          placeholderTextColor="#8E8E93"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} style={styles.clearSearch}>
            <Ionicons name="close-circle" size={18} color="#C7C7CC" />
          </Pressable>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Hero Banner */}
        <Pressable 
          style={styles.heroContainer}
          onPress={() => handleProductPress({ id: 'iphone15pro', name: 'iPhone 15 Pro' })}
        >
          <Image 
            source={{ uri: HERO_BANNER.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{HERO_BANNER.title}</Text>
            <Text style={styles.heroSubtitle}>{HERO_BANNER.subtitle}</Text>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Mua ngay</Text>
            </Pressable>
          </View>
        </Pressable>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
          >
            {FEATURED_PRODUCTS.map((product) => (
              <Pressable
                key={product.id}
                style={styles.featuredCard}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.featuredImageContainer}>
                  <Image 
                    source={{ uri: product.image }}
                    style={styles.featuredImage}
                    resizeMode="contain"
                  />
                  {product.badge && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>{product.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featuredName}>{product.name}</Text>
                <Text style={styles.featuredPrice}>{product.price}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Latest Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
          <View style={styles.latestGrid}>
            {LATEST_PRODUCTS.map((item) => (
              <Pressable
                key={item.id}
                style={styles.latestCard}
                onPress={() => handleProductPress({ id: item.id, name: item.title })}
              >
                <Image 
                  source={{ uri: item.image }}
                  style={styles.latestImage}
                  resizeMode="cover"
                />
                <View style={[styles.latestOverlay, { backgroundColor: item.color + '20' }]} />
                <View style={styles.latestContent}>
                  <Text style={styles.latestTitle}>{item.title}</Text>
                  <Text style={styles.latestSubtitle}>{item.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mua theo danh mục</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                  <Image 
                    source={{ uri: category.icon }}
                    style={styles.categoryIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Accessories */}
        <Pressable 
          style={styles.accessoryContainer}
          onPress={() => router.push('/(tabs)/store')}
        >
          <Image 
            source={{ uri: ACCESSORIES_DATA.image }}
            style={styles.accessoryImage}
            resizeMode="cover"
          />
          <View style={styles.accessoryOverlay} />
          <View style={styles.accessoryContent}>
            <Text style={styles.accessoryTitle}>{ACCESSORIES_DATA.title}</Text>
            <Pressable style={styles.accessoryButton}>
              <Text style={styles.accessoryButtonText}>Xem tất cả</Text>
              <Ionicons name="arrow-forward" size={16} color="#007AFF" />
            </Pressable>
          </View>
        </Pressable>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <Image 
            source={{ uri: HELP_DATA.image }}
            style={styles.helpImage}
            resizeMode="cover"
          />
          <View style={styles.helpOverlay} />
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>{HELP_DATA.title}</Text>
            <Pressable style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Liên hệ hỗ trợ</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons name="logo-apple" size={32} color="#000" />
            <Text style={styles.footerTitle}>Apple Store</Text>
          </View>
          <Text style={styles.footerText}>
            Mua sắm trực tuyến với trải nghiệm Apple chính hãng
          </Text>
          <View style={styles.footerStats}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={20} color="#007AFF" />
              <Text style={styles.statText}>Miễn phí giao hàng</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#32D74B" />
              <Text style={styles.statText}>Bảo hành chính hãng</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="card-outline" size={20} color="#FF9500" />
              <Text style={styles.statText}>Thanh toán an toàn</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBar: {
    height: Platform.OS === 'ios' ? 44 : 24,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    padding: 6,
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  clearSearch: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    height: 380,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  featuredScroll: {
    paddingVertical: 8,
  },
  featuredCard: {
    width: 140,
    marginRight: 16,
  },
  featuredImageContainer: {
    height: 140,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImage: {
    width: '80%',
    height: '80%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  latestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  latestCard: {
    width: (width - 40 - 12) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  latestImage: {
    width: '100%',
    height: '100%',
  },
  latestOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  latestContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  latestSubtitle: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 40 - 24) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  accessoryContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
    position: 'relative',
  },
  accessoryImage: {
    width: '100%',
    height: '100%',
  },
  accessoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  accessoryContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessoryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  accessoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  accessoryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
    position: 'relative',
  },
  helpImage: {
    width: '100%',
    height: '100%',
  },
  helpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  helpContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#F2F2F7',
    padding: 32,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  footerStats: {
    width: '100%',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  bottomSpace: {
    height: 100,
  },
});