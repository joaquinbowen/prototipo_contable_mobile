import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { ContributorHomeScreen } from '../../screens/ContributorScreens';
import { useApp } from '../../state/AppState';
import { getRouteForSession } from '../../state/navigation';
import { theme } from '../../theme';

export default function HomeRoute() {
  const { activeRole, logout } = useApp();
  return <View style={styles.page}><View style={styles.topbar}><View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>CM</Text></View><View><Text style={styles.brandName}>CONT MARJO</Text><Text style={styles.brandHint}>ESPACIO {activeRole === 'CONTRIBUYENTE' ? 'DEL NEGOCIO' : activeRole === 'CONTADOR_PROFESIONAL' ? 'PROFESIONAL' : 'ADMIN'}</Text></View></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={() => { logout(); router.replace(getRouteForSession(false)); }} style={styles.logout}><LogOut size={17} color={theme.muted} /></Pressable></View><ContributorHomeScreen /></View>;
}

const styles = StyleSheet.create({ page: { flex: 1 }, topbar: { minHeight: 59, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.line }, brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: theme.brand }, brandMarkText: { color: '#fff', fontSize: 10, fontWeight: '800' }, brandName: { color: theme.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1 }, brandHint: { marginTop: 2, color: theme.subtle, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 }, logout: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.surfaceMuted } });
