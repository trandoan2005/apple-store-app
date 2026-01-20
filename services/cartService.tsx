import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, formatPrice } from './productService';

export interface CartItem {
  id: string; // Cart Item specific ID (e.g. productId_timestamp)
  productId: string;
  name: string;
  brand: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  cart?: Cart;
  error?: string;
  message?: string;
}

// Helper to remove undefined values for Firestore
const cleanData = (data: any) => {
  const result = { ...data };
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      delete result[key];
    } else if (result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = cleanData(result[key]);
    } else if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => (typeof item === 'object' && item !== null) ? cleanData(item) : item);
    }
  });
  return result;
};

class CartService {
  // Get user's cart
  async getCart(userId: string): Promise<CartResponse> {
    try {
      const cartDoc = doc(db, 'carts', userId);
      const cartSnapshot = await getDoc(cartDoc);

      if (cartSnapshot.exists()) {
        return {
          success: true,
          cart: {
            id: cartSnapshot.id,
            ...cartSnapshot.data()
          } as Cart
        };
      } else {
        // Create empty cart if doesn't exist
        const emptyCart: Omit<Cart, 'id'> = {
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(cartDoc, cleanData(emptyCart));

        return {
          success: true,
          cart: {
            id: userId,
            ...emptyCart
          }
        };
      }
    } catch (error: any) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add item to cart
  async addToCart(userId: string, product: Product, quantity: number = 1, options?: { color?: string, storage?: string }): Promise<CartResponse> {
    try {
      const cartDoc = doc(db, 'carts', userId);
      const cartSnapshot = await getDoc(cartDoc);

      // Check for valid price
      const price = product.price || 0;

      const cartItem: CartItem = {
        id: `${product.id}_${options?.color || 'def'}_${options?.storage || 'def'}`, // Group by variations
        productId: product.id,
        name: product.name,
        brand: product.brand,
        thumbnail: product.thumbnail,
        price: price,
        originalPrice: product.originalPrice || price,
        quantity,
        selectedColor: options?.color,
        selectedStorage: options?.storage
      };

      if (!cartSnapshot.exists()) {
        // Create new cart
        const newCart: Omit<Cart, 'id'> = {
          userId,
          items: [cartItem],
          total: price * quantity,
          itemCount: quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(cartDoc, cleanData(newCart));

        return {
          success: true,
          cart: {
            id: userId,
            ...newCart
          }
        };
      } else {
        // Update existing cart
        const cartData = cartSnapshot.data() as Cart;

        // Find existing item with same ID (same product + same options)
        const existingItemIndex = cartData.items.findIndex(item => item.id === cartItem.id);

        let updatedItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          updatedItems = [...cartData.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item
          updatedItems = [...cartData.items, cartItem];
        }

        // Recalculate totals
        const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const updatedItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        const updatedCart = {
          ...cartData,
          items: updatedItems,
          total: updatedTotal,
          itemCount: updatedItemCount,
          updatedAt: new Date().toISOString()
        };

        await updateDoc(cartDoc, cleanData(updatedCart));

        return {
          success: true,
          cart: {
            id: userId,
            userId,
            items: updatedItems,
            total: updatedTotal,
            itemCount: updatedItemCount,
            createdAt: cartData.createdAt,
            updatedAt: new Date().toISOString()
          }
        };
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update item quantity
  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartResponse> {
    try {
      const cartDoc = doc(db, 'carts', userId);
      const cartSnapshot = await getDoc(cartDoc);

      if (!cartSnapshot.exists()) {
        return { success: false, error: 'Cart not found' };
      }

      const cartData = cartSnapshot.data() as Cart;
      const itemIndex = cartData.items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        return { success: false, error: 'Item not found in cart' };
      }

      const updatedItems = [...cartData.items];

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        updatedItems.splice(itemIndex, 1);
      } else {
        // Update quantity
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity
        };
      }

      // Recalculate totals
      const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const updatedItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

      const updatedCart = {
        ...cartData,
        items: updatedItems,
        total: updatedTotal,
        itemCount: updatedItemCount,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(cartDoc, cleanData(updatedCart));

      return {
        success: true,
        cart: {
          id: userId,
          userId,
          items: updatedItems,
          total: updatedTotal,
          itemCount: updatedItemCount,
          createdAt: cartData.createdAt,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove item from cart
  async removeFromCart(userId: string, itemId: string): Promise<CartResponse> {
    return this.updateCartItem(userId, itemId, 0);
  }

  // Clear cart
  async clearCart(userId: string): Promise<CartResponse> {
    try {
      const cartDoc = doc(db, 'carts', userId);
      const cartSnapshot = await getDoc(cartDoc);

      if (!cartSnapshot.exists()) {
        return { success: false, error: 'Cart not found' };
      }

      const updatedCart = {
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(cartDoc, cleanData(updatedCart));

      return {
        success: true,
        cart: {
          id: userId,
          userId,
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: (cartSnapshot.data() as Cart).createdAt,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to format cart display
  formatCartDisplay(cart: Cart) {
    return {
      itemCount: cart.itemCount,
      total: formatPrice(cart.total),
      hasItems: cart.items.length > 0
    };
  }
}

export const cartService = new CartService();