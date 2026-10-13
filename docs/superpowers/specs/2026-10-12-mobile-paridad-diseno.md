# Diseño mobile de paridad con web

Fecha: 2026-10-12

## Objetivo

Completar la aplicación Expo mobile para que cubra los roles y áreas disponibles en CONT MARJO web, reorganizadas para pantallas táctiles y sin cambiar las reglas del negocio de demostración.

## Personas y tareas

- Contribuyente: revisar el estado del negocio, emitir y consultar comprobantes, registrar compras, controlar inventario y obligaciones, consultar servicios, trabajos y su perfil.
- Contador profesional: completar verificación, revisar oportunidades, gestionar clientes, trabajos, propuestas y el espacio de auditoría del cliente.
- Gestor de contadores: revisar el panorama de verificación, expedientes y agenda de entrevistas.
- Superadmin: revisar panorama, contribuyentes, contadores, marketplace y actividad/servicios de la plataforma.

## Diseño

La web aprobada es la referencia visual y de contenido. Mobile debe compartir su identidad azul y pizarra (canvas `#f4f8fb`, tinta `#0f172a`, azul `#12558b`, azul marino `#193953`), jerarquía, títulos, estados, etiquetas y acciones. Se adapta la composición a touch: login en una columna bajo 768 px, cuatro destinos persistentes por rol y un destino «Más» con el catálogo completo agrupado, en vez de comprimir todo en una barra pequeña. Los módulos conservan la información y tareas de web, reorganizadas en tarjetas legibles, navegación por pestañas y hojas inferiores nativas; controles y archivos mantienen áreas táctiles cómodas y picker del sistema.

El acceso sigue el mismo flujo de web: RUC o correo resuelve automáticamente la cuenta; el cambio a gestor o superadmin se hace en el selector de rol posterior al acceso. En tablet y navegador ancho se conserva el panel azul de bienvenida de la referencia web.

## Arquitectura y datos

Expo Router sigue siendo el sistema de rutas. Una capa de catálogo tipada declara módulos, etiquetas, iconos, agrupaciones y disponibilidad por rol. La selección de un módulo se guarda en estado de navegación; pantallas existentes siguen siendo la implementación de dominios donde están disponibles y se amplían con pantallas nativas específicas para áreas faltantes. El estado local permanece explícitamente de demostración. Gestor se agrega como rol de primera clase. No se incorpora una API, persistencia remota ni dependencia visual adicional.

## Áreas y paridad

- Contribuyente: resumen, negocio/finanzas, emisión, historial, compras/OCR, inventario, calendario, firma y bóveda, servicios contables/trabajos, notificaciones, onboarding/RUC y perfil.
- Contador: resumen, verificación/onboarding, oportunidades y propuestas, cartera/evidencias, espacio del cliente, trabajos, notificaciones y perfil.
- Gestor: panel, expedientes y agenda de entrevistas.
- Superadmin: panorama, marketplace, contribuyentes, contadores, actividad, servicios e integraciones.

## Errores, accesibilidad y límites

Los errores de formularios usan mensajes accionables y controles nativos con roles y etiquetas accesibles. La navegación mantiene estado activo visible y responde al área táctil. Se respetan safe areas y teclado. Los flujos que dependen de SRI, identidad, firma o backend continúan identificados como simulaciones si web/mobile no tienen conexión productiva.

## Validación

TypeScript/lint y export web de Expo para comprobar la integración universal; revisión visual en navegador/dispositivo cuando esté disponible. Las pruebas existentes de lógica se preservan.
