import { View, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Product, productService, formatPrice } from '../../services/productService';
import { categoryService, Category } from '../../services/categoryService';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

export default function ManageProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    thumbnail: '',
    description: '',
    stock: '',
    categoryId: '',
    screen: '',
    chip: '',
    ram: '',
    storage: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await categoryService.getAllCategories();
    if (res.success && res.data) {
      setCategories(res.data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const res = await productService.getAllProducts(100);
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      thumbnail: product.thumbnail,
      description: product.description,
      stock: product.stock.toString(),
      categoryId: product.categoryId || '',
      screen: product.specs?.screen || '',
      chip: product.specs?.chip || '',
      ram: product.specs?.ram || '',
      storage: product.specs?.storage || ''
    });
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc chắn?', [
      { text: 'Hủy' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'products', id));
            loadProducts();
          } catch (e) {
            Alert.alert('Lỗi', 'Không thể xóa');
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return Alert.alert('Lỗi', 'Tên và giá là bắt buộc');

    const productData: any = {
      name: form.name,
      brand: form.brand,
      price: parseInt(form.price),
      originalPrice: form.originalPrice ? parseInt(form.originalPrice) : 0,
      thumbnail: form.thumbnail || 'https://via.placeholder.com/150',
      description: form.description,
      stock: parseInt(form.stock) || 0,
      categoryId: form.categoryId,
      specs: {
        screen: form.screen,
        chip: form.chip,
        ram: form.ram,
        storage: form.storage,
      },
      productImages: [form.thumbnail], // Simple placeholder
      updatedAt: new Date().toISOString()
    };

    try {
      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), productData);
      } else {
        productData.createdAt = new Date().toISOString();
        productData.rating = 0;
        productData.reviewCount = 0;
        await addDoc(collection(db, 'products'), productData);
      }
      setEditing(null);
      resetForm();
      loadProducts();
      Alert.alert('Thành công', 'Đã lưu sản phẩm');
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setForm({
      name: '', brand: '', price: '', originalPrice: '', thumbnail: '',
      description: '', stock: '', categoryId: '', screen: '', chip: '', ram: '', storage: ''
    });
  };

  const renderItem = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);
    return (
      <GlassCard style={styles.item} intensity={20}>
        <Image source={{ uri: item.thumbnail }} style={styles.itemImage} resizeMode="contain" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={styles.stock}>Kho: {item.stock}</Text>
            {category && <Text style={[styles.stock, { color: category.color }]}>• {category.name}</Text>}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  const handleResetData = async () => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa hết dữ liệu cũ và tạo dữ liệu mẫu mới?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý', onPress: async () => {
          setLoading(true);
          await productService.resetAndSeedData();
          await loadProducts();
          setLoading(false);
          Alert.alert('Thành công', 'Đã khôi phục dữ liệu mẫu mới!');
        }
      }
    ]);
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kho sản phẩm</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleResetData}>
              <Ionicons name="refresh-circle" size={24} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditing(null); resetForm(); }}>
              <Ionicons name="add-circle" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.listSection}>
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<Text style={styles.sectionTitle}>Sản phẩm hiện có ({products.length})</Text>}
            />
          </View>

          <GlassCard style={styles.formSection} intensity={60}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{editing ? 'CHI TIẾT SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</Text>
                {editing && (
                  <TouchableOpacity onPress={() => { setEditing(null); resetForm(); }}>
                    <Text style={styles.resetText}>HỦY SỬA</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TÊN SẢN PHẨM</Text>
                <TextInput style={styles.input} placeholder="Ví dụ: iPhone 15 Pro" value={form.name} onChangeText={t => setForm({ ...form, name: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1.5 }]}>
                  <Text style={styles.inputLabel}>HÃNG</Text>
                  <TextInput style={styles.input} placeholder="Apple" value={form.brand} onChangeText={t => setForm({ ...form, brand: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>SỐ LƯỢNG KHO</Text>
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={form.stock} onChangeText={t => setForm({ ...form, stock: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>GIÁ BÁN (VNĐ)</Text>
                  <TextInput style={styles.input} placeholder="20,000,000" keyboardType="numeric" value={form.price} onChangeText={t => setForm({ ...form, price: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>GIÁ GỐC</Text>
                  <TextInput style={styles.input} placeholder="25,000,000" keyboardType="numeric" value={form.originalPrice} onChangeText={t => setForm({ ...form, originalPrice: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ẢNH SẢN PHẨM (URL)</Text>
                <TextInput style={styles.input} placeholder="https://..." value={form.thumbnail} onChangeText={t => setForm({ ...form, thumbnail: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
              </View>

              <Text style={styles.inputLabel}>DANH MỤC</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setForm({ ...form, categoryId: cat.id })}
                    style={[
                      styles.catChip,
                      form.categoryId === cat.id && styles.catChipActive
                    ]}
                  >
                    <Text style={[styles.catChipText, form.categoryId === cat.id && styles.catChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>THÔNG SỐ KỸ THUẬT</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <TextInput style={styles.input} placeholder="Màn hình" value={form.screen} onChangeText={t => setForm({ ...form, screen: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <TextInput style={styles.input} placeholder="Chipset" value={form.chip} onChangeText={t => setForm({ ...form, chip: t })} placeholderTextColor="rgba(255,255,255,0.2)" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MÔ TẢ CHI TIẾT</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Nhập mô tả sản phẩm..."
                  multiline
                  value={form.description}
                  onChangeText={t => setForm({ ...form, description: t })}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{editing ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM VÀO KHO'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },

  content: { flex: 1 },
  listSection: { height: '35%' },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 },
  listPadding: { padding: 20 },

  item: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#FFF' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  itemPrice: { fontSize: 13, fontWeight: '800', color: '#FFF', marginTop: 2, opacity: 0.8 },
  stock: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },

  formSection: {
    height: '65%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  formScroll: { padding: 24, paddingBottom: 60 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  formTitle: { fontSize: 12, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  resetText: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: 1.5, marginLeft: 4 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  row: { flexDirection: 'row' },

  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  catChipActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  catChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  catChipTextActive: { color: '#000', fontWeight: '900' },

  saveBtn: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});