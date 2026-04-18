// ─────────────────────────────────────────────────────────────────────────────
//  EventsScreen.tsx
//  Changes:
//    • Friend cook leaderboard at top (most meals cooked this week wins)
//    • "Cook of the Week" crown on winner
//    • SafeAreaView → useSafeAreaInsets
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { FRIEND_STATS } from '../data/cookingStats';

const SOFT_GREEN = '#7BAF7B';
const ACCENT     = '#D97B4A';
const VAULT_DARK = '#1E2A1E';

type RSVPStatus = 'going' | 'maybe' | 'no' | null;
type Event = {
  id: string; title: string; host: string; date: string;
  address: string; description: string; rsvp: RSVPStatus;
  theme?: string;
};

const SEED_EVENTS: Event[] = [
  {
    id: '1', title: "Sawyer's Potluck", host: 'Sawyer', date: 'Sat Mar 15 · 6:00 PM',
    address: '42 Birchwood Ave', description: 'Bring a dish to share! Theme: Mediterranean.',
    rsvp: null, theme: '🫒 Mediterranean',
  },
  {
    id: '2', title: "Dinner at Katie's", host: 'Katie', date: 'Sun Mar 16 · 7:30 PM',
    address: '18 Maple St', description: 'Casual dinner night. Katie is making her famous ramen.',
    rsvp: 'going',
  },
  {
    id: '3', title: "Brunch at Sara's", host: 'Sara', date: 'Sat Mar 22 · 10:00 AM',
    address: '5 Elm Court', description: 'Sunday-style brunch. Bring something sweet!',
    rsvp: null,
  },
];

// ─── Friend Leaderboard ───────────────────────────────────────────────────────
function Leaderboard() {
  const sorted = [...FRIEND_STATS].sort((a, b) => b.meals - a.meals);
  const winner = sorted[0];

  return (
    <View style={lb.card}>
      <View style={lb.header}>
        <Text style={lb.heading}>🏆 Cook of the Week</Text>
        <Text style={lb.sub}>Who cooked the most meals this week</Text>
      </View>

      {sorted.map((f, i) => {
        const isWinner = f.name === winner.name;
        const isYou    = f.name === 'You';
        return (
          <View key={f.name} style={[lb.row, isWinner && lb.rowWinner, isYou && !isWinner && lb.rowYou]}>
            <Text style={lb.rank}>
              {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </Text>
            <View style={[lb.avatar, isWinner && lb.avatarWinner]}>
              <Text style={lb.avatarEmoji}>{f.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[lb.name, isWinner && lb.nameWinner]}>
                {f.name}{isWinner ? '  👑 Cook of the Week' : ''}{isYou ? ' (you)' : ''}
              </Text>
              <Text style={lb.saved}>${f.saved} saved this week</Text>
            </View>
            <View style={lb.mealsBox}>
              <Text style={[lb.mealsNum, isWinner && lb.mealsNumWinner]}>{f.meals}</Text>
              <Text style={lb.mealsLabel}>meals</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── RSVP Button ─────────────────────────────────────────────────────────────
function RSVPButton({ status, onSelect }: { status: RSVPStatus; onSelect: (s: RSVPStatus) => void }) {
  const opts: { key: RSVPStatus; label: string; color: string }[] = [
    { key: 'going', label: '✓ Going',  color: SOFT_GREEN },
    { key: 'maybe', label: '? Maybe',  color: '#F0C060'  },
    { key: 'no',    label: "✕ Can't",  color: '#E07070'  },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
      {opts.map(o => (
        <TouchableOpacity
          key={o.key}
          style={[ev.rsvpBtn, status === o.key && { backgroundColor: o.color }]}
          onPress={() => onSelect(o.key)}
        >
          <Text style={[ev.rsvpTxt, status === o.key && { color: '#fff', fontWeight: '700' }]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── EventsScreen ─────────────────────────────────────────────────────────────
export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [events,     setEvents]  = useState<Event[]>(SEED_EVENTS);
  const [showCreate, setCreate]  = useState(false);
  const [title,      setTitle]   = useState('');
  const [date,       setDate]    = useState('');
  const [address,    setAddress] = useState('');
  const [desc,       setDesc]    = useState('');
  const [theme,      setTheme]   = useState('');

  const updateRSVP = (id: string, rsvp: RSVPStatus) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, rsvp } : e));

  const saveEvent = () => {
    if (!title.trim()) return;
    setEvents(prev => [{
      id: Date.now().toString(), title: title.trim(), host: 'You',
      date: date.trim() || 'TBD', address: address.trim() || 'TBD',
      description: desc.trim(), rsvp: 'going',
      theme: theme.trim() || undefined,
    }, ...prev]);
    setTitle(''); setDate(''); setAddress(''); setDesc(''); setTheme('');
    setCreate(false);
  };

  return (
    <View style={[ev.safe, { paddingTop: insets.top }]}>
      <View style={ev.header}>
        <Text style={ev.heading}>📅 Events</Text>
        <TouchableOpacity style={ev.createBtn} onPress={() => setCreate(true)}>
          <Text style={ev.createTxt}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ── Leaderboard ──────────────────────────────────── */}
        <Leaderboard />

        {/* ── Upcoming Events ──────────────────────────────── */}
        <Text style={ev.sectionTitle}>Upcoming Events</Text>

        {events.map(e => (
          <View key={e.id} style={ev.card}>
            <View style={ev.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={ev.eventTitle}>{e.title}</Text>
                <Text style={ev.meta}>{e.date}</Text>
                <Text style={ev.meta}>📍 {e.address}</Text>
                {e.theme && <Text style={ev.theme}>Theme: {e.theme}</Text>}
              </View>
              {e.rsvp === 'going' && <View style={ev.goingBadge}><Text style={ev.goingTxt}>Going ✓</Text></View>}
              {e.rsvp === 'maybe' && <View style={[ev.goingBadge, { backgroundColor: '#FFF3CC' }]}><Text style={[ev.goingTxt, { color: '#B8860B' }]}>Maybe</Text></View>}
              {e.rsvp === 'no'    && <View style={[ev.goingBadge, { backgroundColor: '#FFE8E8' }]}><Text style={[ev.goingTxt, { color: '#C0392B' }]}>Can't go</Text></View>}
            </View>
            <Text style={ev.desc}>{e.description}</Text>
            <RSVPButton status={e.rsvp} onSelect={s => updateRSVP(e.id, s)} />
          </View>
        ))}
      </ScrollView>

      {/* ── Create event modal ──────────────────────────────── */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <View style={[ev.modalWrap, { paddingTop: insets.top || 20 }]}>
          <View style={ev.modalHeader}>
            <Text style={ev.heading}>New Event</Text>
            <TouchableOpacity onPress={() => setCreate(false)}>
              <Text style={{ color: '#999', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {([
              ['Event Name *', title,   setTitle,   'e.g. Friday Potluck'],
              ['Date & Time',  date,    setDate,    'e.g. Sat Mar 15 · 6 PM'],
              ['Address',      address, setAddress, 'e.g. 42 Birchwood Ave'],
              ['Theme / Note', theme,   setTheme,   'e.g. 🍕 Italian Night (optional)'],
            ] as [string, string, (v: string) => void, string][]).map(([label, val, setter, ph]) => (
              <View key={label}>
                <Text style={ev.fieldLabel}>{label}</Text>
                <TextInput
                  style={ev.fieldInput}
                  value={val}
                  onChangeText={setter}
                  placeholder={ph}
                />
              </View>
            ))}
            <Text style={ev.fieldLabel}>Description</Text>
            <TextInput
              style={[ev.fieldInput, { height: 90 }]}
              multiline value={desc} onChangeText={setDesc}
              placeholder="What's the plan?"
            />
            <TouchableOpacity style={ev.saveBtn} onPress={saveEvent}>
              <Text style={ev.saveBtnTxt}>Create Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <BottomNav current="Events" />
    </View>
  );
}

// ─── Leaderboard styles ───────────────────────────────────────────────────────
const lb = StyleSheet.create({
  card:          { backgroundColor: VAULT_DARK, borderRadius: 20, padding: 16, marginBottom: 20 },
  header:        { marginBottom: 14 },
  heading:       { fontSize: 16, fontWeight: '800', color: '#E8F5E8' },
  sub:           { fontSize: 12, color: '#5A7A5A', marginTop: 2 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2D4A2D' },
  rowWinner:     { backgroundColor: '#243824', borderRadius: 12, paddingHorizontal: 8, marginHorizontal: -8 },
  rowYou:        { opacity: 1 },
  rank:          { width: 28, textAlign: 'center', fontSize: 16 },
  avatar:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D4A2D', justifyContent: 'center', alignItems: 'center' },
  avatarWinner:  { backgroundColor: '#3A6A3A' },
  avatarEmoji:   { fontSize: 20 },
  name:          { fontSize: 14, fontWeight: '700', color: '#88A888' },
  nameWinner:    { color: '#A8D8A8' },
  saved:         { fontSize: 11, color: '#4A6A4A', marginTop: 1 },
  mealsBox:      { alignItems: 'center' },
  mealsNum:      { fontSize: 20, fontWeight: '800', color: '#5A7A5A' },
  mealsNumWinner:{ color: '#7BAF7B' },
  mealsLabel:    { fontSize: 9, color: '#3A5A3A' },
});

// ─── Event styles ─────────────────────────────────────────────────────────────
const ev = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FAFAF7' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  heading:     { fontSize: 20, fontWeight: '800', color: '#333' },
  createBtn:   { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  createTxt:   { color: '#fff', fontWeight: '700' },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start' },
  eventTitle:  { fontSize: 16, fontWeight: '800', color: '#333' },
  meta:        { fontSize: 12, color: '#888', marginTop: 2 },
  theme:       { fontSize: 12, color: ACCENT, marginTop: 4, fontWeight: '600' },
  desc:        { fontSize: 13, color: '#666', marginTop: 8, lineHeight: 18 },
  goingBadge:  { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  goingTxt:    { fontSize: 11, color: '#2E7D32', fontWeight: '700' },
  rsvpBtn:     { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EDEBE4', alignItems: 'center' },
  rsvpTxt:     { fontSize: 12, color: '#555' },
  modalWrap:   { flex: 1, backgroundColor: '#FAFAF7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 14 },
  fieldInput:  { backgroundColor: '#EDEBE4', borderRadius: 12, padding: 12, fontSize: 14, color: '#333' },
  saveBtn:     { marginTop: 24, backgroundColor: ACCENT, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});
