### Configuración de VS Code para NestJS en este workspace

Este documento resume las configuraciones agregadas en `.vscode/` para mejorar la productividad y la coherencia al trabajar con NestJS en este proyecto.

### Archivos creados/actualizados

- `/.vscode/settings.json`: Preferencias del editor y tema de íconos.
- `/.vscode/launch.json`: Perfiles de depuración para la app y pruebas.
- `/.vscode/tasks.json`: Tareas comunes de desarrollo (build, test, lint, etc.).
- `/.vscode/extensions.json`: Extensiones recomendadas para este proyecto.

### Detalles de configuración y razón

- **Iconos NestJS (Material Icon Theme)**
  - `workbench.iconTheme: material-icon-theme` y `material-icon-theme.activeIconPack: nest`.
  - Asociación `*.*.ts → nestjs` para mostrar el ícono de Nest en todos los archivos TypeScript de este proyecto.
  - **Razón**: Mejorar reconocimiento visual de archivos NestJS y navegación.

- **Formato y linting automáticos**
  - `editor.formatOnSave: true`, `editor.defaultFormatter: esbenp.prettier-vscode`.
  - `editor.codeActionsOnSave`: `source.organizeImports` y `source.fixAll.eslint` activados.
  - `eslint.validate`: TypeScript y JavaScript.
  - **Razón**: Código consistente, imports ordenados y problemas de lint resueltos al guardar.

- **TypeScript del workspace**
  - `typescript.tsdk: node_modules/typescript/lib` y `typescript.updateImportsOnFileMove.enabled: always`.
  - **Razón**: Usar la versión de TS del proyecto y mantener imports correctos en refactors.

- **Exclusiones de ruido y rendimiento**
  - `files.exclude`, `search.exclude` y `files.watcherExclude` para `dist/` y `coverage/`.
  - **Razón**: Búsquedas y watchers más rápidos, explorador limpio.

- **Gestor de paquetes**
  - `npm.packageManager: pnpm`.
  - **Razón**: Alinear VS Code con el gestor usado por el proyecto.

- **Nesting de archivos (agrupación por dominio Nest)**
  - `explorer.fileNesting.enabled: true` y patrones que agrupan `*.module.ts` con `controller`, `service`, `resolver`, `gateway`, `guard`, `interceptor`, `pipe`, `filter`, `strategy`, `dto`, `entity`, `schema`, `repository`, `factory`, `spec`, `e2e-spec`, `mock`.
  - Además agrupa derivados de `*.controller.ts`, `*.service.ts`, etc.
  - **Razón**: Mantener los artefactos de un mismo módulo juntos y reducir ruido visual.

- **Integración con Jest**
  - `jest.jestCommandLine: "pnpm test --"` y `jest.autoRun: watch`.
  - **Razón**: Mejor soporte para ejecución de pruebas desde el editor.

- **Asociaciones de archivos útiles**
  - `.env` y `.env.*` como `dotenv`; `*.http` como `http`.
  - **Razón**: Resaltado adecuado para variables de entorno y peticiones HTTP.

- **Spell checking contextual**
  - `cSpell.words` con términos comunes de NestJS (e.g., `dto`, `guard`, `interceptor`).
  - **Razón**: Reducir falsos positivos del corrector ortográfico.

- **Depuración (launch.json)**
  - `NestJS: Debug app`: ejecuta `pnpm run start:debug` con reattach automático y source maps.
  - `Jest: Unit Tests` y `Jest: E2E Tests`: lanzadores para pruebas unitarias y end-to-end.
  - **Razón**: Arranque rápido de debug y pruebas desde VS Code.

- **Tareas (tasks.json)**
  - `Nest: Start dev`, `Nest: Build`, `Nest: Lint`, `Nest: Test`, `Nest: Test watch`, `Nest: Test e2e`.
  - **Razón**: Ejecutar comandos comunes sin salir del editor, integrados con problem matchers de TypeScript.

- **Extensiones recomendadas (extensions.json)**
  - ESLint, Prettier, Material Icon Theme, Jest/Jest Runner, REST Client, DotENV, Thunder Client, GitLens, EditorConfig, Path Intellisense, Error Lens, entre otras.
  - **Razón**: Mejorar calidad, DX y flujo de trabajo típico en NestJS.

### Notas de uso

- Tras instalar las extensiones recomendadas, recarga la ventana de VS Code para aplicar íconos y reglas.
- Para depurar, abre la vista Run and Debug y selecciona un perfil (por ejemplo, `NestJS: Debug app`).
- Las tareas están disponibles en `Terminal → Run Task...`.

### Futuras mejoras (opcionales)

- Si se configuran aliases en `tsconfig.json` (`baseUrl`/`paths`), considerar `"typescript.preferences.importModuleSpecifier": "non-relative"` para imports más limpios.
