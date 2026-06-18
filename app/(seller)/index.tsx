import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Camera, Upload } from 'lucide-react-native';

const CATEGORIES = ['Mobile', 'Laptop', 'Tablet', 'Camera', 'Audio', 'Gaming', 'Wearables', 'Other'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function ListItemScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert('Permission denied', 'Gallery access chahiye'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) { Alert.alert('Permission denied', 'Camera access chahiye'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('listings').upload(fileName, blob, { contentType: `image/${fileExt}` });
      if (error) throw error;
      const { data } = supabase.storage.from('listings').getPublicUrl(fileName);
      return data.publicUrl;
    } catch { return null; }
  };

  const handleSubmit = async () => {
    if (!title || !category || !condition) { Alert.alert('Error', 'Title, category aur condition daalo'); return; }
    setLoading(true);
    let imageUrl = '';
    if (imageUri) { const url = await uploadImage(imageUri); if (url) imageUrl = url; }
    const { error } = await supabase.from('listings').insert({ seller_id: user?.id, title, category, condition, description, image_url: imageUrl, status: 'pending' });
    setLoading(false);
    if (error) Alert.alert('Error', 'Listing create nahi ho paayi');
    else { Alert.alert('Success', 'Listing submit ho gayi!'); setTitle(''); setCategory(''); setCondition(''); setDescription(''); setImageUri(null); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Item Photo</Text>
      <View style={styles.imageContainer}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : <View style={styles.placeholderImage}><Camera size={40} color="#999" /><Text style={styles.placeholderText}>Photo add karo</Text></View>}
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}><Upload size={20} color="#185FA5" /><Text style={styles.imageButtonText}>Gallery</Text></TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}><Camera size={20} color="#185FA5" /><Text style={styles.imageButtonText}>Camera</Text></TouchableOpacity>
        </View>
      </View>
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} placeholder="Item ka naam daalo" placeholderTextColor="#999" value={title} onChangeText={setTitle} />
      <Text style={styles.label}>Category *</Text>
      <View style={styles.optionsContainer}>{CATEGORIES.map((cat) => (<TouchableOpacity key={cat} style={[styles.optionButton, category === cat && styles.optionActive]} onPress={() => setCategory(cat)}><Text style={[styles.optionText, category === cat && styles.optionTextActive]}>{cat}</Text></TouchableOpacity>))}</View>
      <Text style={styles.label}>Condition *</Text>
      <View style={styles.optionsContainer}>{CONDITIONS.map((cond) => (<TouchableOpacity key={cond} style={[styles.optionButton, condition === cond && styles.optionActive]} onPress={() => setCondition(cond)}><Text style={[styles.optionText, condition === cond && styles.optionTextActive]}>{cond}</Text></TouchableOpacity>))}</View>
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Item ke baare mein batao" placeholderTextColor="#999" multiline numberOfLines={4} value={description} onChangeText={setDescription} />
      <TouchableOpacity style={[styles.submitButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Listing Submit karo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, fontSize: 16, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageContainer: { marginBottom: 16 },
  placeholderImage: { backgroundColor: '#F5F5F5', borderRadius: 12, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  placeholderText: { color: '#999', marginTop: 8 },
  imageButtons: { flexDirection: 'row', gap: 12 },
  imageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#185FA5', gap: 8 },
  imageButtonText: { color: '#185FA5', fontWeight: '600' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' },
  optionActive: { borderColor: '#185FA5', backgroundColor: '#E8F1FF' },
  optionText: { color: '#666', fontSize: 14 },
  optionTextActive: { color: '#185FA5', fontWeight: '600' },
  submitButton: { backgroundColor: '#185FA5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});
