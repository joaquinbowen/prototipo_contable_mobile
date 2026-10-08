import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, Database, FileText, MailCheck, ShieldCheck, Users } from 'lucide-react-native';
import { Card, Notice, Pill, Screen, TitleBlock } from '../components/ui/primitives';
import { theme } from '../theme';

const demoUsers = [
  { name: 'Comercial Andina', role: 'Contribuyente', status: 'Activo · demo' },
  { name: 'María Fernanda López', role: 'Contadora', status: 'Activo · demo' },
  { name: 'Servicios Pichincha', role: 'Contribuyente', status: 'Pendiente · demo' },
];

export function AdminUsersScreen() {
  return <Screen><TitleBlock eyebrow="SUPER ADMIN" title="Cuentas de usuario" subtitle="Vista de control de la plataforma. Estos perfiles son datos de demostración." /><Notice>Entorno de prototipo: aquí no se gestionan cuentas reales ni datos de producción.</Notice>{demoUsers.map((user) => <Card key={user.name} style={styles.userCard}><View style={styles.avatar}><Users size={16} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.title}>{user.name}</Text><Text style={styles.muted}>{user.role}</Text></View><Pill tone={user.status.startsWith('Activo') ? 'good' : 'warning'}>{user.status}</Pill></Card>)}</Screen>;
}

export function AdminServicesScreen() {
  const services = [
    { title: 'SRI', text: 'Conexión no configurada', detail: 'Las autorizaciones son estados simulados.', Icon: FileText, tone: 'warning' as const },
    { title: 'Lectura OCR', text: 'Demostración local', detail: 'No se procesa ni conserva el archivo en un servidor.', Icon: Activity, tone: 'neutral' as const },
    { title: 'Firma electrónica', text: 'Verificación simulada', detail: 'No se valida criptográficamente el certificado.', Icon: ShieldCheck, tone: 'warning' as const },
    { title: 'Almacenamiento', text: 'Archivos locales de demo', detail: 'Sin bóveda de producción conectada.', Icon: Database, tone: 'neutral' as const },
    { title: 'Notificaciones', text: 'Recordatorios ilustrativos', detail: 'No se envían correos ni mensajes.', Icon: MailCheck, tone: 'neutral' as const },
  ];
  return <Screen><TitleBlock eyebrow="SUPER ADMIN" title="Servicios y conexiones" subtitle="Estado visible de las integraciones para esta demostración." /><Notice tone="warning">Ningún servicio está conectado al SRI ni a sistemas productivos.</Notice>{services.map(({ title, text, detail, Icon, tone }) => <Card key={title} style={styles.serviceCard}><View style={styles.serviceIcon}><Icon size={18} color={theme.brand} /></View><View style={styles.serviceBody}><View style={styles.serviceTitle}><Text style={styles.title}>{title}</Text><Pill tone={tone === 'warning' ? 'warning' : 'neutral'}>{text}</Pill></View><Text style={styles.muted}>{detail}</Text></View></Card>)}</Screen>;
}

const styles = StyleSheet.create({
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13 },
  avatar: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.brandSoft },
  title: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  serviceCard: { flexDirection: 'row', gap: 11, padding: 14 },
  serviceIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: theme.brandSoft, alignItems: 'center', justifyContent: 'center' },
  serviceBody: { flex: 1, gap: 6 },
  serviceTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 7 },
});
