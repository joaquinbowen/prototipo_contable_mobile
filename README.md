# CONT MARJO · Mobile

Aplicación nativa para iOS y Android construida con React Native y Expo. Mantiene los roles y flujos del prototipo web, con navegación y controles adaptados a pantallas táctiles.

## Requisitos

- Node.js LTS
- pnpm 10.30.3
- Expo Go compatible con el SDK actual, o Android Studio / Xcode para un build nativo

## Desarrollo

```powershell
pnpm install
pnpm start
```

Para abrir una plataforma directamente:

```powershell
pnpm android
pnpm ios
pnpm web
```

## Validación

```powershell
pnpm lint
pnpm test
pnpm build:web
pnpm dlx expo-doctor
```

La autenticación, OCR, firma, marketplace, documentos del SRI, evidencias y datos son simulaciones locales. Los archivos se seleccionan con los controles nativos del dispositivo y no se envían a un servidor.
