# Prueba To‑Do — Ionic, Angular y Cordova

Aplicación híbrida To‑Do con Ionic y Angular. Este documento detalla la instalación de dependencias, la vinculación con Ionic y la configuración de Cordova (Android / iOS), incluida la compatibilidad con Firebase.

## Requisitos previos

- **Node.js** (LTS recomendado, por ejemplo 20.x o 22.x) y **npm**.
- **Ionic CLI**: se instala como dependencia de desarrollo del proyecto (`@ionic/cli`) o globalmente si lo prefieres (`npm install -g @ionic/cli`).
- **Android**
  - [Android Studio](https://developer.android.com/studio) con Android SDK.
  - Variable de entorno **`JAVA_HOME`** apuntando al JDK que usa Android Studio.
  - Licencias del SDK aceptadas (desde Android Studio o `sdkmanager --licenses`).
- **iOS** (solo en **macOS**)
  - **Xcode completo** desde la App Store (no basta solo con «Command Line Tools» para `cordova platform add ios`).
  - Tras instalar Xcode, el directorio activo de desarrollo debe ser **`Xcode.app`** (ver sección de errores de `xcode-select` más abajo).
  - **CocoaPods** (`brew install cocoapods` o `gem install cocoapods`).

> **Nota:** El repositorio incluye `src/app/` y la configuración Cordova en la raíz (`config.xml`, `ionic.config.json`, `package.json`). Para ejecutar `ng serve`, `ng build` o `ionic build` necesitas un proyecto **Angular + Ionic completo** (`angular.json`, dependencias `@angular/*`, `@ionic/angular`, etc.). Si aún no existen, genera una app Ionic en blanco y fusiona este `src/app` o completa el scaffold en esta carpeta.

---

## 1. Instalar dependencias del proyecto

En la raíz del repositorio:

```bash
cd /ruta/a/Prueba_tec
npm install
```

Esto instala, entre otras cosas:

| Paquete            | Rol                                      |
|-------------------|-------------------------------------------|
| `@ionic/cli`      | Comandos `ionic` (build, cordova, etc.)  |
| `cordova`         | Núcleo de Apache Cordova                 |
| `cordova-android` | Plataforma Android (gestión de versiones)|
| `cordova-ios`     | Plataforma iOS                           |

Los scripts útiles definidos en `package.json` son:

| Script                    | Descripción                          |
|---------------------------|--------------------------------------|
| `npm run build`           | `ng build` (requiere proyecto Angular)|
| `npm run ionic:build`     | Igual que `ng build`                 |
| `npm run ionic:serve`     | `ng serve`                           |
| `npm run cordova:prepare` | `ionic cordova prepare`              |
| `npm run cordova:run:android` | `ionic cordova run android`    |
| `npm run cordova:run:ios`     | `ionic cordova run ios`        |
| `npm run cordova:build:android` | `ionic cordova build android --release` |
| `npm run cordova:build:ios`     | `ionic cordova build ios`           |

También puedes usar `npx` para no depender de PATH global:

```bash
npx ionic --version
npx cordova --version
```

---

## 2. Vincular el proyecto con Ionic (opcional)

### Desarrollo local únicamente

Con **`ionic.config.json`** y **`config.xml`** en la raíz, suele bastar para trabajar con Cordova en tu máquina **sin** conectar el repo a Ionic Appflow.

### Ionic Appflow / panel de Ionic

Si quieres enlazar la app a tu cuenta y al dashboard de Ionic:

```bash
npx ionic login
npx ionic link
```

`ionic link` asocia el proyecto a una aplicación en el panel y puede actualizar `ionic.config.json` con identificadores de la app.

---

## 3. Habilitar o refrescar la integración Cordova

Si instalas el proyecto desde cero o clonas sin carpeta `platforms/`, confirma que la integración Cordova esté alineada con la CLI:

```bash
npx ionic integrations enable cordova --add
```

Si ya existe `config.xml` (como en este repo), el comando principalmente **sincroniza** la integración. Si la CLI regenera algo, revisa que el **widget id**, el **nombre** y las **preferencias** de `config.xml` sigan siendo las que necesitas.

---

## 4. Añadir plataformas Android e iOS

Desde la raíz del proyecto, con dependencias ya instaladas:

```bash
npx ionic cordova platform add android
npx ionic cordova platform add ios
```

Comprobar qué plataformas están instaladas:

```bash
npx cordova platform ls
```

### Ejecutar en dispositivo o emulador

Con el **build web** ya generado en `www/` (tras `ionic build` o el flujo de build de tu app Angular):

```bash
npx ionic cordova run android
npx ionic cordova run ios
```

En iOS, la primera vez suele imponerse abrir el workspace en Xcode o resolver pods según los plugins instalados.

---

## 5. Firebase y Cordova (compatibilidad)

### Buenas prácticas

- **No mezcles** varios plugins Firebase antiguos o duplicados (por ejemplo `cordova-plugin-firebase` obsoleto junto a otros). Eso suele provocar conflictos en **Gradle** o dependencias nativas repetidas.
- En **`config.xml`** este proyecto ya incluye preferencias orientadas a **AndroidX** y **Kotlin**, alineadas con plugins Firebase actuales en Cordova.

### Plugin recomendado para servicios nativos Firebase

Para **Analytics**, **FCM**, **Remote Config** nativos, etc., una opción mantenida es:

```bash
npx ionic cordova plugin add cordova-plugin-firebasex
```

Después debes:

1. Añadir **`google-services.json`** (Firebase Console → tu app Android) en la ubicación que indique la documentación del plugin (suele ser la raíz del proyecto Cordova / rutas que el plugin copia al proyecto nativo).
2. Añadir **`GoogleService-Info.plist`** para iOS y configurar el proyecto según la [documentación oficial del plugin](https://github.com/dpa99c/cordova-plugin-firebasex).
3. Seguir las notas del plugin sobre **Pods** en iOS y versiones de **Google Services** en Android si el build falla.

### Solo Firebase en el WebView (`@angular/fire`)

Si tu uso de Firebase es **solo vía JavaScript** dentro del WebView (sin APIs nativas extra), a veces **no** necesitas plugin Cordova; en ese caso evita instalar **dos** integraciones distintas para el mismo producto. Configura dominios autorizados y reglas según la documentación web de Firebase.

---

## 6. Archivos de configuración relevantes

| Archivo              | Descripción                                                |
|---------------------|-------------------------------------------------------------|
| `config.xml`        | Id de la app, nombre, preferencias Cordovar por plataforma |
| `ionic.config.json` | Nombre del proyecto, tipo `angular`, integración `cordova` |
| `package.json`      | Scripts y versiones de `cordova-ios` / `cordova-android`   |
| `www/`              | Salida del build web que empaqueta Cordova (`index.html`…) |

El **id** de aplicación en `config.xml` (`widget id`, p. ej. `com.pruebatec.todo`) debe coincidir con lo que uses en tiendas y en Firebase al registrar las apps nativas.

---

## 7. Resolución de problemas breve

- **`npx` no encontrado:** instala Node.js LTS y reinicia la terminal; comprueba `node -v` y `npm -v`.
- **Android: fallo de licencias o SDK:** abre Android Studio, instala el SDK pedido y acepta licencias.
- **Build sin carpeta Angular completa:** completa el proyecto con `ionic start` (plantilla blank + Angular) o añade `angular.json` y dependencias antes de `ng build` / `ionic build`.

### iOS: «xcodebuild requires Xcode, but active developer directory … CommandLineTools»

Al ejecutar `npx ionic cordova platform add ios` puede aparecer:

`xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance`

Significa que macOS está usando solo las **herramientas de línea de comandos**, no el **Xcode de aplicación**. Cordova y CocoaPods necesitan el SDK de iOS que viene dentro de `Xcode.app`.

**Pasos:**

1. Instala **Xcode** desde la App Store y ábrelo al menos una vez (acepta licencia y deja que terminen componentes opcionales si te lo pide).
2. Apunta `xcode-select` al Xcode correcto (ruta típica):

   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

   Si Xcode está en otra ruta (p. ej. varias versiones), elige la carpeta `…/Xcode.app/Contents/Developer` que quieras usar.

3. Comprueba:

   ```bash
   xcode-select -p
   # Debe mostrar: /Applications/Xcode.app/Contents/Developer
   xcodebuild -version
   ```

4. Licencia (si Xcode lo pide):

   ```bash
   sudo xcodebuild -license accept
   ```

5. Vuelve a preparar la plataforma (por si `platforms/ios` quedó incompleto):

   ```bash
   cd /ruta/a/Prueba_tec
   npx cordova platform remove ios
   npx ionic cordova platform add ios
   ```

### iOS: «CocoaPods was not found» al añadir la plataforma

Al ejecutar `npx ionic cordova platform add ios`, Cordova instala plugins que dependen de **CocoaPods** (`pod`). Si no está instalado, verás un error similar a:

`CocoaPods was not found. Please install version 1.8.0 or greater`

**Solución (elige una):**

1. **Homebrew** (recomendado en macOS reciente / Apple Silicon):

   ```bash
   brew install cocoapods
   pod --version
   ```

   Debe mostrar una versión ≥ 1.8.0.

2. **RubyGems** (si no usas Homebrew):

   ```bash
   sudo gem install cocoapods
   pod --version
   ```

   En macOS con Ruby del sistema muy antiguo, a veces conviene usar **rbenv** / **asdf** con un Ruby reciente y luego `gem install cocoapods` sin `sudo`.

Después **cierra y abre la terminal** (o ejecuta `hash -r`) y vuelve a añadir iOS:

```bash
cd /ruta/a/Prueba_tec
npx ionic cordova platform add ios
```

Si la carpeta `platforms/ios` quedó a medias por el fallo anterior:

```bash
npx cordova platform remove ios
npx ionic cordova platform add ios
```

**Más adelante**, si el build falla por dependencias nativas: desde `platforms/ios` suele ayudar `pod install` o abrir el `.xcworkspace` en Xcode y dejar que resuelva pods; sigue el mensaje concreto de error.

### iOS: «FirebaseCore … required a higher minimum deployment target» al instalar `cordova-plugin-firebasex`

CocoaPods encuentra el pod `FirebaseCore` (p. ej. 12.9.0), pero el **iOS Deployment Target** del proyecto Cordova es demasiado bajo. Los pods de Firebase 12.x declaran **`ios` ≥ 15.0** en su podspec; si el proyecto sigue en 11.x o 13.x, la resolución falla con un mensaje como:

`Specs satisfying the FirebaseCore (= …) dependency were found, but they required a higher minimum deployment target.`

**En este repositorio**, en `config.xml` dentro de `<platform name="ios">` está definido:

```xml
<preference name="deployment-target" value="15.0" />
```

Si cambiaste el archivo o el fallo ocurrió **antes** de añadir esa preferencia, haz una pasada limpia:

```bash
cd /ruta/a/Prueba_tec
npx cordova plugin remove cordova-plugin-firebasex 2>/dev/null || true
npx cordova platform remove ios
npx ionic cordova platform add ios
npx ionic cordova plugin add cordova-plugin-firebasex
```

Si en el futuro un pod de Firebase exigiera **iOS 16+**, sube el valor a `16.0` en esa misma preferencia y vuelve a preparar la plataforma.

Comprueba también que CocoaPods sea reciente (`pod --version`; el podspec de FirebaseCore pide `cocoapods_version` ≥ 1.12.0).

---

## Licencia y autor

Ajusta autor y licencia según tu organización.
