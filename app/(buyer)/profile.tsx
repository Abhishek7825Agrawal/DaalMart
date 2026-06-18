import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Order } from '@/lib/supabase';
import { User, LogOut, Package, Mail, Calendar, ShoppingBag } from 'lucide-react-native';

interface OrderWithListing extends Order { listing: { title: string; category: string }; }

const STATUS_LABELS: Record<string, string> = { placed: 'Order Placed', picked_up: 'Picked Up', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
const STATUS_COLORS: Record<string, string> = { placed: '#FF9800', picked_up: '#2196F3', out_for_delivery: '#9C27B0', delivered: '#4CAF50' };

export default function BuyerProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const [orders, setOrders] = useState<OrderWithListing[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('orders').select('*, listing:listings(title, category)').eq('buyer_id', user.id).order('created_at', { ascending: false });
    if (!error && data) setOrders(data as OrderWithListing[]);
    setLoadingOrders(false);
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, [user]));

  const handleSignOut = async () => {
    Alert.alert('Logout', 'Logout karna hai?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { setSigningOut(true); await signOut(); } },
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderOrder = ({ item }: { item: OrderWithListing }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle} numberOfLines={1}>{item.listing?.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}><Text style={styles.statusText}>{STATUS_LABELS[item.status] || item.status}</Text></View>
      </View>
      <Text style={styles.orderCategory}>{item.listing?.category}</Text>
      <View style={styles.orderFooter}><Text style={styles.orderAmount}>Rs. {item.total_price.toFixed(0)}</Text><Text style={styles.orderDate}>{formatDate(item.created_at)}</Text></View>
    </View>
  );

  if (loading || loadingOrders) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}><User size={40} color="#185FA5" /></View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>Buyer</Text></View>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}><Mail size={20} color="#185FA5" /><Text style={styles.infoText}>{user?.email}</Text></View>
        <View style={styles.infoRow}><ShoppingBag size={20} color="#185FA5" /><Text style={styles.infoText}>Role: Buyer</Text></View>
        <View style={styles.infoRow}><Calendar size={20} color="#185FA5" /><Text style={styles.infoText}>Joined: {new Date(user?.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
      </View>
      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>My Orders</Text>
        {orders.length === 0 ? <View style={styles.emptyOrders}><Package size={40} color="#CCCCCC" /><Text style={styles.emptyOrdersText}>Koi order nahi hai</Text></View> : <FlatList data={orders} renderItem={renderOrder} keyExtractor={(i) => i.id} scrollEnabled={false} />}
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
  ordersSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  emptyOrders: { alignItems: 'center', padding: 20, backgroundColor: '#F8F8F8', borderRadius: 12 },
  emptyOrdersText: { fontSize: 14, color: '#999', marginTop: 8 },
  orderCard: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12, marginBottom: 8 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  orderTitle: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  orderCategory: { fontSize: 12, color: '#666' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  orderAmount: { fontSize: 14, fontWeight: '700', color: '#185FA5' },
  orderDate: { fontSize: 11, color: '#999' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D32F2F', margin: 20, padding: 16, borderRadius: 12, gap: 8 },
  signOutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
