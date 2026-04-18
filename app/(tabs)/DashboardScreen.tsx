// ─────────────────────────────────────────────────────────────────────────────
//  DashboardScreen.tsx
//  Saved-recipe dashboard: import by URL, filter/sort, view details
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';

// ─── theme ────────────────────────────────────────────────────────────────────
const ACCENT     = '#D97B4A';
const SOFT_GREEN = '#7BAF7B';
const CARD_BG    = '#F4F1EB';

// ─── types ────────────────────────────────────────────────────────────────────
type Source = 'Instagram' | 'Pinterest' | 'AllRecipes' | 'TikTok' | 'NYT Cooking' | 'Other';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Drink';

type SavedRecipe = {
  id: string;
  title: string;
  url: string;
  source: Source;
  mealType: MealType;
  tags: string[];
  notes: string;
  emoji: string;
  savedAt: Date;
};

type SortKey = 'newest' | 'oldest' | 'az' | 'za';

// ─── helpers ──────────────────────────────────────────────────────────────────
function detectSource(url: string): Source {
  const u = url.toLowerCase();
  if (u.includes('instagram'))   return 'Instagram';
  if (u.includes('pinterest'))   return 'Pinterest';
  if (u.includes('allrecipes'))  return 'AllRecipes';
  if (u.includes('tiktok'))      return 'TikTok';
  if (u.includes('nytimes') || u.includes('cooking.nytimes')) return 'NYT Cooking';
  return 'Other';
}

function sourceEmoji(s: Source): string {
  const map: Record<Source, string> = {
    Instagram: '📸', Pinterest: '📌', AllRecipes: '📖',
    TikTok: '🎵', 'NYT Cooking': '📰', Other: '🔗',
  };
  return map[s];
}

function sourceColor(s: Source): { bg: string; text: string } {
  const map: Record<Source, { bg: string; text: string }> = {
    Instagram:   { bg: '#FDEEF8', text: '#A0307A' },
    Pinterest:   { bg: '#FDECEA', text: '#B22222' },
    AllRecipes:  { bg: '#FFF3E0', text: '#B86A00' },
    TikTok:      { bg: '#E8F8F8', text: '#006666' },
    'NYT Cooking': { bg: '#EEF1FF', text: '#3344AA' },
    Other:       { bg: '#EDEBE4', text: '#555555' },
  };
  return map[s];
}

function mealEmoji(m: MealType): string {
  const map: Record<MealType, string> = {
    Breakfast: '🍳', Lunch: '🥪', Dinner: '🍽',
    Snack: '🍎', Dessert: '🍰', Drink: '🥤',
  };
  return map[m];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── seed data ────────────────────────────────────────────────────────────────
const SEED: SavedRecipe[] = [
  {
    id: '1', title: 'Crispy Smash Burgers',
    url: 'https://www.instagram.com/p/example1',
    source: 'Instagram', mealType: 'Dinner',
    tags: ['Quick', 'Comfort'], notes: 'Double smash, American cheese.',
    emoji: '🍔', savedAt: new Date('2025-03-10'),
  },
  {
    id: '2', title: 'Lemon Ricotta Pancakes',
    url: 'https://www.pinterest.com/pin/example2',
    source: 'Pinterest', mealType: 'Breakfast',
    tags: ['Weekend', 'Sweet'], notes: 'Zest one full lemon.',
    emoji: '🥞', savedAt: new Date('2025-03-05'),
  },
  {
    id: '3', title: 'Sheet Pan Salmon & Veggies',
    url: 'https://www.allrecipes.com/recipe/example3',
    source: 'AllRecipes', mealType: 'Dinner',
    tags: ['Healthy', 'Easy'], notes: '',
    emoji: '🐟', savedAt: new Date('2025-02-28'),
  },
  {
    id: '4', title: 'Brown Butter Chocolate Chip Cookies',
    url: 'https://www.tiktok.com/@cook/video/example4',
    source: 'TikTok', mealType: 'Dessert',
    tags: ['Bake', 'Sweet'], notes: 'Chill dough 30 min before baking.',
    emoji: '🍪', savedAt: new Date('2025-02-20'),
  },
  {
    id: '5', title: 'Weeknight Chicken Marsala',
    url: 'https://cooking.nytimes.com/recipes/example5',
    source: 'NYT Cooking', mealType: 'Dinner',
    tags: ['Comfort', 'Italian'], notes: 'Serve over egg noodles.',
    emoji: '🍗', savedAt: new Date('2025-02-15'),
  },
];

const ALL_SOURCES: Source[] = ['Instagram', 'Pinterest', 'AllRecipes', 'TikTok', 'NYT Cooking', 'Other'];
const ALL_MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];
const ALL_TAGS = ['All', 'Quick', 'Easy', 'Healthy', 'Comfort', 'Sweet', 'Bake', 'Weekend', 'Italian', 'Family'];

// ─── Add-from-Link Modal ──────────────────────────────────────────────────────
function AddLinkModal({
  visible, onClose, onSave,
}: { visible: boolean; onClose: () => void; onSave: (r: SavedRecipe) => void }) {
  const [url,      setUrl]      = useState('');
  const [title,    setTitle]    = useState('');
  const [mealType, setMealType] = useState<MealType>('Dinner');
  const [notes,    setNotes]    = useState('');
  const [tagsInput,setTagsInput]= useState('');

  const detectedSource = url.trim() ? detectSource(url) : null;

  const save = () => {
    if (!url.trim())   { Alert.alert('Please enter a URL.'); return; }
    if (!title.trim()) { Alert.alert('Please enter a recipe title.'); return; }
    const source = detectSource(url);
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
      source,
      mealType,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      notes: notes.trim(),
      emoji: mealEmoji(mealType),
      savedAt: new Date(),
    });
    setUrl(''); setTitle(''); setMealType('Dinner'); setNotes(''); setTagsInput('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', paddingTop: 20 }}>
        <View style={al.header}>
          <Text style={al.heading}>Save a Recipe</Text>
          <TouchableOpacity onPress={onClose}><Text style={al.cancel}>Cancel</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={al.body}>

          <Text style={al.label}>Paste a Link *</Text>
          <TextInput
            style={al.input}
            value={url}
            onChangeText={setUrl}
            placeholder="instagram.com/p/… or allrecipes.com/…"
            autoCapitalize="none"
            keyboardType="url"
          />
          {detectedSource && (
            <View style={al.detectedRow}>
              <Text style={al.detectedTxt}>
                {sourceEmoji(detectedSource)}  Detected: {detectedSource}
              </Text>
            </View>
          )}

          <Text style={al.label}>Recipe Title *</Text>
          <TextInput
            style={al.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Crispy Smash Burgers"
          />

          <Text style={al.label}>Meal Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ALL_MEAL_TYPES.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[al.chip, mealType === m && al.chipActive]}
                  onPress={() => setMealType(m)}
                >
                  <Text style={[al.chipTxt, mealType === m && al.chipTxtActive]}>
                    {mealEmoji(m)} {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={al.label}>Tags (comma-separated)</Text>
          <TextInput
            style={al.input}
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="e.g. Quick, Healthy, Italian"
          />

          <Text style={al.label}>Notes</Text>
          <TextInput
            style={[al.input, { height: 80 }]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Any tweaks or reminders…"
          />

          <TouchableOpacity style={al.saveBtn} onPress={save}>
            <Text style={al.saveBtnTxt}>Save Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  recipe, visible, onClose, onDelete,
}: {
  recipe: SavedRecipe | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!recipe) return null;
  const sc = sourceColor(recipe.source);

  const confirmDelete = () => {
    Alert.alert('Remove Recipe', 'Remove this saved recipe?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { onClose(); onDelete(recipe.id); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', paddingTop: 20 }}>
        <View style={dm.header}>
          <TouchableOpacity onPress={onClose}><Text style={dm.back}>← Back</Text></TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}><Text style={dm.del}>Remove</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>

          {/* hero */}
          <View style={dm.hero}>
            <Text style={{ fontSize: 60 }}>{recipe.emoji}</Text>
          </View>

          <Text style={dm.title}>{recipe.title}</Text>
          <Text style={dm.date}>Saved {formatDate(recipe.savedAt)}</Text>

          {/* source badge */}
          <View style={[dm.sourceBadge, { backgroundColor: sc.bg }]}>
            <Text style={[dm.sourceTxt, { color: sc.text }]}>
              {sourceEmoji(recipe.source)}  {recipe.source}
            </Text>
          </View>

          {/* meal type + tags */}
          <View style={dm.tagRow}>
            <View style={dm.mealTag}>
              <Text style={dm.mealTagTxt}>{mealEmoji(recipe.mealType)} {recipe.mealType}</Text>
            </View>
            {recipe.tags.map(t => (
              <View key={t} style={dm.tag}><Text style={dm.tagTxt}>{t}</Text></View>
            ))}
          </View>

          {/* notes */}
          {recipe.notes ? (
            <>
              <Text style={dm.sectionHead}>Notes</Text>
              <View style={dm.notesBox}>
                <Text style={dm.notesTxt}>{recipe.notes}</Text>
              </View>
            </>
          ) : null}

          {/* open link */}
          <View style={dm.urlBox}>
            <Text style={dm.urlLabel}>Source link</Text>
            <Text style={dm.urlTxt} numberOfLines={1}>{recipe.url}</Text>
          </View>

          <TouchableOpacity style={dm.openBtn}>
            <Text style={dm.openBtnTxt}>Open Original Recipe →</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({
  activeTag, setActiveTag,
  activeSource, setActiveSource,
  activeMeal, setActiveMeal,
  sort, setSort,
}: {
  activeTag: string;       setActiveTag: (t: string) => void;
  activeSource: string;    setActiveSource: (s: string) => void;
  activeMeal: string;      setActiveMeal: (m: string) => void;
  sort: SortKey;           setSort: (k: SortKey) => void;
}) {
  const sortLabels: { key: SortKey; label: string }[] = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'az',     label: 'A → Z' },
    { key: 'za',     label: 'Z → A' },
  ];

  return (
    <View>
      {/* source filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={fb.row} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity
          style={[fb.chip, activeSource === 'All' && fb.chipActive]}
          onPress={() => setActiveSource('All')}
        >
          <Text style={[fb.chipTxt, activeSource === 'All' && fb.chipTxtActive]}>All Sources</Text>
        </TouchableOpacity>
        {ALL_SOURCES.map(s => (
          <TouchableOpacity
            key={s}
            style={[fb.chip, activeSource === s && fb.chipActive]}
            onPress={() => setActiveSource(s)}
          >
            <Text style={[fb.chipTxt, activeSource === s && fb.chipTxtActive]}>
              {sourceEmoji(s)} {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* meal type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={fb.row} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity
          style={[fb.chip, activeMeal === 'All' && fb.chipActive]}
          onPress={() => setActiveMeal('All')}
        >
          <Text style={[fb.chipTxt, activeMeal === 'All' && fb.chipTxtActive]}>All Meals</Text>
        </TouchableOpacity>
        {ALL_MEAL_TYPES.map(m => (
          <TouchableOpacity
            key={m}
            style={[fb.chip, activeMeal === m && fb.chipActive]}
            onPress={() => setActiveMeal(m)}
          >
            <Text style={[fb.chipTxt, activeMeal === m && fb.chipTxtActive]}>
              {mealEmoji(m)} {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* tag + sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={fb.row} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {ALL_TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[fb.chip, activeTag === t && fb.chipActive]}
            onPress={() => setActiveTag(t)}
          >
            <Text style={[fb.chipTxt, activeTag === t && fb.chipTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
        <View style={fb.divider} />
        {sortLabels.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[fb.sortChip, sort === s.key && fb.sortChipActive]}
            onPress={() => setSort(s.key)}
          >
            <Text style={[fb.chipTxt, sort === s.key && fb.chipTxtActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [recipes, setRecipes]         = useState<SavedRecipe[]>(SEED);
  const [search, setSearch]           = useState('');
  const [activeTag, setActiveTag]     = useState('All');
  const [activeSource, setActiveSource] = useState('All');
  const [activeMeal, setActiveMeal]   = useState('All');
  const [sort, setSort]               = useState<SortKey>('newest');
  const [selected, setSelected]       = useState<SavedRecipe | null>(null);
  const [showDetail, setShowDetail]   = useState(false);
  const [showAdd, setShowAdd]         = useState(false);

  const filtered = useMemo(() => {
    let r = [...recipes];

    if (search.trim())
      r = r.filter(x => x.title.toLowerCase().includes(search.toLowerCase()));
    if (activeSource !== 'All')
      r = r.filter(x => x.source === activeSource);
    if (activeMeal !== 'All')
      r = r.filter(x => x.mealType === activeMeal);
    if (activeTag !== 'All')
      r = r.filter(x => x.tags.includes(activeTag));

    switch (sort) {
      case 'newest': r.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime()); break;
      case 'oldest': r.sort((a, b) => a.savedAt.getTime() - b.savedAt.getTime()); break;
      case 'az':     r.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za':     r.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    return r;
  }, [recipes, search, activeSource, activeMeal, activeTag, sort]);

  const deleteRecipe = (id: string) =>
    setRecipes(prev => prev.filter(r => r.id !== id));

  const addRecipe = (r: SavedRecipe) =>
    setRecipes(prev => [r, ...prev]);

  return (
    <View style={[ds.safe, { paddingTop: insets.top }]}>

      {/* ── Header ────────────────────────────────────────── */}
      <View style={ds.header}>
        <View>
          <Text style={ds.heading}>📋 Dashboard</Text>
          <Text style={ds.sub}>{recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={ds.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={ds.addBtnTxt}>+ Save Link</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ────────────────────────────────────────── */}
      <View style={ds.searchRow}>
        <TextInput
          style={ds.search}
          placeholder="🔍  Search saved recipes…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Filters ───────────────────────────────────────── */}
      <FilterBar
        activeTag={activeTag}       setActiveTag={setActiveTag}
        activeSource={activeSource} setActiveSource={setActiveSource}
        activeMeal={activeMeal}     setActiveMeal={setActiveMeal}
        sort={sort}                 setSort={setSort}
      />

      {/* ── List ──────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <View style={ds.empty}>
          <Text style={ds.emptyEmoji}>🔍</Text>
          <Text style={ds.emptyTxt}>No recipes match your filters.</Text>
          <TouchableOpacity onPress={() => {
            setSearch(''); setActiveTag('All'); setActiveSource('All'); setActiveMeal('All');
          }}>
            <Text style={ds.emptyReset}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const sc = sourceColor(item.source);
            return (
              <TouchableOpacity
                style={ds.card}
                onPress={() => { setSelected(item); setShowDetail(true); }}
              >
                <View style={ds.cardEmoji}>
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ds.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={ds.cardMeta}>
                    <View style={[ds.sourcePill, { backgroundColor: sc.bg }]}>
                      <Text style={[ds.sourcePillTxt, { color: sc.text }]}>
                        {sourceEmoji(item.source)} {item.source}
                      </Text>
                    </View>
                    <Text style={ds.mealPill}>
                      {mealEmoji(item.mealType)} {item.mealType}
                    </Text>
                  </View>
                  <Text style={ds.cardDate}>{formatDate(item.savedAt)}</Text>
                </View>
                <Text style={{ color: '#bbb', fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BottomNav current="Dashboard" />

      {/* ── Modals ────────────────────────────────────────── */}
      <AddLinkModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={addRecipe}
      />
      <DetailModal
        recipe={selected}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        onDelete={deleteRecipe}
      />
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const ds = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FAFAF7' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  heading:     { fontSize: 22, fontWeight: '800', color: '#333' },
  sub:         { fontSize: 12, color: '#999', marginTop: 2 },
  addBtn:      { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addBtnTxt:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchRow:   { paddingHorizontal: 16, paddingVertical: 10 },
  search:      { backgroundColor: '#EDEBE4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  cardEmoji:   { width: 52, height: 52, borderRadius: 14, backgroundColor: CARD_BG, justifyContent: 'center', alignItems: 'center' },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 5 },
  cardMeta:    { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  sourcePill:  { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  sourcePillTxt: { fontSize: 11, fontWeight: '700' },
  mealPill:    { fontSize: 11, color: '#777' },
  cardDate:    { fontSize: 11, color: '#bbb', marginTop: 4 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyEmoji:  { fontSize: 40, marginBottom: 12 },
  emptyTxt:    { fontSize: 15, color: '#999' },
  emptyReset:  { color: ACCENT, fontWeight: '700', marginTop: 10, fontSize: 14 },
});

const fb = StyleSheet.create({
  row:         { maxHeight: 44, marginBottom: 2 },
  chip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#EDEBE4', borderWidth: 1, borderColor: 'transparent' },
  chipActive:  { backgroundColor: ACCENT, borderColor: ACCENT },
  chipTxt:     { fontSize: 12, color: '#555' },
  chipTxtActive: { color: '#fff', fontWeight: '700' },
  sortChip:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#E4EEE4', borderWidth: 1, borderColor: 'transparent' },
  sortChipActive: { backgroundColor: SOFT_GREEN, borderColor: SOFT_GREEN },
  divider:     { width: 1, backgroundColor: '#DDD', marginHorizontal: 4 },
});

const al = StyleSheet.create({
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  heading:    { fontSize: 20, fontWeight: '800', color: '#333' },
  cancel:     { color: '#999', fontSize: 15 },
  body:       { padding: 20, paddingBottom: 60 },
  label:      { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: '#EDEBE4', borderRadius: 12, padding: 12, fontSize: 14, color: '#333' },
  detectedRow:{ marginTop: 6 },
  detectedTxt:{ fontSize: 12, color: SOFT_GREEN, fontWeight: '700' },
  chip:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EDEBE4', borderWidth: 1.5, borderColor: 'transparent' },
  chipActive: { backgroundColor: '#FDF0E8', borderColor: ACCENT },
  chipTxt:    { fontSize: 12, color: '#555' },
  chipTxtActive: { color: ACCENT, fontWeight: '700' },
  saveBtn:    { marginTop: 24, backgroundColor: SOFT_GREEN, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

const dm = StyleSheet.create({
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  back:       { color: ACCENT, fontSize: 16, fontWeight: '600' },
  del:        { color: '#E07070', fontSize: 14, fontWeight: '600' },
  hero:       { height: 180, backgroundColor: CARD_BG, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:      { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 4 },
  date:       { fontSize: 12, color: '#aaa', marginBottom: 12 },
  sourceBadge:{ alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 },
  sourceTxt:  { fontSize: 13, fontWeight: '700' },
  tagRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  mealTag:    { backgroundColor: '#EEF7EE', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  mealTagTxt: { fontSize: 12, color: '#3A6A3A', fontWeight: '700' },
  tag:        { backgroundColor: '#EDEBE4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt:     { fontSize: 12, color: '#666' },
  sectionHead:{ fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  notesBox:   { backgroundColor: '#FFF8F0', borderRadius: 12, padding: 14, marginBottom: 16 },
  notesTxt:   { fontSize: 14, color: '#555', lineHeight: 20 },
  urlBox:     { backgroundColor: '#F4F1EB', borderRadius: 12, padding: 14, marginBottom: 16 },
  urlLabel:   { fontSize: 11, color: '#aaa', marginBottom: 4 },
  urlTxt:     { fontSize: 13, color: '#888' },
  openBtn:    { backgroundColor: ACCENT, borderRadius: 14, padding: 15, alignItems: 'center' },
  openBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});