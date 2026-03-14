// ─────────────────────────────────────────────────────────────────────────────
//  ProfileScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import {
    Modal, SafeAreaView,
    ScrollView,
    StyleSheet, Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BottomNav } from '../components/BottomNav';

const ACCENT_P     = '#D97B4A';
const SOFT_GREEN_P = '#7BAF7B';

const ALLERGY_OPTIONS  = ['Gluten', 'Dairy', 'Nuts', 'Eggs', 'Shellfish', 'Soy'];
const PREF_OPTIONS     = ['Vegetarian', 'Vegan', 'Pescatarian', 'Low-Carb', 'Keto', 'Halal', 'Kosher'];

const SEED_FRIENDS = [
  { id: '1', name: 'Sawyer', emoji: '👩‍🍳' },
  { id: '2', name: 'Katie',  emoji: '🧑‍🍳' },
  { id: '3', name: 'Sara',   emoji: '👨‍🍳' },
];

const SEED_SCANS = [
  { id: '1', title: "Grandma Rosa's Chicken Soup",  from: 'Rosa Ferretti', year: '1978' },
  { id: '2', title: "Yiayia Elena's Spanakopita",   from: 'Elena Papadakis', year: '1965' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [name,       setName]       = useState('Spencer');
  const [bio,        setBio]        = useState('Home cook · recipe collector 🍂');
  const [editing,    setEditing]    = useState(false);
  const [allergies,  setAllergies]  = useState<string[]>([]);
  const [prefs,      setPrefs]      = useState<string[]>(['Vegetarian']);
  const [friends,    setFriends]    = useState(SEED_FRIENDS);
  const [scans,      setScans]      = useState(SEED_SCANS);
  const [addFriend,  setAddFriend]  = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [weeklyReset,   setWeeklyReset]   = useState(true);

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
    <SafeAreaView style={ps.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ── Avatar + name ──────────────────────────────── */}
        <View style={ps.profileTop}>
          <View style={ps.avatarLarge}>
            <Text style={ps.avatarEmoji}>👩‍🍳</Text>
            {/* swap with <Image> when you add photo picker */}
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
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={ps.editLink}>Edit profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
            {/* placeholder for scan image */}
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
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: SOFT_GREEN_P }}
            thumbColor="#fff"
          />
        </View>
        <View style={ps.settingRow}>
          <Text style={ps.settingLabel}>"Reset My Week" check-in</Text>
          <Switch
            value={weeklyReset}
            onValueChange={setWeeklyReset}
            trackColor={{ true: SOFT_GREEN_P }}
            thumbColor="#fff"
          />
        </View>

      </ScrollView>

      {/* invite modal */}
      <Modal visible={showInvite} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7', padding: 24 }}>
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
        </SafeAreaView>
      </Modal>

      <BottomNav current="Profile" />
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FAFAF7' },
  profileTop:    { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24 },
  avatarLarge:   { width: 80, height: 80, borderRadius: 40, backgroundColor: '#C8D8C8', justifyContent: 'center', alignItems: 'center' },
  avatarEmoji:   { fontSize: 36 },
  name:          { fontSize: 20, fontWeight: '800', color: '#333' },
  bio:           { fontSize: 13, color: '#777', marginTop: 4 },
  editLink:      { color: ACCENT_P, fontSize: 13, marginTop: 6, fontWeight: '600' },
  nameInput:     { backgroundColor: '#EDEBE4', borderRadius: 10, padding: 10, fontSize: 15, fontWeight: '700', color: '#333' },
  bioInput:      { backgroundColor: '#EDEBE4', borderRadius: 10, padding: 10, fontSize: 13, color: '#555' },
  saveBtn:       { backgroundColor: ACCENT_P, borderRadius: 10, padding: 10, alignItems: 'center' },
  saveBtnTxt:    { color: '#fff', fontWeight: '700' },
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