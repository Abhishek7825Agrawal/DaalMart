import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Listing } from '@/lib/supabase';
import { Package } from 'lucide-react-native';

export default function MyListingsScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (!error && data) setListings(data as Listing[]);
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchListings(); }, [user]));

  const onRefresh = () => { setRefreshing(true); fetchListings(); };

  const getStatusColor = (status: string) => {
    switch (status) { case 'approved': return '#4CAF50'; case 'pending': return '#FF9800'; case 'sold': return '#9E9E9E'; default: return '#999'; }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Package size={30} color="#999" /></View>}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}><Text style={styles.statusText}>{item.status}</Text></View>
        </View>
        <Text style={styles.category}>{item.category} - {item.condition}</Text>
        {item.final_price ? <Text style={styles.price}>Rs. {item.final_price.toFixed(0)}</Text> : item.ai_price ? <Text style={styles.priceSuggested}>Suggested: Rs. {item.ai_price.toFixed(0)}</Text> : null}
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      {listings.length === 0 ? (
        <View style={styles.emptyContainer}><Package size={60} color="#CCCCCC" /><Text style={styles.emptyTitle}>Koi listing nahi hai</Text><Text style={styles.emptyText}>+ button se nayi item list karo</Text></View>
      ) : (
        <FlatList data={listings} renderItem={renderListing} keyExtractor={(i) => i.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />} />
      )}
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 3 },
  image: { width: 100, height: 100 },
  imagePlaceholder: { width: 100, height: 100, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF', textTransform: 'capitalize' },
  category: { fontSize: 12, color: '#666', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#185FA5', marginTop: 4 },
  priceSuggested: { fontSize: 14, fontWeight: '600', color: '#FF9800', marginTop: 4 },
  date: { fontSize: 11, color: '#999', marginTop: 4 },
});
