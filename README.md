# Prueba técnica — To‑Do híbrido (Ionic + Angular + Cordova)

Aplicación **To‑Do List** híbrida con **Ionic 8**, **Angular 21** y **Apache Cordova**, almacenamiento local (**@ionic/storage-angular**), **Firebase** (**AngularFire**) + **Remote Config** (feature flag), y arquitectura alineada a **Clean Architecture** y buenas prácticas de rendimiento.

---

## Contenido

1. [Cumplimiento de requisitos de la prueba](#cumplimiento-de-requisitos-de-la-prueba)  
2. [Cómo correr el proyecto](#cómo-correr-el-proyecto)  
3. [Entregables de la prueba](#entregables-de-la-prueba)  
4. [Decisiones técnicas](#decisiones-técnicas)  
5. [Preguntas de la prueba (desafíos, optimización, calidad)](#preguntas-de-la-prueba-desafíos-optimización-calidad)  
6. [Generar APK (Android) e IPA (iOS)](#generar-apk-android-e-ipa-ios)  
7. [Versionamiento con Git](#versionamiento-con-git)  
8. [Configuración Firebase y Remote Config](#configuración-firebase-y-remote-config)  
9. [Archivos de configuración relevantes](#archivos-de-configuración-relevantes)  
10. [Desafíos y limitaciones conocidas](#desafíos-y-limitaciones-conocidas)  
11. [Resolución de problemas](#resolución-de-problemas)  
12. [Requisitos previos de entorno](#requisitos-previos-de-entorno)  
13. [Licencia y autor](#licencia-y-autor)  

---

## Cumplimiento de requisitos de la prueba

| Requisito | Estado | Dónde / notas |
|-----------|--------|----------------|
| **To‑Do: agregar, completar, eliminar tareas** | Cumple | `src/app/features/tasks/pages/task-list/` — alta, checkbox, eliminar por ítem; opción «Eliminar todas» si el feature flag lo habilita. |
| **Almacenamiento local** | Cumple | `LocalTaskRepository` / `LocalCategoryRepository` + `@ionic/storage-angular`; `provideIonicAppStorage()` + `provideLocalTaskAndCategoryRepositories()` en `app.config.ts`. |
| **Categorías: CRUD** | Cumple | `src/app/features/categories/pages/category-list/` — crear/editar (alertas), eliminar con deslizamiento; al borrar categoría se desvinculan tareas. |
| **Asignar categoría a cada tarea** | Cumple | Campo `categoryId` en modelo `Task`; selector al crear tarea en `task-list`. |
| **Filtrar tareas por categoría** | Cumple | Segmento (Todas / Sin categoría / por id) + lista filtrada; lógica en `task-category-filter.ts` y lista precomputada para rendimiento. |
| **Cordova Android e iOS** | Cumple en estructura | `config.xml`, `ionic.config.json`, `package.json` (`cordova` + plataformas); instrucciones de build y emulador en este README. **APK/IPA** se generan en la máquina del evaluador o se enlazan como entrega (no suelen versionarse en Git). |
| **Firebase + Remote Config (feature flag)** | Cumple | `provideFirebaseAndRemoteConfig()`, `AppRemoteConfigService`, clave `feature_show_delete_all_tasks` en `remote-config-keys.ts`; plantilla de ejemplo `remoteconfig.template.json`. |
| **Optimización de rendimiento** | Cumple | Rutas **lazy**; **OnPush** + `markForCheck`; **trackBy** en listas; **CDK Virtual Scroll** si hay **>100** tareas filtradas; lista filtrada sin pipe en el hot path del virtual scroll. |
| **Clean Architecture / SOLID** | Cumple | `core/` (modelos + puertos), `services/` (implementaciones), `providers/` (composición), `features/` + `shared/`. |
| **README detallado** | Cumple | Este documento. |
| **Control de versiones Git (repo público)** | Responsabilidad de entrega | Subir a **GitHub/GitLab público** y enlazar en la entrega; desarrollo en rama según instrucciones del evaluador. |
| **Capturas o video** | Entrega fuera del código | Incluir en la entrega (Drive, enlace en README, carpeta `docs/media/` opcional). |
| **APK e IPA funcionales** | Entrega binaria | Generados con los pasos de [Generar APK e IPA](#generar-apk-android-e-ipa-ios); enlaces de descarga en la entrega. |

**Nota sobre secretos:** `src/environments/environment.ts` puede contener claves de Firebase. No se realiza la subida de este dentro del repositorio.

---

## Cómo correr el proyecto

### Requisito rápido

- **Node.js LTS** (20.x o 22.x recomendado), **npm**.  
- Proyecto con **`.npmrc`** (`legacy-peer-deps=true`) para **Angular 21 + AngularFire 20**.

### 1. Clonar e instalar

```bash
git clone <URL_DEL_REPOSITORIO_PUBLICO>
cd Prueba_tec
npm install
```

### 2. Configurar Firebase (obligatorio para arrancar)

1. Creá proyecto en [Firebase Console](https://console.firebase.google.com/) y una app **Web**.  
2. Copiá la configuración en **`src/environments/environment.ts`**.  
3. En **Remote Config**, creá el parámetro **`feature_show_delete_all_tasks`** (booleano). Valor `false` oculta «Eliminar todas»; `true` la muestra tras fetch/activate.  
4. Opcional: sincronizar plantilla con CLI: **`remoteconfig.template.json`** en la raíz está alineado con `remote-config-keys.ts`.

### 3. Desarrollo en navegador

```bash
npm start
# equivalente: npx ng serve
```

Abrí la URL indicada (típicamente `http://localhost:4200/`). La app redirige a **`/tasks`**. Rutas: **`/tasks`**, **`/categories`**.

### 4. Compilar el bundle web (Cordova / producción)

```bash
npx ng build
# desarrollo con source maps:
npx ng build --configuration development
```

Salida en **`www/`** (configurado en `angular.json`). La carpeta **`www/`** está en **`.gitignore`**; generala antes de `ionic cordova run/build`.

### 5. Ejecutar en Android (emulador o dispositivo)

```bash
npx ng build
npx ionic cordova run android
```

(Requiere Android Studio, SDK y variables como `JAVA_HOME` configuradas.)

### 6. Ejecutar en iOS (solo macOS)

```bash
npx ng build
npx ionic cordova run ios
```

(Requiere **Xcode**, **CocoaPods**, `xcode-select` apuntando a **Xcode.app**; ver [Resolución de problemas](#resolución-de-problemas).)

---

## Entregables de la prueba

Según el enunciado, la entrega suele incluir:

| # | Entregable | Qué hacer en este repo / entrega |
|---|------------|-----------------------------------|
| 1 | **Código fuente** en Git (repo **público**) | Subir este proyecto; README actualizado (este archivo). Trabajar en **rama** según indiquen (p. ej. `feature/prueba-tecnica`). |
| 2 | **README** con ejecución y cambios | Este README: cómo correr, cumplimiento, decisiones, preguntas técnicas, APK/IPA. |
| 3 | **Capturas o video** de funcionalidades | Añadir enlaces en la entrega o una carpeta opcional `docs/media/` (no obligatoria en el código). Mostrar: tareas, categorías, filtro, flag «Eliminar todas» on/off. |
| 4 | **Respuestas** a preguntas técnicas | Sección [Preguntas de la prueba](#preguntas-de-la-prueba-desafíos-optimización-calidad). |
| 5 | **APK** y **IPA** | Generar con Xcode / Android Studio o `ionic cordova build`; **no** incluir binarios pesados en Git salvo que pidan lo contrario — usar **enlaces de descarga** (Drive, GitHub Releases, etc.). |

---

## Decisiones técnicas

1. **Clean Architecture pragmática**  
   - **Dominio** en `core/models` e **interfaces** (puertos `TaskRepository`, `CategoryRepository`).  
   - **Infraestructura** en `services/` (Ionic Storage, stubs Firebase).  
   - **Inversión de dependencias**: `app.config.ts` + `providers/repository.providers.ts` elige implementación sin que las pantallas dependan de detalles de almacenamiento.

2. **Ionic + Angular standalone**  
   - Sin NgModules de feature; **lazy loading** vía `loadChildren` hacia `TASKS_ROUTES` y `CATEGORIES_ROUTES` para **menor carga inicial** y chunks separados.

3. **Persistencia local**  
   - **@ionic/storage-angular** con claves versionadas (`storage-keys.ts`) para migraciones futuras.

4. **Firebase en el WebView**  
   - **AngularFire** (`initializeApp` + `Remote Config`) para el feature flag; coherente con la app Ionic/Cordova como **WebView**. El plugin **cordova-plugin-firebasex** queda para capacidades **nativas** si se necesitan; se evita duplicar la misma lógica de flag en dos sitios.

5. **Feature flag**  
   - Parámetro **`feature_show_delete_all_tasks`**: default en cliente (`REMOTE_CONFIG_DEFAULTS`) + `defaultConfig` en `getRemoteConfig` hasta que responda la red; `showDeleteAllTasks$` en la UI.

6. **Rendimiento en listas grandes**  
   - **OnPush** y **`markForCheck`** tras datos async.  
   - **TrackBy** (`task.id`, `category.id`) en `@for` y `*cdkVirtualFor`.  
   - **Lista filtrada materializada** en el componente (evita ejecutar un pipe sobre cada fila del virtual scroll).  
   - **Angular CDK Virtual Scroll** solo si **> 100** ítems en el filtro activo; `ion-content` desactiva scroll nativo en ese modo para que el CDK controle el viewport.  
   - **`itemSize` fijo** (~88px): trade-off simplicidad vs filas de altura variable.

7. **Build híbrido**  
   - **Angular** empaqueta a **`www/`**; **Cordova** consume `www/` según `config.xml` (`<content src="index.html" />`).

8. **Herramientas de Firebase opcionales**  
   - Raíz: **`firebase.json`** apunta `public/` para **Firebase Hosting** de prueba; la app Cordova usa **`www/`** tras `ng build`. Son flujos distintos; no confundir despliegue web con el empaquetado móvil.

---

## Preguntas de la prueba (desafíos, optimización, calidad)

### ¿Cuáles fueron los principales desafíos al implementar las nuevas funcionalidades?

- **Alinear Cordova + iOS** con dependencias modernas (CocoaPods, **deployment target ≥ 15** para Firebase nativo, `xcode-select` con **Xcode completo** vs solo Command Line Tools).  
- **Compatibilidad de versiones** entre **Angular 21** y **AngularFire 20** (peers), resuelta con **`.npmrc`** `legacy-peer-deps`.  
- **Remote Config**: definir un flujo claro de **valores por defecto** en cliente mientras llega `fetchAndActivate`, sin parpadear UI ni depender solo de red.  
- **Listas grandes**: combinar **OnPush**, filtrado eficiente y **virtual scroll** sin romper la experiencia Ionic (`ion-content`, alturas de fila).

### ¿Qué técnicas de optimización aplicaste y por qué?

| Área | Técnica | Motivo |
|------|---------|--------|
| **Carga inicial** | Rutas **lazy** por feature (`tasks`, `categories`) | Reduce el bundle inicial y acelera el primer pintado. |
| **Cambios de vista** | **OnPush** + **`markForCheck`** tras actualizar datos | Menos ciclos de detección de cambios innecesarios. |
| **Listas** | **trackBy** / `track` estable por `id` | Menos reconciliación DOM al actualizar colecciones. |
| **Muchas tareas** | Lista filtrada **precomputada** + **CDK Virtual Scroll** si **> 100** | Menos nodos en DOM y menor uso de memoria en listas largas. |
| **Remote Config** | Defaults en **`defaultConfig`** + emisión inicial local | UX predecible y menos bloqueos si la red falla o es lenta. |

### ¿Cómo aseguraste la calidad y mantenibilidad del código?

- **Separación por capas** (core / services / features / shared) y **contratos** explícitos (repositorios abstractos).  
- **Nombres y claves centralizados** (`remote-config-keys.ts`, `storage-keys.ts`).  
- **Tipado estricto** TypeScript y plantillas alineadas al compilador de Angular.  
- **README** y plantilla (`remoteconfig.template.json`) para reproducibilidad.  
- **Build verificable** con `ng build` y flujo documentado para Cordova.

---

## Generar APK (Android) e IPA (iOS)

Los binarios **no** suelen subirse al repositorio; la entrega suele ser **enlace de descarga**.

### Android (APK o AAB)

1. `npx ng build`  
2. `npx ionic cordova build android --release`  
3. Firmar y alinear según [documentación Android](https://developer.android.com/studio/publish/app-signing) (Android Studio → *Build > Generate Signed Bundle / APK* o `jarsigner`/`apksigner`).

### iOS (IPA)

1. `npx ng build`  
2. `npx ionic cordova build ios`  
3. Abrir **`platforms/ios/*.xcworkspace`** en **Xcode**, seleccionar dispositivo *Any iOS Device*, **Product → Archive**, luego **Distribute App** para obtener **IPA** (requiere **cuenta de desarrollador Apple** y certificados/provisioning).

---

## Versionamiento con Git

- Realizar **fork** o clonar el remoto indicado por el evaluador.  
- Desarrollar en una **rama** dedicada (p. ej. `feature/prueba-tecnica-daniel`).  
- Hacer **commits** atómicos con mensajes claros.  
- Publicar en repositorio **público** y enviar el **enlace** antes de la fecha límite.

---

## Configuración Firebase y Remote Config

| Archivo | Propósito |
|---------|-----------|
| `src/environments/environment.ts` | Configuración `firebase` de la app web. |
| `src/app/core/config/remote-config-keys.ts` | Nombres de parámetros y defaults locales. |
| `src/app/providers/firebase.providers.ts` | `provideFirebaseApp`, `provideRemoteConfig`, `defaultConfig`. |
| `src/app/services/remote-config/app-remote-config.service.ts` | `fetchAndActivate`, observables (`showDeleteAllTasks$`). |
| `remoteconfig.template.json` | Referencia para Remote Config (Console o `firebase deploy --only remoteconfig`). |
| `firebase.json` | Hosting opcional (`public/`) y referencia al template de Remote Config. |

**Demostración del feature flag:** en Firebase Console → Remote Config, publicá `feature_show_delete_all_tasks` en `true` y abrí la app: debe aparecer **«Eliminar todas»**. Con `false`, el botón no se muestra (tras aplicar valores remotos y refrescar comportamiento según caché).

---

## Archivos de configuración relevantes

| Archivo | Descripción |
|---------|-------------|
| `angular.json` | Build → **`www/`**, configuraciones `development` / `production`. |
| `src/main.ts` | `bootstrapApplication(AppComponent, appConfig)`. |
| `src/app/app.config.ts` | Providers globales. |
| `src/app/app.routes.ts` | Rutas y lazy loading. |
| `config.xml` | Id/nombre Cordova, **iOS deployment-target 15.0**, recursos. |
| `ionic.config.json` | Tipo `angular`, integración `cordova`. |
| `.npmrc` | `legacy-peer-deps=true`. |

---

## Desafíos y limitaciones conocidas

- **Peers AngularFire / Angular** y necesidad de `legacy-peer-deps`.  
- **Cordova + iOS**: Xcode, Pods, deployment target.  
- **Virtual scroll**: `itemSize` fijo; títulos multilínea muy largos pueden requerir ajuste o paginación.  
- **Todo en memoria** en repositorio local: volúmenes extremos conviene paginar o backend.  
- **`public/`** en `firebase.json` es para **Firebase Hosting** de prueba, no sustituye a **`www/`** para Cordova.

---

## Resolución de problemas

### iOS: `xcodebuild` requiere Xcode (no solo Command Line Tools)

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select -p
xcodebuild -version
```

### CocoaPods no encontrado

```bash
brew install cocoapods
pod --version
```

### FirebaseCore y «higher minimum deployment target»

En `config.xml` → `<platform name="ios">`:

```xml
<preference name="deployment-target" value="15.0" />
```

---

## Requisitos previos de entorno

| Entorno | Detalle |
|---------|---------|
| **Node.js** | LTS **20.x o 22.x** (recomendado). |
| **npm** | Incluido con Node. |
| **Android** | Android Studio, `JAVA_HOME`, licencias SDK. |
| **iOS** | Xcode (App Store), CocoaPods, `xcode-select` correcto. |

---

## Licencia y autor

Proyecto de prueba técnica. El autor declarado para el paquete Cordova está en `config.xml` (`<author>`); actualizalo si corresponde a tu entrega.
