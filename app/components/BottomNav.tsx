// ─────────────────────────────────────────────────────────────────────────────
//  BottomNav.tsx  (shared component — import in every screen)
// ─────────────────────────────────────────────────────────────────────────────
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ACCENT = '#D97B4A';

type Tab = 'Events' | 'Recipes' | 'Home' | 'Profile' | 'Dashboard';

interface BottomNavProps {
  current: Tab;
}

export function BottomNav({ current }: BottomNavProps) {
  const tabs: { label: Tab; icon: string; route: string }[] = [
    { label: 'Events',  icon: '📅', route: '/(tabs)/EventsScreen'},
    { label: 'Recipes', icon: '📖', route: '/(tabs)/RecipesScreen'},
    { label: 'Home',    icon: '🏠', route: '/(tabs)'},
    { label: 'Profile', icon: '👤', route: '/(tabs)/ProfileScreen'},
    { label: 'Dashboard', icon: '📋', route: '/(tabs)/DashboardScreen'},
  ];
  const router = useRouter();
  return (
    <View style={bn.bar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.label}
          style={bn.tab}
          onPress={() => router.push(t.route as any)}
        >
          <Text style={[bn.icon, current === t.label && bn.active]}>{t.icon}</Text>
          <Text style={[bn.label, current === t.label && bn.active]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const bn = StyleSheet.create({
  bar:    { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 16, paddingTop: 8 },
  tab:    { flex: 1, alignItems: 'center' },
  icon:   { fontSize: 20, color: '#bbb' },
  label:  { fontSize: 10, color: '#bbb', marginTop: 2 },
  active: { color: ACCENT },
});
