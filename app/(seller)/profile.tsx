import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, ShoppingBag, Mail, Calendar } from 'lucide-react-native';

export default function SellerProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Logout', 'Logout karna hai?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { setSigningOut(true); await signOut(); } },
    ]);
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}><User size={40} color="#185FA5" /></View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>Seller</Text></View>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}><Mail size={20} color="#185FA5" /><Text style={styles.infoText}>{user?.email}</Text></View>
        <View style={styles.infoRow}><ShoppingBag size={20} color="#185FA5" /><Text style={styles.infoText}>Role: Seller</Text></View>
        <View style={styles.infoRow}><Calendar size={20} color="#185FA5" /><Text style={styles.infoText}>Joined: {new Date(user?.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? <ActivityIndicator color="#FFFFFF" /> : <><LogOut size={20} color="#FFFFFF" /><Text style={styles.signOutText}>Logout karo</Text></>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#185FA5' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  roleText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  infoContainer: { padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
  infoText: { fontSize: 16, color: '#333' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D32F2F', margin: 20, padding: 16, borderRadius: 12, gap: 8 },
  signOutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
