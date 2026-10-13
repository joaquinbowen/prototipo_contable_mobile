import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Bell, Check, ChevronDown, LogOut } from 'lucide-react-native';
import { useApp } from '../state/AppState';
import type { UserRole } from '../state/types';
import { getModuleForRole } from '../state/navigation';
import { theme } from '../theme';

const roles: { id: UserRole; label: string; description: string; badge: string }[] = [
  { id: 'CONTRIBUYENTE', label: 'Contribuyente', description: 'Empresa o persona natural; administra su negocio y obligaciones.', badge: 'Cliente' },
  { id: 'CONTADOR_PROFESIONAL', label: 'Contador Profesional', description: 'Estudio contable con cartera de clientes y oportunidades.', badge: 'CPA / Estudio' },
  { id: 'GESTOR_CONTADORES', label: 'Gestor de contadores', description: 'Revisa expedientes y entrevistas de profesionales.', badge: 'Gestor' },
  { id: 'SUPER_ADMIN', label: 'Super Admin', description: 'Consola global, usuarios, servicios y actividad de la plataforma.', badge: 'Plataforma' },
];

export function MobileAppHeader() {
  const { activeRole, setActiveRole, setActiveModule, logout, resetDemo, notificationDismissed, dismissDemoNotification } = useApp();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const current = roles.find((role) => role.id === activeRole)!;
  const notifications = getModuleForRole(activeRole, 'notifications');
  const initials = activeRole === 'CONTRIBUYENTE' ? 'NE' : activeRole === 'CONTADOR_PROFESIONAL' ? 'CP' : activeRole === 'GESTOR_CONTADORES' ? 'GC' : 'SA';

  return <>
    <View style={styles.header}>
      <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>360</Text></View><View><Text style={styles.brandName}>CONT MARJO</Text><Text style={styles.brandHint}>SRI ECUADOR</Text></View></View>
      <View style={styles.actions}>
        {notifications ? <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificaciones" onPress={() => { setNotificationOpen(true); }} style={styles.iconButton}><Bell size={18} color="#fff" />{!notificationDismissed ? <View style={styles.badgeDot} /> : null}</Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={`Cambiar espacio. Actual: ${current.label}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={styles.roleButton}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.roleCopy}><Text numberOfLines={1} style={styles.roleName}>{current.label}</Text><Text style={styles.roleBadge}>{current.badge}</Text></View>
          <ChevronDown size={15} color="#bfdbfe" />
        </Pressable>
      </View>
    </View>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selector de espacio" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <View style={styles.handle} /><Text style={styles.sheetEyebrow}>PERFIL DE DEMOSTRACIÓN</Text><Text style={styles.sheetTitle}>Cambiar espacio</Text>
          {notifications ? <Pressable accessibilityRole="button" onPress={() => { setOpen(false); setActiveModule('notifications'); router.push('/(tabs)/module' as Href); }} style={styles.notificationRow}><Bell size={17} color={theme.brand} /><Text style={styles.notificationText}>Notificaciones y avisos</Text><View style={styles.notificationSpacer} />{!notificationDismissed ? <View style={styles.badgeDot} /> : <Check size={17} color={theme.success} />}</Pressable> : null}
          {roles.map((role) => <Pressable key={role.id} accessibilityRole="radio" accessibilityState={{ checked: activeRole === role.id }} onPress={() => { setOpen(false); setActiveRole(role.id); router.replace('/(tabs)'); }} style={[styles.roleOption, activeRole === role.id && styles.roleOptionActive]}>
            <View style={styles.optionCopy}><View style={styles.optionHeading}><Text style={styles.optionTitle}>{role.label}</Text><Text style={styles.optionBadge}>{role.badge}</Text></View><Text style={styles.optionDescription}>{role.description}</Text></View>
            {activeRole === role.id ? <Check size={19} color={theme.brand} /> : null}
          </Pressable>)}
          <Pressable accessibilityRole="button" onPress={() => { setOpen(false); Alert.alert('Restablecer demo', 'Se borrarán los cambios locales de esta demostración.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Restablecer', style: 'destructive', onPress: resetDemo }]); }} style={styles.reset}><Text style={styles.resetText}>Restablecer datos de la demo</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { setOpen(false); logout(); router.replace('/login'); }} style={styles.logout}><LogOut size={16} color={theme.muted} /><Text style={styles.logoutText}>Cerrar sesión de demostración</Text></Pressable>
        </View>
      </View>
    </Modal>
    <Modal visible={notificationOpen} transparent animationType="slide" onRequestClose={() => setNotificationOpen(false)}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar notificaciones" onPress={() => setNotificationOpen(false)} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <View style={styles.handle} /><Text style={styles.sheetEyebrow}>ALERTAS PREVENTIVAS SRI</Text><Text style={styles.sheetTitle}>Notificaciones</Text>
          {!notificationDismissed ? <View style={styles.alertCard}><View style={styles.alertHeading}><Bell size={17} color={theme.warning} /><Text style={styles.alertTitle}>Revisa tu próxima obligación</Text></View><Text style={styles.alertBody}>Confirma la fecha y estado de tus obligaciones en el calendario tributario.</Text><View style={styles.alertActions}><Pressable accessibilityRole="button" onPress={() => { setNotificationOpen(false); setActiveModule('notifications'); router.push('/(tabs)/module' as Href); }}><Text style={styles.alertLink}>Ver historial de avisos</Text></Pressable><Pressable accessibilityRole="button" onPress={dismissDemoNotification}><Text style={styles.alertLink}>Marcar vista</Text></Pressable></View></View> : <View style={styles.alertEmpty}><Check size={18} color={theme.success} /><Text style={styles.alertBody}>No hay alertas pendientes.</Text></View>}
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  header: { minHeight: 62, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1e40af', backgroundColor: '#1e3a8a' }, badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 }, brandMark: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#fff' }, brandMarkText: { color: '#1e3a8a', fontSize: 12, fontWeight: '900' }, brandName: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 }, brandHint: { marginTop: 2, color: '#bfdbfe', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#ffffff12' },
  roleButton: { maxWidth: 190, minHeight: 42, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 13, backgroundColor: '#ffffff18' }, avatar: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#ffffff26' }, avatarText: { color: '#fff', fontSize: 9, fontWeight: '900' }, roleCopy: { minWidth: 0, flex: 1 }, roleName: { color: '#fff', fontSize: 10, fontWeight: '800' }, roleBadge: { marginTop: 1, color: '#bfdbfe', fontSize: 9 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#10282c88' }, sheet: { gap: 9, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 30, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: theme.canvas }, handle: { width: 38, height: 4, alignSelf: 'center', marginBottom: 7, borderRadius: 4, backgroundColor: theme.line }, sheetEyebrow: { color: theme.brand, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, sheetTitle: { marginBottom: 3, color: theme.ink, fontSize: 21, fontWeight: '800' },
  roleOption: { minHeight: 70, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: theme.line, borderRadius: 15, backgroundColor: theme.surface }, roleOptionActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft }, optionCopy: { flex: 1, gap: 4 }, optionHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }, optionTitle: { color: theme.ink, fontSize: 13, fontWeight: '800' }, optionBadge: { overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: theme.surfaceMuted, color: theme.muted, fontSize: 9, fontWeight: '700' }, optionDescription: { color: theme.muted, fontSize: 11, lineHeight: 15 },
  notificationRow: { minHeight: 44, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, backgroundColor: theme.brandSoft }, notificationText: { color: theme.ink, fontSize: 12, fontWeight: '700' }, notificationSpacer: { flex: 1 }, reset: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 5, borderTopWidth: 1, borderTopColor: theme.line }, resetText: { color: theme.muted, fontSize: 12, fontWeight: '700' },
  alertCard: { gap: 8, padding: 13, borderWidth: 1, borderColor: '#fcd34d', borderRadius: 14, backgroundColor: '#fffbeb' }, alertHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, alertTitle: { flex: 1, color: '#78350f', fontSize: 13, fontWeight: '800' }, alertBody: { color: '#92400e', fontSize: 12, lineHeight: 18 }, alertActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 3 }, alertLink: { color: theme.brand, fontSize: 12, fontWeight: '700' }, alertEmpty: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  logout: { minHeight: 46, marginTop: 3, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: theme.line }, logoutText: { color: theme.muted, fontSize: 12, fontWeight: '700' },
});
