import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, Users, TrendingUp, IndianRupee } from 'lucide-react-native';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ totalListings: 0, pendingListings: 0, approvedListings: 0, soldListings: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalRevenue: 0, totalSellers: 0, totalBuyers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    const [listingsResult, ordersResult, usersResult] = await Promise.all([
      supabase.from('listings').select('status'),
      supabase.from('orders').select('status, total_price'),
      supabase.from('users').select('role'),
    ]);
    const listings = listingsResult.data || [];
    const orders = ordersResult.data || [];
    const users = usersResult.data || [];
    const totalRevenue = orders.reduce((sum: number, o: { total_price: number }) => sum + (o.total_price || 0), 0);
    setStats({
      totalListings: listings.length,
      pendingListings: listings.filter((l: { status: string }) => l.status === 'pending').length,
      approvedListings: listings.filter((l: { status: string }) => l.status === 'approved').length,
      soldListings: listings.filter((l: { status: string }) => l.status === 'sold').length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: { status: string }) => o.status !== 'delivered').length,
      deliveredOrders: orders.filter((o: { status: string }) => o.status === 'delivered').length,
      totalRevenue,
      totalSellers: users.filter((u: { role: string }) => u.role === 'seller').length,
      totalBuyers: users.filter((u: { role: string }) => u.role === 'buyer').length,
    });
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />}>
      <Text style={styles.sectionTitle}>Revenue Overview</Text>
      <View style={styles.revenueCard}>
        <IndianRupee size={32} color="#FFFFFF" />
        <View style={styles.revenueInfo}><Text style={styles.revenueLabel}>Total Revenue</Text><Text style={styles.revenueAmount}>Rs. {stats.totalRevenue.toFixed(0)}</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Listings</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.blueCard]}><Package size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.totalListings}</Text><Text style={styles.statLabel}>Total Listings</Text></View>
        <View style={[styles.statCard, styles.orangeCard]}><Package size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.pendingListings}</Text><Text style={styles.statLabel}>Pending Review</Text></View>
        <View style={[styles.statCard, styles.greenCard]}><Package size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.approvedListings}</Text><Text style={styles.statLabel}>Approved</Text></View>
        <View style={[styles.statCard, styles.purpleCard]}><TrendingUp size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.soldListings}</Text><Text style={styles.statLabel}>Sold</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Orders</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.blueCard]}><ShoppingCart size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.totalOrders}</Text><Text style={styles.statLabel}>Total Orders</Text></View>
        <View style={[styles.statCard, styles.orangeCard]}><ShoppingCart size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.pendingOrders}</Text><Text style={styles.statLabel}>In Progress</Text></View>
        <View style={[styles.statCard, styles.greenCard]}><ShoppingCart size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.deliveredOrders}</Text><Text style={styles.statLabel}>Delivered</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Users</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.blueCard]}><Users size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.totalSellers}</Text><Text style={styles.statLabel}>Sellers</Text></View>
        <View style={[styles.statCard, styles.greenCard]}><Users size={24} color="#FFFFFF" /><Text style={styles.statNumber}>{stats.totalBuyers}</Text><Text style={styles.statLabel}>Buyers</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12, marginTop: 8 },
  revenueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#185FA5', borderRadius: 16, padding: 24, marginBottom: 16, gap: 16 },
  revenueInfo: { flex: 1 },
  revenueLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  revenueAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, minWidth: '45%', borderRadius: 12, padding: 16, alignItems: 'center' },
  blueCard: { backgroundColor: '#185FA5' },
  orangeCard: { backgroundColor: '#FF9800' },
  greenCard: { backgroundColor: '#4CAF50' },
  purpleCard: { backgroundColor: '#9C27B0' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4, textAlign: 'center' },
});
