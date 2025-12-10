// app/(tabs)/store.tsx - PREMIUM APPLE STORE DESIGN
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Premium Apple Store products - Sử dụng ảnh từ Apple chính hãng
const APPLE_PRODUCTS = [
  {
    id: 'iphone15pro',
    name: 'iPhone 15 Pro',
    description: 'Titanium. So strong. So light. So Pro.',
    price: '29.999.000đ',
    originalPrice: '32.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1693009279096',
    category: 'iPhone',
    badge: 'MỚI',
    colors: ['#1d1d1f', '#e3e4e6', '#fad7dd', '#aee1ff']
  },
  {
    id: 'iphone15',
    name: 'iPhone 15',
    description: 'Dynamic Island. Màu sắc rực rỡ.',
    price: '24.999.000đ',
    originalPrice: '27.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1692923777976',
    category: 'iPhone',
    badge: 'MỚI',
    colors: ['#1d1d1f', '#e3e4e6', '#fad7dd', '#aee1ff']
  },
  {
    id: 'macbookair',
    name: 'MacBook Air',
    description: 'Siêu mỏng nhẹ. Chip M3.',
    price: '32.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653499620093',
    category: 'Mac',
    badge: 'MỚI',
    colors: ['#1d1d1f', '#e3e4e6']
  },
  {
    id: 'macbookpro',
    name: 'MacBook Pro 16"',
    description: 'Hiệu năng đột phá. M3 Pro/Max.',
    price: '52.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697317663516',
    category: 'Mac',
    badge: 'PRO',
    colors: ['#1d1d1f', '#e3e4e6']
  },
  {
    id: 'ipadpro',
    name: 'iPad Pro',
    description: 'M2 chip. Màn hình Liquid Retina.',
    price: '25.999.000đ',
    originalPrice: '28.999.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-finish-select-202210?wid=512&hei=512&fmt=p-jpg&qlt=95&.v=1664579027556',
    category: 'iPad',
    badge: 'MỚI',
    colors: ['#1d1d1f', '#e3e4e6']
  },
  {
    id: 'watch9',
    name: 'Apple Watch Series 9',
    description: 'Thông minh hơn. Sáng hơn.',
    price: '11.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-case-41-aluminum-midnight-cell-9double?wid=512&hei=512&fmt=jpeg&qlt=90&.v=1687984884935',
    category: 'Watch',
    badge: 'MỚI',
    colors: ['#1d1d1f', '#e3e4e6', '#fad7dd']
  },
  {
    id: 'watchultra2',
    name: 'Apple Watch Ultra 2',
    description: 'Mạnh mẽ nhất từ trước đến nay.',
    price: '18.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-202409_GEO_VN?wid=512&hei=512&fmt=jpeg&qlt=90&.v=1723562242804',
    category: 'Watch',
    badge: 'ULTRA',
    colors: ['#1d1d1f']
  },
  {
    id: 'airpodspro',
    name: 'AirPods Pro',
    description: 'Chủ động khử ồn. Âm thanh không gian.',
    price: '7.990.000đ',
    originalPrice: '8.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=890&hei=890&fmt=jpeg&qlt=90&.v=1723578315203',
    category: 'AirPods',
    badge: 'MỚI',
    colors: ['#1d1d1f']
  },
  {
    id: 'airpodsmax',
    name: 'AirPods Max',
    description: 'Chất lượng âm thanh đỉnh cao.',
    price: '12.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-skyblue-202006?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1593640833000',
    category: 'AirPods',
    badge: null,
    colors: ['#1d1d1f', '#e3e4e6', '#ffd700']
  },
  {
    id: 'magickeyboard',
    name: 'Magic Keyboard',
    description: 'Không dây. Backlit.',
    price: '3.290.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MK2A3?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1628010791000',
    category: 'Accessories',
    badge: null,
    colors: ['#1d1d1f', '#e3e4e6']
  },
  {
    id: 'applepencil',
    name: 'Apple Pencil',
    description: 'Viết vẽ chân thực.',
    price: '3.490.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU8F2?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1628010791000',
    category: 'Accessories',
    badge: null,
    colors: ['#1d1d1f']
  },
  {
    id: 'homepod',
    name: 'HomePod',
    description: 'Âm thanh đầy đắn.',
    price: '8.990.000đ',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/homepod-mini-select-blue-202110?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1632925517000',
    category: 'Accessories',
    badge: null,
    colors: ['#1d1d1f', '#e3e4e6', '#fad7dd']
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline', color: '#007AFF' },
  { id: 'iPhone', name: 'iPhone', icon: 'phone-portrait-outline', color: '#007AFF' },
  { id: 'Mac', name: 'Mac', icon: 'laptop-outline', color: '#FF9500' },
  { id: 'iPad', name: 'iPad', icon: 'tablet-portrait-outline', color: '#5856D6' },
  { id: 'Watch', name: 'Watch', icon: 'watch-outline', color: '#FF2D55' },
  { id: 'AirPods', name: 'AirPods', icon: 'headset-outline', color: '#32D74B' },
  { id: 'Accessories', name: 'Phụ kiện', icon: 'cog-outline', color: '#5AC8FA' },
];

export default function StoreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = useCallback(async () => {
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
  }, []);

  const handleAddToCart = useCallback(async (product: any) => {
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
          category: product.category,
          description: product.description,
          colors: product.colors
        });
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      await loadCartCount();
      
      // Haptic feedback (nếu cần)
      // if (Platform.OS === 'ios') {
      //   const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
      //   impactAsync(ImpactFeedbackStyle.Light);
      // }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [loadCartCount]);

  const handleProductPress = useCallback((product: any) => {
    // Đảm bảo có file app/product/[id].tsx
    router.push({
      pathname: '/product/[id]',
      params: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        colors: JSON.stringify(product.colors),
        originalPrice: product.originalPrice || '',
        category: product.category,
        badge: product.badge || ''
      }
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return APPLE_PRODUCTS.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryCount = useCallback((categoryId: string) => {
    if (categoryId === 'all') return APPLE_PRODUCTS.length;
    return APPLE_PRODUCTS.filter(p => p.category === categoryId).length;
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  const renderProductCard = useCallback((product: any) => (
    <Pressable
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ 
            uri: product.image,
            cache: 'force-cache' // Tối ưu cache ảnh
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
        {product.badge && (
          <View style={[
            styles.productBadge,
            { 
              backgroundColor: product.badge === 'MỚI' ? '#007AFF' : 
                             product.badge === 'PRO' ? '#5856D6' :
                             product.badge === 'ULTRA' ? '#FF9500' : '#007AFF'
            }
          ]}>
            <Text style={styles.productBadgeText}>{product.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          )}
        </View>

        <View style={styles.productFooter}>
          <View style={styles.colorsContainer}>
            {product.colors.slice(0, 3).map((color: string, index: number) => (
              <View
                key={index}
                style={[styles.colorDot, { backgroundColor: color }]}
              />
            ))}
            {product.colors.length > 3 && (
              <Text style={styles.moreColors}>+{product.colors.length - 3}</Text>
            )}
          </View>
          
          <Pressable
            style={styles.addButton}
            onPress={() => handleAddToCart(product)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  ), [handleProductPress, handleAddToCart]);

  const renderCategoryChip = useCallback((category: any) => {
    const isActive = selectedCategory === category.id;
    const count = getCategoryCount(category.id);
    
    return (
      <Pressable
        key={category.id}
        style={[
          styles.categoryChip,
          isActive && styles.categoryChipActive,
          isActive && { borderColor: category.color }
        ]}
        onPress={() => handleCategoryPress(category.id)}
      >
        <Ionicons 
          name={category.icon as any} 
          size={18} 
          color={isActive ? category.color : '#8E8E93'} 
          style={styles.categoryIcon}
        />
        <Text style={[
          styles.categoryText,
          isActive && styles.categoryTextActive,
          isActive && { color: category.color }
        ]}>
          {category.name}
        </Text>
        <View style={[
          styles.categoryCount,
          isActive && { backgroundColor: category.color + '20' }
        ]}>
          <Text style={[
            styles.categoryCountText,
            isActive && styles.categoryCountTextActive,
            isActive && { color: category.color }
          ]}>
            {count}
          </Text>
        </View>
      </Pressable>
    );
  }, [selectedCategory, getCategoryCount, handleCategoryPress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Cửa hàng</Text>
            <Text style={styles.subtitle}>Cách tốt nhất để mua sản phẩm bạn yêu thích.</Text>
          </View>
          <Pressable 
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={18} color="#C7C7CC" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>

      {/* Products Grid */}
      <ScrollView 
        style={styles.productsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredProducts.length === 0 ? styles.emptyScrollContent : undefined}
      >
        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map(renderProductCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptyText}>
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </Text>
            <Pressable 
              style={styles.emptyButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={styles.emptyButtonText}>Xem tất cả sản phẩm</Text>
            </Pressable>
          </View>
        )}

        {/* Store Footer */}
        {filteredProducts.length > 0 && (
          <View style={styles.storeFooter}>
            <View style={styles.footerRow}>
              <Ionicons name="cube-outline" size={20} color="#007AFF" />
              <Text style={styles.footerText}>Giao hàng miễn phí toàn quốc</Text>
            </View>
            <View style={styles.footerRow}>
              <Ionicons name="refresh-outline" size={20} color="#007AFF" />
              <Text style={styles.footerText}>Đổi trả trong 14 ngày</Text>
            </View>
            <View style={styles.footerRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#007AFF" />
              <Text style={styles.footerText}>Bảo hành chính hãng Apple</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
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
  categoriesScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF15',
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  categoryCount: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  categoryCountTextActive: {
    fontWeight: '700',
  },
  productsScroll: {
    flex: 1,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  productsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    }),
  },
  productImageContainer: {
    height: 160,
    backgroundColor: '#F2F2F7',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 22,
  },
  productDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#C7C7CC',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  moreColors: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  storeFooter: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    gap: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
});