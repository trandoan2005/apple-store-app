// services/cartService.ts
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, formatPrice } from './productService';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedImage?: string;
  price: number;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: Date;
}

export const cartService = {
  // 1. Get user's cart
  getCart: async (userId: string): Promise<{ success: boolean; data?: Cart; error?: string }> => {
    try {
      console.log(`🛒 Getting cart for user: ${userId}`);
      
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data() as Cart;
        console.log(`✅ Cart found with ${cartData.items?.length || 0} items`);
        return { success: true, data: cartData };
      } else {
        // Create empty cart if doesn't exist
        const emptyCart: Cart = {
          userId,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          updatedAt: new Date()
        };
        
        await setDoc(cartRef, emptyCart);
        console.log('✅ Created new empty cart');
        return { success: true, data: emptyCart };
      }
    } catch (error: any) {
      console.error('❌ Error getting cart:', error);
      return { success: false, error: error.message };
    }
  },

  // 2. Add item to cart
  addToCart: async (
    userId: string, 
    product: Product, 
    quantity: number = 1,
    selectedColor?: string,
    selectedStorage?: string
  ): Promise<{ success: boolean; message: string; cart?: Cart }> => {
    try {
      console.log(`➕ Adding ${quantity}x ${product.name} to cart`);
      
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      const cartItem: CartItem = {
        id: `${product.id}_${selectedColor || 'default'}_${selectedStorage || 'default'}`,
        productId: product.id,
        product: product,
        quantity,
        selectedColor,
        selectedStorage,
        selectedImage: product.imageUrl,
        price: product.price,
        addedAt: new Date()
      };
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data() as Cart;
        const existingItemIndex = cartData.items.findIndex(
          item => item.id === cartItem.id
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...cartData.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          
          const updatedCart: Cart = {
            ...cartData,
            items: updatedItems,
            totalItems: cartData.totalItems + quantity,
            totalPrice: cartData.totalPrice + (product.price * quantity),
            updatedAt: new Date()
          };
          
          await updateDoc(cartRef, updatedCart);
          console.log(`✅ Updated quantity in cart`);
        } else {
          // Add new item
          const updatedCart: Cart = {
            ...cartData,
            items: [...cartData.items, cartItem],
            totalItems: cartData.totalItems + quantity,
            totalPrice: cartData.totalPrice + (product.price * quantity),
            updatedAt: new Date()
          };
          
          await updateDoc(cartRef, updatedCart);
          console.log(`✅ Added new item to cart`);
        }
      } else {
        // Create new cart with item
        const newCart: Cart = {
          userId,
          items: [cartItem],
          totalItems: quantity,
          totalPrice: product.price * quantity,
          updatedAt: new Date()
        };
        
        await setDoc(cartRef, newCart);
        console.log(`✅ Created new cart with item`);
      }
      
      // Get updated cart
      const updatedCartSnap = await getDoc(cartRef);
      const updatedCart = updatedCartSnap.data() as Cart;
      
      return {
        success: true,
        message: `Đã thêm ${quantity} ${product.name} vào giỏ hàng`,
        cart: updatedCart
      };
      
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      return {
        success: false,
        message: `Lỗi khi thêm vào giỏ hàng: ${error.message}`
      };
    }
  },

  // 3. Update item quantity
  updateCartItem: async (
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<{ success: boolean; message: string; cart?: Cart }> => {
    try {
      console.log(`📝 Updating item ${itemId} to quantity ${quantity}`);
      
      if (quantity < 1) {
        return await cartService.removeFromCart(userId, itemId);
      }
      
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) {
        return { success: false, message: 'Giỏ hàng không tồn tại' };
      }
      
      const cartData = cartSnap.data() as Cart;
      const itemIndex = cartData.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, message: 'Sản phẩm không tồn tại trong giỏ hàng' };
      }
      
      const item = cartData.items[itemIndex];
      const quantityDiff = quantity - item.quantity;
      
      const updatedItems = [...cartData.items];
      updatedItems[itemIndex] = {
        ...item,
        quantity
      };
      
      const updatedCart: Cart = {
        ...cartData,
        items: updatedItems,
        totalItems: cartData.totalItems + quantityDiff,
        totalPrice: cartData.totalPrice + (item.price * quantityDiff),
        updatedAt: new Date()
      };
      
      await updateDoc(cartRef, updatedCart);
      console.log(`✅ Updated cart item quantity`);
      
      return {
        success: true,
        message: 'Đã cập nhật số lượng',
        cart: updatedCart
      };
      
    } catch (error: any) {
      console.error('❌ Error updating cart item:', error);
      return {
        success: false,
        message: `Lỗi khi cập nhật: ${error.message}`
      };
    }
  },

  // 4. Remove item from cart
  removeFromCart: async (
    userId: string,
    itemId: string
  ): Promise<{ success: boolean; message: string; cart?: Cart }> => {
    try {
      console.log(`🗑️ Removing item ${itemId} from cart`);
      
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) {
        return { success: false, message: 'Giỏ hàng không tồn tại' };
      }
      
      const cartData = cartSnap.data() as Cart;
      const itemIndex = cartData.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, message: 'Sản phẩm không tồn tại trong giỏ hàng' };
      }
      
      const item = cartData.items[itemIndex];
      const updatedItems = cartData.items.filter(item => item.id !== itemId);
      
      const updatedCart: Cart = {
        ...cartData,
        items: updatedItems,
        totalItems: cartData.totalItems - item.quantity,
        totalPrice: cartData.totalPrice - (item.price * item.quantity),
        updatedAt: new Date()
      };
      
      await updateDoc(cartRef, updatedCart);
      console.log(`✅ Removed item from cart`);
      
      return {
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        cart: updatedCart
      };
      
    } catch (error: any) {
      console.error('❌ Error removing from cart:', error);
      return {
        success: false,
        message: `Lỗi khi xóa: ${error.message}`
      };
    }
  },

  // 5. Clear cart
  clearCart: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`🧹 Clearing cart for user: ${userId}`);
      
      const cartRef = doc(db, 'carts', userId);
      const emptyCart: Cart = {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        updatedAt: new Date()
      };
      
      await setDoc(cartRef, emptyCart);
      console.log('✅ Cart cleared');
      
      return {
        success: true,
        message: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng'
      };
      
    } catch (error: any) {
      console.error('❌ Error clearing cart:', error);
      return {
        success: false,
        message: `Lỗi khi xóa giỏ hàng: ${error.message}`
      };
    }
  },

  // 6. Calculate cart summary
  calculateCartSummary: (cart: Cart) => {
    const subtotal = cart.totalPrice;
    const shippingFee = subtotal > 0 ? 30000 : 0; // 30k shipping
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal + shippingFee + tax;
    
    return {
      subtotal,
      shippingFee,
      tax,
      total,
      formattedSubtotal: formatPrice(subtotal),
      formattedShippingFee: formatPrice(shippingFee),
      formattedTax: formatPrice(tax),
      formattedTotal: formatPrice(total)
    };
  },

  // 7. Get cart item count
  getCartItemCount: async (userId: string): Promise<number> => {
    try {
      const cartResult = await cartService.getCart(userId);
      return cartResult.success ? cartResult.data?.totalItems || 0 : 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};