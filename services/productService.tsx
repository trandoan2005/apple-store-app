import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    doc,
    getDoc,
    updateDoc,
    Timestamp,
    addDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Product {
    id: string;
    name: string;
    brand: string; // Apple, Samsung, Xiaomi, etc.
    price: number;
    originalPrice?: number;
    description: string;
    thumbnail: string;
    images: string[];
    specs: {
        screen?: string;
        chip?: string;
        ram?: string;
        storage?: string;
        battery?: string;
        camera?: string;
        [key: string]: string | undefined;
    };
    stock: number;
    rating: number;
    reviewCount: number;
    categoryId: string; // phone, tablet, accessory
    isHot?: boolean;
    isSale?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

export const calculateDiscountPercent = (price: number, originalPrice?: number): number => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
};

import { categoryService } from './categoryService';

class ProductService {
    private collectionName = 'products';

    // Dangerous: Reset all data
    async resetAndSeedData(): Promise<void> {
        try {
            // 1. Delete all existing products
            const q = query(collection(db, this.collectionName));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // 2. Reseed categories (fixed IDs)
            await categoryService.seedInitialCategories();

            // 3. Reseed products
            await this.seedInitialData();
        } catch (e) {
            console.error('Error resetting data:', e);
            throw e;
        }
    }

    // Seed data function - call this once to populate Firestore if empty
    async seedInitialData(): Promise<void> {
        const dummyProducts: Omit<Product, 'id'>[] = [
            // PHONES
            {
                name: 'iPhone 15 Pro Max 256GB',
                brand: 'Apple',
                price: 33990000,
                originalPrice: 34990000,
                description: 'iPhone 15 Pro Max. Thiết kế Titan chuẩn hàng không vũ trụ. Chip A17 Pro mạnh mẽ.',
                thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '6.7" OLED', chip: 'A17 Pro', ram: '8GB', storage: '256GB' },
                stock: 50, rating: 4.9, reviewCount: 120, categoryId: 'phone', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'iPhone 15 128GB',
                brand: 'Apple',
                price: 19990000,
                originalPrice: 22990000,
                description: 'iPhone 15 với Dynamic Island và camera 48MP.',
                thumbnail: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '6.1" OLED', chip: 'A16 Bionic', ram: '6GB', storage: '128GB' },
                stock: 100, rating: 4.7, reviewCount: 80, categoryId: 'phone', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Samsung Galaxy S24 Ultra',
                brand: 'Samsung',
                price: 29990000,
                originalPrice: 33990000,
                description: 'Quyền năng Galaxy AI. Camera 200MP.',
                thumbnail: 'https://images.unsplash.com/photo-1706782483584-7a3ac0d6323c?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '6.8" AMOLED', chip: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB' },
                stock: 30, rating: 4.8, reviewCount: 85, categoryId: 'phone', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Samsung Galaxy Z Fold5',
                brand: 'Samsung',
                price: 35990000,
                originalPrice: 40990000,
                description: 'Mở rộng thế giới với màn hình gập đỉnh cao.',
                thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop',
                images: [],
                specs: { screen: '7.6" Dynamic AMOLED', chip: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '512GB' },
                stock: 10, rating: 4.6, reviewCount: 45, categoryId: 'phone', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Xiaomi 14 Ultra',
                brand: 'Xiaomi',
                price: 26990000,
                originalPrice: 29990000,
                description: 'Hệ thống ống kính Leica huyền thoại.',
                thumbnail: 'https://images.unsplash.com/photo-1662947211833-289886369599?q=80&w=2071&auto=format&fit=crop',
                images: [],
                specs: { screen: '6.73" AMOLED', chip: 'Snapdragon 8 Gen 3', ram: '16GB', storage: '512GB' },
                stock: 15, rating: 4.7, reviewCount: 30, categoryId: 'phone', isHot: true, isSale: false,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // LAPTOPS
            {
                name: 'MacBook Air M2 13.6"',
                brand: 'Apple',
                price: 24990000,
                originalPrice: 28990000,
                description: 'Thiết kế siêu mỏng nhẹ, hiệu năng M2 vượt trội.',
                thumbnail: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '13.6" Liquid Retina', chip: 'Apple M2', ram: '8GB', storage: '256GB' },
                stock: 25, rating: 4.9, reviewCount: 210, categoryId: 'laptop', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'MacBook Pro 14" M3',
                brand: 'Apple',
                price: 39990000,
                originalPrice: 42990000,
                description: 'Dành cho người dùng chuyên nghiệp. Chip M3 cực mạnh.',
                thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '14.2" Liquid Retina XDR', chip: 'Apple M3', ram: '16GB', storage: '512GB' },
                stock: 12, rating: 5.0, reviewCount: 50, categoryId: 'laptop', isHot: true, isSale: false,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Asus ROG Zephyrus G14',
                brand: 'Asus',
                price: 45990000,
                originalPrice: 49990000,
                description: 'Laptop gaming nhỏ gọn mạnh mẽ nhất.',
                thumbnail: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '14" 2K 120Hz', chip: 'AMD Ryzen 9', ram: '16GB', storage: '1TB' },
                stock: 8, rating: 4.8, reviewCount: 35, categoryId: 'laptop', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // TABLETS
            {
                name: 'iPad Pro 11" M2',
                brand: 'Apple',
                price: 20990000,
                originalPrice: 23990000,
                description: 'Hiệu năng máy tính trên một chiếc tablet.',
                thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '11" ProMotion', chip: 'Apple M2', ram: '8GB', storage: '128GB' },
                stock: 20, rating: 4.8, reviewCount: 150, categoryId: 'tablet', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'iPad Air 5 M1',
                brand: 'Apple',
                price: 14990000,
                originalPrice: 16990000,
                description: 'Sức mạnh M1 với nhiều màu sắc trẻ trung.',
                thumbnail: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '10.9" Liquid Retina', chip: 'Apple M1', ram: '8GB', storage: '64GB' },
                stock: 40, rating: 4.7, reviewCount: 95, categoryId: 'tablet', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Samsung Galaxy Tab S9 Ultra',
                brand: 'Samsung',
                price: 25990000,
                originalPrice: 28990000,
                description: 'Màn hình khổng lồ, đi kèm bút S Pen huyền thoại.',
                thumbnail: 'https://images.unsplash.com/photo-1589739900243-4b123b3ef30b?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { screen: '14.6" Dynamic AMOLED', chip: 'Snapdragon 8 Gen 2', ram: '12GB', storage: '256GB' },
                stock: 15, rating: 4.8, reviewCount: 25, categoryId: 'tablet', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // AUDIO
            {
                name: 'AirPods Pro 2 USB-C',
                brand: 'Apple',
                price: 5990000,
                originalPrice: 6590000,
                description: 'Chống ồn vượt trội, cổng sạc USB-C mới.',
                thumbnail: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { chip: 'H2', battery: '6h + 24h case' },
                stock: 200, rating: 4.9, reviewCount: 500, categoryId: 'audio', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Sony WH-1000XM5',
                brand: 'Sony',
                price: 7490000,
                originalPrice: 8490000,
                description: 'Tai nghe chụp tai chống ồn tốt nhất thế giới.',
                thumbnail: 'https://images.unsplash.com/photo-1644737553531-bcbc024d271f?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { chip: 'V1', battery: '30h' },
                stock: 50, rating: 4.9, reviewCount: 180, categoryId: 'audio', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // WATCH
            {
                name: 'Apple Watch Ultra 2',
                brand: 'Apple',
                price: 20990000,
                originalPrice: 21990000,
                description: 'Dành cho vận động viên chuyên nghiệp. Titan siêu bền.',
                thumbnail: 'https://images.unsplash.com/photo-1694246835158-b64d39c9c3e2?q=80&w=2037&auto=format&fit=crop',
                images: [],
                specs: { chip: 'S9 SiP', screen: '3000 nits' },
                stock: 30, rating: 4.9, reviewCount: 65, categoryId: 'watch', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Apple Watch Series 9',
                brand: 'Apple',
                price: 9990000,
                originalPrice: 10990000,
                description: 'Smartwatch phổ biến nhất. Tính năng Double Tap mới.',
                thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=2037&auto=format&fit=crop',
                images: [],
                specs: { chip: 'S9 SiP', battery: '18h' },
                stock: 100, rating: 4.8, reviewCount: 120, categoryId: 'watch', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // ACCESSORIES
            {
                name: 'Apple MagSafe Charger',
                brand: 'Apple',
                price: 990000,
                originalPrice: 1190000,
                description: 'Sạc không dây hít nam châm tiện lợi cho iPhone.',
                thumbnail: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=2037&auto=format&fit=crop',
                images: [],
                specs: { power: '15W' },
                stock: 300, rating: 4.7, reviewCount: 450, categoryId: 'accessory', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // SMART HOME
            {
                name: 'Xiaomi Mi Smart Speaker',
                brand: 'Xiaomi',
                price: 890000,
                originalPrice: 1290000,
                description: 'Loa thông minh điều khiển bằng giọng nói Tiếng Việt.',
                thumbnail: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { power: '12W', connectivity: 'Wi-Fi, Bluetooth' },
                stock: 150, rating: 4.6, reviewCount: 88, categoryId: 'smart-home', isHot: false, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'Eufy RoboVac G10 Hybrid',
                brand: 'Anker',
                price: 4990000,
                originalPrice: 5990000,
                description: 'Robot hút bụi lau nhà thông minh.',
                thumbnail: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { suction: '2000Pa', runtime: '100 min' },
                stock: 20, rating: 4.7, reviewCount: 42, categoryId: 'smart-home', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },

            // TIVI (PC - MÀN HÌNH)
            {
                name: 'Samsung Odyssey G7 28"',
                brand: 'Samsung',
                price: 15990000,
                originalPrice: 17990000,
                description: 'Màn hình đồ họa và gaming 4K 144Hz.',
                thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { resolution: '4K', refresh: '144Hz', panel: 'IPS' },
                stock: 15, rating: 4.8, reviewCount: 56, categoryId: 'tivi', isHot: true, isSale: false,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            },
            {
                name: 'LG C3 OLED 55"',
                brand: 'LG',
                price: 26990000,
                originalPrice: 32990000,
                description: 'Trải nghiệm điện ảnh tuyệt vời nhất với OLED.',
                thumbnail: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop',
                images: [],
                specs: { panel: 'OLED', resolution: '4K', smart: 'webOS' },
                stock: 5, rating: 5.0, reviewCount: 78, categoryId: 'tivi', isHot: true, isSale: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            }
        ];

        try {
            const colRef = collection(db, this.collectionName);
            for (const p of dummyProducts) {
                await addDoc(colRef, p);
            }
            console.log('Seeded data successfully');
        } catch (e) {
            console.error('Error seeing data', e);
        }
    }

    async getAllProducts(limitCount: number = 20): Promise<ApiResponse<Product[]>> {
        try {
            const q = query(
                collection(db, this.collectionName),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            const products: Product[] = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as Product);
            });

            // Temporary fallback for dev if no data
            if (products.length === 0) {
                // await this.seedInitialData();
                // return this.getAllProducts(limitCount);
            }

            return { success: true, data: products };
        } catch (error: any) {
            console.error('Error fetching products:', error);
            return { success: false, error: error.message };
        }
    }

    async getProductById(id: string): Promise<ApiResponse<Product>> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const product = { id: docSnap.id, ...docSnap.data() } as Product;
                return { success: true, data: product };
            }
            return { success: false, error: 'Sản phẩm không tồn tại' };
        } catch (error: any) {
            console.error('Error fetching product details:', error);
            return { success: false, error: error.message };
        }
    }

    async getProductsByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
        console.log('--- ProductService: getProductsByCategory ---');
        console.log('Querying categoryId:', categoryId);
        try {
            const q = query(
                collection(db, this.collectionName),
                where('categoryId', '==', categoryId),
                limit(20)
            );
            console.log('Executing Firestore query...');
            const querySnapshot = await getDocs(q);
            console.log('Query snapshot size:', querySnapshot.size);
            const products: Product[] = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() } as Product);
            });
            return { success: true, data: products };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async searchProducts(searchTerm: string): Promise<ApiResponse<Product[]>> {
        // Note: Firestore doesn't support full-text search directly without 3rd party like Algolia.
        // implementing a simple client-side filter for demo purposes or "startWith" query.
        try {
            // Fetching decent amount and filtering client side for MVP
            const q = query(collection(db, this.collectionName), limit(50));
            const querySnapshot = await getDocs(q);
            const term = searchTerm.toLowerCase();

            const products: Product[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.name.toLowerCase().includes(term) || data.brand.toLowerCase().includes(term)) {
                    products.push({ id: doc.id, ...data } as Product);
                }
            });

            return { success: true, data: products };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export const productService = new ProductService();
