# CI/CD Configuration

Este proyecto está configurado con GitHub Actions para ejecutar tests automáticamente.

## 🚀 Triggers

El workflow se ejecuta automáticamente en los siguientes casos:

### 1. Push a rama `main`
```bash
git push origin main
```
- Ejecuta smoke tests (@smoke)
- Solo en navegador Chromium
- Genera reportes y sube artefactos

### 2. Pull Request a `main`
```bash
# Al crear o actualizar un PR hacia main
```
- Ejecuta smoke tests para validar cambios
- Comenta en el PR con resultados
- Previene merges con tests fallidos

### 3. Ejecución Manual (workflow_dispatch)
Desde GitHub Actions UI puedes ejecutar manualmente:
- Seleccionar entorno (dev/qa/prod)
- Especificar tags personalizados
- Ejecutar suite completa o parcial

## 📋 Jobs Configurados

### Job 1: `test` (Automático)
**Se ejecuta en:** Push y Pull Requests a `main`

**Acciones:**
1. ✅ Checkout del código
2. ✅ Setup Node.js 20.x
3. ✅ Instalación de dependencias (`npm ci`)
4. ✅ Instalación de Playwright Chromium
5. ✅ Configuración de variables de entorno
6. ✅ Ejecución de smoke tests
7. ✅ Generación de reporte HTML
8. ✅ Upload de artefactos (reportes, screenshots, logs)
9. ✅ Comentario en PR con resultados (solo PRs)

**Timeout:** 60 minutos

### Job 2: `all-tests` (Manual)
**Se ejecuta en:** workflow_dispatch solamente

**Acciones:**
1. ✅ Ejecución completa de tests con tags personalizados
2. ✅ Soporte para todos los entornos
3. ✅ Artefactos completos de toda la suite

**Timeout:** 90 minutos

## 📦 Artefactos Generados

Los siguientes artefactos se guardan por **30 días**:

### `test-results-chromium`
```
reports/          # Reportes JSON, HTML, XML
screenshots/      # Screenshots de tests fallidos
videos/          # Videos de ejecución (si habilitado)
logs/            # Logs de ejecución
```

### `cucumber-report-chromium`
```
cucumber-report.html  # Reporte visual HTML
```

## 🔧 Configuración de Entorno

El workflow crea automáticamente un `.env` con:

```env
TEST_ENV=qa              # dev/qa/prod según selección
BROWSER=chromium         # Navegador en uso
HEADLESS=true           # Siempre headless en CI
```

## 📊 Visualización de Resultados

### Durante la Ejecución
1. Ve a **Actions** en tu repositorio
2. Selecciona el workflow run
3. Observa el progreso en tiempo real

### Después de la Ejecución
1. Descarga artefactos desde la pestaña **Summary**
2. Abre `cucumber-report.html` localmente
3. Revisa screenshots/videos de fallos

### En Pull Requests
El bot comentará automáticamente:
```markdown
## 🧪 Test Results

**Browser:** chromium
**Environment:** qa

- ✅ **Passed:** 11/12
- ❌ **Failed:** 1
- ⏭️ **Skipped:** 0
- 📊 **Pass Rate:** 91.67%
- ⏱️ **Duration:** 197.32s

[View detailed report](...)
```

## 🎯 Casos de Uso

### Caso 1: Validar cambios antes de merge
```bash
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git push origin feature/nueva-funcionalidad
# Crear PR → Actions se ejecutan automáticamente
```

### Caso 2: Deploy a producción
```bash
git checkout main
git merge develop
git push origin main
# Smoke tests se ejecutan automáticamente
# Si pasan → deploy manual puede proceder
```

### Caso 3: Regression completo manual
1. Ir a **Actions** → **Cucumber Test Execution**
2. Click **Run workflow**
3. Seleccionar:
   - Environment: `prod`
   - Tags: `@regression`
4. Click **Run workflow**

### Caso 4: Tests específicos
```yaml
Tags: @login and @positive
```
o
```yaml
Tags: @user-management or @dashboard
```

## ⚙️ Personalización

### Cambiar navegadores
En `.github/workflows/test.yml`:
```yaml
matrix:
  browser: [chromium, firefox, webkit]  # Agregar más browsers
```

### Agregar entornos
```yaml
options:
  - dev
  - qa
  - staging  # Nuevo
  - prod
```

### Modificar schedule (opcional)
Agregar ejecuciones programadas:
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Diario a las 2 AM UTC
```

## 🔒 Secrets y Variables

Si necesitas credenciales privadas, agrégalas como **Secrets**:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Agrega:
   - `QA_USERNAME`
   - `QA_PASSWORD`
   - `PROD_USERNAME`
   - `PROD_PASSWORD`

Luego úsalas en el workflow:
```yaml
- name: Create .env file
  run: |
    echo "QA_USERNAME=${{ secrets.QA_USERNAME }}" >> .env
    echo "QA_PASSWORD=${{ secrets.QA_PASSWORD }}" >> .env
```

## 📈 Mejores Prácticas

1. ✅ **Ejecuta smoke tests en cada push** (configuración actual)
2. ✅ **Regression completo solo manualmente o scheduled**
3. ✅ **Revisa artefactos de tests fallidos** antes de hacer merge
4. ✅ **Mantén los tests rápidos** (smoke < 5 min)
5. ✅ **Usa tags apropiadamente** para control granular

## 🐛 Troubleshooting

### Tests fallan en CI pero pasan localmente
- Verifica timeouts (pueden ser más lentos en CI)
- Revisa screenshots/videos de fallos
- Asegúrate de usar `HEADLESS=true`

### Workflow no se ejecuta
- Verifica que el archivo esté en `.github/workflows/`
- Confirma que el push fue a rama `main`
- Revisa permisos de GitHub Actions en Settings

### Artefactos no disponibles
- Verifica que el step `upload-artifact` se ejecutó
- Los artefactos expiran después de 30 días
- Descárgalos antes de que expiren

## 📝 Logs

Para debug detallado, habilita logs:
```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

## 🔗 Enlaces Útiles

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Cucumber CI Best Practices](https://cucumber.io/docs/guides/continuous-integration/)

---

**Última actualización:** 8 de enero de 2026
