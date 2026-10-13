import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, BriefcaseBusiness, Building2, LockKeyhole, UserPlus } from 'lucide-react-native';
import { Button, Field, Notice, Screen } from '../components/ui/primitives';
import { theme } from '../theme';
import { useApp } from '../state/AppState';
import type { UserRole } from '../state/types';

type AccountRole = Extract<UserRole, 'CONTRIBUYENTE' | 'CONTADOR_PROFESIONAL'>;

export function AuthScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const { authMode, setAuthMode, registerDemo, loginDemo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [taxpayerRuc, setTaxpayerRuc] = useState('');
  const [accountType, setAccountType] = useState<AccountRole>('CONTRIBUYENTE');
  const [error, setError] = useState('');
  const isLogin = authMode === 'login';

  function changeMode(next: 'login' | 'register') {
    setAuthMode(next);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  function submit() {
    setError('');
    if (isLogin) {
      if (!loginDemo(identifier)) { setError('Prueba con “admin” o con el RUC o correo de demostración.'); return; }
      router.replace('/(tabs)');
      return;
    }
    if (!displayName.trim() || !identifier.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Completa los datos requeridos para crear tu cuenta.');
      return;
    }
    if (accountType === 'CONTRIBUYENTE' && !/^\d{13}$/.test(taxpayerRuc.trim())) {
      setError('Ingresa los 13 dígitos del RUC de tu negocio.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    registerDemo(accountType, displayName.trim(), identifier.trim(), accountType === 'CONTRIBUYENTE' ? taxpayerRuc.trim() : '');
    router.replace('/(tabs)');
  }

  return <Screen scroll={false}>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.panel, wide && styles.panelWide]}>
        {wide ? <View style={styles.side}>
          <View>
            <View style={styles.sideBrand}><View style={styles.sideMark}><Text style={styles.sideMarkText}>360</Text></View><Text style={styles.sideBrandName}>CONT MARJO</Text></View>
            <View style={styles.sideIntro}><Text style={styles.sideEyebrow}>CONTABILIDAD E IMPUESTOS</Text><Text style={styles.sideTitle}>Tus obligaciones y documentos, en orden.</Text><Text style={styles.sideBody}>Accede al espacio de tu negocio o a las herramientas profesionales de tu estudio contable.</Text></View>
          </View>
          <Text style={styles.sideNote}>Prototipo local. Los documentos, cálculos y trámites son de demostración.</Text>
        </View> : null}

        <View style={[styles.formColumn, wide && styles.formColumnWide]}>
          {!wide ? <View style={styles.mobileBrand}><View style={styles.mobileMark}><Text style={styles.mobileMarkText}>360</Text></View><Text style={styles.mobileBrandName}>CONT MARJO</Text></View> : null}
          <Text style={styles.eyebrow}>ESPACIO DE DEMOSTRACIÓN</Text>
          <Text style={styles.title}>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Ingresa el RUC o correo asociado a tu cuenta. Abriremos tu espacio automáticamente.' : accountType === 'CONTADOR_PROFESIONAL' ? 'Crea tu cuenta profesional y completa tu verificación.' : 'Completa los datos de tu negocio para comenzar.'}</Text>

          <View accessibilityRole="tablist" style={styles.modeTabs}>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: isLogin }} onPress={() => changeMode('login')} style={[styles.modeTab, isLogin && styles.modeTabActive]}><Text style={[styles.modeText, isLogin && styles.modeTextActive]}>Iniciar sesión</Text></Pressable>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: !isLogin }} onPress={() => changeMode('register')} style={[styles.modeTab, !isLogin && styles.modeTabActive]}><Text style={[styles.modeText, !isLogin && styles.modeTextActive]}>Registrarse</Text></Pressable>
          </View>

          {!isLogin ? <View style={styles.accountType}><Text style={styles.accountTypeLabel}>Tipo de cuenta</Text><View style={styles.accountTypeOptions}>
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: accountType === 'CONTRIBUYENTE' }} onPress={() => setAccountType('CONTRIBUYENTE')} style={styles.accountChoice}><Building2 size={16} color={accountType === 'CONTRIBUYENTE' ? theme.brand : theme.muted} /><Text style={[styles.accountChoiceText, accountType === 'CONTRIBUYENTE' && styles.accountChoiceTextActive]}>Negocio</Text><View style={[styles.radio, accountType === 'CONTRIBUYENTE' && styles.radioActive]}>{accountType === 'CONTRIBUYENTE' ? <View style={styles.radioDot} /> : null}</View></Pressable>
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: accountType === 'CONTADOR_PROFESIONAL' }} onPress={() => setAccountType('CONTADOR_PROFESIONAL')} style={styles.accountChoice}><BriefcaseBusiness size={16} color={accountType === 'CONTADOR_PROFESIONAL' ? theme.brand : theme.muted} /><Text style={[styles.accountChoiceText, accountType === 'CONTADOR_PROFESIONAL' && styles.accountChoiceTextActive]}>Contador</Text><View style={[styles.radio, accountType === 'CONTADOR_PROFESIONAL' && styles.radioActive]}>{accountType === 'CONTADOR_PROFESIONAL' ? <View style={styles.radioDot} /> : null}</View></Pressable>
          </View></View> : null}

          <View style={styles.fields}>
            {!isLogin ? <Field label="Nombre o razón social" value={displayName} onChangeText={setDisplayName} placeholder="Nombre de tu negocio" autoCapitalize="words" /> : null}
            {!isLogin && accountType === 'CONTRIBUYENTE' ? <Field label="RUC" value={taxpayerRuc} onChangeText={(value) => setTaxpayerRuc(value.replace(/\D/g, '').slice(0, 13))} placeholder="13 dígitos" keyboardType="numeric" /> : null}
            <Field label={isLogin ? 'Usuario, RUC o correo' : 'Correo electrónico'} value={identifier} onChangeText={setIdentifier} placeholder={isLogin ? 'admin o correo/RUC de demo' : 'nombre@correo.com'} keyboardType={isLogin ? 'default' : 'email-address'} autoCapitalize="none" />
            <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder={isLogin ? 'Opcional en la demo' : 'Escribe cualquier contraseña'} secureTextEntry />
            {!isLogin ? <Field label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repite la contraseña" secureTextEntry /> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonWrap}><Button title={isLogin ? 'Entrar a la demo' : 'Crear cuenta de demostración'} onPress={submit} icon={isLogin ? <LockKeyhole size={16} color="#fff" /> : <UserPlus size={16} color="#fff" />} /><View style={styles.buttonArrow}><ArrowRight size={15} color="#fff" /></View></View>
          </View>
          <Text style={styles.hint}>{isLogin ? 'Prototipo: entra con admin, tu RUC o correo de demostración. La contraseña es opcional. Puedes cambiar de rol desde el selector.' : accountType === 'CONTADOR_PROFESIONAL' ? 'Después del registro completarás tu expediente profesional.' : 'El registro abre el perfil de contribuyente para configurarlo.'}</Text>
          {!wide ? <Notice>Prototipo local. Los documentos, cálculos y trámites son de demostración.</Notice> : null}
        </View>
      </View>
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f3f6f5' },
  panel: { width: '100%', maxWidth: 560, alignSelf: 'center', overflow: 'hidden', borderRadius: 26, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', shadowColor: '#1f333a', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.12, shadowRadius: 25, elevation: 3 },
  panelWide: { maxWidth: 1152, minHeight: 620, flexDirection: 'row' },
  side: { width: '45%', minHeight: 620, padding: 38, justifyContent: 'space-between', backgroundColor: '#1e3a8a' },
  sideBrand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sideMark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#ffffff1a', borderWidth: 1, borderColor: '#ffffff33' },
  sideMarkText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  sideBrandName: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sideIntro: { marginTop: 48, gap: 12 },
  sideEyebrow: { color: '#bfdbfe', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  sideTitle: { maxWidth: 330, color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.7 },
  sideBody: { maxWidth: 350, color: '#e2e8f0', fontSize: 14, lineHeight: 23 },
  sideNote: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#ffffff26', backgroundColor: '#ffffff0d', color: '#e2e8f0', fontSize: 12, lineHeight: 19 },
  formColumn: { padding: 24, gap: 0 },
  formColumnWide: { flex: 1, justifyContent: 'center', paddingHorizontal: 50, paddingVertical: 40 },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 24 },
  mobileMark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#1e3a8a' },
  mobileMarkText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  mobileBrandName: { color: '#0f172a', fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  eyebrow: { color: '#2563eb', fontSize: 10, fontWeight: '800', letterSpacing: 1.7 },
  title: { marginTop: 5, color: '#020617', fontSize: 29, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { marginTop: 7, color: '#475569', fontSize: 14, lineHeight: 21 },
  modeTabs: { flexDirection: 'row', gap: 4, marginTop: 20, padding: 4, borderRadius: 13, backgroundColor: '#f1f5f9' },
  modeTab: { minHeight: 42, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  modeTabActive: { backgroundColor: '#fff', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  modeText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: '#1e3a8a', fontWeight: '700' },
  accountType: { marginTop: 16, gap: 7 },
  accountTypeLabel: { color: '#334155', fontSize: 13, fontWeight: '700' },
  accountTypeOptions: { flexDirection: 'row', gap: 9 },
  accountChoice: { minHeight: 42, flex: 1, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12 },
  accountChoiceText: { flex: 1, color: '#475569', fontSize: 12, fontWeight: '600' },
  accountChoiceTextActive: { color: '#1e3a8a' },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#2563eb' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563eb' },
  fields: { gap: 13, marginTop: 18 },
  error: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: 13, lineHeight: 19 },
  buttonWrap: { position: 'relative', width: '100%' },
  buttonArrow: { position: 'absolute', right: 16, top: 16, pointerEvents: 'none' },
  hint: { marginTop: 12, color: '#64748b', fontSize: 11, lineHeight: 17 },
});
