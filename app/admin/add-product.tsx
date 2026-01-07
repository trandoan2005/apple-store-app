import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('iphone');
  const [isFeatured, setIsFeatured] = useState(false); // THÊM TRƯỜNG NÀY

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '0',
    stock: '50',
    badge: '', // THÊM TRƯỜNG BADGE
  });

  const categories = [
    { id: 'iphone', name: 'iPhone', icon: 'phone-portrait-outline' },
    { id: 'mac', name: 'Mac', icon: 'laptop-outline' },
    { id: 'ipad', name: 'iPad', icon: 'tablet-portrait-outline' },
    { id: 'watch', name: 'Watch', icon: 'watch-outline' },
    { id: 'airpods', name: 'AirPods', icon: 'ear-outline' },
    { id: 'accessories', name: 'Phụ kiện', icon: 'hardware-chip-outline' },
  ];

  // Tùy chọn badge
  const badgeOptions = [
    { value: '', label: 'Không có' },
    { value: 'NEW', label: 'Mới' },
    { value: 'BEST SELLER', label: 'Bán chạy' },
    { value: 'SALE', label: 'Giảm giá' },
    { value: 'HOT', label: 'Hot' },
    { value: 'LIMITED', label: 'Giới hạn' },
  ];

  // Ảnh mặc định từ Unsplash - THÊM NHIỀU ẢNH HƠN
  const getDefaultImages = (category: string) => {
    const imageSets: Record<string, string[]> = {
      iphone: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&auto=format&fit=crop',
      ],
      mac: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&auto=format&fit=crop',
      ],
      ipad: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop',
      ],
      watch: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop',
      ],
      airpods: [
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1588156979341-b5c8d6257f32?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&auto=format&fit=crop',
      ],
      accessories: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop',
      ],
    };
    return imageSets[category] || imageSets.iphone;
  };

  // Thông số kỹ thuật mặc định
  const getDefaultSpecs = (category: string) => {
    const specs: Record<string, Record<string, string>> = {
      iphone: {
        'Màn hình': '6.1 inch Super Retina XDR',
        'Chip': 'Apple A17 Pro',
        'Camera': 'Camera chính 48MP',
        'Pin': 'Lên đến 24 giờ',
        'Hệ điều hành': 'iOS 17',
        'Kích thước': '146.6 x 70.6 x 8.25 mm',
        'Trọng lượng': '187g',
      },
      mac: {
        'Chip': 'Apple M3',
        'RAM': '8GB Unified Memory',
        'SSD': '256GB',
        'Màn hình': '13.6 inch Liquid Retina',
        'Pin': 'Lên đến 18 giờ',
        'Kích thước': '304.1 x 215.0 x 15.6 mm',
        'Trọng lượng': '1.24kg',
      },
      ipad: {
        'Màn hình': '11 inch Liquid Retina',
        'Chip': 'Apple M2',
        'Lưu trữ': '128GB',
        'Hỗ trợ bút': 'Apple Pencil (thế hệ 2)',
        'Hệ điều hành': 'iPadOS 17',
        'Kích thước': '247.6 x 178.5 x 5.9 mm',
        'Trọng lượng': '466g',
      },
      watch: {
        'Màn hình': 'Always-On Retina',
        'Chip': 'Apple S9',
        'Kích thước': '45mm',
        'Chống nước': 'WR50+',
        'Pin': 'Lên đến 36 giờ',
        'Chất liệu': 'Nhôm hoặc Thép không gỉ',
        'Dây đeo': 'Silicone thể thao',
      },
      airpods: {
        'Loại': 'Tai nghe không dây',
        'Chip': 'Apple H2',
        'Thời lượng pin': '6 giờ (nghe nhạc)',
        'Chống nước': 'IPX4',
        'Kết nối': 'Bluetooth 5.3',
        'Chống ồn': 'Active Noise Cancellation',
      },
      accessories: {
        'Chất liệu': 'Silicon cao cấp',
        'Màu sắc': 'Đa dạng',
        'Tương thích': 'iPhone, iPad, Mac',
        'Bảo hành': '1 năm',
        'Xuất xứ': 'Trung Quốc',
        'Đóng gói': 'Hộp chính hãng Apple',
      },
    };
    return specs[category] || specs.iphone;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá sản phẩm hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const images = getDefaultImages(selectedCategory);
      const specs = getDefaultSpecs(selectedCategory);
      const selectedCat = categories.find(c => c.id === selectedCategory);

      // Từ khóa tìm kiếm - CẢI THIỆN
      const keywords = [
        formData.name.toLowerCase(),
        selectedCategory,
        ...formData.name.toLowerCase().split(' '),
        'apple',
        'chính hãng',
        selectedCat?.name.toLowerCase() || 'iphone',
      ].filter(Boolean);

      // QUAN TRỌNG: Thêm featured vào product data
      const productData = {
        productId,
        name: formData.name.trim(),
        description: formData.description.trim() || 
                   `${formData.name} - Sản phẩm chính hãng Apple với công nghệ tiên tiến nhất. Thiết kế sang trọng, hiệu năng mạnh mẽ, trải nghiệm người dùng vượt trội.`,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        discount: Number(formData.discount) || 0,
        categoryId: selectedCategory,
        categoryName: selectedCat?.name || 'iPhone',
        imageUrl: images[0],
        images: images,
        keywords: [...new Set(keywords)], // Loại bỏ trùng lặp
        stock: Number(formData.stock) || 50,
        featured: isFeatured, // ⭐ QUAN TRỌNG: ĐÁNH DẤU SẢN PHẨM NỔI BẬT
        badge: formData.badge, // Thêm badge
        rating: 4.5 + (Math.random() * 0.5), // Random rating 4.5-5.0
        reviewCount: Math.floor(Math.random() * 200) + 100, // Random reviews 100-300
        specifications: {
          ...specs,
          'Thương hiệu': 'Apple',
          'Bảo hành': '12 tháng chính hãng',
          'Xuất xứ': 'Trung Quốc',
          'Phụ kiện kèm theo': 'Cáp USB-C, Sạc, HDSD',
        },
        colors: [
          { name: 'Đen', code: '#1D1D1F', image: images[1] },
          { name: 'Trắng', code: '#FFFFFF', image: images[2] },
          { name: 'Xám Titan', code: '#8E8E93', image: images[3] },
          { name: 'Xanh', code: '#5AC8FA', image: images[0] }
        ],
        storageOptions: [
          { size: '128GB', price: 0 },
          { size: '256GB', price: Number(formData.price) * 0.15 }, // 15% more
          { size: '512GB', price: Number(formData.price) * 0.30 }, // 30% more
          { size: '1TB', price: Number(formData.price) * 0.50 } // 50% more
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('📤 Sending product data:', {
        name: productData.name,
        featured: productData.featured,
        price: productData.price
      });

      // Lưu vào Firestore
      const docRef = await addDoc(collection(db, 'products'), productData);

      Alert.alert(
        '✅ Thành công!',
        `Đã thêm "${formData.name}"\nID: ${docRef.id}\n${isFeatured ? '⭐ Đã đánh dấu là sản phẩm nổi bật' : ''}`,
        [
          {
            text: 'Thêm sản phẩm khác',
            onPress: () => {
              // Reset form nhưng giữ category và featured
              setFormData({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                discount: '0',
                stock: '50',
                badge: '',
              });
              // KHÔNG reset isFeatured
            }
          },
          {
            text: 'Về trang chủ',
            onPress: () => router.push('/')
          },
          {
            text: 'Xem sản phẩm',
            onPress: () => router.push('/(tabs)/store')
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Error adding product:', error);
      Alert.alert('❌ Lỗi', `Không thể thêm sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleProduct = (type: string) => {
    const samples: any = {
      iphone: {
        name: 'iPhone 15 Pro Max 256GB',
        price: '32990000',
        originalPrice: '34990000',
        description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP chuyên nghiệp, thiết kế Titanium siêu nhẹ. Màn hình Super Retina XDR 6.7 inch, hỗ trợ Dynamic Island.',
        discount: '5',
        stock: '100',
        badge: 'BEST SELLER',
      },
      mac: {
        name: 'MacBook Pro 14 inch M3 Pro',
        price: '42990000',
        originalPrice: '44990000',
        description: 'MacBook Pro 14 inch với chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz, RAM 18GB, SSD 512GB. Hiệu năng vượt trội cho công việc sáng tạo.',
        discount: '3',
        stock: '50',
        badge: 'NEW',
      },
      ipad: {
        name: 'iPad Pro 11 inch M2 256GB',
        price: '22990000',
        originalPrice: '24990000',
        description: 'iPad Pro 11 inch với chip M2, màn hình Liquid Retina 120Hz, hỗ trợ Apple Pencil 2 và Magic Keyboard. Hoàn hảo cho sáng tạo và làm việc di động.',
        discount: '8',
        stock: '75',
        badge: 'SALE',
      },
      watch: {
        name: 'Apple Watch Series 9 GPS 45mm',
        price: '11990000',
        originalPrice: '12990000',
        description: 'Apple Watch Series 9 với chip S9, màn hình Always-On Retina, theo dõi sức khỏe toàn diện. Tương thích với tất cả iPhone từ đời 8 trở lên.',
        discount: '7',
        stock: '80',
        badge: 'HOT',
      },
      airpods: {
        name: 'AirPods Pro (Thế hệ 2)',
        price: '5990000',
        originalPrice: '6990000',
        description: 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động gấp đôi, thời lượng pin 6 giờ. Tích hợp MagSafe và hộp sạc có loa.',
        discount: '14',
        stock: '150',
        badge: 'BEST SELLER',
      },
    };

    if (samples[type]) {
      const sample = samples[type];
      setFormData(prev => ({
        ...prev,
        ...sample,
        originalPrice: sample.originalPrice || sample.price,
      }));
      
      setSelectedCategory(type);
      setIsFeatured(true); // Mẫu mặc định là featured
      Alert.alert('✅', `Đã tải mẫu ${type}\nĐã bật chế độ nổi bật`);
    }
  };

  // Hàm thêm nhiều sản phẩm cùng lúc
  const addMultipleProducts = async () => {
    setLoading(true);
    
    const productTemplates = [
      {
        name: 'iPhone 15 128GB',
        price: '21990000',
        category: 'iphone',
        featured: true,
        badge: 'NEW'
      },
      {
        name: 'MacBook Air M2 13 inch',
        price: '27990000',
        category: 'mac',
        featured: true,
        badge: 'BEST SELLER'
      },
      {
        name: 'iPad Air 10.9 inch M1',
        price: '16990000',
        category: 'ipad',
        featured: true,
        badge: 'SALE'
      },
      {
        name: 'Apple Watch SE 40mm',
        price: '6990000',
        category: 'watch',
        featured: true,
        badge: 'HOT'
      },
      {
        name: 'AirPods 3',
        price: '4990000',
        category: 'airpods',
        featured: true,
        badge: 'LIMITED'
      },
    ];

    let successCount = 0;
    
    for (const template of productTemplates) {
      try {
        const images = getDefaultImages(template.category);
        const specs = getDefaultSpecs(template.category);
        
        const productData = {
          productId: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: template.name,
          description: `${template.name} - Sản phẩm chính hãng Apple với công nghệ tiên tiến nhất.`,
          price: Number(template.price),
          originalPrice: Number(template.price) * 1.1,
          discount: 10,
          categoryId: template.category,
          categoryName: template.category.charAt(0).toUpperCase() + template.category.slice(1),
          imageUrl: images[0],
          images: images,
          stock: 50,
          featured: template.featured,
          badge: template.badge,
          rating: 4.5 + (Math.random() * 0.5),
          reviewCount: Math.floor(Math.random() * 200) + 100,
          specifications: specs,
          keywords: [template.category, 'apple', template.name.toLowerCase()],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'products'), productData);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Lỗi thêm ${template.name}:`, error);
      }
    }
    
    setLoading(false);
    Alert.alert(
      '✅ Hoàn thành!',
      `Đã thêm ${successCount}/${productTemplates.length} sản phẩm nổi bật vào cửa hàng.`,
      [
        { text: 'OK', onPress: () => router.push('/') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>➕ Thêm Sản Phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Chọn danh mục */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chọn danh mục</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.id ? '#fff' : '#007AFF'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Thiết lập sản phẩm nổi bật */}
        <View style={styles.section}>
          <View style={styles.featuredContainer}>
            <View style={styles.featuredLabel}>
              <Ionicons name="star" size={20} color="#FF9500" />
              <Text style={styles.featuredLabelText}>Sản phẩm nổi bật</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: '#C7C7CC', true: '#FFD700' }}
              thumbColor={isFeatured ? '#FF9500' : '#f4f3f4'}
            />
          </View>
          
          <Text style={styles.featuredDescription}>
            {isFeatured 
              ? '⭐ Sản phẩm sẽ xuất hiện ở mục "Sản phẩm nổi bật" trên trang chủ'
              : 'Sản phẩm sẽ chỉ hiển thị ở danh mục tương ứng'}
          </Text>
        </View>

        {/* Badge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Badge sản phẩm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeContainer}>
            {badgeOptions.map((badge) => (
              <TouchableOpacity
                key={badge.value}
                style={[
                  styles.badgeButton,
                  formData.badge === badge.value && styles.badgeButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, badge: badge.value }))}
              >
                <Text style={[
                  styles.badgeText,
                  formData.badge === badge.value && styles.badgeTextActive
                ]}>
                  {badge.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Thông tin sản phẩm</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: iPhone 15 Pro Max 256GB"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả sản phẩm</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về sản phẩm..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Giá bán (VND) *</Text>
              <TextInput
                style={styles.input}
                placeholder="32990000"
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Giá gốc (VND)</Text>
              <TextInput
                style={styles.input}
                placeholder="34990000"
                value={formData.originalPrice}
                onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Giảm giá (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.discount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, discount: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Số lượng</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                value={formData.stock}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Mẫu nhanh */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Mẫu nhanh</Text>
          <View style={styles.sampleButtons}>
            {['iphone', 'mac', 'ipad', 'watch', 'airpods'].map((type) => (
              <TouchableOpacity 
                key={type}
                style={styles.sampleButton}
                onPress={() => loadSampleProduct(type)}
              >
                <Ionicons 
                  name={
                    type === 'iphone' ? 'phone-portrait' :
                    type === 'mac' ? 'laptop' :
                    type === 'ipad' ? 'tablet-portrait' :
                    type === 'watch' ? 'watch' :
                    'ear'
                  } 
                  size={18} 
                  color="#007AFF" 
                />
                <Text style={styles.sampleButtonText}>
                  {type === 'iphone' ? 'iPhone' :
                   type === 'mac' ? 'Mac' :
                   type === 'ipad' ? 'iPad' :
                   type === 'watch' ? 'Watch' : 'AirPods'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nút thêm nhanh nhiều sản phẩm */}
        <TouchableOpacity 
          style={styles.multiAddButton}
          onPress={addMultipleProducts}
          disabled={loading}
        >
          <Ionicons name="add-circle-outline" size={22} color="#32D74B" />
          <Text style={styles.multiAddText}>Thêm 5 sản phẩm nổi bật mẫu</Text>
        </TouchableOpacity>

        {/* Nút thêm chính */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!formData.name || !formData.price) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!formData.name || !formData.price || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isFeatured ? '⭐ Thêm Sản Phẩm Nổi Bật' : 'Thêm Sản Phẩm'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          {isFeatured ? '⭐ Sản phẩm sẽ xuất hiện ngay trên trang chủ' : '📝 Sản phẩm sẽ được thêm vào cửa hàng'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
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
    color: '#000',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f2f2f7',
    gap: 8,
    minWidth: 110,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  categoryTextActive: {
    color: '#fff',
  },
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  badgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  badgeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  badgeTextActive: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  sampleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sampleButton: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
  },
  sampleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  multiAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#32D74B',
  },
  multiAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32D74B',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#c7c7cc',
    shadowColor: '#c7c7cc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 40,
  },
});