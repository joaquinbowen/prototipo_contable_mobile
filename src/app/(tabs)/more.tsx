import React from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, BarChart3, Bell, BriefcaseBusiness, CalendarDays, FileText, LayoutDashboard, Package, PenLine, ScanLine, Store, UserRound, Users } from 'lucide-react-native';
import { Card, Screen, TitleBlock } from '../../components/ui/primitives';
import { useApp } from '../../state/AppState';
import { getModulesForRole } from '../../state/navigation';
import type { MobileModuleKey } from '../../state/navigation';
import { theme } from '../../theme';

const icons: Partial<Record<MobileModuleKey, typeof FileText>> = {
  dashboard: LayoutDashboard, business: BarChart3, document_history: FileText, purchases: ScanLine, inventory: Package,
  calendar: CalendarDays, sign_pdf: PenLine, marketplace: Store, work: BriefcaseBusiness, notifications: Bell, profile: UserRound,
  accountant_dashboard: LayoutDashboard, verification: FileText, accountant_proposals: FileText, accountant_clients: Users,
  manager_dashboard: LayoutDashboard, manager_applications: Users, manager_interviews: CalendarDays,
  admin_console: LayoutDashboard, admin_activity: BarChart3, admin_taxpayers: Users, admin_accountants: FileText, admin_marketplace: Store,
};

export default function MoreRoute() {
  const { activeRole, professionalVerification, setActiveModule } = useApp();
  const allModules = getModulesForRole(activeRole);
  const modules = activeRole === 'CONTADOR_PROFESIONAL' && professionalVerification !== 'VERIFICADO'
    ? allModules.filter((module) => module.key === 'verification' || module.key === 'profile')
    : allModules;
  const groups = [...new Set(modules.map((module) => module.group))];
  return <Screen><TitleBlock eyebrow="CONT MARJO 360" title="Todas tus secciones" subtitle="Accede a cada herramienta de tu espacio de trabajo." />
    {groups.map((group) => <View key={group} style={styles.group}><Text style={styles.groupTitle}>{group}</Text>
      {modules.filter((module) => module.group === group).map((module) => {
        const Icon = icons[module.key] ?? FileText;
        return <Pressable key={module.key} accessibilityRole="button" onPress={() => { setActiveModule(module.key); const direct: Partial<Record<MobileModuleKey, string>> = { business: '/(tabs)/workspace', document_history: '/(tabs)/documents', purchases: '/(tabs)/purchases', inventory: '/(tabs)/inventory', calendar: '/(tabs)/calendar', marketplace: activeRole === 'CONTRIBUYENTE' ? '/(tabs)/marketplace' : undefined }; router.push((direct[module.key] || '/(tabs)/module') as Href); }}><Card style={styles.moduleCard}><View style={styles.icon}><Icon size={17} color={theme.brand} /></View><Text style={styles.label}>{module.label}</Text><ArrowRight size={16} color={theme.subtle} /></Card></Pressable>;
      })}
    </View>)}
  </Screen>;
}

const styles = StyleSheet.create({
  group: { gap: 8 }, groupTitle: { color: theme.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  moduleCard: { minHeight: 62, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: theme.brandSoft },
  label: { flex: 1, color: theme.ink, fontSize: 14, fontWeight: '600' },
});
