import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidBackground } from '../components/LiquidBackground';
import { GlassCard } from '../components/GlassCard';
import { ThemedText } from '../components/ThemedText';
import { StatusBar } from 'expo-status-bar';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <LiquidBackground>
      <StatusBar style="light" />
      <View style={styles.container}>
        <GlassCard style={styles.card} intensity={40}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle-outline" size={64} color="#FFF" />
          </View>

          <ThemedText style={styles.title} type="title">Thông báo</ThemedText>
          <ThemedText style={styles.message}>
            Đây là cửa sổ modal được thiết kế theo phong cách Glassmorphism đồng nhất với giao diện toàn ứng dụng.
          </ThemedText>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.buttonText}>Đã hiểu</ThemedText>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    borderRadius: 32,
    marginTop: 0,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#E11D48', // Rose 600
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
