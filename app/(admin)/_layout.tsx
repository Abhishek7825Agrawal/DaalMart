import { Tabs } from 'expo-router';
import { ClipboardList, List, LayoutDashboard } from 'lucide-react-native';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true, headerStyle: { backgroundColor: '#185FA5' }, headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', height: 60, paddingBottom: 8, paddingTop: 8 },
      tabBarActiveTintColor: '#185FA5', tabBarInactiveTintColor: '#999',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Orders', tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} /> }} />
      <Tabs.Screen name="listings" options={{ title: 'Listings', tabBarIcon: ({ size, color }) => <List size={size} color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ size, color }) => <LayoutDashboard size={size} color={color} /> }} />
    </Tabs>
  );
}
