// app/(tabs)/cart.tsx - VERSION WITH IMAGES
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (items: any[]) => {
    await AsyncStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
  };

  const handleIncreaseQuantity = (itemId: string) => {
    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updatedItems);
  };

  const handleDecreaseQuantity = (itemId: string) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity - 1;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);
    
    updateCart(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            updateCart(updatedItems);
          }
        }
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^\d]/g, ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
      return;
    }

    Alert.alert(
      'Thanh toán',
      `Tổng tiền: ${calculateTotal().toLocaleString('vi-VN')}đ\n\nBạn có chắc chắn muốn thanh toán?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán',
          onPress: async () => {
            await AsyncStorage.removeItem('cart');
            setCartItems([]);
            Alert.alert(
              'Thành công! 🎉',
              'Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua sắm!',
              [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptyText}>Hãy thêm sản phẩm vào giỏ hàng của bạn</Text>
        <Pressable 
          style={styles.continueShoppingButton}
          onPress={() => router.push('/(tabs)/store')}
        >
          <Text style={styles.continueShoppingText}>Mua sắm ngay</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ hàng của bạn</Text>
          <Text style={styles.itemCount}>{cartItems.length} sản phẩm</Text>
        </View>

        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image 
              source={item.image} 
              style={styles.itemImage}
              resizeMode="contain"
            />
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              
              <View style={styles.quantityControls}>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => handleDecreaseQuantity(item.id)}
                >
                  <Ionicons name="remove" size={16} color="#007AFF" />
                </Pressable>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => handleIncreaseQuantity(item.id)}
                >
                  <Ionicons name="add" size={16} color="#007AFF" />
                </Pressable>
                
                <Text style={styles.itemSubtotal}>
                  {parseFloat(item.price.replace(/[^\d]/g, '')) * item.quantity}đ
                </Text>
              </View>
            </View>
            
            <Pressable 
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </Pressable>
          </View>
        ))}
        
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>Miễn phí</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>
        
        <View style={styles.promoSection}>
          <Ionicons name="gift-outline" size={20} color="#007AFF" />
          <Text style={styles.promoText}>Nhập mã giảm giá</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Tổng tiền:</Text>
          <Text style={styles.footerTotalValue}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f7',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  itemSubtotal: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  promoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    fontSize: 16,
    color: '#666',
  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});