import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Listing } from '@/lib/supabase';
import { Search, ShoppingBag, Package, Plus } from 'lucide-react-native';

const CATEGORIES = ['All', 'Mobile', 'Laptop', 'Tablet', 'Camera', 'Audio', 'Gaming', 'Wearables', 'Other'];

export default function BrowseScreen() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const fetchListings = async () => {
    const { data, error } = await supabase.from('listings').select('*, seller:users!listings_seller_id_fkey(name)').eq('status', 'approved').order('created_at', { ascending: false });
    if (!error && data) { setListings(data as Listing[]); filterListings(data as Listing[], search, activeCategory); }
    setLoading(false); setRefreshing(false);
  };

  const filterListings = (items: Listing[], query: string, category: string) => {
    let filtered = items;
    if (query) filtered = filtered.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.description?.toLowerCase().includes(query.toLowerCase()));
    if (category !== 'All') filtered = filtered.filter((i) => i.category === category);
    setFiltered(filtered);
  };

  useFocusEffect(useCallback(() => { fetchListings(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchListings(); };
  const handleSearch = (query: string) => { setSearch(query); filterListings(listings, query, activeCategory); };
  const handleCategoryFilter = (category: string) => { setActiveCategory(category); filterListings(listings, search, category); };

  const addToCart = async (listingId: string) => {
    if (!user) return;
    setAddingToCart(listingId);
    const { error } = await supabase.from('cart_items').insert({ buyer_id: user.id, listing_id: listingId });
    if (error) { if (error.code === '23505') alert('Already cart mein hai'); else alert('Add nahi ho paaya'); }
    else alert('Cart mein add ho gaya!');
    setAddingToCart(null);
  };

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Package size={40} color="#CCCCCC" /></View>}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.seller}>by {item.seller?.name || 'Unknown'}</Text>
        <View style={styles.details}><Text style={styles.category}>{item.category}</Text><Text style={styles.condition}>- {item.condition}</Text></View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {item.final_price?.toFixed(0) || item.ai_price?.toFixed(0) || 'N/A'}</Text>
          <TouchableOpacity style={[styles.addButton, addingToCart === item.id && styles.addButtonDisabled]} onPress={() => addToCart(item.id)} disabled={addingToCart === item.id}>
            {addingToCart === item.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Plus size={18} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}><Search size={20} color="#999" /><TextInput style={styles.searchInput} placeholder="Item search karo..." placeholderTextColor="#999" value={search} onChangeText={handleSearch} /></View>
      <FlatList horizontal data={CATEGORIES} keyExtractor={(i) => i} renderItem={({ item }) => (<TouchableOpacity style={[styles.filterButton, activeCategory === item && styles.filterActive]} onPress={() => handleCategoryFilter(item)}><Text style={[styles.filterText, activeCategory === item && styles.filterTextActive]}>{item}</Text></TouchableOpacity>)} style={styles.filterList} contentContainerStyle={styles.filterContent} showsHorizontalScrollIndicator={false} />
      {filtered.length === 0 ? <View style={styles.emptyContainer}><ShoppingBag size={60} color="#CCCCCC" /><Text style={styles.emptyTitle}>Koi item nahi mili</Text><Text style={styles.emptyText}>Koi aur category try karo</Text></View> : <FlatList data={filtered} renderItem={renderListing} keyExtractor={(i) => i.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />} numColumns={2} columnWrapperStyle={styles.row} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 16, marginBottom: 8, paddingHorizontal: 16, borderRadius: 12, elevation: 2 },
  searchInput: { flex: 1, padding: 12, fontSize: 16, color: '#333', marginLeft: 8 },
  filterList: { maxHeight: 50 },
  filterContent: { paddingHorizontal: 12, paddingBottom: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#185FA5', borderColor: '#185FA5' },
  filterText: { fontSize: 14, color: '#666' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
  listContent: { padding: 12 },
  row: { justifyContent: 'space-between' },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, margin: 6, overflow: 'hidden', elevation: 3, maxWidth: '48%' },
  image: { width: '100%', height: 120 },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  seller: { fontSize: 11, color: '#999', marginBottom: 4 },
  details: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 10, color: '#185FA5', fontWeight: '500' },
  condition: { fontSize: 10, color: '#666', marginLeft: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '700', color: '#185FA5' },
  addButton: { backgroundColor: '#185FA5', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addButtonDisabled: { opacity: 0.7 },
});
