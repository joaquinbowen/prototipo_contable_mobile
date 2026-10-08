# CONT MARJO: paridad funcional web y móvil

## Objetivo

Alinear los recorridos del prototipo web y móvil con `spec_contaduria.md` y las correcciones confirmadas por el usuario. Cada operación local debe comunicar el mismo resultado en ambas plataformas, con controles adaptados al dispositivo.

## Alcance aprobado

- El prototipo sigue sin backend: OCR, autenticación, firma, conexión SRI, aprobación y almacenamiento externo son simulados y deben identificarse como tales.
- El alta tributaria permite adjuntar el PDF de RUC, simular OCR, completar los datos requeridos por el spec y revisar/confirmar el resultado.
- El perfil permite adjuntar el certificado `.pfx`/`.p12`, ver su estado/expiración y configurar una cuenta SRI. Las claves ingresadas son efímeras: al confirmar una simulación se limpian y nunca se conservan en el estado persistente.
- Configurada la firma, la emisión firma automáticamente el comprobante; no pide repetir la clave del certificado por cada documento. La emisión simula el envío y presenta primero `Pendiente por aprobación del SRI`, y después `Aprobado por el SRI y enviado`.
- El calendario presenta agenda y próximos vencimientos calculados según el noveno dígito para las obligaciones activas del perfil. Los vencimientos base siguen la tabla publicada por el SRI para IVA; fines de semana/feriados requieren confirmación en el calendario oficial, cuya URL se muestra en el prototipo.
- La compra leída por OCR simulado puede registrarse como gasto, cuenta por pagar y/o ingreso a inventario; ambas apps reflejan los efectos seleccionados.
- Marketplace diferencia la solicitud y propuestas del contribuyente de las oportunidades y propuestas enviadas por el contador; incluye conversación y permisos de acceso simulados. El contador adjunta evidencia de declaraciones y registra obligación, período y nota.
- El superadmin tiene un panel de estadísticas de demostración: usuarios por rol, comprobantes por estado, actividad del marketplace, lecturas OCR, almacenamiento de bóveda y estado de servicios. El spec pide el rol, pero no prescribe estos KPI; son una extensión solicitada por el usuario, no datos reales.
- Web y móvil mantienen repositorios y dependencias independientes. Se replica el contrato funcional con helpers tipados y casos de prueba equivalentes, sin compartir un paquete ejecutable.

## Decisiones de experiencia

- La emisión está guiada por `Nuevo` y no presenta un selector global de tipo en el encabezado.
- Firma y cuenta SRI se configuran en Perfil. La contraseña del certificado se solicita al configurarlo y se borra después de validar la simulación; luego la firma es automática.
- Sin certificado configurado, se ofrece ir a Perfil antes de emitir. Sin cuenta SRI configurada, el comprobante no se declara sincronizado; se comunica el requisito y se ofrece completar el perfil.
- El historial conserva ambas etapas de estado: el comprobante permanece visible como pendiente durante la simulación y después cambia al estado aprobado/enviado.
- Los indicadores administrativos llevan etiquetas de demostración y derivan del estado local, evitando métricas inventadas que no correspondan a registros visibles.

## Fuera de alcance

No se transmiten credenciales, declaraciones ni comprobantes al SRI. No se valida criptográficamente un certificado, no se promete autorización tributaria, no se procesa OCR real y no se ofrece persistencia segura ni multi-dispositivo.

## Referencias

- Requisito funcional base: `spec_contaduria.md`.
- Fechas de IVA por noveno dígito: [SRI - Impuesto al Valor Agregado](https://www.sri.gob.ec/web/intersri/impuesto-al-valor-agregado-iva).
- Ajustes indicados en la conversación: acceso desde `Nuevo`, configuración de firma y bóveda en perfil, perspectivas de marketplace por rol, evidencia de obligaciones del cliente y petición de panel útil para superadmin.
