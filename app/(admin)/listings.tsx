import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Listing } from '@/lib/supabase';
import { Package, Check, X, DollarSign } from 'lucide-react-native';

interface ListingWithSeller extends Listing { seller: { name: string }; }

export default function AdminListingsScreen() {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [priceModal, setPriceModal] = useState<ListingWithSeller | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchListings = async () => {
    let query = supabase.from('listings').select('*, seller:users!listings_seller_id_fkey(name)').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data, error } = await query;
    if (!error && data) setListings(data as ListingWithSeller[]);
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchListings(); }, [filter]));

  const onRefresh = () => { setRefreshing(true); fetchListings(); };

  const approveListing = (listing: ListingWithSeller) => { setPriceInput(listing.ai_price?.toFixed(0) || ''); setPriceModal(listing); };

  const confirmApproval = async () => {
    if (!priceModal) return;
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) { Alert.alert('Error', 'Valid price daalo'); return; }
    setUpdating(priceModal.id);
    const { error } = await supabase.from('listings').update({ status: 'approved', final_price: price }).eq('id', priceModal.id);
    if (!error) { setListings(listings.filter((l) => l.id !== priceModal.id)); setPriceModal(null); }
    setUpdating(null);
  };

  const rejectListing = (listing: ListingWithSeller) => {
    Alert.alert('Reject Listing', `"${listing.title}" ko reject karna hai?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        setUpdating(listing.id);
        const { error } = await supabase.from('listings').delete().eq('id', listing.id);
        if (!error) setListings(listings.filter((l) => l.id !== listing.id));
        setUpdating(null);
      }},
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderListing = ({ item }: { item: ListingWithSeller }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.listingInfo}><Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.listingCategory}>{item.category} - {item.condition}</Text></View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? '#4CAF50' : '#FF9800' }]}><Text style={styles.statusText}>{item.status}</Text></View>
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsRow}><Text style={styles.label}>Seller:</Text><Text style={styles.value}>{item.seller?.name}</Text></View>
      {item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
      <View style={styles.divider} />
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.rejectButton, updating === item.id && styles.buttonDisabled]} onPress={() => rejectListing(item)} disabled={updating === item.id}><X size={18} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={[styles.approveButton, updating === item.id && styles.buttonDisabled]} onPress={() => approveListing(item)} disabled={updating === item.id}>
              {updating === item.id ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Check size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>{(['pending', 'approved', 'all'] as const).map((f) => (
        <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
          <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
        </TouchableOpacity>
      ))}</View>
      {listings.length === 0 ? <View style={styles.emptyContainer}><Package size={60} color="#CCCCCC" /><Text style={styles.emptyTitle}>Koi listing nahi hai</Text><Text style={styles.emptyText}>{filter === 'pending' ? 'Pending listings yahan dikhengay' : 'Approved listings yahan dikhengay'}</Text></View> :
        <FlatList data={listings} renderItem={renderListing} keyExtractor={(i) => i.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#185FA5']} />} />}
      <Modal visible={!!priceModal} transparent animationType="fade" onRequestClose={() => setPriceModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Price</Text>
            <Text style={styles.modalSubtitle}>{priceModal?.title}</Text>
            <View style={styles.priceInputContainer}><DollarSign size={20} color="#185FA5" /><TextInput style={styles.priceInput} keyboardType="numeric" value={priceInput} onChangeText={setPriceInput} placeholder="Price daalo" placeholderTextColor="#999" /></View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPriceModal(null)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmApproval}><Text style={styles.modalConfirmText}>Approve</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { flexDirection: 'row', padding: 16, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#185FA5', borderColor: '#185FA5' },
  filterText: { fontSize: 14, color: '#666' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
  listContent: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, padding: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  listingInfo: { flex: 1, marginRight: 12 },
  listingTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  listingCategory: { fontSize: 12, color: '#666' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333', fontWeight: '500' },
  description: { fontSize: 13, color: '#666', lineHeight: 18, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: '#999' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  rejectButton: { backgroundColor: '#D32F2F', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  approveButton: { backgroundColor: '#4CAF50', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 350 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20 },
  priceInput: { flex: 1, padding: 16, fontSize: 20, fontWeight: '700', color: '#333', textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelButton: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  modalCancelText: { color: '#666', fontWeight: '600', fontSize: 16 },
  modalConfirmButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#185FA5', alignItems: 'center' },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
