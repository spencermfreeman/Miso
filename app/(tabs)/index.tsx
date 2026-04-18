// ─────────────────────────────────────────────────────────────────────────────
//  index.tsx  —  HomeScreen
//  Features added:
//    • "The Vault" — money-saved tracker (reimagined streak, not a streak counter)
//    • SOS "Don't Order Out" emergency mode
//    • Log a Cook — quick meal logging to feed the Vault
//    • Weekly Challenge card
//    • Friends' Food feed (unchanged structure, SafeAreaView removed)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomNav } from '../components/BottomNav';
import {
  COOK_LOG, CookEntry, WEEKLY_CHALLENGES, WeeklyChallenge,
  totalSaved, mealsCooked, longestRun, weeksActive,
} from '../data/cookingStats';

// ─── theme ────────────────────────────────────────────────────────────────────
const ACCENT      = '#D97B4A';
const SOFT_GREEN  = '#7BAF7B';
const CARD_BG     = '#F4F1EB';
const VAULT_DARK  = '#1E2A1E';
const VAULT_MID   = '#2D4A2D';

// ─── mock feed data ───────────────────────────────────────────────────────────
const FEED = [
  { id: '1', user: 'Sawyer', time: '14h', caption: 'Tomato Basil Soup 🍅', liked: false, image: require('../../assets/images/tomatoSoup.jpeg') },
  { id: '2', user: 'Katie',  time: '16h', caption: 'Spicy Ramen Night 🍜',  liked: true,  image: require('../../assets/images/spicyRamen.jpeg') },
  { id: '3', user: 'Sara',   time: '1d',  caption: 'Greek Salad prep 🥗',   liked: false, image: require('../../assets/images/greekSalad.jpeg') },
];

// ─── SOS recipes — fast meals when you're about to cave ──────────────────────
const SOS_RECIPES = [
  { name: 'Garlic butter pasta',   time: '12 min', emoji: '🍝', tip: 'Pasta + butter + garlic + parmesan. Feeds 2 for ~$3.' },
  { name: 'Fried rice',            time: '10 min', emoji: '🍳', tip: 'Leftover rice + egg + soy sauce + anything in the fridge.' },
  { name: 'Bean & cheese quesadilla', time: '8 min', emoji: '🫔', tip: 'Tortilla + canned beans + cheese. Crispy in 8 min.' },
  { name: 'Avocado toast + egg',   time: '7 min',  emoji: '🥑', tip: 'Sourdough + avo + 2 eggs any style. Cafe quality, $2.' },
  { name: 'Tuna melt',             time: '10 min', emoji: '🥪', tip: 'Canned tuna + mayo + cheese on toast. Always works.' },
];

type EnergyLevel = 'drained' | 'busy' | 'great' | null;
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// ─── Vault Card ───────────────────────────────────────────────────────────────
function VaultCard({ log }: { log: CookEntry[] }) {
  const saved  = totalSaved(log);
  const meals  = mealsCooked(log);
  const run    = longestRun(log);
  const weeks  = weeksActive(log);

  // Visual fill: treat $500 as "full vault"
  const fillPct = Math.min(saved / 500, 1);
  const barWidth = `${Math.round(fillPct * 100)}%`;

  return (
    <View style={v.card}>
      {/* dark header */}
      <View style={v.header}>
        <View>
          <Text style={v.label}>THE VAULT</Text>
          <Text style={v.sublabel}>Money you kept instead of DoorDash</Text>
        </View>
        <View style={v.amountBox}>
          <Text style={v.currency}>$</Text>
          <Text style={v.amount}>{saved}</Text>
        </View>
      </View>

      {/* fill bar */}
      <View style={v.barTrack}>
        <View style={[v.barFill, { width: barWidth as any }]} />
      </View>
      <View style={v.barLabels}>
        <Text style={v.barLabelLeft}>$0</Text>
        <Text style={v.barLabelRight}>$500 goal</Text>
      </View>

      {/* stats row */}
      <View style={v.statsRow}>
        <View style={v.stat}>
          <Text style={v.statNum}>{meals}</Text>
          <Text style={v.statLabel}>meals cooked</Text>
        </View>
        <View style={v.statDivider} />
        <View style={v.stat}>
          <Text style={v.statNum}>{run}</Text>
          <Text style={v.statLabel}>day best run</Text>
        </View>
        <View style={v.statDivider} />
        <View style={v.stat}>
          <Text style={v.statNum}>{weeks}</Text>
          <Text style={v.statLabel}>weeks active</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Log a Cook modal ─────────────────────────────────────────────────────────
function LogCookModal({
  visible, onClose, onSave,
}: { visible: boolean; onClose: () => void; onSave: (e: CookEntry) => void }) {
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<MealType>('Dinner');
  const [saved,    setSaved]    = useState('18');
  const insets = useSafeAreaInsets();

  const TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const EMOJIS: Record<MealType, string> = { Breakfast: '🍳', Lunch: '🥪', Dinner: '🍽', Snack: '🍎' };

  const save = () => {
    if (!mealName.trim()) return;
    onSave({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mealName: mealName.trim(),
      mealType,
      savedAmount: parseInt(saved) || 18,
      photoEmoji: EMOJIS[mealType],
    });
    setMealName(''); setMealType('Dinner'); setSaved('18');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[lc.wrap, { paddingTop: insets.top || 20 }]}>
        <View style={lc.header}>
          <Text style={lc.heading}>Log a Cook 🍳</Text>
          <TouchableOpacity onPress={onClose}><Text style={lc.cancel}>Cancel</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={lc.body}>
          <Text style={lc.fieldLabel}>What did you make?</Text>
          <TextInput
            style={lc.input}
            value={mealName}
            onChangeText={setMealName}
            placeholder="e.g. Chicken stir fry"
          />

          <Text style={lc.fieldLabel}>Meal type</Text>
          <View style={lc.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[lc.typeBtn, mealType === t && lc.typeBtnActive]}
                onPress={() => setMealType(t)}
              >
                <Text style={lc.typeEmoji}>{EMOJIS[t]}</Text>
                <Text style={[lc.typeTxt, mealType === t && lc.typeTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={lc.fieldLabel}>Estimated savings vs. ordering out ($)</Text>
          <View style={lc.savingsRow}>
            {['10', '15', '18', '22', '28', '35'].map(amt => (
              <TouchableOpacity
                key={amt}
                style={[lc.amtBtn, saved === amt && lc.amtBtnActive]}
                onPress={() => setSaved(amt)}
              >
                <Text style={[lc.amtTxt, saved === amt && lc.amtTxtActive]}>${amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={lc.saveBtn} onPress={save}>
            <Text style={lc.saveBtnTxt}>Add to My Vault 🔒</Text>
          </TouchableOpacity>

          <View style={lc.avgNote}>
            <Text style={lc.avgTxt}>💡 Average delivery order (with fees & tip) costs $38. Every cook counts.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── SOS Modal ────────────────────────────────────────────────────────────────
function SOSModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[sos.wrap, { paddingTop: insets.top || 20 }]}>
        <View style={sos.header}>
          <View>
            <Text style={sos.heading}>Don't Do It 🚫</Text>
            <Text style={sos.sub}>You can make one of these right now.</Text>
          </View>
          <TouchableOpacity onPress={onClose}><Text style={sos.close}>Close</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {SOS_RECIPES.map(r => (
            <View key={r.name} style={sos.card}>
              <Text style={sos.emoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={sos.cardTop}>
                  <Text style={sos.recipeName}>{r.name}</Text>
                  <View style={sos.timeBadge}><Text style={sos.timeTxt}>{r.time}</Text></View>
                </View>
                <Text style={sos.tip}>{r.tip}</Text>
              </View>
            </View>
          ))}
          <View style={sos.footer}>
            <Text style={sos.footerTxt}>The average delivery order costs $38 after fees and tip.</Text>
            <Text style={sos.footerTxt}>Every meal above costs under $4.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Weekly Challenge card ────────────────────────────────────────────────────
function ChallengeCard({ challenge }: { challenge: WeeklyChallenge }) {
  return (
    <View style={ch.card}>
      <View style={ch.top}>
        <View style={ch.emojiBox}><Text style={ch.emoji}>{challenge.emoji}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={ch.eyebrow}>THIS WEEK'S CHALLENGE</Text>
          <Text style={ch.title}>{challenge.title}</Text>
        </View>
        {challenge.completed && (
          <View style={ch.doneBadge}><Text style={ch.doneTxt}>Done ✓</Text></View>
        )}
      </View>
      <Text style={ch.desc}>{challenge.description}</Text>
      <Text style={ch.reward}>🏅 Reward: {challenge.reward}</Text>
    </View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [cookLog,    setCookLog]    = useState<CookEntry[]>(COOK_LOG);
  const [energy,     setEnergy]     = useState<EnergyLevel>(null);
  const [showReset,  setShowReset]  = useState(true);
  const [feed,       setFeed]       = useState(FEED);
  const [showLog,    setShowLog]    = useState(false);
  const [showSOS,    setShowSOS]    = useState(false);

  const activeChallenge = WEEKLY_CHALLENGES[0];

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
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Header ───────────────────────────────────────── */}
        <View style={s.header}>
          <Text style={s.logo}>🍲 Miso</Text>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.sosBtn} onPress={() => setShowSOS(true)}>
              <Text style={s.sosTxt}>🚫 SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/ProfileScreen' as any)}>
              <View style={s.avatarSmall}><Text style={s.avatarTxt}>You</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── The Vault ────────────────────────────────────── */}
        <VaultCard log={cookLog} />

        {/* ── Log a Cook button ─────────────────────────────── */}
        <TouchableOpacity style={s.logCookBtn} onPress={() => setShowLog(true)}>
          <Text style={s.logCookTxt}>+ Log a Cook  →  Grow Your Vault</Text>
        </TouchableOpacity>

        {/* ── Weekly Challenge ──────────────────────────────── */}
        <ChallengeCard challenge={activeChallenge} />

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
                  <Text style={[s.energyLabel, energy === key && s.energyLabelActive]}>{label}</Text>
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
                <TouchableOpacity style={s.viewRecipesBtn} onPress={() => router.push('/(tabs)/RecipesScreen' as any)}>
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
            <Image source={post.image} style={s.feedImg} resizeMode="cover" />
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

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav current="Home" />

      <LogCookModal visible={showLog} onClose={() => setShowLog(false)} onSave={e => setCookLog(prev => [e, ...prev])} />
      <SOSModal visible={showSOS} onClose={() => setShowSOS(false)} />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#FAFAF7' },
  scroll:            { padding: 16 },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo:              { fontSize: 26, fontWeight: '800', color: ACCENT },
  headerRight:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sosBtn:            { backgroundColor: '#FFE8E8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  sosTxt:            { fontSize: 13, fontWeight: '700', color: '#C0392B' },
  avatarSmall:       { width: 38, height: 38, borderRadius: 19, backgroundColor: SOFT_GREEN, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:         { color: '#fff', fontWeight: '700', fontSize: 12 },

  logCookBtn:        { backgroundColor: SOFT_GREEN, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  logCookTxt:        { color: '#fff', fontWeight: '800', fontSize: 14 },

  resetCard:         { backgroundColor: CARD_BG, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0D8CC' },
  resetHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetTitle:        { fontSize: 17, fontWeight: '700', color: '#333' },
  dismiss:           { fontSize: 16, color: '#999' },
  resetSub:          { marginTop: 8, marginBottom: 12, fontSize: 13, color: '#666' },
  energyRow:         { flexDirection: 'row', gap: 8 },
  energyBtn:         { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#EDE8E0', borderWidth: 1.5, borderColor: 'transparent' },
  energyBtnActive:   { borderColor: ACCENT, backgroundColor: '#FDF0E8' },
  energyEmoji:       { fontSize: 20 },
  energyLabel:       { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center' },
  energyLabelActive: { color: ACCENT, fontWeight: '700' },
  suggestionBox:     { marginTop: 14, backgroundColor: '#fff', borderRadius: 10, padding: 12 },
  suggestionTitle:   { fontWeight: '700', color: '#333', marginBottom: 6 },
  suggestionItem:    { color: '#555', marginVertical: 2, fontSize: 13 },
  viewRecipesBtn:    { marginTop: 10, alignSelf: 'flex-end' },
  viewRecipesTxt:    { color: ACCENT, fontWeight: '700', fontSize: 13 },

  sectionTitle:      { fontSize: 17, fontWeight: '700', color: '#333', marginBottom: 12 },
  feedCard:          { backgroundColor: '#fff', borderRadius: 14, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  feedImg:           { width: '100%', height: 180 },
  feedFooter:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12 },
  feedUser:          { fontWeight: '700', fontSize: 14, color: '#333' },
  feedCaption:       { fontSize: 13, color: '#555', marginTop: 2 },
  feedTime:          { fontSize: 11, color: '#999', marginTop: 4 },
  heart:             { fontSize: 24 },
});

// ─── Vault styles ─────────────────────────────────────────────────────────────
const v = StyleSheet.create({
  card:        { backgroundColor: VAULT_DARK, borderRadius: 20, marginBottom: 12, overflow: 'hidden' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 14 },
  label:       { fontSize: 11, fontWeight: '800', color: '#7BAF7B', letterSpacing: 2 },
  sublabel:    { fontSize: 12, color: '#88A888', marginTop: 3 },
  amountBox:   { flexDirection: 'row', alignItems: 'flex-start' },
  currency:    { fontSize: 18, color: '#A8D8A8', fontWeight: '700', marginTop: 4 },
  amount:      { fontSize: 48, color: '#E8F5E8', fontWeight: '800', lineHeight: 52 },
  barTrack:    { height: 8, backgroundColor: VAULT_MID, marginHorizontal: 20 },
  barFill:     { height: 8, backgroundColor: SOFT_GREEN, borderRadius: 4 },
  barLabels:   { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  barLabelLeft:  { fontSize: 10, color: '#5A7A5A' },
  barLabelRight: { fontSize: 10, color: '#5A7A5A' },
  statsRow:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: VAULT_MID },
  stat:        { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum:     { fontSize: 22, fontWeight: '800', color: '#E8F5E8' },
  statLabel:   { fontSize: 10, color: '#5A7A5A', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: VAULT_MID, marginVertical: 10 },
});

// ─── Log Cook styles ──────────────────────────────────────────────────────────
const lc = StyleSheet.create({
  wrap:      { flex: 1, backgroundColor: '#FAFAF7' },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  heading:   { fontSize: 20, fontWeight: '800', color: '#333' },
  cancel:    { color: '#999', fontSize: 15 },
  body:      { padding: 20, paddingBottom: 60 },
  fieldLabel:{ fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 16 },
  input:     { backgroundColor: '#EDEBE4', borderRadius: 12, padding: 14, fontSize: 15, color: '#333' },
  typeRow:   { flexDirection: 'row', gap: 8 },
  typeBtn:   { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: '#EDEBE4', borderWidth: 1.5, borderColor: 'transparent' },
  typeBtnActive: { borderColor: ACCENT, backgroundColor: '#FDF0E8' },
  typeEmoji: { fontSize: 18 },
  typeTxt:   { fontSize: 10, color: '#666', marginTop: 4 },
  typeTxtActive: { color: ACCENT, fontWeight: '700' },
  savingsRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  amtBtn:    { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: '#EDEBE4', borderWidth: 1.5, borderColor: 'transparent' },
  amtBtnActive: { borderColor: SOFT_GREEN, backgroundColor: '#EEF7EE' },
  amtTxt:    { fontSize: 14, color: '#555', fontWeight: '600' },
  amtTxtActive: { color: SOFT_GREEN, fontWeight: '800' },
  saveBtn:   { marginTop: 28, backgroundColor: VAULT_DARK, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnTxt:{ color: '#A8D8A8', fontWeight: '800', fontSize: 16 },
  avgNote:   { marginTop: 16, backgroundColor: '#F4F1EB', borderRadius: 12, padding: 14 },
  avgTxt:    { fontSize: 12, color: '#888', lineHeight: 18 },
});

// ─── SOS styles ───────────────────────────────────────────────────────────────
const sos = StyleSheet.create({
  wrap:       { flex: 1, backgroundColor: '#FAFAF7' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 8 },
  heading:    { fontSize: 22, fontWeight: '800', color: '#333' },
  sub:        { fontSize: 13, color: '#888', marginTop: 2 },
  close:      { color: '#999', fontSize: 15, marginTop: 4 },
  card:       { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  emoji:      { fontSize: 32, width: 44, textAlign: 'center' },
  cardTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  recipeName: { fontSize: 15, fontWeight: '700', color: '#333', flex: 1 },
  timeBadge:  { backgroundColor: '#EEF7EE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  timeTxt:    { fontSize: 11, color: '#3A7A3A', fontWeight: '700' },
  tip:        { fontSize: 13, color: '#777', lineHeight: 18 },
  footer:     { marginTop: 8, padding: 16, backgroundColor: '#FFF8F0', borderRadius: 14 },
  footerTxt:  { fontSize: 13, color: '#A06040', lineHeight: 20, textAlign: 'center' },
});

// ─── Challenge styles ─────────────────────────────────────────────────────────
const ch = StyleSheet.create({
  card:     { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#E0D8CC' },
  top:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  emojiBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD_BG, justifyContent: 'center', alignItems: 'center' },
  emoji:    { fontSize: 22 },
  eyebrow:  { fontSize: 9, fontWeight: '800', color: '#BBB', letterSpacing: 1.5 },
  title:    { fontSize: 15, fontWeight: '800', color: '#333', marginTop: 2 },
  doneBadge:{ backgroundColor: '#EEF7EE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  doneTxt:  { fontSize: 11, color: '#3A7A3A', fontWeight: '700' },
  desc:     { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 10 },
  reward:   { fontSize: 12, color: ACCENT, fontWeight: '700' },
});
