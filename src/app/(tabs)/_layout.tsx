import { router, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import type { ColorValue } from 'react-native';
import { FileText, LayoutDashboard, PackageSearch, ShieldCheck, Store, UserRound, Users } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useApp } from '../../state/AppState';
import { getTabsForRole } from '../../state/navigation';
import type { MobileTabKey } from '../../state/navigation';
import { theme } from '../../theme';

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
const icons: Record<MobileTabKey, IconComponent> = {
  home: LayoutDashboard,
  documents: FileText,
  workspace: PackageSearch,
  profile: UserRound,
  opportunities: Store,
  clients: Users,
  users: Users,
  services: ShieldCheck,
};

export default function TabLayout() {
  const { activeRole, isAuthenticated } = useApp();
  const tabs = getTabsForRole(activeRole);
  const titles: Record<MobileTabKey, string> = Object.fromEntries(tabs.map((tab) => [tab.key, tab.label])) as Record<MobileTabKey, string>;
  const visible = (key: MobileTabKey) => tabs.some((tab) => tab.key === key);
  useEffect(() => { if (!isAuthenticated) router.replace('/login'); }, [isAuthenticated]);
  const icon = (key: MobileTabKey) => ({ color, size }: { color: ColorValue; size: number }) => {
    const Icon = icons[key];
    return <Icon color={String(color)} size={size} strokeWidth={2} />;
  };
  const common: ComponentProps<typeof Tabs>['screenOptions'] = {
    headerShown: false,
    tabBarActiveTintColor: theme.brand,
    tabBarInactiveTintColor: theme.subtle,
    tabBarStyle: { height: 65, paddingTop: 7, paddingBottom: 7, backgroundColor: '#fff', borderTopColor: theme.line },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    sceneStyle: { backgroundColor: theme.canvas },
  };

  return <Tabs screenOptions={common}>
    <Tabs.Screen name="index" options={{ title: titles.home ?? 'Inicio', tabBarIcon: icon('home'), href: visible('home') ? undefined : null }} />
    <Tabs.Screen name="documents" options={{ title: titles.documents ?? 'Documentos', tabBarIcon: icon('documents'), href: visible('documents') ? '/(tabs)/documents' : null }} />
    <Tabs.Screen name="workspace" options={{ title: titles.workspace ?? 'Gestión', tabBarIcon: icon('workspace'), href: visible('workspace') ? '/(tabs)/workspace' : null }} />
    <Tabs.Screen name="opportunities" options={{ title: titles.opportunities ?? 'Oportunidades', tabBarIcon: icon('opportunities'), href: visible('opportunities') ? '/(tabs)/opportunities' : null }} />
    <Tabs.Screen name="clients" options={{ title: titles.clients ?? 'Clientes', tabBarIcon: icon('clients'), href: visible('clients') ? '/(tabs)/clients' : null }} />
    <Tabs.Screen name="users" options={{ title: titles.users ?? 'Usuarios', tabBarIcon: icon('users'), href: visible('users') ? '/(tabs)/users' : null }} />
    <Tabs.Screen name="services" options={{ title: titles.services ?? 'Servicios', tabBarIcon: icon('services'), href: visible('services') ? '/(tabs)/services' : null }} />
    <Tabs.Screen name="profile" options={{ title: titles.profile ?? 'Perfil', tabBarIcon: icon('profile'), href: visible('profile') ? '/(tabs)/profile' : null }} />
  </Tabs>;
}
