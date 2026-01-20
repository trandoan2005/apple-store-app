import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    updateDoc,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Category {
    id: string;
    name: string;
    icon: string; // Ionicons name
    color: string; // Hex color
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class CategoryService {
    private collectionName = 'categories';

    async getAllCategories(): Promise<ApiResponse<Category[]>> {
        try {
            const q = query(collection(db, this.collectionName), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                await this.seedInitialCategories();
                return this.getAllCategories();
            }

            const categories: Category[] = [];
            querySnapshot.forEach((doc) => {
                categories.push({ id: doc.id, ...doc.data() } as Category);
            });
            return { success: true, data: categories };
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            return { success: false, error: error.message };
        }
    }

    async addCategory(category: Omit<Category, 'id'>): Promise<ApiResponse<string>> {
        try {
            const docRef = await addDoc(collection(db, this.collectionName), category);
            return { success: true, data: docRef.id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<void>> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await updateDoc(docRef, category);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async deleteCategory(id: string): Promise<ApiResponse<void>> {
        try {
            const docRef = doc(db, this.collectionName, id);
            await deleteDoc(docRef);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Default categories for seeding
    async seedInitialCategories(): Promise<void> {
        const defaultCategories = [
            { id: 'phone', name: 'Điện thoại', icon: 'phone-portrait-outline', color: '#3B82F6' },
            { id: 'laptop', name: 'Laptop', icon: 'laptop-outline', color: '#8B5CF6' },
            { id: 'tablet', name: 'Tablet', icon: 'tablet-portrait-outline', color: '#F59E0B' },
            { id: 'audio', name: 'Âm thanh', icon: 'headset-outline', color: '#10B981' },
            { id: 'watch', name: 'Đồng hồ', icon: 'watch-outline', color: '#EC4899' },
            { id: 'smart-home', name: 'Nhà thông minh', icon: 'home-outline', color: '#6366F1' },
            { id: 'accessory', name: 'Phụ kiện', icon: 'game-controller-outline', color: '#EF4444' },
            { id: 'tivi', name: 'PC - Màn hình', icon: 'desktop-outline', color: '#14B8A6' },
        ];

        try {
            for (const cat of defaultCategories) {
                const { id, ...data } = cat;
                const docRef = doc(db, this.collectionName, id);
                await setDoc(docRef, {
                    ...data,
                    createdAt: new Date().toISOString()
                }, { merge: true });
            }
            console.log('Categories seeded/updated successfully');
        } catch (e) {
            console.error('Error seeding categories', e);
        }
    }
}

export const categoryService = new CategoryService();
