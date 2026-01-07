// app/admin/manage-products.tsx - SAFE RENDERING VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  RefreshControl,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product, formatPrice, productService } from '../../services/productService';

export default function ManageProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // States for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: '',
    discount: '',
    featured: false,
    badge: '',
  });
  const [editing, setEditing] = useState(false);

  // Categories
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'iphone', name: 'iPhone' },
    { id: 'mac', name: 'Mac' },
    { id: 'ipad', name: 'iPad' },
    { id: 'watch', name: 'Watch' },
    { id: 'airpods', name: 'AirPods' },
    { id: 'accessories', name: 'Phụ kiện' },
  ];

  // Badge options
  const badgeOptions = [
    { value: '', label: 'Không có' },
    { value: 'NEW', label: 'Mới' },
    { value: 'BEST SELLER', label: 'Bán chạy' },
    { value: 'SALE', label: 'Giảm giá' },
    { value: 'HOT', label: 'Hot' },
    { value: 'LIMITED', label: 'Giới hạn' },
    { value: 'FEATURED', label: 'Nổi bật' },
  ];

  // Safe product getter
  const getSafeProduct = (product: Product | null) => {
    if (!product) {
      return {
        id: 'unknown',
        name: 'Không xác định',
        price: 0,
        stock: 0,
        categoryId: 'unknown',
        imageUrl: 'https://via.placeholder.com/100',
        featured: false,
        badge: '',
        discount: 0,
        categoryName: 'Không xác định'
      } as Product;
    }
    
    return {
      ...product,
      price: typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0,
      stock: typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 0,
      name: product.name || 'Không có tên',
      categoryName: product.categoryName || product.categoryId || 'Không xác định',
      imageUrl: product.imageUrl || 'https://via.placeholder.com/100',
      discount: product.discount || 0,
      badge: product.badge || '',
      featured: product.featured || false
    };
  };

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading products from Firestore...');
      
      const result = await productService.getAllProducts();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.data.length} products`);
        const safeProducts = result.data.map(p => getSafeProduct(p));
        setProducts(safeProducts);
        setFilteredProducts(safeProducts);
        
        if (result.error) {
          Alert.alert('Thông báo', result.error);
        }
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tải danh sách sản phẩm');
      }
      
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const productName = product.name?.toLowerCase() || '';
        const categoryName = product.categoryName?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        
        return productName.includes(query) ||
               categoryName.includes(query) ||
               description.includes(query);
      });
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId === selectedCategory
      );
    }
    
    // Filter by featured
    if (showFeaturedOnly) {
      filtered = filtered.filter(product => product.featured === true);
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, showFeaturedOnly, products]);

  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    const safeProduct = getSafeProduct(product);
    setCurrentProduct(safeProduct);
    setEditForm({
      name: safeProduct.name,
      price: safeProduct.price.toString(),
      stock: safeProduct.stock.toString(),
      discount: (safeProduct.discount || 0).toString(),
      featured: safeProduct.featured,
      badge: safeProduct.badge,
    });
    setEditModalVisible(true);
  };

  // Save edited product
  const handleSaveEdit = async () => {
    if (!currentProduct) return;
    
    if (!editForm.name.trim() || !editForm.price) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setEditing(true);
    try {
      const productRef = doc(db, 'products', currentProduct.id);
      
      const updateData = {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        discount: Number(editForm.discount) || 0,
        featured: editForm.featured,
        badge: editForm.badge,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(productRef, updateData);
      
      // Update local state
      const updatedProducts = products.map(p => 
        p.id === currentProduct.id 
          ? { ...p, ...updateData }
          : p
      );
      
      setProducts(updatedProducts);
      setEditModalVisible(false);
      Alert.alert('✅ Thành công', 'Đã cập nhật sản phẩm');
      
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    } finally {
      setEditing(false);
    }
  };

  // Delete product
  const handleDeleteProduct = (product: Product) => {
    const safeProduct = getSafeProduct(product);
    
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc muốn xóa "${safeProduct.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', safeProduct.id));
              
              // Update local state
              const updatedProducts = products.filter(p => p.id !== safeProduct.id);
              setProducts(updatedProducts);
              
              Alert.alert('✅ Đã xóa', `Đã xóa sản phẩm "${safeProduct.name}"`);
            } catch (error: any) {
              console.error('❌ Error deleting product:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  // Toggle featured status
  const toggleFeatured = async (product: Product) => {
    const safeProduct = getSafeProduct(product);
    
    try {
      const productRef = doc(db, 'products', safeProduct.id);
      const newFeatured = !safeProduct.featured;
      
      await updateDoc(productRef, {
        featured: newFeatured,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      const updatedProducts = products.map(p => 
        p.id === safeProduct.id 
          ? { ...p, featured: newFeatured }
          : p
      );
      
      setProducts(updatedProducts);
      
      Alert.alert(
        newFeatured ? '⭐ Đã thêm nổi bật' : '📌 Đã bỏ nổi bật',
        `Sản phẩm "${safeProduct.name}" ${newFeatured ? 'đã được đánh dấu là nổi bật' : 'đã được bỏ đánh dấu nổi bật'}`
      );
      
    } catch (error: any) {
      console.error('❌ Error toggling featured:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
    }
  };

  // View product details
  const viewProductDetails = (product: Product) => {
    const safeProduct = getSafeProduct(product);
    router.push({
      pathname: '/product/[id]',
      params: { id: safeProduct.id }
    });
  };

  // Statistics
  const getStats = () => {
    const totalProducts = products.length;
    const featuredProducts = products.filter(p => p.featured).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => {
      const price = typeof p.price === 'number' ? p.price : 0;
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      return sum + (price * stock);
    }, 0);
    
    return { totalProducts, featuredProducts, outOfStock, totalValue };
  };

  const stats = getStats();

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>📦 Quản lý sản phẩm</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/admin/add-product')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Tổng sản phẩm</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={20} color="#FF9500" />
          </View>
          <Text style={styles.statNumber}>{stats.featuredProducts}</Text>
          <Text style={styles.statLabel}>Nổi bật</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="warning" size={20} color="#FF3B30" />
          </View>
          <Text style={styles.statNumber}>{stats.outOfStock}</Text>
          <Text style={styles.statLabel}>Hết hàng</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cash" size={20} color="#32D74B" />
          </View>
          <Text style={styles.statNumber}>
            {(stats.totalValue / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.statLabel}>Tổng giá trị</Text>
        </View>
      </ScrollView>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtons}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.featuredFilterButton,
              showFeaturedOnly && styles.featuredFilterButtonActive
            ]}
            onPress={() => setShowFeaturedOnly(!showFeaturedOnly)}
          >
            <Ionicons 
              name={showFeaturedOnly ? "star" : "star-outline"} 
              size={18} 
              color={showFeaturedOnly ? "#FFFFFF" : "#FF9500"} 
            />
            <Text style={[
              styles.featuredFilterText,
              showFeaturedOnly && styles.featuredFilterTextActive
            ]}>
              Nổi bật
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id || Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào trong cửa hàng'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/admin/add-product')}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Thêm sản phẩm đầu tiên</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const safeItem = getSafeProduct(item);
          
          return (
            <View style={styles.productCard}>
              {/* Product Image */}
              <TouchableOpacity 
                style={styles.productImageContainer}
                onPress={() => viewProductDetails(safeItem)}
              >
                <Image
                  source={{ uri: safeItem.imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                  defaultSource={{ uri: 'https://via.placeholder.com/100' }}
                />
                {safeItem.featured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                  </View>
                )}
                {safeItem.badge && (
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{safeItem.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <TouchableOpacity onPress={() => viewProductDetails(safeItem)}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {safeItem.name}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.productMeta}>
                  <Text style={styles.productCategory}>
                    {safeItem.categoryName}
                  </Text>
                  <Text style={styles.productStock}>
                    {safeItem.stock > 0 ? `📦 ${safeItem.stock} cái` : '⚠️ Hết hàng'}
                  </Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>
                    {formatPrice(safeItem.price)}
                  </Text>
                  {safeItem.discount && safeItem.discount > 0 && (
                    <Text style={styles.productDiscount}>
                      -{safeItem.discount}%
                    </Text>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.featuredAction]}
                  onPress={() => toggleFeatured(safeItem)}
                >
                  <Ionicons 
                    name={safeItem.featured ? "star" : "star-outline"} 
                    size={18} 
                    color={safeItem.featured ? "#FF9500" : "#8E8E93"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.editAction]}
                  onPress={() => handleEditProduct(safeItem)}
                >
                  <Ionicons name="create-outline" size={18} color="#007AFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteAction]}
                  onPress={() => handleDeleteProduct(safeItem)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.productsList}
      />

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Chỉnh sửa sản phẩm</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {currentProduct && (
                <View style={styles.productPreview}>
                  <Image
                    source={{ uri: currentProduct.imageUrl }}
                    style={styles.previewImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/100' }}
                  />
                  <Text style={styles.previewName}>{currentProduct.name}</Text>
                  <Text style={styles.previewCategory}>
                    {currentProduct.categoryName} • ID: {currentProduct.id?.substring(0, 8)}...
                  </Text>
                </View>
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên sản phẩm *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                  placeholder="Nhập tên sản phẩm"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Giá (VND) *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.price}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setEditForm(prev => ({ ...prev, price: cleaned }));
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.formLabel}>Số lượng</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.stock}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setEditForm(prev => ({ ...prev, stock: cleaned }));
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Giảm giá (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.discount}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setEditForm(prev => ({ ...prev, discount: cleaned }));
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Badge</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.badgeOptions}
                >
                  {badgeOptions.map(badge => (
                    <TouchableOpacity
                      key={badge.value}
                      style={[
                        styles.badgeOption,
                        editForm.badge === badge.value && styles.badgeOptionActive
                      ]}
                      onPress={() => setEditForm(prev => ({ ...prev, badge: badge.value }))}
                    >
                      <Text style={[
                        styles.badgeOptionText,
                        editForm.badge === badge.value && styles.badgeOptionTextActive
                      ]}>
                        {badge.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.featuredToggle}>
                <View style={styles.toggleLabel}>
                  <Ionicons name="star" size={20} color="#FF9500" />
                  <Text style={styles.toggleText}>Sản phẩm nổi bật</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    editForm.featured && styles.toggleButtonActive
                  ]}
                  onPress={() => setEditForm(prev => ({ ...prev, featured: !prev.featured }))}
                >
                  <View style={[
                    styles.toggleIndicator,
                    editForm.featured && styles.toggleIndicatorActive
                  ]} />
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
                disabled={editing || !editForm.name.trim() || !editForm.price}
              >
                {editing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    marginRight: 12,
    minWidth: 120,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1D1D1F',
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  featuredFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    marginLeft: 8,
  },
  featuredFilterButtonActive: {
    backgroundColor: '#FF9500',
  },
  featuredFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 6,
  },
  featuredFilterTextActive: {
    color: '#FFFFFF',
  },
  productsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  featuredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  productStock: {
    fontSize: 14,
    color: '#8E8E93',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  productDiscount: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionsContainer: {
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredAction: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  editAction: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  deleteAction: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  productPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewCategory: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  badgeOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badgeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  badgeOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  badgeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  badgeOptionTextActive: {
    color: '#FFFFFF',
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5E7',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FF9500',
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIndicatorActive: {
    transform: [{ translateX: 22 }],
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});