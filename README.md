# Prueba To‑Do — Ionic, Angular y Cordova

Aplicación híbrida **To‑Do** con **Ionic 8**, **Angular 21**, **Apache Cordova**, almacenamiento local (**Ionic Storage**), **AngularFire** (Remote Config) y arquitectura orientada a **Clean Architecture** (core, servicios, features, shared).

---

## Contenido

1. [Requisitos previos](#requisitos-previos)  
2. [Paso a paso: clonar y ejecutar](#paso-a-paso-clonar-y-ejecutar)  
3. [Configuración de Firebase y Remote Config](#configuración-de-firebase-y-remote-config)  
4. [Build para Cordova](#build-para-cordova)  
5. [Integración Cordova, plataformas y plugins](#integración-cordova-plataformas-y-plugins)  
6. [Firebase nativo (Cordova) vs Web SDK](#firebase-nativo-cordova-vs-web-sdk)  
7. [Archivos de configuración relevantes](#archivos-de-configuración-relevantes)  
8. [Decisiones técnicas](#decisiones-técnicas)  
9. [Desafíos y limitaciones conocidas](#desafíos-y-limitaciones-conocidas)  
10. [Resolución de problemas](#resolución-de-problemas)  

---

## Requisitos previos

| Entorno | Detalle |
|--------|---------|
| **Node.js** | **LTS 20.x o 22.x** recomendado. Versiones non‑LTS (p. ej. 25) pueden mostrar advertencias con Angular. |
| **npm** | Incluido con Node. Este repo usa **`.npmrc`** con `legacy-peer-deps=true` por compatibilidad **Angular 21 + AngularFire 20**. |
| **Android** (opcional) | [Android Studio](https://developer.android.com/studio), `JAVA_HOME`, licencias SDK. |
| **iOS** (solo macOS) | **Xcode** completo (App Store), `xcode-select` apuntando a `Xcode.app`, **CocoaPods** ≥ 1.12. |

---

## Paso a paso: clonar y ejecutar

Sigue este orden la primera vez (y cada vez que clones en una máquina nueva).

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd Prueba_tec
```

(ajusta el nombre de la carpeta si tu remoto usa otro path).

### 2. Instalar dependencias

```bash
npm install
```

No hace falta pasar `--legacy-peer-deps` manualmente si existe **`.npmrc`** en la raíz (ya está versionado).

### 3. Configurar Firebase para la app web

Edita **`src/environments/environment.ts`** y completa el objeto **`firebase`** con los datos de tu proyecto en [Firebase Console](https://console.firebase.google.com/) → configuración del proyecto → tu app Web.

Sin valores válidos, **`initializeApp`** fallará al arrancar porque **`app.config.ts`** registra **`provideFirebaseAndRemoteConfig()`**.

### 4. Remote Config (feature flags)

1. En Firebase Console → **Remote Config**, crea el parámetro definido en **`src/app/core/config/remote-config-keys.ts`** (p. ej. `feature_show_delete_all_tasks`).  
2. Los valores por defecto en cliente están en **`REMOTE_CONFIG_DEFAULTS`** hasta que se complete `fetchAndActivate`.

### 5. Ejecutar en desarrollo (navegador)

```bash
npm start
# equivalente a:
npx ng serve
```

Abre la URL que indique la CLI (suele ser `http://localhost:4200/`). La app redirige a **`/tasks`**.

### 6. Compilar el frontend (salida para Cordova)

```bash
npx ng build
# o desarrollo con sourcemaps:
npx ng build --configuration development
```

La salida va a **`www/`** (ver `angular.json`). Esa carpeta está en **`.gitignore`**; se regenera con cada build.

### 7. (Opcional) Vincular con Ionic Appflow

```bash
npx ionic login
npx ionic link
```

No es obligatorio para desarrollo local.

---

## Configuración de Firebase y Remote Config

| Archivo | Propósito |
|---------|-----------|
| `src/environments/environment.ts` | Credenciales **`firebase`** y flag **`production`** (afecta intervalo de fetch en Remote Config). |
| `src/app/providers/firebase.providers.ts` | `provideFirebaseApp`, `provideRemoteConfig`, **`defaultConfig`** derivado de las constantes de Remote Config. |
| `src/app/core/config/remote-config-keys.ts` | Nombres de parámetros y valores por defecto locales. |
| `src/app/services/remote-config/app-remote-config.service.ts` | Emisión inicial + `fetchAndActivate`; observable **`showDeleteAllTasks$`**, etc. |

---

## Build para Cordova

1. Generar **`www/`**: `npx ng build` (o `npm run build`).  
2. Preparar / ejecutar con Ionic + Cordova, por ejemplo:

```bash
npx ionic cordova prepare android
npx ionic cordova run android
```

En iOS, tras añadir la plataforma y resolver Pods, abre el **`.xcworkspace`** en Xcode si hace falta.

---

## Integración Cordova, plataformas y plugins

```bash
npx ionic integrations enable cordova --add
npx ionic cordova platform add android
npx ionic cordova platform add ios
npx cordova platform ls
```

Scripts útiles en **`package.json`**:

| Script | Descripción |
|--------|-------------|
| `npm start` | `ng serve` |
| `npm run build` | `ng build` |
| `npm run cordova:prepare` | `ionic cordova prepare` |
| `npm run cordova:run:android` / `cordova:run:ios` | Ejecutar en dispositivo/emulador |
| `npm run cordova:build:android` / `cordova:build:ios` | Builds de release |

---

## Firebase nativo (Cordova) vs Web SDK

- **AngularFire + SDK JS** en el WebView cubre **Remote Config** (y futuro Firestore en JS) sin depender del bridge nativo.  
- **`cordova-plugin-firebasex`** aporta capacidades **nativas** (FCM, etc.). Evita duplicar la misma función con dos plugins distintos.  
- Añade **`google-services.json`** / **`GoogleService-Info.plist`** según la guía del plugin si compilás nativo con Firebasex.

---

## Archivos de configuración relevantes

| Archivo | Descripción |
|---------|-------------|
| `angular.json` | Build Angular → **`www/`**, configs `development` / `production`. |
| `tsconfig.json`, `tsconfig.app.json` | TypeScript del proyecto. |
| `src/main.ts` | `bootstrapApplication(AppComponent, appConfig)`. |
| `src/app/app.config.ts` | Providers: Ionic, Router, Firebase, Storage, repositorios. |
| `src/app/app.routes.ts` | Rutas con **carga diferida** por feature. |
| `config.xml` | Id de app Cordova, nombre, **iOS deployment-target** (≥ 15 para Firebase reciente), recursos. |
| `ionic.config.json` | Tipo `angular`, integración `cordova`, id Appflow si aplica. |
| `.npmrc` | `legacy-peer-deps=true`. |

El **widget id** de `config.xml` debe ser coherente con el registro en tiendas y con apps **Android/iOS** en Firebase si usás SDK nativo.

---

## Decisiones técnicas

1. **Clean Architecture ligera**  
   - **Core**: modelos (`Task`, `Category`) y puertos abstractos (`TaskRepository`, `CategoryRepository`).  
   - **Services**: implementaciones concretas (Ionic Storage, stubs Firebase).  
   - **Composición** en `providers/`: `provideLocalTaskAndCategoryRepositories()` vs `provideFirebaseTaskAndCategoryRepositories()` para invertir dependencias (SOLID / DIP).

2. **Standalone components + rutas lazy**  
   - Sin NgModules de feature: `loadChildren` importa `TASKS_ROUTES` / `CATEGORIES_ROUTES` y genera **chunks** separados.

3. **Persistencia local con `@ionic/storage-angular`**  
   - Claves versionadas en `storage-keys.ts` para poder migrar esquemas.

4. **Remote Config con AngularFire**  
   - Defaults en cliente + `fetchAndActivate`; feature flag para UI sensible (p. ej. «Eliminar todas las tareas»).  
   - **AngularFire 20** con **Angular 21** vía **`legacy-peer-deps`** hasta alineación oficial de peers.

5. **Lista de tareas a escala**  
   - **`ChangeDetectionStrategy.OnPush`** + `markForCheck` tras datos async.  
   - **TrackBy** explícito en `@for` y `*cdkVirtualFor`.  
   - **Angular CDK Virtual Scroll** si el filtro activo supera **100** ítems; lista filtrada precomputada para no ejecutar pipes pesados en cada fila virtual.  
   - **`itemSize` fijo** (~88px): asunción de filas de altura uniforme.

6. **Salida de build en `www/`**  
   - Alineado con **Cordova** / flujo típico Ionic.

7. **`.gitignore` de `www/`**  
   - El artefacto de build no se versiona; cada entorno genera `www/` con `ng build`.

---

## Desafíos y limitaciones conocidas

- **Peers Angular / AngularFire:** requiere `.npmrc` o flags manuales; conviene revisar cuando salga AngularFire con soporte peer explícito para tu versión de Angular.  
- **Cordova + iOS:** CocoaPods, **deployment target** (Firebase 12.x → iOS ≥ 15) y **`xcode-select` apuntando a Xcode.app** suelen ser la fuente de errores en equipos nuevos.  
- **Remote Config:** primer valor útil = defaults + caché; la red puede fallar; el servicio contempla fallback.  
- **Virtual scroll CDK:** alturas de ítem muy variables o contenido dinámico alto pueden necesitar ajuste de **`itemSize`** u otra estrategia (paginación).  
- **Firebase en WebView vs nativo:** definir qué API usás para cada capability evita configuraciones contradictorias.  
- **Tareas en volumen extremo:** el repositorio local carga todo en memoria; para miles de registros habría que valorar paginación en Storage o pasar a backend/Firestore con consultas paged.

---

## Resolución de problemas

### General

- **`npx` / Node:** instalá Node LTS y verificá `node -v`, `npm -v`.  
- **Android:** licencias y SDK desde Android Studio.

### iOS: `xcodebuild` requiere Xcode (no solo Command Line Tools)

Apuntá el developer directory a Xcode:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcode-select -p
xcodebuild -version
```

Luego regenerá la plataforma si hace falta:

```bash
npx cordova platform remove ios
npx ionic cordova platform add ios
```

### iOS: CocoaPods no encontrado

```bash
brew install cocoapods
pod --version
```

### iOS: FirebaseCore y «higher minimum deployment target»

En **`config.xml`** (plataforma `ios`) debe existir algo como:

```xml
<preference name="deployment-target" value="15.0" />
```

Si falló la instalación del plugin, limpiá plataforma/plugin y volvé a añadir (ver versiones anteriores del README o la documentación del plugin).

---

## Licencia y autor

Autor: Daniel Enrique Alvarado Fuentes
