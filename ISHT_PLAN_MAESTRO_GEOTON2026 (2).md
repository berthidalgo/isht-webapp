# ISHT — ÍNDICE DE SEGURIDAD HÍDRICA TERRITORIAL DEL PERÚ
## Master Plan Estratégico v5.0 (Documento Único Consolidado, Auditado RedTeam) | GEOTÓN Perú 2026 — Categoría: Territorio Sostenible (Agua, ambiente, biodiversidad y recursos hídricos)
### HiDATA — Joan Hidalgo (Lead Técnico; Ing. Física UNI, Adm. de Negocios Internacionales ADEX; fundador HiDATA) + Bruno Elescano (Químico Puro, UNMSM; Calidad Hídrica y Geoquímica)
**Fecha:** Junio 2026
**Nivel:** Consultoría estratégica aplicada a recursos hídricos (filosofía y rigor de firma internacional)
**Alcance:** Capa de integración y decisión sobre datos hídricos oficiales del Estado. No un visor más. No un balance hídrico más. El índice de decisión interactivo que falta.

> **Estado de ejecución (5 jun, 15:20).** ✅ **Fase 0 completa:** el sistema full-stack está desplegado y vivo — backend en `https://isht-webapp.onrender.com` (FastAPI, `/docs` operativo) y frontend en `https://isht-webapp.vercel.app` (mapa interactivo de Perú), conectados y verificados. El esqueleto, el pipeline de deploy (GitHub→Render+Vercel) y la arquitectura del §4 ya son realidad, no plan. **Lo que sigue (Fase 1)** es poblar el sistema con datos reales, empezando por la capa de cuencas de GeoPerú (admisibilidad). El detalle operativo y el punto de continuación están en el documento hermano `ISHT_MASTER_PLAN_EJECUCION.md`, §14.

> **Nota de versión (v5.0).** Esta versión reposiciona el ISHT tras una auditoría forense del ecosistema de datos del Estado (GeoPerú, GEOIDEP, Geoportal ANA, SNIRH, Balance Hídrico SENAMHI) y la verificación de las fuentes de datos descargables. Dos hallazgos centrales: **(1)** el Estado SÍ publica capas hídricas y SÍ tiene un modelo de oferta hídrica validado y peer-reviewed (PISCO_HyM_GR2M, Llauca et al. 2021, SENAMHI), descargable como producto abierto con DOI; **(2)** lo que no existe es la capa de integración que cruza oferta con demanda, valoriza la brecha en soles y prioriza la inversión. El ISHT deja de competir con la ciencia hídrica del Estado y construye, sobre ella, la inteligencia de decisión que falta — entregada como un sistema interactivo, no un visor estático.

---

## ★ ARRANQUE INMEDIATO — LA PRIMERA PIEDRA (para ejecutar HOY)

> **Estado confirmado:** HiDATA está inscrita (formulario t/52312). Hoy (5 de junio) es el último día de la ventana de desarrollo. El registro de la propuesta final es por el formulario **https://facilita.gob.pe/t/52313**. Si el cronograma sufre ajuste, se comunica por canales oficiales; ante duda, escribir a contacto@datosabiertos.gob.pe.
>
> **▶ Actualización de ejecución (15:20):** La infraestructura ya está montada y desplegada (Fase 0 ✅). Los pasos de abajo se reinterpretan a la luz de eso: ya no es "construir desde cero" sino "poblar con datos el sistema vivo". El siguiente paso real es el **Paso 1-2 combinado**: verificar el endpoint WFS de GeoPerú y bajar la capa de cuencas. Ver `ISHT_MASTER_PLAN_EJECUCION.md` §14 para el detalle operativo exacto.

Esta sección es la guía de acción para las próximas horas. El resto del documento es el sustento completo. Orden de ejecución:

**Paso 0 — Lo no negociable del concurso (15 min).**
Releer la sección 9-BIS (alineación a bases). El entregable que se sube a Facilita son **10 campos + un anexo visual obligatorio** — NO este documento. Este documento es nuestra biblia interna y la defensa para preguntas. El 60% del puntaje está en: relevancia del problema (20%) + uso de datos GEO Perú (20%) + propuesta de solución (20%).

**Paso 1 — Validar endpoints de datos (medio día).**
Abrir en QGIS o navegador cada servicio de la Sección 8-BIS (Inventario de Fuentes). Marcar vivo/caído. Esta validación ES el subproducto de gobernanza que ofrecemos a la PCM. Prioridad de validación:
1. ANA red hidrográfica Pfafstetter (la malla base de cuencas).
2. PISCO_HyM_GR2M (la oferta hídrica — descargar el NetCDF).
3. OEFA afectación de cuencas (respaldo de la dimensión calidad/conflicto).

**Paso 2 — Bajar la base geométrica (1-2 h).**
Cuencas Pfafstetter desde ANA (`SERV_AguasContiLoticos`) → exportar a GeoPackage. Es la malla sobre la que se construye TODO.

**Paso 3 — Bajar la oferta (1-2 h).**
NetCDF de PISCO_HyM_GR2M → leer con `xarray` en Python → agregar caudal/escorrentía por cuenca Pfafstetter. (No re-correr el modelo R; consumir la salida validada.)

**Paso 4 — Construir el MVP del diagnóstico (medio día).**
Demanda por cuenca (derechos ANA + población INEI + exportaciones SUNAT) → brecha = oferta − demanda → índice dual → semáforo. Con esto ya hay un resultado mostrable.

**Paso 5 — Foco en cuencas bandera (resto del tiempo).**
Ica (déficit crítico) + La Libertad (superávit aprovechado). Evaluar series reales; si alcanzan, modelar; si no, escenarios. Honestidad metodológica.

**Paso 6 — Anexo visual (crítico para el entregable).**
Construir el tablero/Atlas o, si el tiempo aprieta, una lámina explicativa de alta calidad que muestre: el problema (paradoja hídrica), el índice por cuenca (semáforo), y la priorización de inversión. Esto es lo que se sube a Facilita.

**Paso 7 — Llenar los 10 campos y registrar en t/52313 ANTES del cierre.**

> **Regla de oro del tiempo:** si hay que elegir entre profundidad técnica y tener algo completo y mostrable subido a tiempo, gana lo segundo. Un MVP honesto del diagnóstico (oferta − demanda → brecha → priorización) sobre 2 cuencas bandera, con un anexo visual claro, es una propuesta ganadora. La sofisticación (los 3 motores, los 8 modelos) es el techo, no el piso.

---

## 0. RESUMEN PARA EL JURADO (UNA PÁGINA)

**Qué es el ISHT.** Un sistema de inteligencia hídrica territorial que, para las 159 unidades hidrográficas del Perú, integra la oferta hídrica oficial (modelo PISCO_HyM_GR2M de SENAMHI) con la demanda multisectorial (población, agro, minería, energía), calcula la **brecha** resultante, la **valoriza** en soles y empleos, y **prioriza** la inversión pública por retorno. Es interactivo: el tomador de decisión mueve un parámetro y el escenario se recalcula.

**Qué NO es.** No es un visor de consulta (eso ya existe: GeoPerú). No es un modelo de balance de oferta (eso ya existe y está bien hecho: PISCO_HyM_GR2M). No es un mapa de colores para colgar en la pared.

**Por qué el Estado lo necesita.** Hoy, las decisiones de inversión hídrica se toman sin una imagen integrada de dónde la demanda supera la oferta, cuánto cuesta ese déficit, y dónde el siguiente sol rinde más. El Estado tiene los datos dispersos en silos; nadie los integra en un índice de decisión. El ISHT es exactamente el caso de uso que ordena la **RM 049-2026 PCM** (Estrategia Nacional de Gobierno de Datos 2026-2030): interoperabilidad aplicada a un dominio crítico.

**Diferenciador honesto.** Nos paramos sobre el trabajo científico del Estado (citándolo y dándole crédito) y construimos las cuatro capas que el Estado nunca construyó: demanda cruzada, brecha, valorización y priorización. Esto es consultoría estratégica real: no reinventamos la oferta hídrica; entregamos la decisión.

**Equipo.** Joan Hidalgo (Ingeniero Físico por la UNI, cursando Administración de Negocios Internacionales en ADEX; fundador y cabeza de HiDATA) lidera arquitectura, modelos y estrategia. Bruno Elescano (Químico Puro por la UNMSM) lidera calidad hídrica y geoquímica. Dos disciplinas duras —física y química— de las dos universidades más exigentes del país, aplicadas a un problema de Estado. HiDATA nace con la filosofía de las grandes firmas de consultoría: rigor analítico, disciplina de alcance, y foco obsesivo en el valor para el cliente —en este caso, el Estado peruano.

---

## 1. MANIFIESTO EJECUTIVO: LA CIFRA QUE ABRE

> El Perú es el octavo país del mundo por volumen de agua dulce, pero vive una paradoja territorial estructural: la vertiente amazónica concentra la enorme mayoría del agua disponible para una minoría de la población, mientras la vertiente del Pacífico —donde vive cerca de dos tercios de los peruanos y se concentra el grueso de la producción nacional— dispone de una fracción mínima del recurso.
>
> El resultado es una crisis de gobernanza hídrica: cerca de la mitad de la población no tiene acceso a agua potable segura; el país ha perdido aproximadamente la mitad de su superficie glaciar desde mediados del siglo XX; y la costa —donde corre la economía— sufre escasez crónica mientras desperdicia agua estacional en desbordes que van al mar sin infraestructura de captura.
>
> **El ISHT no es un mapa de colores ni un visor más. Es la capa de integración y decisión que falta.** Para cada una de las 159 unidades hidrográficas, integra la oferta hídrica oficial del Estado con la demanda multisectorial, calcula la brecha, la valoriza en soles y empleos, proyecta su trayectoria, y prioriza la inversión pública por retorno. Se ancla a la metodología oficial de la ANA, al modelo PISCO_HyM_GR2M de SENAMHI, a la Ley de Recursos Hídricos (29338), a la Ley de Siembra y Cosecha de Agua, y a la RM 049-2026 PCM, para decirle al Estado, con precisión de consultoría estratégica, **dónde poner el siguiente sol**.

> **Disciplina de cifras (v5.0).** Toda cifra macro de este documento debe ir acompañada de su fuente primaria citada en el Anexo de Fuentes antes de la presentación final. Las cifras sin fuente verificada se presentan como "estimación preliminar pendiente de validación", nunca como dato duro. Esta disciplina es deliberada: aplicamos a nuestro propio documento el principio de Fabián Camargo (S6) — "basura entra, basura sale". Un dato sin trazabilidad no entra al índice.

---

## 2. EL PROBLEMA TERRITORIAL: DIAGNÓSTICO CON RIGOR

### 2.1 La paradoja cuantificada
La desigualdad hidrográfica del Perú no es anecdótica; es estructural y medible. La Región Hidrográfica Amazónica genera la gran mayoría del agua dulce nacional para una minoría poblacional. La Región del Pacífico, donde vive la mayoría de los peruanos y se ubica el grueso del PBI agrícola, genera una fracción mínima del recurso. Lima, la capital, sobreconsume muy por encima del estándar OMS en una cuenca donde el agua es escasa y la población creció de forma sostenida en las últimas décadas.

> *Las cifras exactas de cada vertiente (porcentaje de agua, porcentaje de población, consumo per cápita de Lima) se presentan con su fuente ANA / Política Nacional de Recursos Hídricos en el Anexo de Fuentes. Se usa una sola fuente consistente en toda la propuesta para evitar discrepancias decimales.*

### 2.2 La costa: escasez y desperdicio simultáneos
La costa peruana padece tres patologías concurrentes:
- **Acuíferos sobreexplotados**: En Ica, la napa freática desciende de forma sostenida cada año, pasando de una reserva explotable positiva a una sobreexplotación neta (datos ANA del Plan de Gestión del Acuífero de Ica; el ISHT actualiza la tendencia con series de pozos e indicadores satelitales recientes).
- **Desabastecimiento poblacional**: cerca de la mitad de la población peruana carece de acceso a agua potable segura.
- **Pérdida estacional masiva**: Con cada evento de El Niño, los ríos costeros se desbordan, inundan y se van al mar sin infraestructura de captura. El SENAMHI emite alertas recurrentes por crecidas en la costa norte y central.

### 2.3 El vacío real del Estado: NO es ceguera de datos, es ausencia de integración
Este es el corazón del diagnóstico, y la corrección más importante respecto de versiones anteriores de este plan.

**El Estado SÍ publica capas hídricas.** La auditoría forense del ecosistema de datos confirmó que:
- La **ANA**, a través de su Geoportal (Visor Geohidro, Catálogo de Metadatos y Geoservicios), publica vía WMS/WFS/Shapefile las unidades hidrográficas (Pfafstetter), la clasificación de cuerpos de agua por calidad (ECA), glaciares, e infraestructura hidráulica.
- El **SNIRH / Observatorio del Agua** integra, por cuenca, represas, demanda, calidad, gestión de riesgo e inventario de fuentes superficiales y subterráneas para las 159 unidades hidrográficas.
- El **SENAMHI**, a través de PHISIS e IDESEP, publica caudales en tiempo real y un Balance Hídrico SIG con proyecciones a futuro, sustentado en el modelo validado PISCO_HyM_GR2M.
- **GeoPerú** integra más de 700 capas de 27 categorías, incluyendo una categoría de conflictos (agrarios, mineros, hídricos, energéticos).

**Entonces, ¿cuál es el problema?** Que ninguna de estas piezas se cruza con las demás en un índice de decisión. Cada capa vive en su silo:
- SENAMHI sabe cuánta agua hay (oferta), pero no la cruza con cuánta se consume (demanda).
- ANA tiene los derechos de uso y la calidad, pero no los integra en una brecha valorizada.
- GeoPerú visualiza conflictos, pero no los predice ni los prioriza.
- **Nadie calcula la brecha (oferta − demanda) por cuenca, nadie la valoriza en soles, y nadie prioriza la inversión por retorno.**

El Estado no invierte a ciegas por falta de datos. Invierte sub-óptimamente por **falta de integración**. Los millones de la Ley de Siembra y Cosecha de Agua del Midagri necesitan un mapa de retorno que hoy no existe.

### 2.4 Problema vs Síntoma (Narrativa de firma)
> *"La sequía es el síntoma. El huaico es el síntoma. El conflicto minero por el agua es el síntoma. El problema es la inseguridad hídrica territorial: la ausencia de un sistema integrado que cruce oferta con demanda, anticipe dónde la brecha se volverá crítica, y priorice la inversión antes de que fallen las cosechas, colapsen los acuíferos o sangren las quebradas."*
> — Alineado a la pirámide epistemológica de Naldi Carrión (ESAN, S10): Dato → Información → Evidencia → Decisión → Conocimiento → Valor Público.

**El posicionamiento epistemológico del ISHT en esa pirámide es deliberado:** las plataformas actuales del Estado (Balance Hídrico SENAMHI, Observatorio SNIRH) llegan hasta el escalón de "Información/Evidencia" — muestran datos procesados. El ISHT toma esa evidencia y sube los dos escalones que faltan: **Decisión** (ranking por retorno) y **Valor Público** (soles protegidos, conflictos evitados).

---

## 3. EL ESTADO DEL ARTE: QUÉ TIENE YA EL ESTADO Y DÓNDE VIVE EL ISHT

Esta sección es la más importante de la propuesta. Demuestra que conocemos el terreno con precisión forense y que nuestra diferenciación es honesta y defendible.

### 3.1 Lo que el Estado YA tiene (y nosotros honramos)

| Plataforma del Estado | Qué hace bien | Tecnología real |
|---|---|---|
| **PISCO_HyM_GR2M** (Llauca et al. 2021, SENAMHI) | Modela la oferta hídrica superficial mensual de **3,594 subcuencas** del Perú (incluidas cuencas transfronterizas), con series de **1981 a 2022**. Validado con métricas KGE/NSE de nivel publicación científica (paper en *Water*, MDPI, DOI: 10.3390/w13081048). Es ciencia hídrica seria, peer-reviewed, y **descargable abiertamente** (NetCDF en HydroShare y Figshare; código R en GitHub `hllauca/GR2MSemiDistr`). | Modelo hidrológico GR2M semi-distribuido, regionalización por método FAST, ruteo WFAC. Variables: precipitación, evapotranspiración real, humedad de suelo, escorrentía, caudal — por subcuenca, mensual. |
| **Balance Hídrico SIG (SENAMHI/IDESEP)** | Publica precipitación, evapotranspiración, rendimiento hídrico y caudales con proyección a escenarios de cambio climático (horizonte 2035-2065) para todas las unidades hidrográficas | Visor SIG de consulta (estático) sobre el motor PISCO/GR2M |
| **Geoportal ANA + SNIRH** | Publica cuencas Pfafstetter, derechos de uso, calidad de cuerpos de agua (ECA), inventario de fuentes, represas; integra por cuenca en el Observatorio del Agua | Servicios WMS/WFS + dashboard ASP.NET (Visor Geohidro, Catálogo de Metadatos, Geoservicios) |
| **GeoPerú (PCM)** | Agrega (cifras oficiales del lanzamiento GEOTÓN 2026) información de más de 317 entidades públicas, más de 2,000 capas geoespaciales y 1,015 servicios interoperables; permite cargar capas externas WMS/WFS/REST | Visor nacional (SPA), DS 029-2021-PCM |

**Postura de HiDATA, explícita y humilde:** No competimos con PISCO_HyM_GR2M. Es un buen modelo de oferta y lo usamos como **insumo validado**. Reinventar la oferta hídrica en 8 días sería arrogante e inferior. Esto es exactamente lo que hace una consultora seria: se para sobre los datos oficiales y construye la capa de decisión que falta.

### 3.2 Lo que el Estado NO tiene (y nosotros construimos)

La auditoría confirmó cinco vacíos. Cada uno es una capa del ISHT:

1. **El cruce oferta − demanda (la brecha).** Ningún sistema del Estado calcula, por cuenca, cuánta agua se necesita versus cuánta hay. SENAMHI da la oferta; nadie le resta la demanda. Sin brecha no hay diagnóstico de seguridad hídrica.
2. **La integración subterráneo + superficial + calidad.** PISCO_HyM_GR2M es solo agua superficial. No toca acuíferos (los pozos de Ica), ni calidad química (el arsénico de las cuencas mineras), ni los integra en un índice dual.
3. **La valorización financiera.** Nadie traduce el déficit a soles, divisas en riesgo, empleos amenazados, conflictos latentes.
4. **La priorización por retorno de inversión.** Nadie le dice al Estado dónde el siguiente sol rinde más.
5. **La interactividad de decisión.** Las plataformas actuales son visores de consulta: muestran un resultado fijo. El ISHT es una herramienta viva donde el decisor mueve un supuesto (precio del espárrago, expansión de pozos, escenario de El Niño) y ve el índice y el ranking recalcularse.

### 3.3 La frase de diferenciación (memorizar para el pitch)
> *"El SENAMHI ya modeló, con rigor científico, cuánta agua hay en cada cuenca del Perú. Hizo bien su trabajo y lo usamos como base. Lo que el Estado nunca construyó es la capa que cruza esa oferta con la demanda real, le pone precio a la brecha, y le dice al Estado dónde invertir primero. Eso es el ISHT: no reinventamos la ciencia del agua; entregamos la decisión sobre el agua."*

---

## 4. MARCO ISHT: SISTEMA DE INTELIGENCIA HÍDRICA (4×4)

El ISHT se construye sobre una arquitectura de **cuatro capas de profundidad vertical** aplicadas a **cuatro dimensiones de análisis horizontal**. Esto separa un visor estático de un sistema de decisión.

### 4.1 Profundidad vertical: las 4 capas

**Capa 1 — Diagnóstico (Balance Dual por Cuenca)**
Para cada cuenca se integran **dos balances** en un índice compuesto:
- **Balance superficial**: Oferta (se consume el rendimiento hídrico de PISCO_HyM_GR2M de SENAMHI como insumo validado, más volumen estacional desbordado) menos demanda consuntiva superficial (riego, población, industria).
- **Balance subterráneo**: Recarga estimada menos extracción (pozos, bombas, transferencia minera). Este es un aporte propio: el Estado no tiene balance subterráneo integrado.

El índice compuesto pondera cada balance según la dependencia hídrica de la cuenca. En cuencas costeras (Ica, La Yarada-Lluta), el peso subterráneo domina; en cuencas andinas (Mantaro, Rímac), domina el superficial. El resultado se clasifica en semáforo, que es la **interfaz de decisión** del índice numérico, no el producto:
- **Rojo**: Déficit crítico (brecha amplia, tendencia negativa).
- **Amarillo**: Equilibrio frágil (brecha estrecha, alta variabilidad estacional).
- **Azul**: Superávit con oportunidad (excedente con potencial de captura o generación).

> *El semáforo es la interfaz de decisión de un índice numérico predictivo. Detrás de cada color hay: balances dualizados, la oferta validada de SENAMHI, demanda cruzada, proyecciones, valorización financiera y ranking por retorno. El ISHT no pinta cuencas: cruza oferta con demanda, le pone precio a la brecha, y prioriza inversión.*

**Capa 2 — Proyección (Trayectoria de la Brecha)**
Aquí está la segunda gran diferenciación frente a SENAMHI. SENAMHI proyecta la **oferta** (cuánta agua habrá). El ISHT proyecta la **brecha** (oferta menos demanda), que es lo que importa para la decisión.

La metodología es discriminatoria y honesta — no prometemos modelos de serie temporal para 159 cuencas si los datos no lo sostienen:
- **Cuencas bandera con series robustas** (mejor instrumentadas): modelos SARIMAX sobre las series de brecha, con Prophet validando changepoints (El Niño, sequías), XGBoost capturando demanda no-lineal, y LSTM modelando residuos en un híbrido validado cruzadamente.
- **Cuencas con series intermedias**: Prophet + XGBoost con variables proxy (ONI, PDO, NDVI).
- **Cuencas con series cortas o gaps grandes**: análisis de escenarios (pesimista/base/optimista) con regresión espacial y variables proxy (precipitación satelital CHIRPS, NDVI Landsat, proyecciones poblacionales INEI, derechos ANA), calibrados contra las cuencas bandera.

**Capa 3 — Valorización (Capa Financiera)**
Cada cuenca en déficit o equilibrio frágil se traduce a soles y empleos:
- **Agrícola**: Exportaciones en riesgo (ADUANET/SUNAT), hectáreas sin riego, empleo directo e indirecto.
- **Poblacional**: Población sin acceso a agua segura × costo de oportunidad de salud/productividad.
- **Minero**: Valor de concesiones en cuencas con conflicto hídrico proyectado (riesgo de paralización por conflicto social).
- **Energético**: Potencial de generación no aprovechado en cuencas azules (superávit + gradiente topográfico + cercanía a red SEIN).

**Capa 4 — Priorización (Ranking por Retorno)**
Las cuencas se rankean por **retorno de inversión hídrica**: valor desbloqueado (divisas protegidas + empleos salvados + energía generada + conflictos evitados) dividido por inversión requerida (captura, regulación, reposición). Esto le dice al Estado, con precisión, dónde poner el siguiente sol primero. **Ningún sistema del Estado hace esto.**

### 4.2 Amplitud horizontal: las 4 dimensiones (MECE)

**Dimensión Poblacional**
Consumo humano, brecha de agua segura, acceso a saneamiento. Cerca de la mitad de peruanos sin agua potable segura; Lima sobreconsume. La escasez en cuencas costeras amenaza la salud pública.

**Dimensión Agrícola**
Cerca del 80% del recurso hídrico nacional. El gran demandante y el gran generador de divisas. Ica es la tragedia: la mayoría del agua subterránea va a agroexportación, con una alta proporción de pozos sin licencia en Villacurí. La Libertad es la esperanza: demuestra que la captura estacional funciona.

**Dimensión Minero-Industrial (CONFLICTO, NO NEUTRAL)**
La minería no es "un usuario más". Es un actor con asimetría de poder hídrico. El ISHT no mide "demanda minera por cuenca" como dato lineal (no existe esa serie en el SNIRH). En su lugar, mapea **zonas de conflicto hídrico proyectado**: solapamiento espacial entre (a) cuencas en déficit o equilibrio frágil, (b) concesiones mineras vigentes y en trámite (INGEMMET), y (c) derechos de uso otorgados a minería vs. población y agricultura. Esto es inteligencia territorial, no contabilidad de litros.

> *Toda afirmación sobre una empresa minera específica (montos adeudados, descenso de napa atribuido) se sustenta con resolución administrativa de ANA u OEFA citada por número de expediente en el Anexo de Fuentes, o se reformula a lenguaje agregado por cuenca. HiDATA no publica acusaciones nominales sin sustento documental. Esto protege la integridad técnica y legal de la propuesta.*

**Dimensión Energética (OPORTUNIDAD DEL SUPERÁVIT)**
El Perú tiene un potencial hidroeléctrico ampliamente subaprovechado. La dimensión energética del ISHT no es un estudio de prefactibilidad por cuenca (eso excede el alcance). Es una **lectura de oportunidad**: donde el índice detecta superávit hídrico sostenido + gradiente topográfico significativo (SRTM) + proximidad a la red SEIN, la cuenca se marca como "oportunidad energética".

---

## 5. ARSENAL DE MODELOS ML: LA INTELIGENCIA QUE EL ESTADO NO APLICÓ

Aquí respondemos directamente a la intuición de fondo: el Estado tiene un buen modelo de oferta (GR2M), pero **no aplicó el arsenal de machine learning moderno a la decisión hídrica**. GR2M es un modelo hidrológico conceptual clásico; es excelente para la física del agua, pero no aprende patrones de demanda no-lineal, no detecta changepoints de conflicto, ni proyecta brechas multivariadas. Ahí entra el ISHT.

No abandonamos los modelos interpretables (SARIMAX es el baseline defendible ante hidrólogos conservadores de la ANA), pero los **rodeamos** con modelos que demuestran sofisticación moderna.

| Modelo | Para qué | Justificación técnica |
|--------|----------|----------------------|
| **SARIMAX** | Cuencas bandera con series robustas | Baseline interpretable. La ANA y SENAMHI entienden este lenguaje. Credibilidad institucional. |
| **Prophet (Meta)** | Changepoints (El Niño, sequías) y estacionalidad múltiple | Captura efectos de regresores (ONI, PDO) sin overfitting. Explica variabilidad a no-técnicos. |
| **XGBoost / LightGBM** | Demanda hídrica no-lineal (agro, minería) | Variables exógenas complejas: NDVI, temperatura, tipo de cultivo, expansión minera. Captura interacciones que GR2M y SARIMAX no ven. |
| **LSTM / GRU** | Series multivariadas de caudal/precipitación/brecha | Captura dependencias de largo plazo (memoria de sequías, efectos glaciares). |
| **Híbrido SARIMAX-LSTM** | Residuos de SARIMAX modelados por LSTM | SARIMAX saca la estructura lineal/estacional; LSTM limpia los residuos no-lineales. Nivel tesis de posgrado; pocos equipos lo proponen. |
| **GWR (Geographically Weighted Regression)** | Downscaling espacial para subcuencas/puntos de estación (n>500) | Cada punto tiene su regresión local. No asumimos que una cuenca en Amazonas se comporta como una en Ica. **No se aplica a los 159 polígonos agregados** (sería inestable); se aplica a subcuencas/puntos con densidad suficiente. |
| **Random Forest Espacial / ESF / RELM** | Las 159 cuencas agregadas con datos escasos | Regresión espacial global que maneja la agregación de polígonos heterogéneos. |
| **Spatial DBSCAN / K-Means** | Clustering de cuencas por comportamiento hídrico similar | Extrapola resultados de cuencas bandera a vecinas sin datos. |
| **Análisis de calidad de agua (Bruno)** | Geoquímica de acuíferos, índices de contaminación (WQI, HEI) | Bruno aporta el rigor químico: arsénico, cadmio, mercurio, pH ácido en cuencas mineras. Convierte el índice de **cantidad** a **seguridad hídrica integral** (cantidad + calidad). |

**La jugada de firma — framework de validación cruzada honesto:**
- SARIMAX da el número base.
- Prophet valida los changepoints.
- XGBoost valida la demanda no-lineal.
- LSTM valida los residuos.
- Si los modelos convergen en la misma dirección (la brecha se agranda), la proyección es robusta. Si discrepan, se reporta como incertidumbre metodológica. Eso es honestidad de firma, no humo.

**Distinción clave frente a GR2M (memorizar):** GR2M modela el agua *física* que escurre. Nuestro arsenal modela la *brecha socioeconómica* (oferta menos demanda) y sus impulsores no-lineales (expansión agrícola, presión minera, crecimiento poblacional). Son problemas distintos. No competimos con GR2M; lo complementamos en una dimensión que ningún modelo hidrológico conceptual aborda.

---

## 6. LA INNOVACIÓN CENTRAL: DE VISOR ESTÁTICO A GEMELO DE DECISIÓN INTERACTIVO

Esta es la sección que materializa la visión: lo del Estado es estático; lo nuestro es vivo. Es donde el ISHT deja de ser "otro estudio" y se vuelve una herramienta de inteligencia comercial aplicada al agua, al nivel de lo que una consultora top entregaría a un cliente corporativo — pero para el Estado.

### 6.1 El problema con lo existente
El Balance Hídrico de SENAMHI, el Observatorio SNIRH y los visores institucionales comparten una limitación de diseño: son **vitrinas de consulta**. Muestran un resultado precalculado. El usuario no puede preguntar "¿qué pasa si...?". No hay simulación, no hay escenarios dinámicos, no hay recálculo. Se imprime el mapa y se cuelga en la pared. En 2026, con la IA y el ML disponibles, eso es subutilizar la tecnología.

### 6.2 Lo que entrega el ISHT: un tablero de decisión interactivo (decision cockpit)
El entregable estrella es un **tablero ejecutivo interactivo** donde el tomador de decisión:
- **Mueve supuestos y ve el recálculo en vivo.** Sliders para: precio internacional del espárrago/palta/uva, tasa de expansión de pozos en Ica, escenario de El Niño (leve/moderado/extremo), porcentaje de captura estacional (qochas). Al mover un slider, el índice, el semáforo y el ranking de cuencas se recalculan al instante.
- **Hace drill-down de nacional a cuenca a subcuenca.** Clic en una cuenca roja → se abre su ficha: balance dual, trayectoria proyectada, valorización en soles, conflictos latentes, y la recomendación de inversión priorizada.
- **Compara escenarios lado a lado.** "Si el Estado invierte S/X en captura en La Libertad vs. Ica, ¿cuál rinde más en divisas protegidas y empleos salvados?" El tablero responde con números.
- **Simula la asignación del presupuesto de siembra y cosecha.** El decisor distribuye el presupuesto Midagri entre cuencas y ve el retorno agregado proyectado. Es un optimizador de inversión hídrica.

### 6.3 Cómo se construye (stack realista, no humo)
- **Backend de cálculo**: Python (los modelos de la Sección 5 corren offline; el tablero consume sus salidas precomputadas + recálculo ligero en vivo para los sliders).
- **Capa interactiva**: Plotly Dash o Streamlit para el tablero ejecutivo; Folium/Leaflet para el mapa; los sliders disparan funciones de recálculo sobre los coeficientes ya entrenados (no se re-entrena el modelo en vivo, se re-evalúa — esto es lo que lo hace instantáneo y honesto).
- **Datos**: capas oficiales consumidas vía WMS/WFS (método Sección 8) + cacheo local en GeoPackage.
- **Prueba de interoperabilidad en vivo**: el Atlas ISHT se publica como servicio WMS y se **carga dentro del propio visor GeoPerú** (que acepta capas externas WMS/WFS/REST), demostrando interoperabilidad real con la plataforma de la PCM, no prometida.

### 6.4 Por qué esto gana el concurso
Un jurado que ha visto 11 sesiones de visores estáticos y mapas de consulta verá, por primera vez, una herramienta donde puede **mover una perilla y ver el futuro hídrico del país recalcularse**. Esa es la diferencia entre "información" y "decisión" en la pirámide de Naldi Carrión. Es lo que separa a HiDATA de un equipo que hace un mapa bonito. Y es honesto: cada número detrás del slider está sustentado en un modelo validado y datos oficiales.

### 6.5 Disciplina de alcance (lo que NO prometemos)
No prometemos un sistema en producción nacional en el plazo del concurso. Prometemos un **prototipo funcional sobre cuencas bandera** que demuestra el mecanismo completo (integración → brecha → valorización → priorización → interactividad), más el marco metodológico para escalarlo a las 159 cuencas. Esta honestidad de alcance es lo que separa una consultoría seria de un PowerPoint con todo metido adentro.

### 6.6 El salto de robustez: tres motores que ningún sistema del Estado tiene

Para que la propuesta sea innovadora y robusta de verdad —y no solo "un tablero bonito"— el ISHT incorpora tres motores que elevan el sistema de "visualización interactiva" a "inteligencia hídrica accionable". Cada uno responde a una pregunta que el Estado hoy no puede responder.

**Motor 1 — Índice ISHT compuesto y auditable (el número único).**
El corazón cuantitativo es un índice 0-100 por cuenca que sintetiza las cuatro dimensiones en una sola cifra comparable y rankeable, construido con metodología transparente:
- Normalización min-max de cada componente (balance superficial, balance subterráneo, calidad química, presión de demanda, riesgo de conflicto).
- Ponderación explícita y editable por el usuario (un decisor puede decir "priorizo calidad sobre cantidad" y el índice se recalcula).
- Análisis de sensibilidad incorporado: el tablero muestra cuánto cambia el ranking si cambian los pesos, para que la decisión sea robusta y no dependa de un peso arbitrario.
- Trazabilidad total: cada valor del índice se puede "abrir" hasta el dato fuente y su fecha. Esto materializa el principio de Naldi Carrión (dato → ... → valor) de forma auditable.

Esto es lo que hace una firma seria: no entrega un número mágico; entrega un número que el cliente puede interrogar, ajustar y defender ante terceros.

**Motor 2 — Sistema de Alerta Temprana Hídrica (la dimensión predictiva accionable).**
Aquí el ISHT pasa de "diagnóstico" a "anticipación operativa". Cruzando la proyección de brecha (Capa 2) con los pronósticos hidrológicos estacionales de SENAMHI y los indicadores ENSO (ONI/El Niño), el sistema clasifica cada cuenca en un nivel de alerta forward-looking:
- **Semáforo predictivo a 3/6/12 meses**: no "cómo está la cuenca hoy" sino "cómo estará la próxima campaña agrícola".
- **Detección de cruces de umbral**: el sistema marca qué cuencas cruzarán de amarillo a rojo y cuándo, con la incertidumbre reportada (banda de los modelos convergentes/divergentes).
- **Priorización dinámica de la respuesta**: ante un escenario de El Niño costero, el sistema reordena automáticamente el ranking de inversión hacia las cuencas que más rápido se deteriorarán.

Esto conecta directamente con la cita de Miguel Estrada (S4) sobre el costo de la reconstrucción reactiva: el ISHT es la herramienta para invertir *antes* del desastre, no para reconstruir *después*.

**Motor 3 — Simulador de Políticas de Inversión (el "what-if" de Estado).**
Este es el diferenciador más alto y el más cercano a lo que una consultora top entrega a un ministro. Es un optimizador de asignación presupuestal:
- El decisor ingresa un presupuesto disponible (p. ej., la partida de siembra y cosecha del Midagri).
- Define una función objetivo (maximizar divisas protegidas, o empleos salvados, o población con acceso, o una combinación ponderada).
- El motor resuelve la asignación óptima entre cuencas (un problema de optimización con restricciones: presupuesto, capacidad de captura física por cuenca, prioridad social).
- Devuelve: el mapa de asignación recomendada, el retorno agregado proyectado, y la comparación contra la asignación actual ("si distribuyes como hoy obtienes X; si distribuyes como recomienda el ISHT obtienes X+Δ").

El mensaje al jurado es contundente: *"No le decimos al Estado que invierta más. Le decimos cómo obtener más resultado con el mismo presupuesto que ya tiene."* Eso es, literalmente, la propuesta de valor de una firma de estrategia: optimización de la asignación de capital escaso.

### 6.7 Por qué esta arquitectura es robusta (no frágil)
Tres decisiones de ingeniería deliberadas garantizan que el sistema no sea humo:
1. **Separación cálculo / presentación.** Los modelos pesados (LSTM, calibración) corren offline y producen coeficientes y tablas; el tablero solo re-evalúa funciones ligeras en vivo. Esto hace la interacción instantánea y honesta —no se re-entrena nada en vivo, se re-evalúa— y permite que corra en hardware modesto.
2. **Degradación elegante ante datos faltantes.** Si una cuenca no tiene series, el sistema no falla: muestra el resultado por escenarios con su incertidumbre explícita y una marca visible de "estimación por proxy". El sistema nunca finge certeza que no tiene.
3. **Reproducibilidad total.** Todo el pipeline vive en un notebook versionado; cualquier tercero puede reconstruir cada número. Esto es lo que convierte una demo en un sistema confiable para el Estado.

---

## 7. CUENCAS BANDERA: PROFUNDIDAD DONDE CUENTA

No ejecutamos 159 cuencas al detalle en el plazo del concurso (eso sería superficialidad de amateur). Ejecutamos **cuencas bandera con rigor de tesis**, que demuestran las patologías opuestas del Perú. La selección final de cuencas bandera se confirma tras evaluar la disponibilidad real de series (ver nota de honestidad de datos abajo).

### 7.1 Ica — La tragedia de la demanda descontrolada (DÉFICIT CRÍTICO)
- **Patología**: Reserva explotable ampliamente superada por la explotación actual; sobreexplotación severa del acuífero.
- **Uso**: mayoría en agroexportación (espárrago, vid, palta).
- **Infraestructura**: miles de pozos, alta proporción sin licencia en Villacurí.
- **Dinámica**: descenso sostenido de napa freática; proyección de afectación severa de áreas de cultivo en la próxima década.
- **Valorización**: divisas agroexportadoras y decenas de miles de empleos en riesgo.
- **Análisis ML**: la oferta superficial se toma de PISCO_HyM_GR2M; el balance subterráneo y la demanda se modelan con el arsenal propio. Si las series son robustas: SARIMAX + Prophet + XGBoost + LSTM sobre la brecha. Si hay gaps: escenarios de regresión con proxy (NDVI, número de pozos, exportaciones ADUANET).

### 7.2 La Libertad — La prueba de que el agua se puede capturar (SUPERÁVIT APROVECHADO)
- **Patología invertida**: multiplicación de qochas y reservorios en pocos años, con resultado de cero desbordes en los ríos principales durante un evento de El Niño.
- **Lección**: el agua que se pierde se puede capturar. El problema no es solo falta de agua; es falta de dónde almacenarla.
- **Análisis ML**: análisis contrafactual (qué hubiera pasado sin la infraestructura de captura); GWR espacial aplicado a subcuencas de recarga para identificar zonas prioritarias en cuencas vecinas.

### 7.3 Piura — Próxima prioridad (EN RADAR)
- **Patología**: embalse de Poechos colmatado a una fracción de su capacidad original; agroexportación (mango, uva) en riesgo.
- **Amenaza inmediata**: actividad de El Niño costero; cultivos en riesgo por desbordes.
- **Análisis ML**: LSTM con series de caudales + proyecciones SENAMHI para anticipar déficit post-El Niño; monitoreo multitemporal de colmatación con Sentinel-1 SAR (validado por Estrada, S4, para zonas con cobertura vegetal/nubes).

> **Nota de honestidad de datos (crítica).** Antes del pitch, HiDATA descarga y evalúa las series reales disponibles (caudales SENAMHI/PHISIS, pozos ANA, exportaciones ADUANET) para cada cuenca candidata. Las cuencas bandera definitivas son aquellas con series suficientes para sostener el análisis completo. Para las demás se usa análisis de escenarios. Los KPI de precisión predictiva (Sección 13) se afirman solo sobre cuencas con series validadas. Esta verificación se hace con datos en mano, no por supuesto. **No se promete precisión sobre cuencas que no podemos modelar.**

---

## 8. DATA, FUENTES Y PIPELINE: EL MÉTODO OFICIAL DEL ESTADO, EJECUTADO

Esta sección operacionaliza el consumo de datos siguiendo exactamente el método que la propia PCM enseñó en la Sesión 3 del programa (expositor: Mario Flores, Centro Nacional de Datos). No improvisamos: ejecutamos el procedimiento oficial.

### 8.1 Data primigenia (regla de Darwin, S11: empezar por GeoPerú)
> *"Recuerden que es necesario que su data primigenia, la primera que ustedes utilicen sea de GeoPerú."* — Darwin, PCM, S11.

**Cumplimos la regla al pie de la letra.** La data primigenia de corte territorial (límites de cuencas, regiones, distritos, infraestructura, zonas de riesgo) se identifica en el catálogo GEOIDEP y se consume desde GeoPerú / los geoservicios catalogados, validando operatividad con `GetCapabilities` antes de la ingestión.

### 8.2 Procedimiento de consumo (método Mario Flores, S3)
El flujo exacto, replicable y documentado:
1. **Identificar el servicio** en el Catálogo Nacional de Servicios Georreferenciados (GEOIDEP), buscando por entidad (ANA, SENAMHI, INGEMMET, INEI, MTC, etc.).
2. **Verificar que el servicio responde**: se abre la URL del `GetCapabilities` y se confirma que devuelve el XML de capacidades (si devuelve error, el servicio está caído — condición transitoria, no inexistencia, según Mario Flores S3).
3. **Consumir WMS** (visualización/consulta) o **WFS** (descarga de objetos vectoriales) vía Python `owslib`. Para WFS, se exportan los objetos a Shapefile/GeoPackage.
4. **Fallback documentado**: si el WFS no responde, se intenta descarga alternativa (Shapefile zip, KML, GeoJSON) — exactamente las alternativas que Mario Flores demuestra en S3. Si ninguna responde, se registra el fallo y se usa la fuente institucional directa.
5. **Health-check como subproducto**: cada servicio intentado se registra (disponibilidad, latencia, fecha de última actualización, entidad productora). Esto genera un **subproducto de gobernanza de datos para la PCM** — un mapa de salud de los servicios hídricos del Estado, que es valor agregado puro.

### 8.3 Fuentes y su rol en el ISHT

| Fuente | Qué aporta | Rol en el ISHT |
|---|---|---|
| **PISCO_HyM_GR2M v1.1 / SENAMHI** (Llauca et al. 2021) | Oferta hídrica superficial validada: caudal, escorrentía, ET real, humedad de suelo, por subcuenca, mensual, 1981-2022 | Insumo de la Capa 1 (no se recalcula). Descargable: NetCDF en HydroShare/Figshare (DOI), código R en GitHub |
| **ANA / SNIRH (Geoportal, Geohidro)** | Cuencas Pfafstetter, derechos de uso, calidad (ECA), inventario de fuentes, represas | Demanda, derechos, calidad base |
| **SENAMHI / PHISIS** | Caudales en tiempo real, alertas | Validación y proyección |
| **INGEMMET** | Concesiones mineras vigentes y en trámite | Dimensión conflicto |
| **ADUANET / SUNAT** | Exportaciones agropecuarias por región | Valorización financiera |
| **INEI** | Proyecciones poblacionales por distrito | Demanda poblacional |
| **MINEM** | Potencial hidroeléctrico, red SEIN | Dimensión energética |
| **Sentinel-1 SAR / CHIRPS / Landsat** | Colmatación, deforestación de cabeceras, precipitación satelital, NDVI | Proxies para cuencas sin series |
| **Banco Mundial / OECD** | Indicadores de acceso, pobreza, gobernanza | Marco macro |

### 8.4 Protocolo de Validación Hídrica ISHT (alineado a principios de ISO 19157)
Siguiendo la norma citada por Moisés Pollatos (S9), el Protocolo de Calidad ISHT evalúa: **exactitud** (validación cruzada con estaciones SENAMHI), **completitud** (imputación de gaps documentada: método, porcentaje, impacto), **consistencia** (coherencia superficial-subterráneo), **actualidad** (fecha de última medición por cuenca, con disclaimer cuando el dato es histórico), y **adecuación al uso** (verificación química de Bruno Elescano antes de ingestión).

> *Bruno Elescano lidera la validación química de datos hídricos (WQI, índices de metales pesados, pH, conductividad) y contribuye al Protocolo de Calidad de Datos ISHT, que se alinea a principios de ISO 19157 para metadatos geoespaciales y a estándares de calidad de agua (WHO, EPA). Bruno no es experto en normas geoespaciales ISO; su expertise es químico, y es indispensable para que los datos de calidad de agua sean "adecuados al uso" del índice.*

> *"No existe la calidad mala, regular, buena... lo que existe es calidad más adecuada o menos adecuada al uso pretendido."* — Moisés Pollatos, S9.

### 8.5 Stack tecnológico (100% open source)

| Etapa | Herramienta | Qué hace |
|-------|-------------|----------|
| **Extracción** | Python (owslib, requests, retrying) | Consumo WMS/WFS de GEOIDEP; descarga directa como fallback |
| **Monitor de salud** | Python (requests, logging) | Health-check de servicios GEOIDEP; subproducto de gobernanza |
| **Limpieza** | GeoPandas, Rasterio, Xarray | Geometrías, proyecciones EPSG:4326 (geográficas) / EPSG:32717-32718-32719 (UTM 17-19S proyectadas), gaps imputados |
| **Almacenamiento (prototipo)** | GeoPackage (SQLite espacial) | Base portable; cacheo local de capas WFS |
| **Almacenamiento (escalamiento)** | PostgreSQL + PostGIS | Arquitectura nacional post-concurso |
| **Análisis espacial** | QGIS + Python (rasterstats, scipy) | Overlay de cuencas, recarga, gradientes (SRTM) |
| **Modelado** | Python (statsmodels, Prophet, XGBoost, TensorFlow/Keras) | SARIMAX, Prophet, XGBoost, LSTM, híbridos |
| **Calidad de agua** | Python (scikit-learn, pandas) + input de Bruno | WQI, HEI, correlación con minería |
| **Tablero interactivo** | Plotly Dash / Streamlit + Folium | Decision cockpit con sliders y drill-down |
| **Documentación** | Jupyter + Markdown/LaTeX | Notebook reproducible + PDF ejecutivo |

> **Corrección técnica (v5.0):** El sistema de referencia geográfico es EPSG:4326 (WGS84), confirmado como el datum oficial del visor GeoPerú. Para análisis en proyectada (cálculo de áreas, distancias) se usa UTM zonas 17S/18S/19S (EPSG:32717/32718/32719) según la ubicación de cada cuenca. (Versiones anteriores contenían una errata de código EPSG; queda corregida.)

**Ventaja para el Estado:** Stack 100% open source. Cero costos de licenciamiento. Replicable en cualquier entidad sin barreras comerciales — el antídoto exacto a soluciones cerradas y costosas.

---

---

## 8-BIS. INVENTARIO DE FUENTES DE DATOS ACCIONABLE (endpoints reales para arrancar)

Esta sección es la hoja de ruta de datos para empezar a consumir HOY. Cada fuente está mapeada a la capa del ISHT que alimenta, con su endpoint real y método de consumo.

> **Verificación:** los endpoints fueron identificados en índices públicos durante la auditoría. No pudieron probarse desde el entorno de auditoría (firewall restringe dominios .gob.pe), pero son URLs públicas del Estado. La primera tarea (Paso 1 del Arranque) es confirmar que cada uno responde desde el entorno de HiDATA, abriendo su `GetCapabilities` (WMS/WFS) o agregando `?f=json` (ArcGIS REST).

### 8-BIS.1 Plataformas de acceso (punto de entrada obligatorio)

| Recurso | URL | Rol |
|---|---|---|
| Visor GEO Perú | https://visor.geoperu.gob.pe/ | Data primigenia; carga capas externas WMS/WFS/REST y descarga. Datum: WGS84 (EPSG:4326). |
| Catálogo Nacional de Servicios (GEOIDEP) | https://www.geoidep.gob.pe/catalogo-nacional-de-servicios-web | Buscar servicios por entidad/categoría; obtener URLs WMS/WFS. |
| Catálogo de Metadatos GEOIDEP | https://catalogo.geoidep.gob.pe/metadatos/ | Metadatos de cada capa (fecha, escala, fuente). |

**Método de consumo (Sesión 3, Mario Flores):** GEOIDEP → identificar servicio por entidad → verificar `GetCapabilities` → WMS (consulta) o WFS (descarga vectorial) en QGIS/owslib → exportar a Shapefile/GeoPackage. Si WFS falla, usar descarga alternativa (Shapefile zip / KML / GeoJSON).

### 8-BIS.2 Oferta hídrica (insumo validado, no se recalcula)

| Fuente | Endpoint / acceso | Qué entrega | Capa ISHT |
|---|---|---|---|
| **PISCO_HyM_GR2M v1.1** (Llauca et al. 2021) | NetCDF vía HydroShare (THREDDS) y Figshare (DOI). Paper: DOI 10.3390/w13081048. Código: github.com/hllauca/GR2MSemiDistr | Caudal, escorrentía, ET real, humedad de suelo — por subcuenca, mensual, 1981-2022, 3594 subcuencas | Oferta superficial (Capa 1) |
| **PISCO_HyD_ARNOVIC** | github.com/hllauca | Caudales **diarios** 1981-2022 | Oferta alta frecuencia |
| **PISCO precipitación / ET** | Datasets grillados SENAMHI 0.1° | Forzantes meteorológicos | Insumo de balance |
| **RClimChange** | github.com/hllauca/RClimChange | Escenarios CMIP6 (NASA NEX-GDDP) | Proyección climática (Capa 2) |

**Lectura en Python:** NetCDF con `xarray` (`xr.open_dataset()`). No se necesita R para consumir; solo para re-correr el modelo (no recomendado).

### 8-BIS.3 Cuencas, derechos, calidad (ANA / SNIRH)

| Fuente | Endpoint | Qué entrega | Capa ISHT |
|---|---|---|---|
| **ANA — Red hidrográfica Pfafstetter** | `geosnirh.ana.gob.pe/server/rest/services/Público/SERV_AguasContiLoticos/MapServer` | Red hidrográfica codificada Pfafstetter, topológicamente consistente | Cuencas (base geométrica) |
| **ANA — WMS institucional** | `idep.gob.pe/geoportal/rest/services/INSTITUCIONALES/ANA_WMS/MapServer` | Cochas, humedales, manantiales, glaciares, hidrometeorológica, AAA, unidades hidrográficas | Múltiples capas |
| **ANA — Geoportal Geohidro** | Visor Geohidro, Catálogo Metadatos, Geoservicios | Clasificación de cuerpos de agua por calidad (ECA), inventario de fuentes, infraestructura | Calidad base + demanda |
| **ANA — Observatorio del Agua / SNIRH** | snirh.ana.gob.pe/observatoriosnirh/ | Por cuenca: represas, demanda, calidad, riesgo, fuentes (159 UH) | Validación demanda |

**Nota:** el ArcGIS REST de ANA permite consulta directa (agregar `?f=json` al MapServer; `/query?...&f=geojson` para extraer features).

### 8-BIS.4 Calidad y conflicto (Bruno + minería)

| Fuente | Endpoint | Qué entrega | Capa ISHT |
|---|---|---|---|
| **OEFA — Afectación de cuencas** | `pifa.oefa.gob.pe/server_gis/rest/services/Metadatos/Afectacion_Cuencas_Hidrograficas/MapServer` | Afectación oficial en cuencas (EPSG:4326) | Conflicto/contaminación (respaldo oficial, evita acusación nominal) |
| **INGEMMET — Catastro/geología** | `geoperu.ingemmet.gob.pe/wmsconnector/com.esri.wms.Esrimap/Mapa_Geologico` (WMS); `geocatmin.ingemmet.gob.pe/arcgis/rest/services` | Concesiones mineras, geología | Conflicto minero (overlay) |
| **MINAM — Geoservidor** | `geoservidorperu.minam.gob.pe/arcgis/rest/services` | ANP, comunidades nativas, caracterización territorial | Contexto ambiental |

**Aporte de Bruno:** sobre la capa de OEFA y los datos de calidad de ANA, Bruno calcula WQI/HEI y correlaciona con presión minera. Sustenta la dimensión química **con fuente oficial**, sin afirmaciones sobre empresas específicas.

### 8-BIS.5 Población, agro, energía y valorización

| Fuente | Acceso | Qué entrega | Capa ISHT |
|---|---|---|---|
| **INEI** | WFS catalogado en GEOIDEP | Población por distrito, proyecciones | Demanda poblacional + valorización |
| **SENAMHI / PHISIS** | senamhi.gob.pe (monitoreo hidrológico) | Caudales/niveles tiempo real, alertas | Validación + alerta temprana (Motor 2) |
| **SENAMHI / IDESEP GeoServer** | `idesep.senamhi.gob.pe/geoserver/{workspace}/wms?request=GetCapabilities&service=WMS` | Capas climáticas/hidrológicas WMS + WFS | Insumos varios |
| **ADUANET / SUNAT** | Portal estadísticas comercio exterior | Exportaciones agropecuarias por región | Valorización divisas (Capa 3) |
| **MINEM** | Portal MINEM / SEIN | Potencial hidroeléctrico, centrales, red SEIN | Dimensión energética |
| **MEF — Consulta Amigable** | apps5.mineco.gob.pe (SIAF) | Partida Midagri siembra y cosecha (código SIAF) | **VERIFICAR cifra exacta aquí** |
| **MEF — Geoservicios** | `ofi3.mef.gob.pe/geows/arcgis/rest/services` | Inversión pública georreferenciada | Contexto inversión |

### 8-BIS.6 Proxies satelitales (cuencas sin series — Plan B)

| Fuente | Acceso | Uso |
|---|---|---|
| **CHIRPS** | UCSB Climate Hazards Center | Precipitación satelital donde no hay estación |
| **Landsat / MODIS (NDVI)** | USGS EarthExplorer / Google Earth Engine | Expansión agrícola, uso de suelo |
| **Sentinel-1 SAR** | Copernicus / ESA | Colmatación de embalses (Poechos), deforestación de cabeceras |
| **SRTM (DEM)** | USGS / NASA | Gradiente topográfico (dimensión energética) |

### 8-BIS.7 Advertencias técnicas (modo paranoid)

- **PISCO está en R, tu stack es Python.** Consume la salida NetCDF con xarray; no re-corras el modelo salvo necesidad estricta.
- **Datum:** GEO Perú trabaja en WGS84 (EPSG:4326). Para área/distancia, reproyectar a UTM 17S/18S/19S (EPSG:32717/32718/32719).
- **Servicios intermitentes:** un endpoint caído hoy puede revivir mañana (Mario Flores, S3). Ten siempre el fallback de descarga directa.
- **Propiedad intelectual (bases, sección 17):** lo que subas a Facilita la PCM puede difundirlo. No incluyas código core propietario ni metodología fina en el entregable público; muestra el qué y el valor.
- **No acusar nominalmente:** usa la capa de afectación de OEFA (oficial) en vez de afirmaciones sobre empresas específicas.

---

## 9. ANCLAJE POLÍTICO Y PRESUPUESTAL: EJECUCIÓN DE UNA LEY EXISTENTE

El ISHT no propone una nueva política. Le dice al Estado **dónde ejecutar la política que ya existe**, con los recursos ya asignados. Eso es consultoría aplicada, no academia.

- **Ley 29338 (Recursos Hídricos)**: reconoce la gestión por cuencas y la necesidad de información para decidir.
- **Ley de Siembra y Cosecha de Agua**: declarada de interés nacional, con presupuesto asignado.
- **Presupuesto Midagri 2026 para siembra y cosecha**: una partida específica destinada a qochas y reservorios que beneficia a miles de familias. El ISHT orienta esa inversión por retorno.
- **RM 049-2026 PCM (Estrategia Nacional de Gobierno de Datos 2026-2030)**: de carácter obligatorio. El ISHT es el primer caso de uso demostrable de esta estrategia en un dominio crítico (agua), porque materializa la interoperabilidad que la estrategia ordena.

> **Verificación presupuestal (v5.0):** El monto exacto de la partida de siembra y cosecha de agua se confirma en la Consulta Amigable del MEF (SIAF) y se cita con su código presupuestal específico en el Anexo de Fuentes antes del pitch. Hasta esa verificación, la cifra se presenta como "según PIA Midagri 2026, pendiente de confirmación de partida específica". No anclamos la propuesta de valor en una cifra sin trazabilidad SIAF.

**El problema que resolvemos**: el Midagri sabe cuánto tiene, pero no **dónde** ponerlo para máximo impacto. El ISHT resuelve exactamente eso, y ningún sistema del Estado lo hace hoy.

---

## 9-BIS. ALINEACIÓN A LAS BASES DE LA GEOTÓN PERÚ 2026 (verificadas)

Esta sección amarra la propuesta a las reglas oficiales del concurso, ya leídas del PDF de bases.

**Categoría.** Categoría 2 — Territorio Sostenible (uso sostenible del territorio, agua, recursos hídricos, ambiente, biodiversidad, gestión de recursos naturales). Encaje directo: el dominio del ISHT es el agua.

**Quiénes participan.** Personas naturales mayores de 18, peruanas o residentes; equipos de **hasta 3 integrantes**. HiDATA se presenta con 2 (Joan Hidalgo + Bruno Elescano) — dentro de norma, con espacio para un tercero si se decide. No se requiere experiencia previa (aunque la tenemos).

**Qué exige el concurso (sección 6 de bases):** identificar una problemática territorial concreta, usar al menos un conjunto de datos de GEO Perú, analizar con evidencia georreferenciada, y formular una solución coherente. El ISHT cumple los cuatro con holgura.

**Entregables de la propuesta (sección 9 de bases) — lo que realmente se sube a Facilita:**
La propuesta se registra en el formulario https://facilita.gob.pe/t/52313 con estos campos mínimos: (1) título, (2) nombre del equipo, (3) categoría, (4) descripción del problema territorial, (5) objetivo, (6) datos utilizados —incluyendo al menos uno de GEO Perú—, (7) descripción del análisis territorial, (8) hallazgos principales, (9) propuesta de solución, (10) **anexo visual obligatorio** (mapa, gráfico, visualización, tablero, lámina, esquema o prototipo simple).

> **Implicación operativa clave:** el entregable formal NO es este master plan, sino una propuesta concisa en esos 10 campos más el anexo visual. Este documento es la **biblia interna de HiDATA** (sustento del análisis y defensa para preguntas); de él se destila la propuesta-formulario. El anexo visual es donde nuestro tablero interactivo / Atlas brilla (cuenta para "Claridad y comunicación").

**Criterios de evaluación (sección 12 de bases) y dónde puntúa el ISHT:**

| N° | Criterio | Peso | Dónde lo cubre el ISHT |
|----|----------|------|------------------------|
| 1 | Relevancia del problema territorial | 20% | Sección 2: la paradoja hídrica estructural, problema de primer orden |
| 2 | Uso de datos georreferenciados (GEO Perú) | 20% | Sección 8 + Inventario: data primigenia GEO Perú + pipeline verificado |
| 3 | Análisis territorial | 15% | Secciones 4-5: balance dual, ML, cuencas bandera |
| 4 | Propuesta de solución | 20% | Secciones 4-6: las 4 capas + 3 motores, coherencia problema-datos-solución |
| 5 | Valor público e impacto | 15% | Secciones 11-13: priorización de inversión, ODS, KPIs |
| 6 | Viabilidad | 5% | Stack open source, datos descargables verificados, alcance disciplinado |
| 7 | Claridad y comunicación | 5% | Anexo visual: tablero interactivo + Atlas |

El **60% del puntaje** está en problema + datos + solución (criterios 1, 2, 4). La propuesta-formulario debe ser quirúrgica en esos tres. La sofisticación técnica (ML, interactividad) suma dentro de "análisis" y "solución" — es un medio para el valor, no un fin en sí mismo.

**Cronograma (sección 13 de bases):**
- Inscripciones: 27 abril – 29 mayo (formulario t/52312).
- Desarrollo de propuestas: 18 mayo – **5 junio**.
- Registro de propuesta final: formulario t/52313, dentro de plazo.
- Evaluación: 8-12 junio. Finalistas: 12 junio. Clausura: 25 junio.
- *La organización puede ajustar el cronograma por canales oficiales.*

> **ACCIÓN CRÍTICA:** verificar que HiDATA está inscrita (t/52312, cerró 29 mayo) y registrar la propuesta final (t/52313) dentro del plazo vigente. Ante cualquier duda de plazo, escribir a contacto@datosabiertos.gob.pe.

**Reconocimiento (sección 15 de bases).** El concurso otorga **reconocimiento institucional** (visibilidad del talento ciudadano y del uso de datos), no premio monetario. Esto alinea perfectamente con el objetivo estratégico de HiDATA: posicionarse ante la PCM como autoridad técnica en datos e inteligencia territorial. El valor de ganar es reputacional y de posicionamiento — exactamente lo que buscamos.

**Comité Evaluador (sección 14).** Mixto: PCM, aliados estratégicos (incluye Cooperación Suiza), academia (ESAN) y especialistas en datos geoespaciales e innovación. *Implicación:* el jurado conoce el ecosistema GEO Perú a fondo. Por eso la honestidad del posicionamiento (no fingir que el Estado no tiene datos, sino integrarlos) es decisiva.

**Propiedad intelectual y legal (secciones 16-17).** Al participar se autoriza a la PCM a difundir la propuesta con fines institucionales no comerciales, respetando autoría. Las propuestas no deben incluir datos personales sensibles ni vulnerar derechos de autor. *Implicación para HiDATA:* el entregable público muestra el qué y el valor; el código core y la metodología fina propietaria se resguardan. Toda fuente debe ser pública/abierta (lo cumplimos) y toda afirmación verificable (disciplina de cifras y de no-acusación nominal).

> **Nota de método (v5.0):** Las bases fueron leídas del PDF oficial. Los requisitos formales aquí descritos reflejan ese documento. Si la organización emite precisiones o ajustes por canales oficiales, se incorporan.

---

## 10. DELIVERABLES EXACTOS PARA EL JURADO

1. **Atlas Nacional ISHT** (Shapefile/GeoPackage + PDF): 159 cuencas con índice numérico dual y clasificación semáforo derivada. Metadatos completos, proyecciones y valorización por cuenca. Publicable como WMS y **cargable en el visor GeoPerú** como prueba de interoperabilidad.
2. **Tablero de Decisión Interactivo** (decision cockpit, web local o demo en vivo): integra los tres motores de la Sección 6.6 — (a) índice ISHT compuesto y auditable con pesos editables y análisis de sensibilidad, (b) Sistema de Alerta Temprana Hídrica con semáforo predictivo a 3/6/12 meses, y (c) Simulador de Políticas de Inversión que optimiza la asignación del presupuesto. Más sliders de escenario, drill-down a cuenca y comparación de escenarios. **Este es el entregable que nos diferencia.**
3. **Notebook Reproducible** (Jupyter): pipeline completo desde consumo de servicios hasta modelo y tablero. Demuestra rigor y replicabilidad.
4. **Documento Técnico** (PDF): problema, estado del arte, metodología, cuencas bandera, análisis de sensibilidad, limitaciones.
5. **Mapa de Salud de Servicios Hídricos del Estado** (subproducto de gobernanza): qué servicios WMS/WFS de ANA/SENAMHI/etc. están operativos, su latencia y actualidad. Valor agregado directo para la PCM.
6. **Anexo Visual** (GEOTÓN): mapas de alta resolución, gráficos de trayectoria, tablas de priorización.
7. **Repositorio Público con DOI**: todo el código, datos procesados y metadatos para replicación. (El DOI se acuña en Zenodo antes del cierre; hasta entonces, repositorio Git versionado con DOI al cierre.)

---

## 11. MAPEO A LA PIRÁMIDE DE NALDI CARRIÓN (ESAN, S10)

| Escalón | Componente ISHT | Quién más llega aquí |
|---|---|---|
| **Dato** | Caudales SENAMHI, precipitación, censo INEI, derechos ANA | Todos |
| **Información** | Series limpias, geometrías validadas, oferta GR2M | SENAMHI, SNIRH |
| **Evidencia** | Correlaciones espaciales (GWR/RF), changepoints (Prophet), balance dual | Balance Hídrico SENAMHI llega hasta aquí |
| **Decisión** | Índice ISHT + ranking por retorno de inversión | **Solo el ISHT** |
| **Conocimiento** | Modelo predictivo de trayectoria de brecha (no de oferta) | **Solo el ISHT** |
| **Valor Público** | Presupuesto priorizado, conflictos evitados, divisas protegidas | **Solo el ISHT** |

El punto del mapeo es visual y contundente: las plataformas del Estado se detienen en "Evidencia". El ISHT es el único que sube a Decisión, Conocimiento y Valor Público.

---

## 12. ODS CON MÉTRICAS (Carla Morales, S8, exigió ODS)

| ODS | Métrica ISHT | Cómo se mide |
|-----|--------------|--------------|
| **ODS 6** (Agua limpia) | Población con acceso en cuencas priorizadas | Habitantes × cobertura proyectada post-intervención |
| **ODS 13** (Acción climática) | Precisión de predicción de déficit ante El Niño | % de acierto del híbrido en validación cruzada (solo cuencas validadas) |
| **ODS 2** (Hambre cero) | Hectáreas de cultivo protegidas por priorización | Ha en cuencas rojas/amarillas con inversión priorizada |
| **ODS 11** (Ciudades sostenibles) | Planificación con cuenca como unidad (no distrito) | N° de cuencas con plan de gestión basado en ISHT |

---

## 13. KPIs POST-IMPLEMENTACIÓN (Carla exigió impacto medible)

| Horizonte | KPI | Meta |
|-----------|-----|------|
| 1 año | Precisión predictiva del índice en cuencas bandera validadas | Meta de acierto definida tras evaluar series reales |
| 1 año | Presupuesto de siembra-cosecha priorizado por ISHT | % del presupuesto asignado a cuencas rankeadas |
| 3 años | Conflictos hídricos anticipados con alerta temprana | N° de conflictos mayores anticipados |
| 5 años | Cuencas con plan de gestión basado en ISHT | N° de cuencas adicionales al piloto |

> *Las metas numéricas exactas de cada KPI se fijan tras evaluar la disponibilidad real de series en las cuencas bandera. No se afirma una precisión específica (p. ej. "85%") sobre cuencas cuyas series aún no hemos validado. Esta es honestidad metodológica que un jurado técnico respeta más que una cifra inflada.*

---

## 14. PRESUPUESTO DEL PROYECTO Y RIESGOS

### 14.1 Presupuesto del prototipo (GEOTÓN)
| Componente | Costo | Justificación |
|------------|-------|---------------|
| Software | S/0 | Stack 100% open source |
| Infraestructura cloud | S/0 – S/5,000 | Solo si se requiere cómputo masivo para LSTM; el prototipo corre en hardware local. **El "S/0" se refiere a licencias, no necesariamente al total.** |
| Tiempo equipo | Dedicación parcial | Lead técnico + químico |
| **Total prototipo** | **Bajo, dominado por tiempo** | Consultoría aplicada sin costos de licenciamiento |

### 14.2 Riesgos y mitigaciones
| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Datos ANA/SENAMHI incompletos o desactualizados | Alta | Alto | Plan B: proxy satelital (CHIRPS, NDVI) + regresión espacial. Disclaimer explícito. |
| **"Esto ya lo hace SENAMHI"** | **Alta** | **Alto** | **Respuesta blindada (Sección 16): SENAMHI modela oferta; el ISHT cruza oferta-demanda, valoriza y prioriza. No competimos; integramos.** |
| Cambio de gestión post-elección | Media | Alto | Anclaje a leyes vigentes (29338, Siembra y Cosecha) y a la RM 049-2026, que trascienden gestiones. |
| Resistencia sectorial a validación externa | Media | Medio | Neutralidad metodológica: usamos sus datos y los honramos. No criticamos; complementamos. |
| Competencia con propuestas más "bonitas" | Media | Medio | Diferenciación técnica: índice predictivo interactivo vs. mapas estáticos. Notebook como prueba de rigor. |
| Series insuficientes en cuencas no instrumentadas | Alta | Medio | Escenarios en vez de series. Documentado. |

---

## 15. PLAN DE EJECUCIÓN

| Fase | Entregable | Actividad |
|------|-----------|-----------|
| **F1** | Data lake geoespacial + health-check | Consumo WMS/WFS desde GEOIDEP (método Mario Flores S3). Ingestión de oferta PISCO_HyM_GR2M. Limpieza GeoPandas. Documentación de salud de servicios. |
| **F2** | Balance dual v1.0 | Cálculo balance superficial (oferta SENAMHI − demanda) + subterráneo, 159 cuencas. Clasificación semáforo. Sanity checks. |
| **F3** | Modelado bandera (Ica) | Evaluar calidad de series. Si robustas: SARIMAX + Prophet + XGBoost + LSTM sobre la brecha. Si gaps: escenarios. Documentar decisión. |
| **F4** | Modelado bandera (La Libertad) | Análisis contrafactual de captura. GWR a subcuencas de recarga. Extrapolar a vecinas. |
| **F5** | Dimensión minera + calidad (Bruno) | Overlay concesiones INGEMMET + derechos ANA. WQI/HEI. Mapeo de conflictos proyectados. |
| **F6** | Dimensión energética + valorización | Oportunidad energética (superávit + SRTM + SEIN). Valorización (ADUANET + empleo + población). Ranking por retorno. |
| **F7** | Atlas + Tablero interactivo | Atlas nacional. **Decision cockpit con sliders y drill-down.** Carga del Atlas en visor GeoPerú (prueba de interoperabilidad). |
| **F8** | Documento + pitch | Documento técnico. Pitch de 8 minutos. Revisión RedTeam interna. Verificación final de cifras y fuentes. |

---

## 16. RED TEAM: PREGUNTAS DEL JURADO Y RESPUESTAS CEMENTADAS

**"¿En qué se diferencia el ISHT del Balance Hídrico que SENAMHI ya publica para todas las cuencas, con proyección a 2065?"** *(LA PREGUNTA MÁS PELIGROSA — RESPUESTA OBLIGATORIA)*
→ El Balance Hídrico de SENAMHI se basa en el modelo PISCO_HyM_GR2M (Llauca et al., 2021, publicado en *Water*), que modela la **oferta** hídrica: cuánta agua cae y escurre por subcuenca. Es buena ciencia —lo citamos y lo usamos como insumo validado, descargando su producto NetCDF directamente—. Lo que SENAMHI no hace, y ningún sistema del Estado hace, es cruzar esa oferta con la **demanda** multisectorial para calcular la **brecha**, ponerle **precio** a esa brecha en soles y empleos, y **priorizar** la inversión por retorno. SENAMHI dice "hay 100 litros aquí". El ISHT dice "hay 100 pero se necesitan 146, el déficit pone en riesgo X millones en agroexportación y Y empleos, y el siguiente sol rinde más invertido en esta cuenca que en esa otra". Además, el de ellos es un visor estático de consulta; el nuestro es interactivo, con índice auditable, alerta temprana predictiva y un simulador que optimiza la asignación del presupuesto. No competimos con SENAMHI; nos paramos sobre su trabajo —reconociendo su autoría— y construimos la capa de decisión que falta. Reinventar la oferta hídrica sería arrogante; integrarla para la decisión es la jugada de una firma seria.

**"¿No es esto reinventar lo que ya existe?"**
→ Al contrario: es lo opuesto a reinventar. Una consultora seria no recalcula lo que el cliente ya tiene bien hecho. Tomamos la oferta hídrica oficial (SENAMHI), las cuencas y derechos (ANA), las concesiones (INGEMMET) y las exportaciones (SUNAT), y construimos el índice de integración que cruza todo. Reinventar la oferta hídrica en el plazo del concurso sería arrogante e inferior a lo que el Estado ya tiene. Nuestra humildad técnica es deliberada.

**"¿Cómo hacen SARIMAX para 159 cuencas si no hay series completas?"**
→ No lo hacemos para todas. SARIMAX solo para cuencas bandera con data robusta. Para el resto, análisis de escenarios con regresión espacial y proxy satelital. Profundidad donde cuenta, amplitud donde es barata. La precisión se afirma solo sobre cuencas con series validadas.

**"¿La minería está tratada como un usuario más?"**
→ No. Se mapea como **conflicto de derechos hídricos**: cruzamos concesiones, derechos otorgados y cuencas en déficit. Bruno Elescano valida la calidad química (arsénico, cadmio, mercurio, pH). Toda afirmación sobre una empresa específica va sustentada con resolución de ANA/OEFA o se reformula a lenguaje agregado.

**"¿Por qué su tablero es 'interactivo' y eso importa?"**
→ Porque la decisión hídrica no es estática. El precio del espárrago cambia, El Niño varía, los pozos se multiplican. Un visor que muestra un resultado fijo no sirve para decidir bajo incertidumbre. Nuestro tablero deja al decisor mover esos supuestos y ver el índice, el semáforo y el ranking recalcularse. Eso es pasar de "información" a "decisión" en la pirámide de Naldi Carrión.

**"¿Usan datos de GeoPerú como data primigenia?"**
→ Sí, cumplimos la regla de Darwin (S11). GeoPerú es el visor nacional; GEOIDEP el catálogo de servicios. Identificamos y consumimos servicios WMS/WFS de ANA/SENAMHI/INEI desde el catálogo, siguiendo el método que la propia PCM enseñó en la Sesión 3 (Mario Flores). Documentamos la salud de cada servicio como subproducto de gobernanza para la PCM.

**"¿Su entregable es un mapa de colores con semáforo?"**
→ No. El semáforo es la interfaz de decisión de un índice numérico. Detrás hay balances dualizados, oferta validada de SENAMHI, demanda cruzada, proyección de brecha, valorización y ranking por retorno, todo en un tablero interactivo. El valor está en el sistema de decisión, no en la estética del mapa.

**"¿El potencial hidroeléctrico es real o humo?"**
→ Es dato oficial del MINEM. El ISHT no hace prefactibilidad; marca "oportunidad energética" donde superávit + gradiente + red SEIN convergen. Lectura estratégica, no ingeniería de detalle.

**"¿Por qué no proponen construir qochas o represas?"**
→ Porque no somos constructoras. Somos inteligencia territorial. Decimos dónde poner la plata para máximo retorno. El Estado (Midagri, ANA) construye. Esa disciplina de alcance separa una consultoría de un PowerPoint con todo metido adentro.

---

## 17. POSICIONAMIENTO COMPETITIVO: DÓNDE ENCAJA EL ISHT

A diferencia de otras propuestas del programa, el ISHT no compite en el mismo plano. Se ubica en una capa distinta de la pirámide de valor. Este encuadre es colaborativo, no confrontacional: cada propuesta resuelve una pieza; el ISHT resuelve la integración para la decisión de Estado.

| Enfoque observado en el programa | Plano que ocupa | Cómo se relaciona con el ISHT |
|---|---|---|
| Asistencia técnica a agricultores cruzando datos | Recomendación individual | El ISHT le dice al Estado dónde invertir para que haya agricultores que asistir. Complementarios. |
| Clustering visual e índices por capas en geoportal | Visualización | El ISHT construye el índice numérico predictivo detrás de la visualización. Somos el motor, no solo la interfaz. |
| Superposición de capas para viabilidad de proyectos | Análisis estático | El ISHT proyecta viabilidad futura con ML. |
| Contaminación ambiental y ECAs | Medición ambiental | El ISHT integra contaminación (Bruno) + demanda + derechos para predecir conflicto. |
| Comunidades nativas + análisis de capas | Localización | El ISHT predice dónde las comunidades perderán agua por superposición de usos. |

El diferenciador transversal: ninguna otra propuesta integra oferta-demanda-valorización-priorización en un índice de decisión interactivo, ni se para explícitamente sobre los modelos oficiales del Estado para hacerlo.

---

## 18. CITAS DE LAS SESIONES PCM (CONTEXTO METODOLÓGICO)

> *Las siguientes son referencias a conceptos expuestos en las sesiones del programa, citadas para alinear la propuesta con los criterios de evaluación. Provienen de notas de las sesiones; se citan por sesión y expositor. Para uso en el documento final se verifican contra las grabaciones oficiales publicadas en la landing del programa.*

- Sobre calidad de datos y ISO 19157, y sobre pronósticos para adelantarse a eventos — Moisés Pollatos, S9.
- Sobre la transformación dato → información → evidencia → decisión, y problema vs. síntoma — Naldi Carrión, S10.
- Sobre empezar por GeoPerú como data primigenia — Darwin, S11.
- Sobre "basura entra, basura sale" en proyectos de IA — Fabián Camargo, S6.
- Sobre que la PCM no es productora de información geoespacial y que un servicio caído indica problema técnico de la entidad (no inexistencia) — Mario Flores, S3.
- Sobre el costo de la reconstrucción post-El Niño y la pérdida de infraestructura, y sobre decisiones basadas en ciencia — Miguel Estrada, S4.

---

## 19. CONCLUSIÓN DEL STAFF ENGINEER

Tras auditar forensemente el ecosistema de datos del Estado, el patrón es inequívoco:

1. **El Estado SÍ tiene datos hídricos y SÍ tiene un modelo de oferta validado (PISCO_HyM_GR2M).** El vacío no es de datos ni de ciencia hídrica; es de **integración para la decisión**. Esta es la corrección central respecto de diagnósticos previos.
2. **Las plataformas del Estado son visores de consulta estáticos.** Muestran resultados; no permiten simular escenarios ni recalcular. El ISHT es interactivo: una herramienta de decisión, no una vitrina.
3. **Nadie cruza oferta con demanda, nadie valoriza la brecha, nadie prioriza por retorno.** Esas son las cuatro capas del ISHT, y son territorio sin ocupar.
4. **La metodología de evaluación valida nuestra estructura.** Problema claro, evidencia verificada, solución viable, impacto medible, ODS alineados.
5. **El arsenal ML moderno (SARIMAX-LSTM-XGBoost-GWR) no se ha aplicado a la decisión hídrica del Estado.** GR2M es un modelo de oferta clásico; el ISHT aplica ML a la brecha socioeconómica, que es otro problema.
6. **La calidad química con químico puro (Bruno) es diferenciador.** Convierte cantidad en seguridad hídrica integral.
7. **La RM 049-2026 es obligatoria y el ISHT es su caso de uso demostrable.** Materializa la interoperabilidad que la estrategia ordena.
8. **Nuestra humildad es estratégica.** Honramos el trabajo del Estado y nos paramos sobre él. Eso reduce la resistencia sectorial y nos posiciona como integradores, no como críticos.

> *"El Perú no necesita otro visor estático ni otro modelo de oferta hídrica — eso ya existe y está bien hecho. El Perú necesita un Índice de Seguridad Hídrica Territorial que cruce la oferta oficial con la demanda real, le ponga precio a la brecha, prediga dónde el conflicto se volverá crítico, y le diga al Estado dónde invertir el siguiente sol — todo en una herramienta interactiva donde el decisor mueve un supuesto y ve el futuro recalcularse. Nos paramos sobre la ciencia del agua que el Estado ya construyó, y entregamos la decisión sobre el agua que el Estado todavía no tiene. Eso es HiDATA: consultoría estratégica de datos, nacida en Perú para Latinoamérica."*

---

## ANEXO A — FUENTES DE DATOS VERIFICADAS Y DESCARGABLES

Fuentes confirmadas durante la auditoría. Las marcadas como "descarga directa" tienen endpoint público abierto (la descarga se ejecuta desde el entorno de HiDATA; algunos dominios estaban fuera del alcance del entorno de auditoría pero son públicos para el usuario final).

**Oferta hídrica (insumo Capa 1):**
- **PISCO_HyM_GR2M v1.1** — producto de caudales mensuales, 3,594 subcuencas, 1981-2022. Paper: Llauca H., Lavado-Casimiro W., Montesinos C., Santini W., Rau P. (2021). *PISCO_HyM_GR2M: A Model of Monthly Water Balance in Peru (1981–2020)*. Water, 13(8), 1048. DOI: 10.3390/w13081048. Dataset: Figshare (DOI propio) y HydroShare (NetCDF vía THREDDS). Código: GitHub `hllauca/GR2MSemiDistr` (R, instalable con devtools).
- **PISCO_HyD_ARNOVIC** — caudales diarios, 1981-2022 (resolución más fina). Mismo autor, GitHub `hllauca`.
- **RClimChange** — paquete R para descargar escenarios CMIP6 (NASA NEX-GDDP) para proyección climática. GitHub `hllauca/RClimChange`.
- **PISCO (precipitación/temperatura/ET)** — datasets grillados base de SENAMHI (Aybar et al. 2019; Huerta et al. 2022-2023, *Scientific Data*). Insumo meteorológico.

**Cuencas, derechos, calidad (ANA/SNIRH):**
- Geoportal ANA: Visor Geohidro, Catálogo de Metadatos, Geoservicios (WMS/WFS/Shapefile). Capas: unidades hidrográficas Pfafstetter, clasificación de cuerpos de agua por calidad (ECA), glaciares, infraestructura hidráulica, fuentes superficiales y subterráneas.
- Observatorio del Agua SNIRH: integración por cuenca (represas, demanda, calidad, riesgo, inventario de fuentes), 159 unidades hidrográficas.

**Caudales en tiempo real y pronóstico (SENAMHI):**
- PHISIS (Plataforma Hidrológica): niveles y caudales de la red de monitoreo.
- IDESEP: servicios web (Red de Estaciones, clasificación climática, etc.) y Visor SIG de Balance Hídrico (proyección 2035-2065).
- Pronóstico hidrológico estacional (reportes DHI-SPH) basado en PISCO_HyM_GR2M.

**Demanda, conflicto, valorización:**
- INGEMMET: concesiones mineras vigentes y en trámite (catálogo GEOIDEP).
- INEI: proyecciones poblacionales por distrito (WFS catalogado).
- ADUANET/SUNAT: exportaciones agropecuarias por región (valorización de divisas).
- MINEM: potencial hidroeléctrico, centrales, red SEIN.
- GeoPerú: categoría de conflictos (agrarios, mineros, hídricos, energéticos) — base para el mapeo de conflicto proyectado.

**Proxies satelitales (cuencas sin series):**
- CHIRPS (precipitación satelital), Landsat/MODIS (NDVI, uso de suelo), Sentinel-1 SAR (colmatación, deforestación de cabeceras), SRTM (gradiente topográfico para dimensión energética).

**Plataformas y método de consumo:**
- Catálogo Nacional de Servicios Georreferenciados (GEOIDEP) — punto de identificación de servicios.
- Visor GeoPerú (visor.geoperu.gob.pe) — data primigenia y carga de capas externas (WMS/WFS/REST).
- Método de consumo: Sesión 3 del programa (Mario Flores) — GEOIDEP → GetCapabilities → WMS/WFS → exportar Shapefile/GeoPackage.

**Endpoints GIS reales identificados (verificar operatividad desde el entorno de trabajo):**
- ANA red hidrográfica Pfafstetter: `geosnirh.ana.gob.pe/server/rest/services/Público/SERV_AguasContiLoticos/MapServer`
- ANA WMS institucional: `idep.gob.pe/geoportal/rest/services/INSTITUCIONALES/ANA_WMS/MapServer`
- SENAMHI GeoServer (WMS+WFS): `idesep.senamhi.gob.pe/geoserver/{workspace}/wms?request=GetCapabilities&service=WMS`
- OEFA afectación de cuencas: `pifa.oefa.gob.pe/server_gis/rest/services/Metadatos/Afectacion_Cuencas_Hidrograficas/MapServer`
- INGEMMET geología/catastro: `geoperu.ingemmet.gob.pe/wmsconnector/com.esri.wms.Esrimap/Mapa_Geologico` y `geocatmin.ingemmet.gob.pe/arcgis/rest/services`
- MINAM geoservidor: `geoservidorperu.minam.gob.pe/arcgis/rest/services`
- MEF geoservicios: `ofi3.mef.gob.pe/geows/arcgis/rest/services`
- PISCO_HyM_GR2M: NetCDF en HydroShare/Figshare; código en `github.com/hllauca/GR2MSemiDistr`

> **El detalle completo de cada endpoint, mapeado a su capa y con método de consumo, está en la Sección 8-BIS de este mismo documento.**

---

## ANEXO B — CHECKLIST DE VERIFICACIÓN ANTES DEL PITCH

Items que deben cerrarse con fuente primaria antes de presentar (disciplina anti-"basura entra, basura sale"):

**Cumplimiento del concurso (prioridad máxima — fechas ya verificadas en bases):**
- [ ] **Confirmar inscripción en Facilita t/52312** (cerró 29 de mayo 2026). Si está hecha, OK; si no, escribir YA a contacto@datosabiertos.gob.pe por posible prórroga.
- [ ] **Registrar propuesta final en Facilita t/52313** dentro del plazo (desarrollo cierra 5 de junio; verificar si hay ajuste de cronograma).
- [ ] Preparar los **10 campos del entregable** (sección 9 de bases) destilando este master plan.
- [ ] Preparar el **anexo visual obligatorio** (tablero/Atlas/lámina).
- [ ] Confirmar que el entregable público no expone código core propietario (bases sección 17).

**Datos y cifras:**
- [ ] Descargar PISCO_HyM_GR2M v1.1 (NetCDF) y validar estructura/cobertura para las cuencas bandera.
- [ ] Cifras macro de vertientes (% agua / % población / consumo Lima) — fuente ANA / Política Nacional, una sola consistente.
- [ ] Monto exacto de partida Midagri siembra y cosecha — Consulta Amigable MEF / código SIAF.
- [ ] Cifras de Ica (reserva, explotación, déficit, n° pozos) — Plan de Gestión del Acuífero de Ica, ANA.
- [ ] Cualquier afirmación sobre minera específica — resolución ANA/OEFA por expediente, o reformular a agregado.
- [ ] Evaluar series reales disponibles por cuenca bandera (SENAMHI/PHISIS, ANA) y fijar metas de KPI.
- [ ] Verificar operatividad de servicios WMS/WFS clave con GetCapabilities.
- [ ] Acuñar DOI del repositorio en Zenodo.

---

*Documento preparado por HiDATA — Joan Hidalgo (Lead Técnico; Ing. Física UNI, Adm. Negocios Internacionales ADEX) y Bruno Elescano (Calidad Hídrica; Químico Puro UNMSM). Rigurosidad y filosofía de consultoría estratégica internacional. Aplicación territorial peruana. Escalabilidad latinoamericana. v5.0 — Documento Único Consolidado, Auditada RedTeam, junio 2026.*
