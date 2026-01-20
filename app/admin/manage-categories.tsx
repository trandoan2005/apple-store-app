import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { categoryService, Category } from '../../services/categoryService';
import { LiquidBackground } from '../../components/LiquidBackground';
import { GlassCard } from '../../components/GlassCard';
import { ThemedText as Text } from '../../components/ThemedText';

export default function ManageCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Category | null>(null);

    // Form State
    const [form, setForm] = useState({
        name: '',
        icon: 'cube-outline',
        color: '#3B82F6'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const res = await categoryService.getAllCategories();
        if (res.success && res.data) {
            setCategories(res.data);
        }
        setLoading(false);
    };

    const handleEdit = (category: Category) => {
        setEditing(category);
        setForm({
            name: category.name,
            icon: category.icon,
            color: category.color
        });
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Xóa danh mục', 'Bạn có chắc chắn? Hành động này có thể ảnh hưởng đến việc lọc sản phẩm.', [
            { text: 'Hủy' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    const res = await categoryService.deleteCategory(id);
                    if (res.success) {
                        loadCategories();
                    } else {
                        Alert.alert('Lỗi', 'Không thể xóa danh mục');
                    }
                }
            }
        ]);
    };

    const handleSave = async () => {
        if (!form.name || !form.icon) return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');

        const categoryData = {
            ...form,
            createdAt: editing ? editing.createdAt : new Date().toISOString()
        };

        try {
            if (editing) {
                await categoryService.updateCategory(editing.id, categoryData);
            } else {
                await categoryService.addCategory(categoryData);
            }
            setEditing(null);
            resetForm();
            loadCategories();
            Alert.alert('Thành công', 'Đã lưu danh mục');
        } catch (e) {
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
        }
    };

    const handleResetCategories = async () => {
        Alert.alert('Xác nhận', 'Bạn có muốn khôi phục danh mục mẫu? (Chỉ thực hiện nếu danh sách hiện tại trống hoặc lỗi)', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý', onPress: async () => {
                    setLoading(true);
                    await categoryService.seedInitialCategories();
                    await loadCategories();
                    setLoading(false);
                    Alert.alert('Thành công', 'Đã khởi tạo danh mục mẫu!');
                }
            }
        ]);
    };

    const resetForm = () => {
        setForm({ name: '', icon: 'cube-outline', color: '#3B82F6' });
    };

    const renderItem = ({ item }: { item: Category }) => (
        <GlassCard style={styles.item} intensity={25}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.icon}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </GlassCard>
    );

    return (
        <LiquidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Danh mục</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleResetCategories}>
                            <Ionicons name="refresh-circle" size={24} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setEditing(null); resetForm(); }}>
                            <Ionicons name="add-circle" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.listSection}>
                        {loading ? (
                            <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={categories}
                                renderItem={renderItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listPadding}
                                showsVerticalScrollIndicator={false}
                                ListHeaderComponent={<Text style={styles.sectionTitle}>Các loại danh mục ({categories.length})</Text>}
                            />
                        )}
                    </View>

                    <GlassCard style={styles.formSection} intensity={60}>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>{editing ? 'CHI TIẾT DANH MỤC' : 'THÊM DANH MỤC MỚI'}</Text>
                                {editing && (
                                    <TouchableOpacity onPress={() => { setEditing(null); resetForm(); }}>
                                        <Text style={styles.resetText}>HỦY SỬA</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>TÊN DANH MỤC</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Điện thoại, Laptop..."
                                    value={form.name}
                                    onChangeText={t => setForm({ ...form, name: t })}
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>IONICONS NAME</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="cube-outline"
                                        value={form.icon}
                                        onChangeText={t => setForm({ ...form, icon: t })}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.inputLabel}>MÀU HIỂN THỊ (HEX)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="#FF3B30"
                                        value={form.color}
                                        onChangeText={t => setForm({ ...form, color: t })}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveText}>{editing ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC'}</Text>
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
    listSection: { height: '45%' },
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
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    itemMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },

    formSection: {
        height: '55%',
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
