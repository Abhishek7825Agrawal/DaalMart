import { Tabs } from 'expo-router';
import { ShoppingBag, ShoppingCart, User } from 'lucide-react-native';

export default function BuyerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true, headerStyle: { backgroundColor: '#185FA5' }, headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', height: 60, paddingBottom: 8, paddingTop: 8 },
      tabBarActiveTintColor: '#185FA5', tabBarInactiveTintColor: '#999',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Browse', tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ size, color }) => <ShoppingCart size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ size, color }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
