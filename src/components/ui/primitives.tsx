import React from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, radius } from '../../theme';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={styles.fill}>{children}</View>}
    </SafeAreaView>
  );
}

export function TitleBlock({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: ReactNode }) {
  return <View style={styles.titleRow}><View style={styles.titleCopy}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>{right}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, icon, compact = false }: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, compact && styles.buttonCompact, styles[`button_${variant}`], (disabled || loading) && styles.disabled, pressed && !disabled && !loading && styles.pressed]}><>{icon}{loading ? <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : theme.brand} /> : <Text style={[styles.buttonText, styles[`buttonText_${variant}`], compact && styles.buttonTextCompact]}>{title}</Text>}</></Pressable>;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline = false, secureTextEntry = false, autoCapitalize }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.subtle} keyboardType={keyboardType} multiline={multiline} secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} style={[styles.input, multiline && styles.multiline]} /></View>;
}

export function Notice({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' | 'success' }>) {
  const color = tone === 'warning' ? theme.warning : tone === 'success' ? theme.success : theme.brand;
  const backgroundColor = tone === 'warning' ? theme.warningSoft : tone === 'success' ? theme.successSoft : theme.brandSoft;
  return <View style={[styles.notice, { backgroundColor, borderColor: color + '30' }]}><Text style={[styles.noticeText, { color }]}>{children}</Text></View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{title}</Text>{action && onAction ? <Pressable accessibilityRole="button" onPress={onAction}><Text style={styles.inlineAction}>{action}</Text></Pressable> : null}</View>;
}

export function Pill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'good' | 'warning' }>) {
  const color = tone === 'good' ? theme.success : tone === 'warning' ? theme.warning : theme.brand;
  const bg = tone === 'good' ? theme.successSoft : tone === 'warning' ? theme.warningSoft : theme.brandSoft;
  return <View style={[styles.pill, { backgroundColor: bg }]}><Text style={[styles.pillText, { color }]}>{children}</Text></View>;
}

export function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return <View style={[styles.stat, accent && styles.statAccent]}><Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text><Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.canvas },
  fill: { flex: 1 },
  content: { paddingHorizontal: 19, paddingTop: 18, paddingBottom: 32, gap: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titleCopy: { flex: 1, gap: 5 },
  eyebrow: { color: theme.brand, fontSize: 11, fontWeight: '700', letterSpacing: 1.15, textTransform: 'uppercase' },
  title: { color: theme.ink, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: theme.muted, fontSize: 14, lineHeight: 21 },
  card: { padding: 17, gap: 13, borderRadius: radius.card, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, shadowColor: '#203239', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.035, shadowRadius: 8, elevation: 1 },
  button: { minHeight: 48, paddingHorizontal: 17, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: radius.control, borderWidth: 1 },
  buttonCompact: { minHeight: 39, paddingHorizontal: 13, paddingVertical: 8, alignSelf: 'flex-start' },
  button_primary: { backgroundColor: theme.brand, borderColor: theme.brand },
  button_secondary: { backgroundColor: theme.surface, borderColor: theme.line },
  button_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  button_danger: { backgroundColor: theme.dangerSoft, borderColor: theme.dangerSoft },
  buttonText: { fontSize: 14, fontWeight: '700' },
  buttonTextCompact: { fontSize: 12 },
  buttonText_primary: { color: '#fff' },
  buttonText_secondary: { color: theme.ink },
  buttonText_ghost: { color: theme.brand },
  buttonText_danger: { color: theme.danger },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  field: { gap: 7 },
  label: { color: theme.ink, fontSize: 13, fontWeight: '600' },
  input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderColor: theme.line, borderRadius: radius.control, color: theme.ink, backgroundColor: theme.surface, fontSize: 15 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  notice: { borderWidth: 1, borderRadius: 14, padding: 13 },
  noticeText: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { color: theme.ink, fontSize: 16, fontWeight: '700' },
  inlineAction: { color: theme.brand, fontSize: 13, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  stat: { minWidth: '46%', flexGrow: 1, backgroundColor: theme.surfaceMuted, borderRadius: 15, padding: 14, gap: 3 },
  statAccent: { backgroundColor: theme.brand },
  statValue: { color: theme.ink, fontSize: 21, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statValueAccent: { color: '#fff' },
  statLabel: { color: theme.muted, fontSize: 12, lineHeight: 17 },
  statLabelAccent: { color: '#dce9e8' },
});
