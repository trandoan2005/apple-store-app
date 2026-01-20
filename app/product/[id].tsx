import { View, Text as RNText, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ThemedText as Text } from '../../components/ThemedText';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Product, productService, formatPrice } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { WebAwareImage } from '../../components/WebAwareImage';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        if (id) {
            const res = await productService.getProductById(id as string);
            if (res.success && res.data) {
                setProduct(res.data);
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
                router.back();
            }
        }
        setLoading(false);
    };

    const handleAddToCart = async () => {
        if (product) {
            setLoading(true);
            try {
                await addToCart(product);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading || !product) {
        return (
            <LiquidBackground>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#E11D48" />
                </View>
            </LiquidBackground>
        );
    }

    const images = [product.thumbnail, ...(product.images || [])];

    return (
        <LiquidBackground>
            <Stack.Screen options={{
                headerTransparent: true,
                headerTitle: '',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <GlassCard style={styles.iconButton} intensity={25}>
                            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        </GlassCard>
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity style={styles.backButton}>
                        <GlassCard style={styles.iconButton} intensity={25}>
                            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                        </GlassCard>
                    </TouchableOpacity>
                )
            }} />

            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Cinematic Gallery Section */}
                    <View style={styles.galleryContainer}>
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.mainImageWrapper}>
                            <GlassCard style={styles.mainImageCard} intensity={20}>
                                <WebAwareImage
                                    source={{ uri: images[selectedImage] }}
                                    style={styles.mainImage}
                                    resizeMode="contain"
                                />
                            </GlassCard>
                        </Animated.View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
                            {images.map((img, index) => (
                                <TouchableOpacity key={index} onPress={() => setSelectedImage(index)}>
                                    <GlassCard
                                        style={[styles.thumbCard, selectedImage === index && styles.thumbCardActive]}
                                        intensity={30}
                                    >
                                        <WebAwareImage
                                            source={{ uri: img }}
                                            style={styles.galleryImage}
                                            resizeMode="contain"
                                        />
                                    </GlassCard>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Product Master Info */}
                    <Animated.View entering={FadeInUp.delay(300)} style={styles.masterInfo}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name}>{product.name}</Text>
                            <View style={styles.ratingBox}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingVal}>{product.rating || '4.9'}</Text>
                            </View>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>
                            {product.originalPrice && (
                                <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
                            )}
                        </View>

                        <Text style={styles.description}>{product.description}</Text>

                        {/* Premium Specs Grid */}
                        <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
                        <View style={styles.featureGrid}>
                            <GlassCard intensity={15} style={styles.featureCard}>
                                <Ionicons name="hardware-chip-outline" size={20} color="#38BDF8" />
                                <Text style={styles.featureLabel}>Màn hình</Text>
                                <Text style={styles.featureValue} numberOfLines={1}>Super Retina XDR</Text>
                            </GlassCard>
                            <GlassCard intensity={15} style={styles.featureCard}>
                                <Ionicons name="camera-outline" size={20} color="#E11D48" />
                                <Text style={styles.featureLabel}>Camera</Text>
                                <Text style={styles.featureValue} numberOfLines={1}>Pro System 48MP</Text>
                            </GlassCard>
                            <GlassCard intensity={15} style={styles.featureCard}>
                                <Ionicons name="battery-charging-outline" size={20} color="#10B981" />
                                <Text style={styles.featureLabel}>Pin</Text>
                                <Text style={styles.featureValue} numberOfLines={1}>Lên đến 29h</Text>
                            </GlassCard>
                            <GlassCard intensity={15} style={styles.featureCard}>
                                <Ionicons name="flash-outline" size={20} color="#A855F7" />
                                <Text style={styles.featureLabel}>Chip</Text>
                                <Text style={styles.featureValue} numberOfLines={1}>A17 Pro Bionic</Text>
                            </GlassCard>
                        </View>

                        <Text style={styles.sectionTitle}>Tổng quan</Text>
                        <View style={styles.specsList}>
                            <View style={styles.specLine}>
                                <Text style={styles.specKey}>Bảo hành</Text>
                                <Text style={styles.specVal}>12 tháng chính hãng</Text>
                            </View>
                            <View style={styles.specLine}>
                                <Text style={styles.specKey}>Giao hàng</Text>
                                <Text style={styles.specVal}>Miễn phí toàn quốc</Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Buy Action Bar */}
                <GlassCard style={styles.footer} intensity={80}>
                    <View style={styles.footerContent}>
                        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
                            <Ionicons name="cart-outline" size={26} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buyButton} onPress={() => router.push('/checkout')}>
                            <Text style={styles.buyText}>Sở hữu ngay</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            </View>
        </LiquidBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { marginHorizontal: 20 },
    iconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        marginTop: 0,
    },
    galleryContainer: {
        paddingTop: Platform.OS === 'ios' ? 100 : 70,
        alignItems: 'center',
    },
    mainImageWrapper: {
        width: width,
        height: width * 0.9,
        paddingHorizontal: 24,
    },
    mainImageCard: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 0,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    thumbnails: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    thumbCard: {
        width: 70,
        height: 70,
        borderRadius: 20,
        marginRight: 12,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    thumbCardActive: {
        borderColor: 'rgba(225, 29, 72, 0.5)',
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    masterInfo: {
        padding: 24,
        marginTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 16,
        letterSpacing: -0.5,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    ratingVal: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFF',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 20,
    },
    price: {
        fontSize: 26,
        fontWeight: '900',
        color: '#38BDF8', // Price highlight
    },
    originalPrice: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.4)',
        textDecorationLine: 'line-through',
        fontWeight: '600',
    },
    description: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 32,
    },
    featureCard: {
        width: (width - 60) / 2,
        margin: 6,
        padding: 16,
        borderRadius: 24,
        alignItems: 'flex-start',
        marginTop: 0,
    },
    featureLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 12,
        letterSpacing: 1,
    },
    featureValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '700',
        marginTop: 4,
    },
    specsList: {
        gap: 12,
        paddingBottom: 40,
    },
    specLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    specKey: {
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    specVal: {
        color: '#FFF',
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 0,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cartButton: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    buyButton: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#E11D48',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '900',
    }
});
