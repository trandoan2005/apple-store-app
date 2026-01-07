// app/product/[id].tsx - PRODUCT DETAIL PAGE
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { productService, Product, formatPrice } from '../../services/productService';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load product data
  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log(`📦 Loading product detail for ID: ${id}`);
      
      const result = await productService.getProductById(id as string);
      
      if (result.success && result.data) {
        const productData = result.data;
        console.log(`✅ Product loaded: ${productData.name}`);
        setProduct(productData);
        
        // Load related products
        const relatedResult = await productService.getRelatedProducts(productData);
        if (relatedResult.success) {
          setRelatedProducts(relatedResult.data);
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      // TODO: Implement actual cart logic with Firebase
      // For now, just show success message
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert(
        'Thêm thành công',
        `${product.name} đã được thêm vào giỏ hàng`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now function
  const handleBuyNow = () => {
    if (!product) return;
    
    Alert.alert(
      'Mua ngay',
      `Bạn có muốn mua ${product.name} ngay bây giờ?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: () => {
            router.push('/(tabs)/cart');
          }
        }
      ]
    );
  };

  // Calculate final price
  const calculateFinalPrice = () => {
    if (!product) return 0;
    
    let finalPrice = product.price;
    
    // Add storage option price if selected
    if (product.storageOptions && product.storageOptions[selectedStorage]) {
      finalPrice += product.storageOptions[selectedStorage].price;
    }
    
    // Apply discount if any
    if (product.discount && product.discount > 0) {
      finalPrice = finalPrice * (1 - product.discount / 100);
    }
    
    return finalPrice;
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  // Product not found
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Không tìm thấy sản phẩm</Text>
        <Text style={styles.errorText}>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        
        <View style={styles.headerRight}>
          <Pressable style={styles.headerIcon}>
            <Ionicons name="heart-outline" size={22} color="#000" />
          </Pressable>
          <Pressable style={styles.headerIcon}>
            <Ionicons name="share-outline" size={22} color="#000" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: product.images?.[selectedImage] || product.imageUrl }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {product.images.map((image, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.thumbnailWrapper,
                    selectedImage === index && styles.selectedThumbnail
                  ]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image 
                    source={{ uri: image }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.productHeader}>
            <View style={styles.badgeContainer}>
              {product.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.categoryName}</Text>
              </View>
            </View>
            
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= Math.floor(product.rating || 0) ? '#FF9500' : '#C7C7CC'}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.rating?.toFixed(1)} ({product.reviewCount} đánh giá)
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.finalPrice}>{formatPrice(finalPrice)}</Text>
              {product.discount && product.discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discount}%</Text>
                </View>
              )}
            </View>
            
            {product.originalPrice && product.originalPrice > finalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            
            <View style={styles.stockContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
              <Text style={styles.stockText}>
                {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'} • 
                {product.stock > 0 ? ` ${product.stock} sản phẩm có sẵn` : ''}
              </Text>
            </View>
          </View>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={styles.sectionTitle}>Màu sắc</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.colorContainer}
              >
                {product.colors.map((color, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.colorOption,
                      selectedColor === index && styles.selectedColor,
                      { borderColor: color.code }
                    ]}
                    onPress={() => setSelectedColor(index)}
                  >
                    <View 
                      style={[styles.colorCircle, { backgroundColor: color.code }]}
                    />
                    <Text style={styles.colorName}>{color.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Storage Selection */}
          {product.storageOptions && product.storageOptions.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={styles.sectionTitle}>Dung lượng lưu trữ</Text>
              <View style={styles.storageContainer}>
                {product.storageOptions.map((option, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.storageOption,
                      selectedStorage === index && styles.selectedStorage
                    ]}
                    onPress={() => setSelectedStorage(index)}
                  >
                    <Text style={[
                      styles.storageSize,
                      selectedStorage === index && styles.selectedStorageText
                    ]}>
                      {option.size}
                    </Text>
                    {option.price > 0 && (
                      <Text style={[
                        styles.storagePrice,
                        selectedStorage === index && styles.selectedStorageText
                      ]}>
                        +{formatPrice(option.price)}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <Pressable 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? '#C7C7CC' : '#007AFF'} />
              </Pressable>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <Pressable 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Ionicons name="add" size={20} color={quantity >= product.stock ? '#C7C7CC' : '#007AFF'} />
              </Pressable>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>
              {product.description}
            </Text>
          </View>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.specsSection}>
              <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
              <View style={styles.specsGrid}>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <View key={index} style={styles.specItem}>
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.relatedContainer}
              >
                {relatedProducts.map((relatedProduct) => (
                  <Pressable
                    key={relatedProduct.id}
                    style={styles.relatedCard}
                    onPress={() => router.replace(`/product/${relatedProduct.id}`)}
                  >
                    <Image 
                      source={{ uri: relatedProduct.imageUrl }}
                      style={styles.relatedImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {relatedProduct.name}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      {formatPrice(relatedProduct.price)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 1)']}
        style={styles.bottomBar}
      >
        <View style={styles.bottomBarContent}>
          <View style={styles.priceSummary}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatPrice(finalPrice * quantity)}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.actionButton, styles.cartButton]}
              onPress={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
            >
              {addingToCart ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={20} color="#007AFF" />
                  <Text style={styles.cartButtonText}>Thêm vào giỏ</Text>
                </>
              )}
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, styles.buyButton]}
              onPress={handleBuyNow}
              disabled={product.stock <= 0}
            >
              <Text style={styles.buyButtonText}>Mua ngay</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 24,
  },
  mainImage: {
    width: width,
    height: width * 0.8,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#007AFF',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 16,
  },
  productHeader: {
    marginBottom: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: '#32D74B15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#32D74B',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  priceSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 18,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockText: {
    fontSize: 14,
    color: '#32D74B',
    fontWeight: '500',
  },
  selectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  colorContainer: {
    flexDirection: 'row',
  },
  colorOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  selectedColor: {
    backgroundColor: '#007AFF10',
    borderWidth: 2,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  colorName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  storageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  storageOption: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  selectedStorage: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  storageSize: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedStorageText: {
    color: '#007AFF',
  },
  storagePrice: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    width: 60,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  specsSection: {
    marginBottom: 24,
  },
  specsGrid: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  specKey: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedContainer: {
    flexDirection: 'row',
  },
  relatedCard: {
    width: 140,
    marginRight: 16,
  },
  relatedImage: {
    width: 140,
    height: 140,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  bottomSpace: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSummary: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cartButton: {
    backgroundColor: '#007AFF10',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cartButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});