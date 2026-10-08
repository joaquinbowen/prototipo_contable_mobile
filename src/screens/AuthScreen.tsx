import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { BriefcaseBusiness, Building2, FileUp, Landmark, ShieldCheck, UserRound } from 'lucide-react-native';
import { Button, Card, Field, Notice, Screen } from '../components/ui/primitives';
import { theme } from '../theme';
import { useApp } from '../state/AppState';
import type { UserRole } from '../state/types';

const roleOptions: { id: UserRole; label: string; description: string; Icon: typeof UserRound }[] = [
  { id: 'CONTRIBUYENTE', label: 'Contribuyente', description: 'Gestiona tu negocio y obligaciones', Icon: Building2 },
  { id: 'CONTADOR_PROFESIONAL', label: 'Contador', description: 'Administra clientes y encargos', Icon: BriefcaseBusiness },
];

export function AuthScreen() {
  const { authMode, setAuthMode, authRole, setAuthRole, login, attachedRuc, setAttachedRuc } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ruc, setRuc] = useState('');

  async function pickRuc() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) setAttachedRuc(result.assets[0].name);
  }

  function submit() {
    if (!email.trim() || !password.trim() || (authMode === 'register' && !name.trim())) {
      Alert.alert('Completa tus datos', authMode === 'register' ? 'Ingresa tu nombre, correo y contraseña para continuar.' : 'Ingresa tu correo y contraseña para continuar.');
      return;
    }
    login(authRole);
    router.replace('/(tabs)');
  }

  return <Screen>
    <View style={styles.brand}><View style={styles.mark}><Landmark size={24} color="#fff" strokeWidth={2.2} /></View><View><Text style={styles.brandName}>CONT MARJO</Text><Text style={styles.brandCaption}>Gestión tributaria y contable</Text></View></View>
    <View style={styles.intro}><Text style={styles.eyebrow}>{authMode === 'login' ? 'TU ESPACIO DE TRABAJO' : 'EMPIEZA A ORGANIZARTE'}</Text><Text style={styles.title}>{authMode === 'login' ? 'Tus cuentas, en orden.' : 'Crea tu cuenta.'}</Text><Text style={styles.subtitle}>{authMode === 'login' ? 'Ingresa a tu negocio o a tu estudio contable.' : 'Elige cómo usarás CONT MARJO para mostrarte el registro correcto.'}</Text></View>

    {authMode === 'register' ? <View style={styles.roles}>{roleOptions.map(({ id, label, description, Icon }) => <Pressable key={id} onPress={() => setAuthRole(id)} style={[styles.roleChoice, authRole === id && styles.roleChoiceActive]}><Icon size={19} color={authRole === id ? theme.brand : theme.muted} /><View style={styles.roleCopy}><Text style={styles.roleTitle}>{label}</Text><Text style={styles.roleDescription}>{description}</Text></View><View style={[styles.radio, authRole === id && styles.radioActive]}>{authRole === id ? <View style={styles.radioDot} /> : null}</View></Pressable>)}</View> : <View style={styles.roleOptions}>{roleOptions.map(({ id, label }) => <Pressable key={id} onPress={() => setAuthRole(id)} style={[styles.rolePill, authRole === id && styles.rolePillActive]}><Text style={[styles.rolePillText, authRole === id && styles.rolePillTextActive]}>{label}</Text></Pressable>)}<Pressable onPress={() => setAuthRole('SUPER_ADMIN')} style={[styles.rolePill, authRole === 'SUPER_ADMIN' && styles.rolePillActive]}><ShieldCheck size={14} color={authRole === 'SUPER_ADMIN' ? theme.brand : theme.muted} /><Text style={[styles.rolePillText, authRole === 'SUPER_ADMIN' && styles.rolePillTextActive]}>Super Admin · demo</Text></Pressable></View>}

    <Card>
      <Text style={styles.formTitle}>{authMode === 'login' ? 'Inicia sesión' : authRole === 'CONTADOR_PROFESIONAL' ? 'Datos profesionales' : 'Datos del negocio'}</Text>
      {authMode === 'register' ? <Field label="Nombre completo" value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" /> : null}
      {authMode === 'register' && authRole === 'CONTRIBUYENTE' ? <>
        <Field label="RUC" value={ruc} onChangeText={setRuc} placeholder="13 dígitos" keyboardType="numeric" />
        <Button title={attachedRuc ? `RUC adjunto · ${attachedRuc}` : 'Adjuntar PDF del RUC'} variant="secondary" onPress={pickRuc} icon={<FileUp size={17} color={theme.brand} />} />
        <Notice>Simulación: los datos del PDF no se envían a un servicio OCR.</Notice>
      </> : null}
      {authMode === 'register' && authRole === 'CONTADOR_PROFESIONAL' ? <Field label="RUC profesional (opcional)" value={ruc} onChangeText={setRuc} placeholder="Número de identificación" keyboardType="numeric" /> : null}
      <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="nombre@negocio.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry />
      <Button title={authMode === 'login' ? 'Entrar a mi cuenta' : 'Crear cuenta'} onPress={submit} />
      <Pressable style={styles.switchMode} onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}><Text style={styles.switchText}>{authMode === 'login' ? '¿Aún no tienes cuenta? ' : '¿Ya tienes cuenta? '}<Text style={styles.switchLink}>{authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}</Text></Text></Pressable>
    </Card>

    {authMode === 'login' ? <View style={styles.demoBlock}><Text style={styles.demoLabel}>ENTRAR DIRECTAMENTE A LA DEMO</Text><View style={styles.demoButtons}><Button compact title="Contribuyente" variant="secondary" onPress={() => { login('CONTRIBUYENTE'); router.replace('/(tabs)'); }} /><Button compact title="Contador" variant="secondary" onPress={() => { login('CONTADOR_PROFESIONAL'); router.replace('/(tabs)'); }} /><Button compact title="Super Admin" variant="secondary" onPress={() => { login('SUPER_ADMIN'); router.replace('/(tabs)'); }} /></View><Notice>Prototipo local. Sin conexión al SRI ni almacenamiento en servidor.</Notice></View> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 4 },
  mark: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.brand },
  brandName: { color: theme.ink, fontSize: 14, fontWeight: '800', letterSpacing: 1.1 },
  brandCaption: { marginTop: 2, color: theme.muted, fontSize: 11 },
  intro: { gap: 7, marginTop: 7, marginBottom: 4 },
  eyebrow: { color: theme.brand, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: theme.ink, fontSize: 31, lineHeight: 37, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { maxWidth: 345, color: theme.muted, fontSize: 14, lineHeight: 21 },
  roleOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rolePill: { minHeight: 39, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  rolePillActive: { borderColor: theme.brand, backgroundColor: theme.brandSoft },
  rolePillText: { color: theme.muted, fontSize: 12, fontWeight: '600' },
  rolePillTextActive: { color: theme.brandDark },
  roles: { gap: 9 },
  roleChoice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, borderRadius: 15 },
  roleChoiceActive: { borderColor: theme.brand, backgroundColor: '#edf5f4' },
  roleCopy: { flex: 1, gap: 3 },
  roleTitle: { color: theme.ink, fontSize: 13, fontWeight: '700' },
  roleDescription: { color: theme.muted, fontSize: 11 },
  radio: { width: 20, height: 20, borderWidth: 1.5, borderColor: theme.line, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: theme.brand },
  radioDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: theme.brand },
  formTitle: { color: theme.ink, fontSize: 17, fontWeight: '700' },
  switchMode: { alignItems: 'center', paddingVertical: 2 },
  switchText: { color: theme.muted, fontSize: 13 },
  switchLink: { color: theme.brand, fontWeight: '700' },
  demoBlock: { gap: 11, paddingTop: 2 },
  demoLabel: { color: theme.subtle, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  demoButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
