import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Email aur password daalo'); return; }
    setLoading(true); setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error.message || 'Login failed');
    setLoading(false);
  };

  return (
    <LinearGradient colors={['#185FA5', '#0D47A1']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoCircle}><ShoppingBag color="#185FA5" size={40} /></View>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Login karo apne account mein</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email daalo" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Password daalo" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
            </View>
            {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#185FA5" /> : <Text style={styles.buttonText}>Login karo</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerText}>Account nahi hai? <Text style={styles.registerLinkText}>Register karo</Text></Text>
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
  errorContainer: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#D32F2F', textAlign: 'center', fontSize: 14 },
  button: { backgroundColor: '#185FA5', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: '#666', fontSize: 14 },
  registerLinkText: { color: '#185FA5', fontWeight: '600' },
});
