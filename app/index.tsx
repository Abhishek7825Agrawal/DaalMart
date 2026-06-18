import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ShoppingBag, Store } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === 'seller') router.replace('/(seller)');
      else if (user.role === 'buyer') router.replace('/(buyer)');
      else if (user.role === 'admin') router.replace('/(admin)');
    }
  }, [user, loading]);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <LinearGradient colors={['#185FA5', '#0D47A1']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <ShoppingBag color="#185FA5" size={60} />
        </View>
        <Text style={styles.appName}>DaalMart</Text>
        <Text style={styles.tagline}>Purana lo, naya paao</Text>
        <Text style={styles.subtitle}>Used Electronics Reselling Platform</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.sellerButton]} onPress={() => router.push('/(auth)/register?role=seller')}>
            <Store color="#185FA5" size={24} />
            <Text style={styles.sellerButtonText}>Seller hun</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buyerButton]} onPress={() => router.push('/(auth)/register?role=buyer')}>
            <ShoppingBag color="#FFFFFF" size={24} />
            <Text style={styles.buyerButtonText}>Kharidna hai</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>Already have account? <Text style={styles.loginLinkText}>Login karo</Text></Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 30, elevation: 8 },
  appName: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  tagline: { fontSize: 22, color: '#D6E4FF', marginBottom: 8, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#A5C8FF', marginBottom: 50 },
  buttonContainer: { width: '100%', maxWidth: 300, gap: 16 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 10 },
  sellerButton: { backgroundColor: '#FFFFFF' },
  sellerButtonText: { color: '#185FA5', fontSize: 18, fontWeight: '600' },
  buyerButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FFFFFF' },
  buyerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  loginLink: { marginTop: 40 },
  loginText: { color: '#A5C8FF', fontSize: 14 },
  loginLinkText: { color: '#FFFFFF', fontWeight: '600', textDecorationLine: 'underline' },
});
