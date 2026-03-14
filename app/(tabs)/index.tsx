import React, { useState } from 'react';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BottomNav } from '../components/BottomNav';

// ─── placeholder colours ──────────────────────────────────────────────────────
const CARD_BG         = '#F4F1EB';
const ACCENT          = '#D97B4A';
const SOFT_GREEN      = '#7BAF7B';

// ─── mock data ────────────────────────────────────────────────────────────────
const FEED = [
  { id: '1', user: 'Sawyer', time: '14h', caption: 'Tomato Basil Soup 🍅', liked: false, image: require('../../assets/images/tomatoSoup.jpeg') },
  { id: '2', user: 'Katie',  time: '16h', caption: 'Spicy Ramen Night 🍜',  liked: true,  image: require('../../assets/images/spicyRamen.jpeg') },
  { id: '3', user: 'Sara',   time: '1d',  caption: 'Greek Salad prep 🥗',   liked: false, image: require('../../assets/images/greekSalad.jpeg') },
];

type EnergyLevel = 'drained' | 'busy' | 'great' | null;

export default function HomeScreen() {
  const [energy, setEnergy]       = useState<EnergyLevel>(null);
  const [showReset, setShowReset] = useState(true);
  const [feed, setFeed]           = useState(FEED);
  const router = useRouter();

  const toggle = (id: string) =>
    setFeed(f => f.map(p => p.id === id ? { ...p, liked: !p.liked } : p));

  const energyConfig: { key: EnergyLevel; label: string; emoji: string }[] = [
    { key: 'drained', label: 'Drained',       emoji: '😓' },
    { key: 'busy',    label: 'Busy but okay', emoji: '😅' },
    { key: 'great',   label: 'Back on track', emoji: '💪' },
  ];

  const mealSuggestions: Record<string, string[]> = {
    drained: ['Chicken Soup', 'Greek Salad', 'Stir Fry'],
    busy:    ['Stir Fry', 'Pasta Bolognese', 'Stuffed Peppers'],
    great:   ['Spanakopita', 'Homemade Ramen', 'Greek Salad'],
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Header ───────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.logo}>🍲 Miso </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/ProfileScreen' as any)}>
            <View style={s.avatarSmall}><Text style={s.avatarTxt}>You</Text></View>
          </TouchableOpacity>
        </View>

        {/* ── Reset My Week card ───────────────────────────── */}
        {showReset && (
          <View style={s.resetCard}>
            <View style={s.resetHeader}>
              <Text style={s.resetTitle}>Reset My Week 🔄</Text>
              <TouchableOpacity onPress={() => setShowReset(false)}>
                <Text style={s.dismiss}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.resetSub}>How's your energy lately?</Text>
            <View style={s.energyRow}>
              {energyConfig.map(({ key, label, emoji }) => (
                <TouchableOpacity
                  key={key}
                  style={[s.energyBtn, energy === key && s.energyBtnActive]}
                  onPress={() => setEnergy(key)}
                >
                  <Text style={s.energyEmoji}>{emoji}</Text>
                  <Text style={[s.energyLabel, energy === key && s.energyLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {energy && (
              <View style={s.suggestionBox}>
                <Text style={s.suggestionTitle}>
                  {energy === 'drained' ? '🛋 Recovery Mode — Minimal Prep' :
                   energy === 'busy'    ? '⚡ Quick Wins this Week' :
                                          '🌟 Cooking in Full Swing'}
                </Text>
                {mealSuggestions[energy].map(m => (
                  <Text key={m} style={s.suggestionItem}>• {m}</Text>
                ))}
                <TouchableOpacity
                  style={s.viewRecipesBtn}
                  onPress={() => router.push('/(tabs)/RecipesScreen' as any)}
                >
                  <Text style={s.viewRecipesTxt}>View My Recipes →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Friends' Food Feed ───────────────────────────── */}
        <Text style={s.sectionTitle}>Friends' Food 👫</Text>
        {feed.map(post => (
          <View key={post.id} style={s.feedCard}>
            <Image
              source={post.image}
              style={s.feedImg}
              resizeMode="cover"
            />
            <View style={s.feedFooter}>
              <View>
                <Text style={s.feedUser}>{post.user}</Text>
                <Text style={s.feedCaption}>{post.caption}</Text>
                <Text style={s.feedTime}>{post.time} ago</Text>
              </View>
              <TouchableOpacity onPress={() => toggle(post.id)}>
                <Text style={s.heart}>{post.liked ? '♥️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNav current="Home" />
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#FAFAF7' },
  scroll:             { padding: 16 },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logo:               { fontSize: 26, fontWeight: '800', color: ACCENT },
  avatarSmall:        { width: 38, height: 38, borderRadius: 19, backgroundColor: SOFT_GREEN, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:          { color: '#fff', fontWeight: '700', fontSize: 12 },

  resetCard:          { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0D8CC' },
  resetHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetTitle:         { fontSize: 17, fontWeight: '700', color: '#333' },
  dismiss:            { fontSize: 16, color: '#999' },
  resetSub:           { marginTop: 8, marginBottom: 12, fontSize: 13, color: '#666' },
  energyRow:          { flexDirection: 'row', gap: 8 },
  energyBtn:          { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#EDE8E0', borderWidth: 1.5, borderColor: 'transparent' },
  energyBtnActive:    { borderColor: ACCENT, backgroundColor: '#FDF0E8' },
  energyEmoji:        { fontSize: 20 },
  energyLabel:        { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
  energyLabelActive:  { color: ACCENT, fontWeight: '700' },

  suggestionBox:      { marginTop: 14, backgroundColor: '#fff', borderRadius: 10, padding: 12 },
  suggestionTitle:    { fontWeight: '700', color: '#333', marginBottom: 6 },
  suggestionItem:     { color: '#555', marginVertical: 2, fontSize: 13 },
  viewRecipesBtn:     { marginTop: 10, alignSelf: 'flex-end' },
  viewRecipesTxt:     { color: ACCENT, fontWeight: '700', fontSize: 13 },

  sectionTitle:       { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 12 },
  feedCard:           { backgroundColor: '#fff', borderRadius: 14, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  feedImg:            { width: '100%', height: 180 },
  feedFooter:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12 },
  feedUser:           { fontWeight: '700', fontSize: 14, color: '#333' },
  feedCaption:        { fontSize: 13, color: '#555', marginTop: 2 },
  feedTime:           { fontSize: 11, color: '#999', marginTop: 4 },
  heart:              { fontSize: 24 },
});