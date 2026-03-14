import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BottomNav } from '../components/BottomNav';

const ACCENT     = '#D97B4A';
const SOFT_GREEN = '#7BAF7B';
const CARD_BG    = '#F4F1EB';

// ─── types ────────────────────────────────────────────────────────────────────
type Ingredient = { name: string; checked: boolean };
type Recipe = {
  id: string;
  title: string;
  emoji: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  isFamily?: boolean;
  author?: string;
};

// ─── seed data ────────────────────────────────────────────────────────────────
const SEED_RECIPES: Recipe[] = [
  {
    id: '1', title: 'Chicken Soup', emoji: '🍲', tags: ['Easy', 'Comfort'],
    isFamily: true, author: 'Grandma Rosa',
    ingredients: [
      { name: 'Chicken', checked: false },
      { name: 'Pasta', checked: false },
      { name: 'Chicken Stock', checked: false },
      { name: 'Carrots', checked: false },
    ],
    steps: ['Boil stock.', 'Add chicken and cook through.', 'Add pasta and veggies. Simmer 10 min.'],
  },
  {
    id: '2', title: 'Spanakopita', emoji: '🥬', tags: ['Greek', 'Bake'],
    isFamily: true, author: 'Yiayia Elena',
    ingredients: [
      { name: 'Phyllo Dough', checked: false },
      { name: 'Spinach', checked: false },
      { name: 'Feta', checked: false },
    ],
    steps: ['Sauté spinach. Mix with feta.', 'Layer phyllo, brushing butter between sheets.', 'Fill and bake at 375 °F for 35 min.'],
  },
  {
    id: '3', title: 'Stir Fry Vegetables', emoji: '🥦', tags: ['Quick', 'Healthy'],
    ingredients: [
      { name: 'Broccoli', checked: false },
      { name: 'Bell Pepper', checked: false },
      { name: 'Soy Sauce', checked: false },
      { name: 'Garlic', checked: false },
    ],
    steps: ['Heat oil on high.', 'Add vegetables, stir 5 min.', 'Add soy sauce and garlic. Toss and serve.'],
  },
  {
    id: '4', title: 'Spaghetti Bolognese', emoji: '🍝', tags: ['Comfort', 'Family'],
    ingredients: [
      { name: 'Ground Beef', checked: false },
      { name: 'Tomato Sauce', checked: false },
      { name: 'Spaghetti', checked: false },
      { name: 'Onion', checked: false },
    ],
    steps: ['Brown beef with onion.', 'Add sauce, simmer 20 min.', 'Cook pasta, combine and serve.'],
  },
  {
    id: '5', title: 'Greek Salad', emoji: '🥗', tags: ['Quick', 'Healthy', 'Greek'],
    ingredients: [
      { name: 'Cucumber', checked: false },
      { name: 'Tomato', checked: false },
      { name: 'Feta', checked: false },
      { name: 'Olives', checked: false },
      { name: 'Red Onion', checked: false },
    ],
    steps: ['Chop all veggies.', 'Toss with olive oil, oregano, salt.', 'Top with feta and olives.'],
  },
];

const ALL_TAGS = ['All', 'Quick', 'Easy', 'Comfort', 'Greek', 'Bake', 'Healthy', 'Family'];

// ─── grocery-list builder ─────────────────────────────────────────────────────
function GroceryModal({
  recipes, visible, onClose,
}: { recipes: Recipe[]; visible: boolean; onClose: () => void }) {
  const [items, setItems] = useState<{ label: string; recipe: string; checked: boolean }[]>(() =>
    recipes.flatMap(r => r.ingredients.map(i => ({ label: i.name, recipe: r.title, checked: false }))),
  );

  const toggle = (idx: number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it));

  const grouped = recipes.map(r => ({
    title: r.title,
    items: items.filter(it => it.recipe === r.title),
    startIdx: items.findIndex(it => it.recipe === r.title),
  }));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
        <View style={gm.header}>
          <Text style={gm.title}>🛒 Grocery List</Text>
          <TouchableOpacity onPress={onClose}><Text style={gm.close}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {grouped.map(group => (
            <View key={group.title} style={gm.group}>
              <Text style={gm.groupTitle}>{group.title}</Text>
              {group.items.map((it, localIdx) => {
                const globalIdx = group.startIdx + localIdx;
                return (
                  <TouchableOpacity
                    key={it.label + localIdx}
                    style={gm.row}
                    onPress={() => toggle(globalIdx)}
                  >
                    <View style={[gm.circle, it.checked && gm.circleChecked]}>
                      {it.checked && <Text style={gm.checkMark}>✓</Text>}
                    </View>
                    <Text style={[gm.itemLabel, it.checked && gm.strikethrough]}>
                      {it.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── recipe detail modal ──────────────────────────────────────────────────────
function RecipeDetailModal({
  recipe, visible, onClose, onAddToGrocery,
}: {
  recipe: Recipe | null;
  visible: boolean;
  onClose: () => void;
  onAddToGrocery: (r: Recipe) => void;
}) {
  if (!recipe) return null;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
        <View style={rd.header}>
          <TouchableOpacity onPress={onClose}><Text style={rd.back}>← Back</Text></TouchableOpacity>
          {recipe.isFamily && <View style={rd.familyBadge}><Text style={rd.familyTxt}>👨‍👩‍👧 Family Recipe</Text></View>}
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* placeholder image */}
          <View style={rd.imgBox}>
            <Text style={rd.imgEmoji}>{recipe.emoji}</Text>
            {recipe.isFamily && (
              <Text style={rd.scanNote}>📄 Scan of original card — see profile</Text>
            )}
          </View>

          <Text style={rd.title}>{recipe.title}</Text>
          {recipe.author && <Text style={rd.author}>by {recipe.author}</Text>}

          <View style={rd.tagRow}>
            {recipe.tags.map(t => (
              <View key={t} style={rd.tag}><Text style={rd.tagTxt}>{t}</Text></View>
            ))}
          </View>

          <Text style={rd.sectionHead}>Ingredients</Text>
          {recipe.ingredients.map(ing => (
            <Text key={ing.name} style={rd.listItem}>• {ing.name}</Text>
          ))}

          <Text style={rd.sectionHead}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <Text key={i} style={rd.listItem}>{i + 1}. {step}</Text>
          ))}

          <TouchableOpacity style={rd.groceryBtn} onPress={() => { onAddToGrocery(recipe); onClose(); }}>
            <Text style={rd.groceryBtnTxt}>+ Add to Grocery List</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── add recipe modal ─────────────────────────────────────────────────────────
function AddRecipeModal({ visible, onClose, onSave }: {
  visible: boolean; onClose: () => void; onSave: (r: Recipe) => void;
}) {
  const [title, setTitle]         = useState('');
  const [ingLine, setIngLine]     = useState('');
  const [stepsLine, setStepsLine] = useState('');
  const [isFamily, setIsFamily]   = useState(false);
  const [author, setAuthor]       = useState('');

  const save = () => {
    if (!title.trim()) { Alert.alert('Please enter a recipe name.'); return; }
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      emoji: '🍽',
      tags: ['My Recipe'],
      isFamily,
      author: author.trim() || undefined,
      ingredients: ingLine.split(',').map(i => ({ name: i.trim(), checked: false })).filter(i => i.name),
      steps: stepsLine.split('.').map(s => s.trim()).filter(Boolean),
    });
    setTitle(''); setIngLine(''); setStepsLine(''); setIsFamily(false); setAuthor('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
        <View style={ar.header}>
          <Text style={ar.title}>New Recipe</Text>
          <TouchableOpacity onPress={onClose}><Text style={ar.cancel}>Cancel</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={ar.body}>
          <Text style={ar.label}>Recipe Name *</Text>
          <TextInput style={ar.input} value={title} onChangeText={setTitle} placeholder="e.g. Grandma's Pierogi" />

          <Text style={ar.label}>Ingredients (comma-separated)</Text>
          <TextInput style={[ar.input, { height: 80 }]} multiline value={ingLine} onChangeText={setIngLine} placeholder="Flour, Egg, Potato, Cheese" />

          <Text style={ar.label}>Steps (separate with periods)</Text>
          <TextInput style={[ar.input, { height: 100 }]} multiline value={stepsLine} onChangeText={setStepsLine} placeholder="Mix dough. Fill and fold. Boil 5 min." />

          <TouchableOpacity style={ar.toggleRow} onPress={() => setIsFamily(f => !f)}>
            <View style={[ar.checkbox, isFamily && ar.checkboxOn]}>
              {isFamily && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={ar.toggleLabel}>👨‍👩‍👧 This is a Family Recipe</Text>
          </TouchableOpacity>

          {isFamily && (
            <>
              <Text style={ar.label}>Original Author</Text>
              <TextInput style={ar.input} value={author} onChangeText={setAuthor} placeholder="e.g. Grandma Rosa" />
              <View style={ar.scanBox}>
                <Text style={ar.scanBoxTxt}>📷 Tap to upload scan of recipe card</Text>
                <Text style={ar.scanSub}>(placeholder — wire up image picker later)</Text>
              </View>
            </>
          )}

          <TouchableOpacity style={ar.saveBtn} onPress={save}>
            <Text style={ar.saveBtnTxt}>Save Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────
export default function RecipesScreen({ navigation }: any) {
  const [recipes, setRecipes]           = useState<Recipe[]>(SEED_RECIPES);
  const [activeTag, setActiveTag]       = useState('All');
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<Recipe | null>(null);
  const [showDetail, setShowDetail]     = useState(false);
  const [showAdd, setShowAdd]           = useState(false);
  const [groceryList, setGroceryList]   = useState<Recipe[]>([]);
  const [showGrocery, setShowGrocery]   = useState(false);

  const filtered = recipes.filter(r => {
    const matchTag  = activeTag === 'All' || r.tags.includes(activeTag);
    const matchText = r.title.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchText;
  });

  const addToGrocery = (r: Recipe) =>
    setGroceryList(prev => prev.find(p => p.id === r.id) ? prev : [...prev, r]);

  return (
    <SafeAreaView style={ms.safe}>
      {/* search */}
      <View style={ms.searchRow}>
        <TextInput
          style={ms.search}
          placeholder="🔍  Search recipes…"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={ms.groceryBadge} onPress={() => setShowGrocery(true)}>
          <Text style={ms.groceryIcon}>🛒</Text>
          {groceryList.length > 0 && (
            <View style={ms.badge}><Text style={ms.badgeTxt}>{groceryList.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* tag filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ms.tagScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {ALL_TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[ms.tag, activeTag === t && ms.tagActive]}
            onPress={() => setActiveTag(t)}
          >
            <Text style={[ms.tagTxt, activeTag === t && ms.tagTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* recipe list */}
      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={ms.recipeRow}
            onPress={() => { setSelected(item); setShowDetail(true); }}
          >
            <View style={ms.recipeEmoji}><Text style={{ fontSize: 28 }}>{item.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={ms.recipeName}>{item.title}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {item.isFamily && <View style={ms.famBadge}><Text style={ms.famBadgeTxt}>👨‍👩‍👧</Text></View>}
                {item.tags.slice(0, 2).map(t => (
                  <View key={t} style={ms.miniTag}><Text style={ms.miniTagTxt}>{t}</Text></View>
                ))}
              </View>
            </View>
            <Text style={{ color: '#bbb', fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={ms.fab} onPress={() => setShowAdd(true)}>
        <Text style={ms.fabTxt}>+</Text>
      </TouchableOpacity>

      <BottomNav current="Recipes" />

      {/* modals */}
      <RecipeDetailModal
        recipe={selected}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        onAddToGrocery={addToGrocery}
      />
      <AddRecipeModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={r => setRecipes(prev => [r, ...prev])}
      />
      <GroceryModal
        recipes={groceryList}
        visible={showGrocery}
        onClose={() => setShowGrocery(false)}
      />
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#FAFAF7' },
  searchRow:     { flexDirection: 'row', alignItems: 'center', margin: 16, gap: 10 },
  search:        { flex: 1, backgroundColor: '#EDEBE4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  groceryBadge:  { position: 'relative' },
  groceryIcon:   { fontSize: 26 },
  badge:         { position: 'absolute', top: -4, right: -4, backgroundColor: ACCENT, borderRadius: 8, minWidth: 16, alignItems: 'center' },
  badgeTxt:      { color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 3 },
  tagScroll:     { maxHeight: 44, marginBottom: 4 },
  tag:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#EDEBE4', borderWidth: 1, borderColor: 'transparent' },
  tagActive:     { backgroundColor: ACCENT, borderColor: ACCENT },
  tagTxt:        { fontSize: 13, color: '#555' },
  tagTxtActive:  { color: '#fff', fontWeight: '700' },
  recipeRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  recipeEmoji:   { width: 52, height: 52, borderRadius: 14, backgroundColor: CARD_BG, justifyContent: 'center', alignItems: 'center' },
  recipeName:    { fontSize: 15, fontWeight: '700', color: '#333' },
  famBadge:      { backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  famBadgeTxt:   { fontSize: 11 },
  miniTag:       { backgroundColor: '#EDEBE4', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  miniTagTxt:    { fontSize: 11, color: '#666' },
  fab:           { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: SOFT_GREEN, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabTxt:        { fontSize: 32, color: '#fff', lineHeight: 36 },
});

const rd = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  back:        { color: ACCENT, fontSize: 16, fontWeight: '600' },
  familyBadge: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  familyTxt:   { fontSize: 12, color: '#C97B30', fontWeight: '700' },
  imgBox:      { height: 200, backgroundColor: '#C8D8C8', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  imgEmoji:    { fontSize: 60 },
  scanNote:    { marginTop: 8, fontSize: 12, color: '#888' },
  title:       { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 4 },
  author:      { fontSize: 13, color: '#888', marginBottom: 10 },
  tagRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tag:         { backgroundColor: '#EDEBE4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt:      { fontSize: 12, color: '#666' },
  sectionHead: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  listItem:    { fontSize: 14, color: '#555', lineHeight: 22 },
  groceryBtn:  { marginTop: 24, backgroundColor: ACCENT, borderRadius: 14, padding: 14, alignItems: 'center' },
  groceryBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

const ar = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title:       { fontSize: 18, fontWeight: '800', color: '#333' },
  cancel:      { color: '#999', fontSize: 15 },
  body:        { padding: 20, paddingBottom: 60 },
  label:       { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 14 },
  input:       { backgroundColor: '#EDEBE4', borderRadius: 12, padding: 12, fontSize: 14, color: '#333' },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 10 },
  checkbox:    { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: ACCENT, justifyContent: 'center', alignItems: 'center' },
  checkboxOn:  { backgroundColor: ACCENT },
  toggleLabel: { fontSize: 14, color: '#444', fontWeight: '600' },
  scanBox:     { marginTop: 12, backgroundColor: '#FFF3E0', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#FDDBB0', borderStyle: 'dashed' },
  scanBoxTxt:  { color: '#C97B30', fontWeight: '700' },
  scanSub:     { color: '#aaa', fontSize: 11, marginTop: 4 },
  saveBtn:     { marginTop: 24, backgroundColor: SOFT_GREEN, borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});

const gm = StyleSheet.create({
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title:        { fontSize: 20, fontWeight: '800', color: '#333' },
  close:        { color: ACCENT, fontWeight: '700', fontSize: 16 },
  group:        { marginBottom: 20 },
  groupTitle:   { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8, borderBottomWidth: 1, borderColor: '#EEE', paddingBottom: 4 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  circle:       { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center' },
  circleChecked: { backgroundColor: SOFT_GREEN, borderColor: SOFT_GREEN },
  checkMark:    { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemLabel:    { fontSize: 14, color: '#444' },
  strikethrough: { textDecorationLine: 'line-through', color: '#AAA' },
});