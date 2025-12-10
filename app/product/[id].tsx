// app/product/[id].tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  // Parse product data from params
  const product = {
    id: params.id as string,
    name: params.name as string,
    price: params.price as string,
    description: params.description as string,
    image: params.image ? JSON.parse(params.image as string) : null,
  };

  useEffect(() => {
    loadCartCount();
  }, []);

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

  const handleAddToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : [];
      
      const existingIndex = cart.findIndex((item: any) => item.id === product.id);
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
        });
      }
      
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      await loadCartCount();
      
      Alert.alert(
        'Thành công! 🎉',
        `Đã thêm ${quantity} ${product.name} vào giỏ hàng`,
        [
          {
            text: 'Xem giỏ hàng',
            onPress: () => router.push('/(tabs)/cart')
          },
          {
            text: 'Tiếp tục mua sắm',
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        
        <Pressable 
          style={styles.cartButton} 
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        {product.image && (
          <Image 
            source={product.image} 
            style={styles.productImage}
            resizeMode="contain"
          />
        )}

        <View style={styles.content}>
          {/* Product Info */}
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>

          <Text style={styles.productDescription}>
            {product.description}
          </Text>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Chính hãng Apple</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Bảo hành 12 tháng</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Giao hàng miễn phí</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.featureText}>Hỗ trợ 24/7</Text>
              </View>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantitySelector}>
              <Pressable 
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={handleDecreaseQuantity}
                disabled={quantity === 1}
              >
                <Ionicons name="remove" size={20} color={quantity === 1 ? '#999' : '#007AFF'} />
              </Pressable>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <Pressable 
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Pressable style={styles.buyNowButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.buyNowText}>Thêm vào giỏ hàng</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
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
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f7',
  },
  content: {
    padding: 20,
  },
  productHeader: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  features: {
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
    padding: 8,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  buyNowButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});