import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { BadgeCheck, BriefcaseBusiness, FileArchive, FileUp, KeyRound, ShieldCheck, UserRound } from 'lucide-react-native';
import { Button, Card, Field, Notice, Pill, Screen, SectionTitle, TitleBlock } from '../components/ui/primitives';
import { useApp } from '../state/AppState';
import { getRouteForSession } from '../state/navigation';
import { theme } from '../theme';

type ProfileSection = 'account' | 'ruc' | 'signature' | 'sri' | 'vault';
const sections: { key: ProfileSection; label: string; Icon: typeof UserRound }[] = [
  { key: 'account', label: 'Datos', Icon: UserRound },
  { key: 'ruc', label: 'RUC', Icon: BriefcaseBusiness },
  { key: 'signature', label: 'Firma digital', Icon: ShieldCheck },
  { key: 'sri', label: 'Cuenta SRI', Icon: KeyRound },
  { key: 'vault', label: 'Bóveda', Icon: FileArchive },
];

export function ProfileScreen() {
  const { activeRole, logout, attachedRuc, setAttachedRuc, certificateName, setCertificateName, signatureConfigured, signatureExpiryDate, sriAccountConfigured, sriUsername, completeSignatureSetup, completeSriSetup, taxpayerProfile, simulateRucExtraction, confirmTaxpayerProfile, vaultFiles, addVaultFile } = useApp();
  const [section, setSection] = useState<ProfileSection>('account');
  const [fullName, setFullName] = useState(activeRole === 'CONTADOR_PROFESIONAL' ? 'María Fernanda López' : 'Joaquín Bowen Suárez');
  const [email, setEmail] = useState(activeRole === 'CONTADOR_PROFESIONAL' ? 'maria@estudiocontable.ec' : 'contacto@negocio.ec');
  const [phone, setPhone] = useState('+593 99 555 3173');
  const [ruc, setRuc] = useState(activeRole === 'CONTADOR_PROFESIONAL' ? '1712345678001' : '1792456789001');
  const [address, setAddress] = useState('Quito, Pichincha');
  const [certificatePassword, setCertificatePassword] = useState('');
  const [certificateExpiry, setCertificateExpiry] = useState('2027-10-14');
  const [sriLogin, setSriLogin] = useState(sriUsername);
  const [sriPassword, setSriPassword] = useState('');
  const [rucExtracted, setRucExtracted] = useState(false);
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  async function pickRuc() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) { setAttachedRuc(result.assets[0].name); setSection('ruc'); }
  }

  async function pickCertificate() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    const fileName = result.assets[0].name;
    if (!/\.(p12|pfx)$/i.test(fileName)) { Alert.alert('Formato no reconocido', 'Adjunta un certificado digital .p12 o .pfx.'); return; }
    setCertificateName(fileName);
    Alert.alert('Certificado adjunto', 'El archivo se seleccionó en este dispositivo para la demostración.');
  }

  async function pickVaultFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/xml', 'text/xml'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      if (vaultFiles.length >= 20) { Alert.alert('Bóveda llena', 'La capacidad de demostración es de 20 documentos.'); return; }
      addVaultFile(result.assets[0].name);
    }
  }

  const roleTitle = activeRole === 'CONTADOR_PROFESIONAL' ? 'Perfil profesional' : activeRole === 'SUPER_ADMIN' ? 'Perfil de administración' : 'Perfil del negocio';
  const visibleSections = activeRole === 'CONTRIBUYENTE' ? sections : sections.filter(({ key }) => key === 'account');
  return <Screen><TitleBlock eyebrow="CUENTA Y CONFIGURACIÓN" title={roleTitle} subtitle="Administra tus datos, el RUC, la firma y los documentos del negocio." />
    <View style={styles.sectionList}>{visibleSections.map(({ key, label, Icon }) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: section === key }} onPress={() => setSection(key)} style={[styles.sectionPill, section === key && styles.sectionPillActive]}><Icon size={14} color={section === key ? theme.brand : theme.muted} /><Text style={[styles.sectionLabel, section === key && styles.sectionLabelActive]}>{label}</Text>{key === 'signature' && signatureConfigured && <View style={styles.greenDot} />}{key === 'sri' && sriAccountConfigured && <View style={styles.greenDot} />}</Pressable>)}</View>
    {section === 'account' ? <>
      <Card><SectionTitle title="Datos de acceso" /><Field label="Nombre" value={fullName} onChangeText={setFullName} autoCapitalize="words" /><Field label="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Notice>Los datos se guardan solo mientras esta demostración está abierta.</Notice></Card>
      {activeRole === 'CONTRIBUYENTE' && <Card><SectionTitle title="Datos tributarios" /><Text style={styles.dataValue}>RUC {taxpayerProfile.ruc || ruc}</Text><Text style={styles.muted}>{taxpayerProfile.regimen || 'Completa la información con tu PDF del RUC'}</Text><Text style={styles.dataValue}>{taxpayerProfile.address || address}</Text><Button compact title="Revisar información del RUC" variant="secondary" onPress={() => setSection('ruc')} /></Card>}
      <Button title="Cerrar sesión" variant="secondary" onPress={() => { logout(); router.replace(getRouteForSession(false)); }} />
    </> : section === 'ruc' ? <>
      <Notice>Adjunta el PDF del RUC. Los campos se completan con datos de demostración y puedes revisarlos; no hay conexión OCR/SRI.</Notice>
      <Card><SectionTitle title="Información tributaria" /><Button title={attachedRuc ? `Cambiar PDF · ${attachedRuc}` : 'Adjuntar PDF del RUC'} variant="secondary" onPress={pickRuc} icon={<FileUp size={16} color={theme.brand} />} />{attachedRuc ? <><Pill tone="good">PDF adjunto · demo</Pill><Button title={rucExtracted ? 'Actualizar datos de ejemplo' : 'Extraer datos del RUC · demo'} onPress={() => { simulateRucExtraction(); setRucExtracted(true); setProfileConfirmed(false); }} /><Field label="Número de RUC" value={taxpayerProfile.ruc} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, ruc: value })} keyboardType="numeric" /><Field label="Razón social" value={taxpayerProfile.razonSocial} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, razonSocial: value })} autoCapitalize="words" /><Field label="Nombre comercial" value={taxpayerProfile.nombreComercial} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, nombreComercial: value })} autoCapitalize="words" /><Field label="Régimen" value={taxpayerProfile.regimen} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, regimen: value })} /><Field label="Actividades económicas" value={taxpayerProfile.actividades} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, actividades: value })} multiline /><Field label="Establecimiento matriz" value={taxpayerProfile.establecimiento} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, establecimiento: value })} /><Field label="Dirección principal" value={taxpayerProfile.address} onChangeText={(value) => confirmTaxpayerProfile({ ...taxpayerProfile, address: value })} /><SectionTitle title="Obligaciones detectadas" />{taxpayerProfile.obligaciones.map((item) => <Pill key={item}>{item}</Pill>)}<Button title={profileConfirmed ? 'Información confirmada' : 'Confirmar datos del RUC'} disabled={!rucExtracted} onPress={() => { setProfileConfirmed(true); Alert.alert('Perfil tributario confirmado · demo', 'Los datos de ejemplo están listos para esta sesión.'); }} />{profileConfirmed ? <Notice tone="success">Datos revisados y confirmados para este prototipo.</Notice> : null}</> : null}</Card>
    </> : section === 'signature' ? <>
      <Notice>La firma se configura aquí en el perfil. La bóveda guarda documentos del negocio; no guarda certificados.</Notice>
      <Card><View style={styles.signatureHeading}><View style={styles.shield}><ShieldCheck size={21} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Certificado digital</Text><Text style={styles.muted}>Adjunta el archivo entregado por tu proveedor de firma.</Text></View></View>
        <Button title={certificateName ? `Cambiar certificado · ${certificateName}` : 'Adjuntar certificado .p12 o .pfx'} variant="secondary" onPress={pickCertificate} icon={<FileUp size={16} color={theme.brand} />} />
        {certificateName ? <><Field label="Fecha de vencimiento" value={certificateExpiry} onChangeText={setCertificateExpiry} placeholder="AAAA-MM-DD" /><Field label="Contraseña del certificado" value={certificatePassword} onChangeText={setCertificatePassword} secureTextEntry placeholder="Solo para esta revisión local" /><Notice tone={signatureConfigured ? 'success' : 'warning'}>{signatureConfigured ? `Certificado configurado · vigencia indicada hasta ${signatureExpiryDate}; estado no verificado criptográficamente.` : `${certificateName} adjunto localmente. Confirma la contraseña una vez para configurar la firma automática.`}</Notice><Button title={signatureConfigured ? 'Actualizar configuración del certificado' : 'Configurar firma automática'} disabled={!certificatePassword || !certificateExpiry} onPress={() => { completeSignatureSetup(certificateExpiry); setCertificatePassword(''); Alert.alert('Firma configurada · demo', 'Los documentos se marcarán como firmados automáticamente en las emisiones simuladas.'); }} /></> : <Notice tone="warning">Todavía no hay un certificado adjunto.</Notice>}
        <View style={styles.facts}><View style={styles.fact}><KeyRound size={15} color={theme.muted} /><Text style={styles.factText}>La clave no se conserva</Text></View><View style={styles.fact}><BadgeCheck size={15} color={theme.muted} /><Text style={styles.factText}>Validez demostrativa</Text></View></View>
      </Card>
    </> : section === 'sri' ? <>
      <Notice>Configura esta sección para simular la sincronización de comprobantes. El prototipo no se conecta al SRI y nunca guarda tu contraseña.</Notice>
      <Card><SectionTitle title="Cuenta del SRI en línea" /><Field label="Usuario / RUC" value={sriLogin} onChangeText={setSriLogin} placeholder="Usuario de ejemplo" autoCapitalize="none" /><Field label="Contraseña SRI (solo esta prueba)" value={sriPassword} onChangeText={setSriPassword} placeholder="No uses la clave real" secureTextEntry /><Notice tone={sriAccountConfigured ? 'success' : 'warning'}>{sriAccountConfigured ? `Cuenta de demo configurada como ${sriUsername}; sincronización local simulada.` : 'Aún no está configurada. Completa usuario y clave de ejemplo para habilitar el flujo simulado.'}</Notice><Button title="Probar y guardar configuración demo" disabled={!sriLogin.trim() || !sriPassword} onPress={() => { completeSriSetup(sriLogin.trim()); setSriPassword(''); Alert.alert('Cuenta SRI configurada · demo', 'La clave se borró y no se contactó al SRI.'); }} /></Card>
    </> : <>
      <Card><View style={styles.signatureHeading}><View style={styles.vaultIcon}><FileArchive size={19} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Bóveda del negocio</Text><Text style={styles.muted}>RUC, declaraciones, balances y contratos.</Text></View></View><Button title="Añadir documento" onPress={pickVaultFile} icon={<FileUp size={16} color="#fff" />} /></Card>
      <SectionTitle title={`Bóveda · ${vaultFiles.length} / 20 documentos`} />
      {vaultFiles.map((file, index) => <Card key={`${file}-${index}`} style={styles.fileCard}><View style={styles.fileIcon}><FileArchive size={17} color={theme.brand} /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{file}</Text><Text style={styles.muted}>Documento local · demo</Text></View><Pill>PDF</Pill></Card>)}
      <Notice>La bóveda organiza archivos. Adjunta el certificado en “Firma digital”.</Notice>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  sectionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  sectionPill: { minHeight: 37, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionPillActive: { borderColor: '#c1d9d6', backgroundColor: theme.brandSoft },
  sectionLabel: { color: theme.muted, fontSize: 11, fontWeight: '600' },
  sectionLabelActive: { color: theme.brandDark },
  greenDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: theme.success },
  muted: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  dataValue: { color: theme.ink, fontSize: 14, fontWeight: '600' },
  cardTitle: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  signatureHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  shield: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.brandSoft },
  facts: { paddingTop: 5, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  factText: { color: theme.muted, fontSize: 11 },
  vaultIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.brandSoft },
  fileCard: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 10 },
  fileIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: theme.brandSoft, alignItems: 'center', justifyContent: 'center' },
});
