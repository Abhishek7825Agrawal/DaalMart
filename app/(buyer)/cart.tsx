import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, CartItem, Listing } from '@/lib/supabase';
import { ShoppingCart, Package, Trash2 } from 'lucide-react-native';

interface CartItemWithListing extends CartItem { listing: Listing; }

export default function CartScreen() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('cart_items').select('*, listing:listings(*)').eq('buyer_id', user.id).order('added_at', { ascending: false });
    if (!error && data) setCartItems(data as CartItemWithListing[]);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchCart(); }, [user]));

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (!error) setCartItems(cartItems.filter((i) => i.id !== itemId));
  };

  const handleRemove = (itemId: string, title: string) => {
    Alert.alert('Remove Item', `"${title}" ko cart se remove karna hai?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) },
    ]);
  };

  const checkout = async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    let success = 0;
    for (const item of cartItems) {
      const price = item.listing.final_price || item.listing.ai_price || 0;
      const { error } = await supabase.from('orders').insert({ buyer_id: user?.id, listing_id: item.listing_id, total_price: price, delivery_charge: 50, status: 'placed' });
      if (!error) {
        await supabase.from('listings').update({ status: 'sold' }).eq('id', item.listing_id);
        await supabase.from('cart_items').delete().eq('id', item.id);
        success++;
      }
    }
    setCheckingOut(false);
    if (success > 0) { Alert.alert('Success', `${success} items order ho gaye!`); setCartItems([]); }
  };

  const getTotal = () => cartItems.reduce((sum, i) => sum + (i.listing.final_price || i.listing.ai_price || 0), 0);
  const getDeliveryTotal = () => cartItems.length * 50;

  const renderCartItem = ({ item }: { item: CartItemWithListing }) => (
    <View style={styles.card}>
      {item.listing.image_url ? <Image source={{ uri: item.listing.image_url }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Package size={30} color="#999" /></View>}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{item.listing.title}</Text>
        <Text style={styles.category}>{item.listing.category} - {item.listing.condition}</Text>
        <Text style={styles.price}>Rs. {(item.listing.final_price || item.listing.ai_price || 0).toFixed(0)}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id, item.listing.title)}><Trash2 size={20} color="#D32F2F" /></TouchableOpacity>
    </View>
  );

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}><ShoppingCart size={60} color="#CCCCCC" /><Text style={styles.emptyTitle}>Cart khali hai</Text><Text style={styles.emptyText}>Browse se items add karo</Text></View>
      ) : (
        <>
          <FlatList data={cartItems} renderItem={renderCartItem} keyExtractor={(i) => i.id} contentContainerStyle={styles.listContent} />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Items Total</Text><Text style={styles.summaryValue}>Rs. {getTotal().toFixed(0)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery (Rs. 50/item)</Text><Text style={styles.summaryValue}>Rs. {getDeliveryTotal()}</Text></View>
            <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>Rs. {(getTotal() + getDeliveryTotal()).toFixed(0)}</Text></View>
            <TouchableOpacity style={[styles.checkoutButton, checkingOut && styles.buttonDisabled]} onPress={checkout} disabled={checkingOut}>
              {checkingOut ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.checkoutText}>Place Order karo</Text>}
            </TouchableOpacity>
          </View>
        </>
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
  listContent: { padding: 16, paddingBottom: 200 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 3 },
  image: { width: 80, height: 80 },
  imagePlaceholder: { width: 80, height: 80, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  category: { fontSize: 12, color: '#666', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#185FA5' },
  removeButton: { padding: 12, justifyContent: 'center' },
  summaryContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#185FA5' },
  checkoutButton: { backgroundColor: '#185FA5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  checkoutText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});
