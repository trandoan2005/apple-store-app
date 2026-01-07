import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Cart, cartService } from '../services/cartService';

interface UserProfile {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  register: (email: string, password: string, displayName?: string) => Promise<{success: boolean, message?: string}>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setCart: (cart: Cart) => void;
  updateCartCount: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load user profile từ Firestore
  const loadUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load cart từ Firestore
  const loadCart = async (userId: string) => {
    try {
      const cartResult = await cartService.getCart(userId);
      if (cartResult.success && cartResult.data) {
        setCart(cartResult.data);
        setCartCount(cartResult.data.totalItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Update cart count
  const updateCartCount = async () => {
    if (user) {
      const count = await cartService.getCartItemCount(user.uid);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  // Refresh cart data
  const refreshCart = async () => {
    if (user) {
      await loadCart(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 onAuthStateChanged:', firebaseUser?.email || 'null');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user profile và cart
        await Promise.all([
          loadUserProfile(firebaseUser.uid),
          loadCart(firebaseUser.uid)
        ]);
      } else {
        // Reset khi logout
        setUserProfile(null);
        setCart(null);
        setCartCount(0);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Hàm chuyển đổi lỗi Firebase sang tiếng Việt
  const getFirebaseErrorMessage = (error: any): string => {
    if (!error.code) return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Email không hợp lệ.';
      case 'auth/user-disabled':
        return 'Tài khoản đã bị vô hiệu hóa.';
      case 'auth/user-not-found':
        return 'Không tìm thấy người dùng với email này.';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác.';
      case 'auth/email-already-in-use':
        return 'Email đã được sử dụng.';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (ít nhất 6 ký tự).';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
      case 'auth/too-many-requests':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      default:
        return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  };

const login = async (email: string, password: string) => {
  try {
    console.log('🔑 [AuthContext] Attempting login for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ [AuthContext] Firebase login successful:', userCredential.user.email);
    
    if (!userCredential.user.emailVerified) {
      console.warn('⚠️ [AuthContext] Email not verified');
      // KHÔNG throw error, chỉ warn
    }
    
    // Load cart sau khi login
    await loadCart(userCredential.user.uid);
    console.log('🛒 [AuthContext] Cart loaded for user');
    
    return { 
      success: true,
      message: userCredential.user.emailVerified ? '' : 'Vui lòng xác thực email'
    };
    
  } catch (error: any) {
    console.error('❌ [AuthContext] Login error:', error);
    const errorMessage = getFirebaseErrorMessage(error);
    return { success: false, message: errorMessage };
  }
};
  const register = async (email: string, password: string, displayName?: string) => {
    try {
      // 1. Tạo user trong Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Gửi email xác thực
      await sendEmailVerification(userCredential.user);
      
      // 3. Lưu thông tin profile vào Firestore
      const userProfileData: UserProfile = {
        displayName,
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfileData);
      setUserProfile(userProfileData);
      
      // 4. Tạo cart mới cho user
      const emptyCart: Cart = {
        userId: userCredential.user.uid,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        updatedAt: new Date()
      };
      
      await cartService.getCart(userCredential.user.uid); // This will create cart if doesn't exist
      setCart(emptyCart);
      setCartCount(0);
      
      // 5. Cập nhật displayName trong Auth
      if (displayName) {
        await updateAuthProfile(userCredential.user, { displayName });
      }
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    console.log('🔓 [AuthContext] Logout called');
    
    try {
      // 1. Reset state ngay lập tức
      setUser(null);
      setUserProfile(null);
      setCart(null);
      setCartCount(0);
      
      // 2. Firebase signOut
      if (auth.currentUser) {
        console.log('🔓 [AuthContext] Signing out from Firebase...');
        await signOut(auth);
      }
      
      // 3. Xóa cache cho web
      if (typeof window !== 'undefined') {
        // Xóa Firebase cache
        Object.keys(localStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('Firebase')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      }
      
      console.log('✅ [AuthContext] Logout completed');
    } catch (error) {
      console.error('❌ [AuthContext] Logout error:', error);
      // Vẫn reset state dù có lỗi
      setUser(null);
      setUserProfile(null);
      setCart(null);
      setCartCount(0);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Chưa đăng nhập');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      cart,
      cartCount,
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      setCart,
      updateCartCount,
      refreshCart
    }}>
      {children}
    </AuthContext.Provider>
  );
};