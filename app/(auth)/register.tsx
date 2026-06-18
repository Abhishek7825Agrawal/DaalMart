import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Mail, Lock, User, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>((params.role as UserRole) || 'buyer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) { setError('Sab fields bharo'); return; }
    if (password !== confirmPassword) { setError('Passwords match nahi kar rahe'); return; }
    if (password.length < 6) { setError('Password kam se kam 6 characters ka hona chahiye'); return; }
    setLoading(true); setError(null);
    const { error } = await signUp(email, password, name, role);
    if (error) setError(error.message || 'Registration failed');
    else router.replace('/');
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#185FA5', '#0D47A1']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoCircle}><ShoppingBag color="#185FA5" size={40} /></View>
          <Text style={styles.title}>Naya Account</Text>
          <Text style={styles.subtitle}>Register karo aur shuru karo</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Apna naam daalo" placeholderTextColor="#999" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email daalo" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Password banao" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
            </View>
            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Password confirm karo" placeholderTextColor="#999" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            </View>
            <Text style={styles.roleLabel}>Role choose karo:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]} onPress={() => setRole('seller')}>
                <Text style={[styles.roleText, role === 'seller' && styles.roleTextActive]}>Seller</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]} onPress={() => setRole('buyer')}>
                <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>Buyer</Text>
              </TouchableOpacity>
            </View>
            {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Register karo</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginText}>Already have account? <Text style={styles.loginLinkText}>Login karo</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 30, alignSelf: 'center', elevation: 8 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#A5C8FF', textAlign: 'center', marginBottom: 40 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, elevation: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#333' },
  roleLabel: { fontSize: 14, color: '#666', marginBottom: 12 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center' },
  roleButtonActive: { borderColor: '#185FA5', backgroundColor: '#E8F1FF' },
  roleText: { fontSize: 16, color: '#666', fontWeight: '500' },
  roleTextActive: { color: '#185FA5', fontWeight: '600' },
  errorContainer: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#D32F2F', textAlign: 'center', fontSize: 14 },
  button: { backgroundColor: '#185FA5', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  loginLink: { marginTop: 24, alignItems: 'center' },
  loginText: { color: '#666', fontSize: 14 },
  loginLinkText: { color: '#185FA5', fontWeight: '600' },
});
