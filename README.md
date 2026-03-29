# Prueba técnica — Lista de tareas híbrida (Ionic + Angular + Cordova)

Aplicación híbrida de **lista de tareas** con **Ionic 8**, **Angular 21** y **Apache Cordova**; almacenamiento local (**@ionic/storage-angular**), integración con **Firebase** (**AngularFire**) y **Remote Config** (feature flag), y arquitectura alineada con **Clean Architecture** y buenas prácticas de rendimiento.

---

## Contenido

1. [Cumplimiento de los requisitos de la prueba](#cumplimiento-de-los-requisitos-de-la-prueba)  
2. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)  
3. [Entregables de la prueba](#entregables-de-la-prueba)  
4. [Decisiones técnicas](#decisiones-técnicas)  
5. [Preguntas de la prueba (desafíos, optimización y calidad)](#preguntas-de-la-prueba-desafíos-optimización-y-calidad)  
6. [Control de versiones con Git](#control-de-versiones-con-git)  
7. [Configuración de Firebase y Remote Config](#configuración-de-firebase-y-remote-config)  
8. [Archivos de configuración relevantes](#archivos-de-configuración-relevantes)  
9. [Desafíos y limitaciones conocidas](#desafíos-y-limitaciones-conocidas)  
10. [Requisitos previos del entorno](#requisitos-previos-del-entorno)  
11. [Licencia y autoría](#licencia-y-autoría)  

---

## Cumplimiento de los requisitos de la prueba

| Requisito | Estado | Ubicación / notas |
|-----------|--------|-------------------|
| **Lista de tareas: agregar, completar y eliminar** | Cumple | `src/app/features/tasks/pages/task-list/` — altas, casilla de completado y eliminación por ítem; opción «Eliminar todas» si el feature flag lo habilita. |
| **Almacenamiento local** | Cumple | `LocalTaskRepository` / `LocalCategoryRepository` con `@ionic/storage-angular`; `provideIonicAppStorage()` y `provideLocalTaskAndCategoryRepositories()` en `app.config.ts`. |
| **Categorías: CRUD** | Cumple | `src/app/features/categories/pages/category-list/` — creación y edición (diálogos), eliminación con gesto de deslizamiento; al eliminar una categoría se desvinculan las tareas asociadas. |
| **Asignar categoría a cada tarea** | Cumple | Campo `categoryId` en el modelo `Task`; selector al crear la tarea en `task-list`. |
| **Filtrar tareas por categoría** | Cumple | Segmento (Todas / Sin categoría / por identificador) y lista filtrada; lógica en `task-category-filter.ts` y lista precomputada para mejorar el rendimiento. |
| **Cordova Android e iOS** | Cumple en estructura | `config.xml`, `ionic.config.json`, `package.json` (sección `cordova` y plataformas). |
| **Firebase y Remote Config (feature flag)** | Cumple | `provideFirebaseAndRemoteConfig()`, `AppRemoteConfigService`, clave `feature_show_delete_all_tasks` en `remote-config-keys.ts`; plantilla de ejemplo `remoteconfig.template.json`. |
| **Optimización de rendimiento** | Cumple | Rutas con **carga diferida (lazy)**; **OnPush** y `markForCheck`; **trackBy** en listas; **CDK Virtual Scroll** cuando hay **más de 100** tareas filtradas; lista filtrada sin pipe en la ruta crítica del virtual scroll. |
| **Clean Architecture / SOLID** | Cumple | `core/` (modelos y puertos), `services/` (implementaciones), `providers/` (composición), `features/` y `shared/`. |
| **README detallado** | Cumple | El presente documento. |
| **Control de versiones en Git (repositorio público)** | Responsabilidad de entrega | Publicar en **GitHub o GitLab** con visibilidad pública y compartir el enlace en la entrega; el desarrollo se realiza en rama según las instrucciones del evaluador. |
| **Capturas de pantalla o video** | Entrega externa al código | Incluir en la entrega (por ejemplo, enlace a Drive, enlace en el README o carpeta opcional `docs/media/`). |

**Nota sobre credenciales:** la configuración web de Firebase se define en `src/environments/firebase.web.ts` (y archivos de entorno); no se recomienda publicar credenciales sensibles en repositorios públicos sin las debidas precauciones.

---

## Cómo ejecutar el proyecto

### Requisitos mínimos

- **Node.js LTS** (se recomienda la rama 20.x o 22.x) y **npm**.  
- El proyecto incluye **`.npmrc`** con `legacy-peer-deps=true` para compatibilidad entre **Angular 21** y **AngularFire 20**.

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone <URL_DEL_REPOSITORIO_PUBLICO>
cd Prueba_tec
npm install
```

### 2. Configurar Firebase (obligatorio para iniciar la aplicación)

1. Cree un proyecto en [Firebase Console](https://console.firebase.google.com/) y registre una aplicación **Web**.  
2. Copie la configuración en **`src/environments/firebase.web.ts`**.  
3. En **Remote Config**, cree el parámetro **`feature_show_delete_all_tasks`** (tipo booleano). Un valor `false` oculta la acción «Eliminar todas»; un valor `true` la muestra después de `fetch` y `activate`.  
4. Opcional: sincronizar la plantilla mediante la CLI; el archivo **`remoteconfig.template.json`** en la raíz está alineado con `remote-config-keys.ts`.

### 3. Desarrollo en el navegador

```bash
npm start
# equivalente: npx ng serve
```

Abra la URL que indique la consola (habitualmente `http://localhost:4200/`). La aplicación redirige a **`/tasks`**. Rutas principales: **`/tasks`**, **`/categories`**.

### 4. Compilar el paquete de producción

```bash
npx ng build
# entorno de desarrollo con source maps:
npx ng build --configuration development
```

La salida se genera en **`www/`** (según `angular.json`). La carpeta **`www/`** figura en **`.gitignore`**.

---

## Entregables de la prueba

De acuerdo con el enunciado, la entrega suele incluir:

| # | Entregable | Acción en este repositorio / en la entrega |
|---|------------|---------------------------------------------|
| 1 | **Código fuente** en Git (repositorio **público**) | https://github.com/Alva09/To-do_app.git la rama que tiene el proyecto es la **full-app**|
| 2 | **README** con instrucciones de ejecución y descripción de cambios | Este documento: ejecución, cumplimiento de requisitos, decisiones técnicas y respuestas a las preguntas planteadas. |
| 3 | **Capturas de pantalla o video** de las funcionalidades | Se envían adjuntas al correo |
| 4 | **Respuestas** a las preguntas técnicas | Sección [Preguntas de la prueba](#preguntas-de-la-prueba-desafíos-optimización-y-calidad). |

---

## Decisiones técnicas

1. **Clean Architecture de carácter pragmático**  
   - **Dominio** en `core/models` e **interfaces** (puertos `TaskRepository`, `CategoryRepository`).  
   - **Infraestructura** en `services/` (Ionic Storage, integración con Firebase).  
   - **Inversión de dependencias:** `app.config.ts` y `providers/repository.providers.ts` seleccionan la implementación sin acoplar las pantallas al detalle del almacenamiento.

2. **Ionic y Angular en modo standalone**  
   - Sin módulos de característica (NgModules); **carga diferida** mediante `loadChildren` hacia `TASKS_ROUTES` y `CATEGORIES_ROUTES` para reducir la carga inicial y generar fragmentos (chunks) separados.

3. **Persistencia local**  
   - **@ionic/storage-angular** con claves versionadas (`storage-keys.ts`) para facilitar migraciones futuras.

4. **Firebase dentro del WebView**  
   - **AngularFire** (`initializeApp` y `Remote Config`) para el feature flag; coherente con la aplicación Ionic/Cordova como **WebView**. El complemento **cordova-plugin-firebasex** queda disponible para capacidades **nativas** si se requiere; se evita duplicar la misma lógica del flag en dos capas.

5. **Feature flag**  
   - Parámetro **`feature_show_delete_all_tasks`:** valores predeterminados en el cliente (`REMOTE_CONFIG_DEFAULTS`) y `defaultConfig` en `getRemoteConfig` hasta que responda la red; observable `showDeleteAllTasks$` en la interfaz.

6. **Rendimiento con listas extensas**  
   - **OnPush** y **`markForCheck`** tras operaciones asíncronas.  
   - **TrackBy** (`task.id`, `category.id`) en `@for` y `*cdkVirtualFor`.  
   - **Lista filtrada materializada** en el componente (se evita ejecutar un pipe por cada fila del virtual scroll).  
   - **Angular CDK Virtual Scroll** únicamente si hay **más de 100** elementos en el filtro activo; en ese modo, `ion-content` desactiva el desplazamiento nativo para que el CDK controle el viewport.  
   - **`itemSize` fijo** (aproximadamente 88 px): equilibrio entre simplicidad y filas de altura variable.

7. **Directorio de salida del build**  
   - **Angular** genera el paquete en **`www/`**. El archivo **`firebase.json`** apunta a **`public/`** para pruebas con Firebase Hosting; no debe confundirse con la salida del CLI de Angular (`www/`).

---

## Preguntas de la prueba (desafíos, optimización y calidad)

### ¿Cuáles fueron los principales desafíos al implementar las nuevas funcionalidades?

- **Compatibilidad de versiones** entre **Angular 21** y **AngularFire 20** (dependencias peer), abordada mediante **`.npmrc`** con `legacy-peer-deps`.  
- **Remote Config:** definir un flujo claro de **valores predeterminados** en el cliente mientras se completa `fetchAndActivate`, sin parpadeos en la interfaz ni depender exclusivamente de la red.  
- **Listas extensas:** combinar **OnPush**, filtrado eficiente y **virtual scroll** sin deteriorar la experiencia con Ionic (`ion-content`, alturas de fila).

### ¿Qué técnicas de optimización aplicó y por qué?

| Ámbito | Técnica | Justificación |
|--------|---------|---------------|
| **Carga inicial** | Rutas con **carga diferida** por característica (`tasks`, `categories`) | Reduce el tamaño del bundle inicial y acelera el primer renderizado. |
| **Actualización de la vista** | **OnPush** y **`markForCheck`** tras actualizar datos | Disminuye ciclos innecesarios de detección de cambios. |
| **Listas** | **trackBy** / `track` estable por `id` | Reduce la reconciliación del DOM al actualizar colecciones. |
| **Gran número de tareas** | Lista filtrada **precomputada** y **CDK Virtual Scroll** si hay **más de 100** elementos | Menor cantidad de nodos en el DOM y menor uso de memoria en listas largas. |
| **Remote Config** | Valores predeterminados en **`defaultConfig`** y emisión inicial local | Experiencia de usuario predecible y menor bloqueo si la red falla o es lenta. |

### ¿Cómo aseguró la calidad y la mantenibilidad del código?

- **Separación por capas** (core, services, features, shared) y **contratos** explícitos (repositorios abstractos).  
- **Nombres y claves centralizados** (`remote-config-keys.ts`, `storage-keys.ts`).  
- **Tipado estricto** con TypeScript y plantillas alineadas con el compilador de Angular.  
- **README** y plantilla (`remoteconfig.template.json`) para facilitar la reproducibilidad.  
- **Compilación verificable** mediante `ng build`.

---

## Control de versiones con Git

- Realizar **fork** del repositorio o clonar el remoto indicado por el evaluador.  
- Desarrollar en una **rama** dedicada (TDO-001, TDO002, TDO003).  
- Registrar **commits** atómicos con mensajes claros y descriptivos.  
- Publicar el código en un repositorio **público** y enviar el **enlace**.

---

## Configuración de Firebase y Remote Config

| Archivo | Propósito |
|---------|-----------|
| `src/environments/firebase.web.ts` | Configuración Firebase de la aplicación web. |
| `src/environments/environment.ts` / `environment.prod.ts` | Indicador `production` y referencia a la configuración web. |
| `src/app/core/config/remote-config-keys.ts` | Nombres de parámetros y valores predeterminados locales. |
| `src/app/providers/firebase.providers.ts` | `provideFirebaseApp`, `provideRemoteConfig`, `defaultConfig`. |
| `src/app/services/remote-config/app-remote-config.service.ts` | `fetchAndActivate` y observables (`showDeleteAllTasks$`). |
| `remoteconfig.template.json` | Referencia para Remote Config (consola o `firebase deploy --only remoteconfig`). |
| `firebase.json` | Hosting opcional (`public/`) y referencia a la plantilla de Remote Config. |

**Comprobación del feature flag:** en Firebase Console → Remote Config, publique `feature_show_delete_all_tasks` con valor `true` y abra la aplicación: debe mostrarse la acción **«Eliminar todas»**. Con valor `false`, el botón no debe mostrarse (tras aplicar los valores remotos y según el comportamiento de la caché).

---

## Archivos de configuración relevantes

| Archivo | Descripción |
|---------|-------------|
| `angular.json` | Build hacia **`www/`**, configuraciones `development` y `production`. |
| `src/main.ts` | `bootstrapApplication(AppComponent, appConfig)`. |
| `src/app/app.config.ts` | Proveedores globales de la aplicación. |
| `src/app/app.routes.ts` | Rutas y carga diferida. |
| `config.xml` | Identificador, nombre de la aplicación Cordova y recursos por plataforma. |
| `ionic.config.json` | Tipo `angular`, integración con `cordova`. |
| `.npmrc` | `legacy-peer-deps=true`. |

---

## Desafíos y limitaciones conocidas

- **Dependencias peer** entre AngularFire y Angular y la necesidad de `legacy-peer-deps`.  
- **Virtual scroll:** `itemSize` fijo; títulos muy largos en varias líneas pueden requerir ajustes o paginación.  
- **Repositorio local:** los datos residen en memoria en el almacenamiento del dispositivo; volúmenes extremos pueden requerir paginación o un backend.  
- La carpeta **`public/`** en `firebase.json` corresponde a **Firebase Hosting** de prueba; el build de la aplicación Ionic utiliza **`www/`**.

---

## Requisitos previos del entorno

| Componente | Detalle |
|------------|---------|
| **Node.js** | LTS **20.x o 22.x** (recomendado). |
| **npm** | Incluido con la instalación de Node.js. |

---

## Licencia y autoría

Autor: Daniel Enrique Alvarado Fuentes