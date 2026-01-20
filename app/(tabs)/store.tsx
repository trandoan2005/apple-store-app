import { View, Text as RNText, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, Platform } from 'react-native';
import { ThemedText as Text } from '../../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { Product, productService, formatPrice } from '../../services/productService';
import { categoryService, Category } from '../../services/categoryService';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { WebAwareImage } from '../../components/WebAwareImage';

const SPOTLIGHT_COLLECTIONS = [
    { id: 's1', title: 'iPhone 15 Series', subtitle: 'Titanium Design', image: 'https://images.unsplash.com/photo-1695048133169-ca9fc7876a3e?q=80&w=2670&auto=format&fit=crop' },
    { id: 's2', title: 'MacBook Pro', subtitle: 'M3 Max Chip', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=2526&auto=format&fit=crop' },
    { id: 's3', title: 'iPad Air', subtitle: 'Light. Bright.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2568&auto=format&fit=crop' },
];

const BRANDS = ['All', 'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Asus', 'Nokia'];

export default function StoreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(params.categoryId as string || null);
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (params.categoryId) {
            const catId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
            setSelectedCategoryId(catId);
        }
    }, [params.categoryId]);

    const loadCategories = async () => {
        const res = await categoryService.getAllCategories();
        if (res.success && res.data) {
            setCategories(res.data);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [selectedBrand, selectedCategoryId, searchQuery])
    );

    const loadProducts = async () => {
        console.log('--- StoreScreen: loadProducts ---');
        console.log('Selected Category ID:', selectedCategoryId);
        console.log('Search Query:', searchQuery);

        setLoading(true);
        try {
            let res;
            if (searchQuery.trim().length > 0) {
                res = await productService.searchProducts(searchQuery);
            } else if (selectedCategoryId) {
                console.log('Fetching products by category:', selectedCategoryId);
                res = await productService.getProductsByCategory(selectedCategoryId);
                console.log('Result count:', res.data?.length || 0);
            } else {
                res = await productService.getAllProducts(50);
            }

            if (res.success && res.data) {
                let filtered = res.data;
                if (selectedBrand !== 'All' && searchQuery.trim().length === 0) {
                    filtered = filtered.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
                }
                setProducts(filtered);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.gridItemWrapper}
            onPress={() => router.push(`/product/${item.id}` as any)}
        >
            <GlassCard style={styles.card} intensity={20}>
                <View style={styles.imageWrapper}>
                    <WebAwareImage source={{ uri: item.thumbnail }} style={styles.image} resizeMode="contain" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Store</Text>
                    <GlassCard style={styles.searchBox} intensity={25}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                        <TextInput
                            style={styles.input}
                            placeholder="Tìm kiếm..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </GlassCard>
                </View>

                <View style={styles.filtersSection}>
                    <View style={styles.spotlightSection}>
                        <FlatList
                            horizontal
                            data={SPOTLIGHT_COLLECTIONS}
                            renderItem={({ item }) => (
                                <GlassCard style={styles.spotlightCard} intensity={40}>
                                    <WebAwareImage source={{ uri: item.image }} style={styles.spotlightImg} resizeMode="cover" />
                                    <View style={styles.spotlightOverlay} />
                                    <View style={styles.spotlightText}>
                                        <Text style={styles.spotlightSub}>{item.subtitle}</Text>
                                        <Text style={styles.spotlightTitle}>{item.title}</Text>
                                    </View>
                                </GlassCard>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.spotlightList}
                        />
                    </View>

                    <FlatList
                        horizontal
                        data={[{ id: null, name: 'Tất cả' }, ...categories]}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedCategoryId(item.id)}
                                style={styles.chipWrapper}
                            >
                                <GlassCard
                                    style={[styles.categoryChip, selectedCategoryId === item.id && styles.chipActive]}
                                    intensity={selectedCategoryId === item.id ? 60 : 20}
                                >
                                    <Text style={[styles.chipText, selectedCategoryId === item.id && styles.chipTextActive]}>{item.name}</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id || 'all'}
                        contentContainerStyle={styles.chipsRow}
                    />

                    <FlatList
                        horizontal
                        data={BRANDS}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedBrand(item)}
                                style={styles.chipWrapper}
                            >
                                <GlassCard
                                    style={[styles.brandChip, selectedBrand === item && styles.chipActive]}
                                    intensity={selectedBrand === item ? 60 : 20}
                                >
                                    <Text style={[styles.chipText, selectedBrand === item && styles.chipTextActive]}>{item}</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item}
                        contentContainerStyle={styles.chipsRowLower}
                    />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={<Text style={styles.sectionTitle}>SẢN PHẨM ({products.length})</Text>}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.1)" />
                                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { paddingHorizontal: 24, paddingVertical: 16 },
    headerTitle: { fontSize: 34, fontWeight: '900', color: '#FFF', marginBottom: 16, letterSpacing: -1 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#FFF', fontWeight: '500' },

    // Spotlight
    spotlightSection: { marginBottom: 24 },
    spotlightList: { paddingHorizontal: 24, gap: 16 },
    spotlightCard: { width: 280, height: 160, borderRadius: 32, overflow: 'hidden', padding: 0, borderWidth: 0 },
    spotlightImg: { width: '100%', height: '100%' },
    spotlightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    spotlightText: { position: 'absolute', bottom: 20, left: 20 },
    spotlightTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
    spotlightSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },

    filtersSection: { marginBottom: 8 },
    chipsRow: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
    chipsRowLower: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
    chipWrapper: { marginRight: 0 },
    categoryChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
    brandChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    chipActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
    chipText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 },
    chipTextActive: { color: '#000', fontWeight: '800' },

    list: { paddingHorizontal: 16, paddingBottom: 120 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 20, marginLeft: 8 },

    // Product Item Clean
    gridItemWrapper: { flex: 1, margin: 8, maxWidth: '47%' },
    card: { borderRadius: 32, padding: 0, borderWidth: 0, overflow: 'hidden' }, // No border, full clean
    imageWrapper: { backgroundColor: 'rgba(255,255,255,0.05)', height: 160, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 },
    image: { width: '100%', height: '100%' },
    info: { padding: 16, gap: 6, backgroundColor: 'rgba(0,0,0,0.2)' }, // Darker bottom
    name: { fontSize: 15, fontWeight: '700', color: '#FFF', height: 40, lineHeight: 20 },
    price: { fontSize: 17, fontWeight: '900', color: '#38BDF8' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 15, fontWeight: '600' },
});
