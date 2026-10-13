import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, Database, FileText, MailCheck, ShieldCheck, Users } from 'lucide-react-native';
import { Card, Notice, Pill, Screen, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { theme } from '../theme';

export function AdminUsersScreen() {
  const { taxpayerProfile, professionalProfile, professionalVerification } = useApp();
  const statusLabels: Record<string, string> = { PENDIENTE: 'Borrador', EN_REVISION: 'En revisión', OBSERVADO: 'Requiere correcciones', HABILITADO_PARA_ENTREVISTA: 'Entrevista habilitada', ENTREVISTA_AGENDADA: 'Entrevista agendada', PENDIENTE_DECISION: 'Pendiente de decisión', VERIFICADO: 'Verificada', RECHAZADO: 'Rechazada', SUSPENDIDO: 'Suspendida' };
  const users = [
    { name: taxpayerProfile.razonSocial || 'Contribuyente sin razón social', detail: `${taxpayerProfile.ruc ? `RUC ${taxpayerProfile.ruc}` : 'RUC pendiente'} · ${taxpayerProfile.email || 'Sin correo'}`, role: 'Contribuyente', status: taxpayerProfile.ruc ? 'Activa' : 'Pendiente', good: Boolean(taxpayerProfile.ruc) },
    { name: professionalProfile.fullName || 'Contador profesional', detail: `${professionalProfile.email || 'Sin correo'} · ${professionalProfile.city || 'Ciudad pendiente'}`, role: 'Contador', status: statusLabels[professionalVerification], good: professionalVerification === 'VERIFICADO' },
  ];
  return <Screen><TitleBlock eyebrow="SUPER ADMIN" title="Cuentas de usuario" subtitle="Perfiles registrados en el estado actual de la plataforma." /><Notice>Esta sesión de demostración conserva localmente los datos de contribuyente y contador para revisar sus perfiles.</Notice>{users.map((user) => <Card key={user.role} style={styles.userCard}><View style={styles.avatar}><Users size={16} color={theme.brand} /></View><View style={{ flex: 1, gap: 3 }}><Text style={styles.title}>{user.name}</Text><Text style={styles.muted}>{user.role} · {user.detail}</Text></View><Pill tone={user.good ? 'good' : 'warning'}>{user.status}</Pill></Card>)}</Screen>;
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
