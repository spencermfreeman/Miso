// ─────────────────────────────────────────────────────────────────────────────
//  ProfileScreen.tsx
//  Changes:
//    • Vault summary card at top of profile
//    • Chef level badge (identity system: Home Cook → Sous Chef → Chef de Cuisine)
//    • Cook history log displayed on profile
//    • SafeAreaView → useSafeAreaInsets
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Modal, ScrollView, StyleSheet, Switch, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { COOK_LOG, totalSaved, mealsCooked, longestRun } from '../data/cookingStats';

const ACCENT_P     = '#D97B4A';
const SOFT_GREEN_P = '#7BAF7B';
const VAULT_DARK   = '#1E2A1E';

// ─── Chef level system ────────────────────────────────────────────────────────
function getChefLevel(meals: number): { title: string; next: string; progress: number; color: string } {
  if (meals < 5)  return { title: 'Home Cook',       next: 'Sous Chef',         progress: meals / 5,   color: '#A0B890' };
  if (meals < 15) return { title: 'Sous Chef',        next: 'Chef de Partie',    progress: (meals - 5) / 10, color: SOFT_GREEN_P };
  if (meals < 30) return { title: 'Chef de Partie',   next: 'Chef de Cuisine',   progress: (meals - 15) / 15, color: ACCENT_P };
  return               { title: 'Chef de Cuisine',   next: '— Max level',       progress: 1,           color: '#C8A040' };
}

const ALLERGY_OPTIONS = ['Gluten', 'Dairy', 'Nuts', 'Eggs', 'Shellfish', 'Soy'];
const PREF_OPTIONS    = ['Vegetarian', 'Vegan', 'Pescatarian', 'Low-Carb', 'Keto', 'Halal', 'Kosher'];

const SEED_FRIENDS = [
  { id: '1', name: 'Sawyer', emoji: '👩‍🍳' },
  { id: '2', name: 'Katie',  emoji: '🧑‍🍳' },
  { id: '3', name: 'Sara',   emoji: '👨‍🍳' },
];

const SEED_SCANS = [
  { id: '1', title: "Grandma Rosa's Chicken Soup",  from: 'Rosa Ferretti',  year: '1978' },
  { id: '2', title: "Yiayia Elena's Spanakopita",   from: 'Elena Papadakis', year: '1965' },
];

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();

  const [name,          setName]          = useState('Spencer');
  const [bio,           setBio]           = useState('Home cook · recipe collector 🍂');
  const [editing,       setEditing]       = useState(false);
  const [allergies,     setAllergies]     = useState<string[]>([]);
  const [prefs,         setPrefs]         = useState<string[]>(['Vegetarian']);
  const [friends,       setFriends]       = useState(SEED_FRIENDS);
  const [scans,         setScans]         = useState(SEED_SCANS);
  const [addFriend,     setAddFriend]     = useState('');
  const [showInvite,    setShowInvite]    = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [weeklyReset,   setWeeklyReset]   = useState(true);

  const meals  = mealsCooked(COOK_LOG);
  const saved  = totalSaved(COOK_LOG);
  const run    = longestRun(COOK_LOG);
  const level  = getChefLevel(meals);

  const toggleAllergy = (a: string) =>
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const togglePref = (p: string) =>
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const inviteFriend = () => {
    if (!addFriend.trim()) return;
    setFriends(prev => [...prev, { id: Date.now().toString(), name: addFriend.trim(), emoji: '🙂' }]);
    setAddFriend('');
    setShowInvite(false);
  };

  return (
    <View style={[ps.safe, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ── Avatar + name ──────────────────────────────── */}
        <View style={ps.profileTop}>
          <View style={ps.avatarLarge}>
            <Text style={ps.avatarEmoji}>👩‍🍳</Text>
          </View>
          {editing ? (
            <View style={{ flex: 1, gap: 8 }}>
              <TextInput style={ps.nameInput} value={name} onChangeText={setName} />
              <TextInput style={ps.bioInput} value={bio} onChangeText={setBio} multiline />
              <TouchableOpacity style={ps.saveBtn} onPress={() => setEditing(false)}>
                <Text style={ps.saveBtnTxt}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={ps.name}>{name}</Text>
              <Text style={ps.bio}>{bio}</Text>
              {/* Chef level badge */}
              <View style={[ps.levelBadge, { backgroundColor: level.color + '22', borderColor: level.color + '55' }]}>
                <Text style={[ps.levelTxt, { color: level.color }]}>👨‍🍳 {level.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={ps.editLink}>Edit profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Vault Summary ──────────────────────────────── */}
        <View style={ps.vaultCard}>
          <View style={ps.vaultHeader}>
            <Text style={ps.vaultLabel}>MY VAULT</Text>
            <Text style={ps.vaultAmount}>${saved} saved</Text>
          </View>

          {/* Chef level progress bar */}
          <View style={ps.levelRow}>
            <Text style={ps.levelRowLabel}>{level.title}</Text>
            <Text style={ps.levelRowNext}>→ {level.next}</Text>
          </View>
          <View style={ps.levelTrack}>
            <View style={[ps.levelFill, { width: `${Math.round(level.progress * 100)}%` as any, backgroundColor: level.color }]} />
          </View>
          <Text style={ps.levelHint}>
            {level.progress < 1
              ? `${meals} meals cooked · ${Math.round((1 - level.progress) * (meals < 5 ? 5 : meals < 15 ? 10 : 15))} more to reach ${level.next}`
              : 'Maximum level reached — legendary cook!'}
          </Text>

          {/* Stat chips */}
          <View style={ps.vaultStats}>
            <View style={ps.vaultStat}>
              <Text style={ps.vaultStatNum}>{meals}</Text>
              <Text style={ps.vaultStatLabel}>meals cooked</Text>
            </View>
            <View style={ps.vaultStatDiv} />
            <View style={ps.vaultStat}>
              <Text style={ps.vaultStatNum}>{run}</Text>
              <Text style={ps.vaultStatLabel}>day best run</Text>
            </View>
            <View style={ps.vaultStatDiv} />
            <View style={ps.vaultStat}>
              <Text style={ps.vaultStatNum}>${Math.round(saved / (meals || 1))}</Text>
              <Text style={ps.vaultStatLabel}>avg per meal</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Cooks ───────────────────────────────── */}
        <Text style={ps.sectionTitle}>🍽 Recent Cooks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {COOK_LOG.slice(0, 6).map(entry => (
            <View key={entry.id} style={ps.cookChip}>
              <Text style={ps.cookEmoji}>{entry.photoEmoji}</Text>
              <Text style={ps.cookName} numberOfLines={1}>{entry.mealName}</Text>
              <Text style={ps.cookSaved}>+${entry.savedAmount}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Allergy Info ───────────────────────────────── */}
        <Text style={ps.sectionTitle}>🚫 Allergies</Text>
        <View style={ps.chipRow}>
          {ALLERGY_OPTIONS.map(a => (
            <TouchableOpacity
              key={a}
              style={[ps.chip, allergies.includes(a) && ps.chipActive]}
              onPress={() => toggleAllergy(a)}
            >
              <Text style={[ps.chipTxt, allergies.includes(a) && ps.chipTxtActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Food Preferences ───────────────────────────── */}
        <Text style={ps.sectionTitle}>🥗 Food Preferences</Text>
        <View style={ps.chipRow}>
          {PREF_OPTIONS.map(p => (
            <TouchableOpacity
              key={p}
              style={[ps.chip, prefs.includes(p) && ps.chipActive]}
              onPress={() => togglePref(p)}
            >
              <Text style={[ps.chipTxt, prefs.includes(p) && ps.chipTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Family Recipe Scans ────────────────────────── */}
        <View style={ps.sectionRow}>
          <Text style={ps.sectionTitle}>📄 Family Recipe Scans</Text>
          <TouchableOpacity>
            <Text style={ps.addLink}>+ Upload Scan</Text>
          </TouchableOpacity>
        </View>
        {scans.map(scan => (
          <View key={scan.id} style={ps.scanCard}>
            <View style={ps.scanThumb}>
              <Text style={{ fontSize: 24 }}>📜</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ps.scanTitle}>{scan.title}</Text>
              <Text style={ps.scanMeta}>by {scan.from} · {scan.year}</Text>
            </View>
          </View>
        ))}

        {/* ── Friends / Group ────────────────────────────── */}
        <View style={ps.sectionRow}>
          <Text style={ps.sectionTitle}>👥 My Group</Text>
          <TouchableOpacity onPress={() => setShowInvite(true)}>
            <Text style={ps.addLink}>+ Invite</Text>
          </TouchableOpacity>
        </View>
        <View style={ps.friendsRow}>
          {friends.map(f => (
            <View key={f.id} style={ps.friendBubble}>
              <View style={ps.friendAvatar}><Text style={{ fontSize: 20 }}>{f.emoji}</Text></View>
              <Text style={ps.friendName}>{f.name}</Text>
            </View>
          ))}
        </View>

        {/* ── Settings ───────────────────────────────────── */}
        <Text style={ps.sectionTitle}>⚙️ Settings</Text>
        <View style={ps.settingRow}>
          <Text style={ps.settingLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: SOFT_GREEN_P }} thumbColor="#fff" />
        </View>
        <View style={ps.settingRow}>
          <Text style={ps.settingLabel}>"Reset My Week" check-in</Text>
          <Switch value={weeklyReset} onValueChange={setWeeklyReset} trackColor={{ true: SOFT_GREEN_P }} thumbColor="#fff" />
        </View>

      </ScrollView>

      {/* invite modal */}
      <Modal visible={showInvite} animationType="slide" presentationStyle="formSheet">
        <View style={{ flex: 1, backgroundColor: '#FAFAF7', padding: 24, paddingTop: (insets.top || 0) + 24 }}>
          <Text style={ps.sectionTitle}>Invite a Friend</Text>
          <TextInput
            style={ps.nameInput}
            placeholder="Friend's name or email"
            value={addFriend}
            onChangeText={setAddFriend}
          />
          <TouchableOpacity style={[ps.saveBtn, { marginTop: 16 }]} onPress={inviteFriend}>
            <Text style={ps.saveBtnTxt}>Send Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowInvite(false)} style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: '#999' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <BottomNav current="Profile" />
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FAFAF7' },
  profileTop:    { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 20 },
  avatarLarge:   { width: 80, height: 80, borderRadius: 40, backgroundColor: '#C8D8C8', justifyContent: 'center', alignItems: 'center' },
  avatarEmoji:   { fontSize: 36 },
  name:          { fontSize: 20, fontWeight: '800', color: '#333' },
  bio:           { fontSize: 13, color: '#777', marginTop: 4 },
  levelBadge:    { alignSelf: 'flex-start', marginTop: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  levelTxt:      { fontSize: 12, fontWeight: '700' },
  editLink:      { color: ACCENT_P, fontSize: 13, marginTop: 8, fontWeight: '600' },
  nameInput:     { backgroundColor: '#EDEBE4', borderRadius: 10, padding: 10, fontSize: 15, fontWeight: '700', color: '#333' },
  bioInput:      { backgroundColor: '#EDEBE4', borderRadius: 10, padding: 10, fontSize: 13, color: '#555' },
  saveBtn:       { backgroundColor: ACCENT_P, borderRadius: 10, padding: 10, alignItems: 'center' },
  saveBtnTxt:    { color: '#fff', fontWeight: '700' },

  vaultCard:     { backgroundColor: VAULT_DARK, borderRadius: 20, padding: 18, marginBottom: 20 },
  vaultHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  vaultLabel:    { fontSize: 10, fontWeight: '800', color: '#5A7A5A', letterSpacing: 2 },
  vaultAmount:   { fontSize: 20, fontWeight: '800', color: '#A8D8A8' },
  levelRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelRowLabel: { fontSize: 12, fontWeight: '700', color: '#88A888' },
  levelRowNext:  { fontSize: 12, color: '#4A6A4A' },
  levelTrack:    { height: 6, backgroundColor: '#2D4A2D', borderRadius: 3, marginBottom: 6 },
  levelFill:     { height: 6, borderRadius: 3 },
  levelHint:     { fontSize: 11, color: '#4A6A4A', marginBottom: 14 },
  vaultStats:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2D4A2D', paddingTop: 12 },
  vaultStat:     { flex: 1, alignItems: 'center' },
  vaultStatNum:  { fontSize: 18, fontWeight: '800', color: '#A8D8A8' },
  vaultStatLabel:{ fontSize: 10, color: '#4A6A4A', marginTop: 2 },
  vaultStatDiv:  { width: 1, backgroundColor: '#2D4A2D', marginVertical: 4 },

  cookChip:      { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginRight: 10, alignItems: 'center', width: 90, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cookEmoji:     { fontSize: 26, marginBottom: 4 },
  cookName:      { fontSize: 10, color: '#555', textAlign: 'center', fontWeight: '600', marginBottom: 2 },
  cookSaved:     { fontSize: 11, color: SOFT_GREEN_P, fontWeight: '800' },

  sectionTitle:  { fontSize: 15, fontWeight: '800', color: '#333', marginTop: 20, marginBottom: 10 },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  addLink:       { color: ACCENT_P, fontWeight: '700', fontSize: 13 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:          { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#EDEBE4', borderWidth: 1.5, borderColor: 'transparent' },
  chipActive:    { backgroundColor: '#FDF0E8', borderColor: ACCENT_P },
  chipTxt:       { fontSize: 13, color: '#555' },
  chipTxtActive: { color: ACCENT_P, fontWeight: '700' },
  scanCard:      { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  scanThumb:     { width: 50, height: 50, borderRadius: 10, backgroundColor: '#F4F1EB', justifyContent: 'center', alignItems: 'center' },
  scanTitle:     { fontSize: 14, fontWeight: '700', color: '#333' },
  scanMeta:      { fontSize: 12, color: '#999', marginTop: 2 },
  friendsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 },
  friendBubble:  { alignItems: 'center' },
  friendAvatar:  { width: 50, height: 50, borderRadius: 25, backgroundColor: '#C8D8C8', justifyContent: 'center', alignItems: 'center' },
  friendName:    { fontSize: 11, color: '#555', marginTop: 4, textAlign: 'center' },
  settingRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  settingLabel:  { fontSize: 14, color: '#444' },
});
