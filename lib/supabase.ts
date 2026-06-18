import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type UserRole = 'seller' | 'buyer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  ai_price: number;
  final_price: number;
  status: 'pending' | 'approved' | 'sold';
  image_url: string;
  created_at: string;
  seller?: User;
}

export interface CartItem {
  id: string;
  buyer_id: string;
  listing_id: string;
  added_at: string;
  listing?: Listing;
}

export interface Order {
  id: string;
  buyer_id: string;
  listing_id: string;
  total_price: number;
  delivery_charge: number;
  status: 'placed' | 'picked_up' | 'out_for_delivery' | 'delivered';
  created_at: string;
  listing?: Listing;
  buyer?: User;
}
