import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Order } from '@/lib/supabase';
import { Truck, CheckCircle, Clock } from 'lucide-react-native';

interface OrderWithDetails extends Order { buyer: { name: string }; listing: { title: string; category: string }; }

const STATUS_FLOW = ['placed', 'picked_up', 'out_for_delivery', 'delivered'] as const;
const STATUS_LABELS: Record<string, string> = { placed: 'Order Placed', picked_up: 'Picked Up', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
const STATUS_COLORS: Record<string, string> = { placed: '#FF9800', picked_up: '#2196F3', out_for_delivery: '#9C27B0', delivered: '#4CAF50' };

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*, buyer:users!orders_buyer_id_fkey(name), listing:listings(title, category)').order('created_at', { ascending: false });
    if (!error && data) setOrders(data as OrderWithDetails[]);
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus as any);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return;
    const newStatus = STATUS_FLOW[currentIndex + 1];
    Alert.alert('Update Status', `Order status "${STATUS_LABELS[newStatus]}" mein change karna hai?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: async () => {
        setUpdating(orderId);
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
        setUpdating(null);
      }},
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderOrder = ({ item }: { item: OrderWithDetails }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}><Text style={styles.orderTitle} numberOfLines={1}>{item.listing?.title}</Text><Text style={styles.orderCategory}>{item.listing?.category}</Text></View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}><Text style={styles.statusText}>{STATUS_LABELS[item.status] || item.status}</Text></View>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsRow}><Text style={styles.label}>Buyer:</Text><Text style={styles.value}>{item.buyer?.name}</Text></View>
      <View style={styles.detailsRow}><Text style={styles.label}>Amount:</Text><Text style={styles.price}>Rs. {item.total_price.toFixed(0)}</Text></View>
      <View style={styles.detailsRow}><Text style={styles.label}>Delivery:</Text><Text style={styles.value}>Rs. {item.delivery_charge.toFixed(0)}</Text></View>
      <View style={styles.detailsRow}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{formatDate(item.created_at)}</Text></View>
      {item.status !== 'delivered' ? (
        <TouchableOpacity style={[styles.updateButton, updating === item.id && styles.buttonDisabled]} onPress={() => updateStatus(item.id, item.status)} disabled={updating === item.id}>
          {updating === item.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><Truck size={18} color="#FFFFFF" /><Text style={styles.updateButtonText}>Status Update karo</Text></>}
        </TouchableOpacity>
      ) : (
        <View style={styles.deliveredBadge}><CheckCircle size={18} color="#4CAF50" /><Text style={styles.deliveredText}>Order Complete</Text></View>
      )}
    </View>
  );

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      {orders.length === 0 ? <View style={styles.emptyContainer}><Clock size={60} color="#CCCCCC" /><Text style={styles.emptyTitle}>Koi order nahi hai</Text><Text style={styles.emptyText}>Jab orders aayenge to yahan dikhengay</Text></View> :
        <FlatList data={orders} renderItem={renderOrder} keyExtractor={(i) => i.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, padding: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderInfo: { flex: 1, marginRight: 12 },
  orderTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  orderCategory: { fontSize: 12, color: '#666' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333', fontWeight: '500' },
  price: { fontSize: 14, color: '#185FA5', fontWeight: '700' },
  updateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#185FA5', marginTop: 12, padding: 12, borderRadius: 8, gap: 8 },
  updateButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  buttonDisabled: { opacity: 0.7 },
  deliveredBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#E8F5E9', gap: 8 },
  deliveredText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
});
