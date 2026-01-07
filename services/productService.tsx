// services/productService.tsx - COMPLETE SAFE VERSION
import { 
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface Product {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  categoryId: string;
  categoryName?: string;
  imageUrl: string;
  images?: string[];
  keywords?: string[];
  stock: number;
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: any;
  updatedAt?: any;
  specifications?: Record<string, string>;
  colors?: Array<{ name: string; code: string; image?: string }>;
  storageOptions?: Array<{ size: string; price: number }>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  productCount?: number;
}

// Format price VND - COMPLETE SAFE VERSION
export const formatPrice = (price: any): string => {
  // Kiểm tra tất cả trường hợp có thể
  if (price === undefined || price === null) {
    return 'Liên hệ';
  }
  
  // Convert to number
  let priceNumber: number;
  if (typeof price === 'number') {
    priceNumber = price;
  } else if (typeof price === 'string') {
    // Remove all non-numeric characters except decimal point
    const cleaned = price.replace(/[^0-9.-]+/g, '');
    priceNumber = parseFloat(cleaned);
  } else {
    // Try to convert anyway
    priceNumber = Number(price);
  }
  
  // Validate number
  if (isNaN(priceNumber) || !isFinite(priceNumber) || priceNumber < 0) {
    return 'Liên hệ';
  }
  
  try {
    return `${priceNumber.toLocaleString('vi-VN')}đ`;
  } catch (error) {
    return 'Liên hệ';
  }
};

export const formatPriceWithFrom = (price: any): string => {
  const formatted = formatPrice(price);
  return formatted === 'Liên hệ' ? 'Liên hệ' : `Từ ${formatted}`;
};

// Fallback categories
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'iphone',
    name: 'iPhone',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_iphone__d0wnev4y6a8m_large.png',
    color: '#007AFF'
  },
  {
    id: 'ipad',
    name: 'iPad',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_ipad__e5m3xn31teyu_large.png',
    color: '#5856D6'
  },
  {
    id: 'mac',
    name: 'Mac',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_mac__covlxbvash4i_large.png',
    color: '#FF9500'
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_watch__csqqcayzqueu_large.png',
    color: '#FF2D55'
  },
  {
    id: 'airpods',
    name: 'AirPods',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_airpods__b20u3tqx9kau_large.png',
    color: '#32D74B'
  },
  {
    id: 'accessories',
    name: 'Phụ kiện',
    icon: 'https://www.apple.com/v/home/bf/images/shop/shop_accessories__cx2e9gs7q3rm_large.png',
    color: '#5AC8FA'
  },
];

// Helper: Convert any value to number safely
const safeNumber = (value: any, defaultValue: number): number => {
  if (value === undefined || value === null) return defaultValue;
  
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? defaultValue : value;
  }
  
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
  }
  
  return defaultValue;
};

// Helper: Safe string with fallback
const safeString = (value: any, defaultValue: string = ''): string => {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
};

// Helper: Safe array
const safeArray = (value: any, defaultValue: any[] = []): any[] => {
  if (Array.isArray(value)) return value;
  return defaultValue;
};

// Helper: Safe object
const safeObject = (value: any, defaultValue: Record<string, any> = {}): Record<string, any> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return defaultValue;
};

// Helper: Get category from name
const getCategoryFromName = (name: string): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('iphone')) return 'iphone';
  if (nameLower.includes('mac')) return 'mac';
  if (nameLower.includes('ipad')) return 'ipad';
  if (nameLower.includes('watch')) return 'watch';
  if (nameLower.includes('airpods')) return 'airpods';
  if (nameLower.includes('cáp') || nameLower.includes('sạc') || nameLower.includes('ốp')) return 'accessories';
  return 'iphone';
};

// Default image based on category
const getDefaultImage = (category: string): string => {
  const images = {
    iphone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=512&h=512&fit=crop',
    mac: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=512&h=512&fit=crop',
    ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=512&h=512&fit=crop',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=512&h=512&fit=crop',
    airpods: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=512&h=512&fit=crop',
    accessories: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=512&h=512&fit=crop',
  };
  return images[category as keyof typeof images] || images.iphone;
};

// Default price based on product name
const getDefaultPrice = (name: string, category: string): number => {
  const prices = {
    iphone: 29990000,
    mac: 32990000,
    ipad: 19990000,
    watch: 11990000,
    airpods: 5990000,
    accessories: 1000000,
  };
  return prices[category as keyof typeof prices] || 1000000;
};

// Process product data with fallbacks - EXTRA SAFE VERSION
const processProductData = (product: any): Product => {
  try {
    const productId = safeString(product.id, '');
    const rawName = safeString(product.name, 'Sản phẩm Apple');
    const productName = rawName.trim() || 'Sản phẩm Apple';
    
    // Determine category
    let productCategory = safeString(product.categoryId, '').toLowerCase();
    if (!productCategory) {
      productCategory = getCategoryFromName(productName);
    }
    
    // Process price - EXTRA SAFE
    let priceValue: number;
    if (product.price !== undefined && product.price !== null) {
      priceValue = safeNumber(product.price, getDefaultPrice(productName, productCategory));
    } else {
      priceValue = getDefaultPrice(productName, productCategory);
    }
    
    // Ensure price is positive
    if (priceValue <= 0) {
      priceValue = getDefaultPrice(productName, productCategory);
    }
    
    // Process original price
    let originalPriceValue: number | undefined;
    if (product.originalPrice !== undefined && product.originalPrice !== null) {
      const original = safeNumber(product.originalPrice, 0);
      if (original > 0 && original !== priceValue) {
        originalPriceValue = original;
      }
    }
    
    // Process badge
    let badgeValue = '';
    const badge = safeString(product.badge);
    if (badge && badge.trim() !== '') {
      badgeValue = badge.trim();
    } else if (productName.toLowerCase().includes('new') || productName.toLowerCase().includes('mới')) {
      badgeValue = 'NEW';
    }
    
    // Category name mapping
    const categoryNameMap: Record<string, string> = {
      'iphone': 'iPhone',
      'mac': 'Mac',
      'ipad': 'iPad',
      'watch': 'Watch',
      'airpods': 'AirPods',
      'accessories': 'Phụ kiện'
    };
    
    const result: Product = {
      id: productId,
      productId: safeString(product.productId, productId),
      name: productName,
      description: safeString(product.description, 
        `Sản phẩm ${productName} chính hãng Apple với công nghệ tiên tiến nhất. Thiết kế sang trọng, hiệu năng mạnh mẽ, trải nghiệm người dùng vượt trội.`),
      price: priceValue,
      originalPrice: originalPriceValue,
      discount: safeNumber(product.discount, 0),
      categoryId: productCategory,
      categoryName: safeString(product.categoryName, categoryNameMap[productCategory] || 'iPhone'),
      imageUrl: safeString(product.imageUrl, getDefaultImage(productCategory)),
      images: safeArray(product.images, [
        getDefaultImage(productCategory),
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=512&h=512&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=512&h=512&fit=crop'
      ]),
      keywords: safeArray(product.keywords, [productName.toLowerCase(), productCategory]),
      stock: safeNumber(product.stock, 50),
      featured: product.featured === true,
      badge: badgeValue,
      rating: safeNumber(product.rating, 4.5),
      reviewCount: safeNumber(product.reviewCount, Math.floor(Math.random() * 100) + 50),
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt,
      specifications: safeObject(product.specifications, {
        'Thương hiệu': 'Apple',
        'Bảo hành': '12 tháng chính hãng',
        'Xuất xứ': 'Trung Quốc'
      }),
      colors: safeArray(product.colors, [
        { name: 'Đen', code: '#1D1D1F' },
        { name: 'Trắng', code: '#FFFFFF' },
        { name: 'Xám', code: '#8E8E93' }
      ]),
      storageOptions: safeArray(product.storageOptions, [
        { size: '128GB', price: 0 },
        { size: '256GB', price: 3000000 },
        { size: '512GB', price: 6000000 }
      ])
    };

    // Final validation - ensure price is a valid number
    if (typeof result.price !== 'number' || isNaN(result.price) || !isFinite(result.price)) {
      console.warn(`⚠️ Fixing invalid price for product ${result.id}: ${result.price}`);
      result.price = getDefaultPrice(result.name, result.categoryId);
    }

    return result;
    
  } catch (error) {
    console.error('❌ Critical error processing product:', error, product);
    // Return a safe default product
    return {
      id: product?.id || 'error',
      name: 'Sản phẩm lỗi',
      description: 'Sản phẩm này gặp lỗi khi xử lý',
      price: 1000000,
      categoryId: 'iphone',
      categoryName: 'iPhone',
      imageUrl: 'https://images.unsplash.com/photo-1546054451-aa5b470bcc71?w=512&h=512&fit=crop',
      stock: 0,
      createdAt: new Date(),
    };
  }
};

// Product Service - UPDATED WITH COMPLETE ERROR HANDLING
export const productService = {
  // 1. Get All Products
  getAllProducts: async (): Promise<{ success: boolean; data: Product[]; error?: string }> => {
    try {
      console.log('🔄 Getting ALL products from Firestore...');
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      console.log(`📊 Found ${querySnapshot.docs.length} raw documents`);
      
      const products: Product[] = [];
      const errors: string[] = [];
      
      querySnapshot.docs.forEach(doc => {
        try {
          const rawData = doc.data();
          const product = processProductData({
            id: doc.id,
            ...rawData
          });
          
          // Final check for critical fields
          if (!product.id || !product.name || typeof product.price !== 'number') {
            console.warn(`⚠️ Product ${doc.id} has missing critical fields:`, {
              id: product.id,
              name: product.name,
              price: product.price,
              priceType: typeof product.price
            });
            
            // Fix critical issues
            if (!product.name) product.name = 'Sản phẩm không tên';
            if (typeof product.price !== 'number' || isNaN(product.price)) {
              product.price = 1000000;
            }
          }
          
          products.push(product);
          
        } catch (error: any) {
          console.error(`❌ Error processing product ${doc.id}:`, error);
          errors.push(`Product ${doc.id}: ${error.message}`);
        }
      });
      
      console.log(`✅ Successfully loaded ${products.length} products`);
      if (errors.length > 0) {
        console.warn(`⚠️ Had ${errors.length} processing errors`);
      }
      
      return { 
        success: true, 
        data: products,
        error: errors.length > 0 ? `Có ${errors.length} sản phẩm bị lỗi` : undefined
      };
      
    } catch (error: any) {
      console.error('❌ Error getting all products:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // 2. Get Products by Keyword
  getProductsByKeyword: async (keyword: string): Promise<{ success: boolean; data: Product[]; error?: string }> => {
    try {
      console.log(`🔍 Searching for: "${keyword}"`);
      
      const allResult = await productService.getAllProducts();
      
      if (!allResult.success) {
        return allResult;
      }
      
      const searchTerm = keyword.toLowerCase().trim();
      const filteredProducts = allResult.data.filter(product => {
        if (!product) return false;
        
        const searchFields = [
          product.name?.toLowerCase(),
          product.description?.toLowerCase(),
          product.categoryName?.toLowerCase(),
          ...(product.keywords || []).map((k: string) => k.toLowerCase())
        ].filter(Boolean);
        
        return searchFields.some(field => field?.includes(searchTerm));
      });
      
      console.log(`✅ Found ${filteredProducts.length} products for keyword "${keyword}"`);
      return { success: true, data: filteredProducts };
    } catch (error: any) {
      console.error('❌ Error searching products:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // 3. Get Products by Category ID
  getProductsByCategoryId: async (categoryId: string): Promise<{ success: boolean; data: Product[]; error?: string }> => {
    try {
      console.log(`📂 Getting products for category: ${categoryId}`);
      
      const allResult = await productService.getAllProducts();
      
      if (!allResult.success) {
        return allResult;
      }
      
      const filteredProducts = allResult.data.filter(product => 
        product && product.categoryId === categoryId
      );
      
      console.log(`✅ Found ${filteredProducts.length} products in category ${categoryId}`);
      return { success: true, data: filteredProducts };
    } catch (error: any) {
      console.error('❌ Error getting products by category:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // 4. Get Featured Products
  getFeaturedProducts: async (): Promise<{ success: boolean; data: Product[]; error?: string }> => {
    try {
      console.log('⭐ Getting featured products...');
      
      const allResult = await productService.getAllProducts();
      
      if (!allResult.success) {
        return allResult;
      }
      
      const featuredProducts = allResult.data
        .filter(product => product && product.featured === true)
        .slice(0, 8);
      
      const productsToShow = featuredProducts.length > 0 
        ? featuredProducts 
        : allResult.data.slice(0, 4);
      
      console.log(`✅ Showing ${productsToShow.length} featured products`);
      return { success: true, data: productsToShow };
    } catch (error: any) {
      console.error('❌ Error getting featured products:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // 5. Get All Categories
  getAllCategories: async (): Promise<{ success: boolean; data: Category[]; error?: string }> => {
    try {
      console.log('📁 Getting categories from Firestore...');
      
      const categoriesRef = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      if (!querySnapshot.empty) {
        const categories: Category[] = [];
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          categories.push({
            id: doc.id,
            name: safeString(data.name, 'Unnamed Category'),
            icon: safeString(data.icon, FALLBACK_CATEGORIES[0].icon),
            color: safeString(data.color, '#007AFF'),
            description: data.description,
            productCount: safeNumber(data.productCount, 0)
          });
        });
        
        console.log(`✅ Loaded ${categories.length} categories from Firestore`);
        return { success: true, data: categories };
      }
      
      console.log('ℹ️ No categories in Firestore, using fallback');
      return { success: true, data: FALLBACK_CATEGORIES };
      
    } catch (error: any) {
      console.error('❌ Error getting categories:', error);
      return { success: true, data: FALLBACK_CATEGORIES, error: error.message };
    }
  },

  // 6. Get Single Product by ID
  getProductById: async (productId: string): Promise<{ success: boolean; data?: Product; error?: string }> => {
    try {
      console.log(`🔎 Getting product by ID: ${productId}`);
      
      if (!productId) {
        return { success: false, error: 'Product ID is required' };
      }
      
      // Try to get directly from Firestore by document ID
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const product = processProductData({
            id: docSnap.id,
            ...docSnap.data()
          });
          console.log(`✅ Found product by document ID: ${product.name}`);
          return { success: true, data: product };
        }
      } catch (error) {
        console.log('⚠️ Not found by document ID:', error);
      }
      
      // Try to find by productId field
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('productId', '==', productId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const product = processProductData({
            id: doc.id,
            ...doc.data()
          });
          console.log(`✅ Found product by productId field: ${product.name}`);
          return { success: true, data: product };
        }
      } catch (error) {
        console.log('⚠️ Not found by productId field:', error);
      }
      
      // Fallback: search in all products
      const allResult = await productService.getAllProducts();
      
      if (allResult.success) {
        const product = allResult.data.find(p => 
          p && (p.id === productId || 
          p.productId === productId ||
          p.name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase())
        );
        
        if (product) {
          console.log(`✅ Found product in all products: ${product.name}`);
          return { success: true, data: product };
        }
      }
      
      console.log(`❌ Product not found: ${productId}`);
      return { success: false, error: 'Product not found' };
      
    } catch (error: any) {
      console.error('❌ Error getting product by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // 7. Get Related Products
  getRelatedProducts: async (product: Product, limitCount: number = 4): Promise<{ success: boolean; data: Product[]; error?: string }> => {
    try {
      console.log(`🔄 Getting related products for: ${product.name}`);
      
      const allResult = await productService.getAllProducts();
      
      if (!allResult.success) {
        return allResult;
      }
      
      const relatedProducts = allResult.data
        .filter(p => 
          p && 
          p.id !== product.id && 
          (p.categoryId === product.categoryId || 
           (p.keywords || []).some((keyword: string) => 
             (product.keywords || []).includes(keyword)
           ))
        )
        .slice(0, limitCount);
      
      console.log(`✅ Found ${relatedProducts.length} related products`);
      return { success: true, data: relatedProducts };
    } catch (error: any) {
      console.error('❌ Error getting related products:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // 8. Test Firebase Connection
  testConnection: async (): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      console.log('🧪 Testing Firebase connection...');
      
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      const rawData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Firebase connection successful');
      
      return {
        success: true,
        message: `Connected successfully. Found ${rawData.length} products`,
        data: rawData
      };
    } catch (error: any) {
      console.error('❌ Firebase connection failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  },

  // 9. Fix product prices in Firestore
  fixProductPrices: async (): Promise<{ success: boolean; message: string; fixedCount: number }> => {
    try {
      console.log('🔧 Fixing product prices...');
      
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      
      let fixedCount = 0;
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        let needsUpdate = false;
        const updateData: any = {};
        
        // Fix price if invalid
        if (data.price === undefined || data.price === null || 
            typeof data.price !== 'number' || isNaN(data.price)) {
          
          const name = safeString(data.name, 'Sản phẩm Apple');
          const category = safeString(data.categoryId, 'iphone').toLowerCase();
          const defaultPrice = getDefaultPrice(name, category);
          
          updateData.price = defaultPrice;
          needsUpdate = true;
          fixedCount++;
        }
        
        // Fix stock if invalid
        if (data.stock === undefined || data.stock === null || 
            typeof data.stock !== 'number' || isNaN(data.stock)) {
          
          updateData.stock = 50;
          needsUpdate = true;
          fixedCount++;
        }
        
        if (needsUpdate) {
          await updateDoc(doc.ref, {
            ...updateData,
            updatedAt: new Date()
          });
        }
      }
      
      const message = fixedCount > 0 
        ? `✅ Fixed ${fixedCount} products with invalid data`
        : '✅ All products have valid data';
      
      console.log(message);
      return { success: true, message, fixedCount };
      
    } catch (error: any) {
      console.error('❌ Error fixing product prices:', error);
      return { success: false, message: `Fix failed: ${error.message}`, fixedCount: 0 };
    }
  }
};