# Page Object Model (POM) - Guía de Buenas Prácticas

## 🎯 Principio Fundamental

**NUNCA accedas directamente a `this.page!` con locators en los step definitions**

❌ **MAL - Violación del POM**:
```typescript
// login.steps.ts
When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  await this.page!.getByPlaceholder('Username').fill(username);  // ❌ Locator hardcodeado
});
```

✅ **BIEN - Siguiendo POM**:
```typescript
// login.steps.ts
When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.enterUsername(username);  // ✅ Método del Page Object
});
```

---

## 📋 Reglas del POM

### Regla 1: Locators SOLO en Page Objects
**Todos los selectores CSS, XPath, role-based, etc. deben estar en el Page Object**

```typescript
// ✅ LoginPage.ts
export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
  
  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }
}
```

### Regla 2: Steps = Acciones de Usuario, NO Implementación Técnica
**Los steps deben ser legibles y abstractos**

```gherkin
# ✅ Enfoque de usuario (lo que VE el usuario)
When I enter username "Admin"
And I enter password "admin123"
And I click the login button

# ❌ Enfoque técnico (lo que hace el código)
When I fill the input with placeholder "Username" with "Admin"
And I locate button by role "button" and click it
```

### Regla 3: Una Acción = Un Método en Page Object
**Cada acción atómica debe tener su método**

```typescript
// ✅ LoginPage.ts - Métodos granulares
async enterUsername(username: string): Promise<void> { }
async enterPassword(password: string): Promise<void> { }
async clickLoginButton(): Promise<void> { }

// ✅ También métodos compuestos
async login(username: string, password: string): Promise<void> {
  await this.enterUsername(username);
  await this.enterPassword(password);
  await this.clickLoginButton();
}
```

### Regla 4: Step Definitions = Orquestadores
**Los steps solo orquestan, no implementan lógica de UI**

```typescript
// ✅ login.steps.ts - Solo orquestación
let loginPage: LoginPage;

Given('I am on the login page', async function(this: ICustomWorld) {
  loginPage = new LoginPage(this.page!);
  await loginPage.goto();
});

When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  await loginPage.enterUsername(username);
});

When('I login with {string} and {string}', async function(this: ICustomWorld, user: string, pass: string) {
  await loginPage.login(user, pass);  // Método compuesto
});
```

---

## 🔧 Refactorización Práctica

### Ejemplo Completo: Refactorizar Login Steps

#### ❌ ANTES (Violando POM)

```typescript
// login.steps.ts - MAL
When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  await this.page!.getByPlaceholder('Username').fill(username);
});

Then('I should see the forgot password link', async function(this: ICustomWorld) {
  const link = this.page!.getByText('Forgot your password?');
  await expect(link).toBeVisible();
});

When('I click on user dropdown', async function(this: ICustomWorld) {
  const dropdown = this.page!.locator('.oxd-userdropdown-tab');
  await dropdown.click();
});
```

#### ✅ DESPUÉS (Siguiendo POM)

**Paso 1: Agregar métodos al Page Object**
```typescript
// LoginPage.ts - Agregar métodos
export class LoginPage extends BasePage {
  private readonly forgotPasswordLink: Locator;
  
  constructor(page: Page) {
    super(page);
    this.forgotPasswordLink = page.getByText('Forgot your password?');
  }
  
  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }
  
  async isForgotPasswordLinkVisible(): Promise<boolean> {
    return await this.isVisible(this.forgotPasswordLink);
  }
  
  async clickForgotPasswordLink(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }
}

// DashboardPage.ts - Para elementos del dashboard
export class DashboardPage extends BasePage {
  private readonly userDropdown: Locator;
  private readonly logoutOption: Locator;
  
  constructor(page: Page) {
    super(page);
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutOption = page.getByRole('menuitem', { name: 'Logout' });
  }
  
  async clickUserDropdown(): Promise<void> {
    await this.click(this.userDropdown);
  }
  
  async clickLogout(): Promise<void> {
    await this.click(this.logoutOption);
  }
}
```

**Paso 2: Actualizar Steps**
```typescript
// login.steps.ts - BIEN
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

When('I enter username {string}', async function(this: ICustomWorld, username: string) {
  loginPage = loginPage || new LoginPage(this.page!);
  await loginPage.enterUsername(username);
});

Then('I should see the forgot password link', async function(this: ICustomWorld) {
  loginPage = loginPage || new LoginPage(this.page!);
  const isVisible = await loginPage.isForgotPasswordLinkVisible();
  expect(isVisible).toBeTruthy();
});

When('I click on user dropdown', async function(this: ICustomWorld) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  await dashboardPage.clickUserDropdown();
});

When('I click logout', async function(this: ICustomWorld) {
  dashboardPage = dashboardPage || new DashboardPage(this.page!);
  await dashboardPage.clickLogout();
});
```

---

## 🏗️ Estructura de Archivos Correcta

```
src/
├── pages/                           # 📂 Todos los locators y acciones de UI aquí
│   ├── BasePage.ts                  # Métodos reutilizables (click, fill, wait)
│   ├── LoginPage.ts                 # Locators + métodos de login
│   ├── DashboardPage.ts             # Locators + métodos de dashboard
│   ├── PIMPage.ts                   # Locators + métodos de PIM
│   └── LeavePage.ts                 # Locators + métodos de Leave
│
├── step-definitions/                # 📂 Solo orquestación, NO locators
│   ├── login.steps.ts               # Llama métodos de LoginPage
│   ├── dashboard.steps.ts           # Llama métodos de DashboardPage
│   └── pim.steps.ts                 # Llama métodos de PIMPage
│
└── support/
    └── CustomWorld.ts               # Proporciona this.page! a los steps
```

---

## 🚨 Violaciones Comunes a Evitar

### ❌ Violación 1: Locator en Step Definition
```typescript
// ❌ MAL
Then('I should see validation errors', async function(this: ICustomWorld) {
  const errors = this.page!.locator('.oxd-input-field-error-message');
  expect(await errors.count()).toBeGreaterThan(0);
});
```

**✅ Solución**: Mover a Page Object
```typescript
// LoginPage.ts
async getValidationErrorsCount(): Promise<number> {
  const errors = this.page.locator('.oxd-input-field-error-message');
  return await errors.count();
}

// login.steps.ts
Then('I should see validation errors', async function(this: ICustomWorld) {
  loginPage = loginPage || new LoginPage(this.page!);
  const count = await loginPage.getValidationErrorsCount();
  expect(count).toBeGreaterThan(0);
});
```

### ❌ Violación 2: CSS Selector Hardcoded
```typescript
// ❌ MAL
const logo = this.page!.locator('img[alt*="logo"], img[alt*="company"]').first();
```

**✅ Solución**: Definir en constructor del Page Object
```typescript
// LoginPage.ts
private readonly logoImage: Locator;

constructor(page: Page) {
  super(page);
  this.logoImage = page.locator('img[alt*="logo"], img[alt*="company"]').first();
}

async isLogoVisible(): Promise<boolean> {
  return await this.isVisible(this.logoImage);
}
```

### ❌ Violación 3: Lógica de Negocio en Steps
```typescript
// ❌ MAL - Lógica en step
When('I search for {string}', async function(this: ICustomWorld, term: string) {
  await this.page!.getByPlaceholder('Search').fill(term);
  await this.page!.keyboard.press('Enter');
  await this.page!.waitForLoadState('networkidle');
  await this.page!.waitForSelector('.search-results', { timeout: 5000 });
});
```

**✅ Solución**: Encapsular en Page Object
```typescript
// SearchPage.ts
async searchFor(term: string): Promise<void> {
  await this.fill(this.searchInput, term);
  await this.page.keyboard.press('Enter');
  await this.waitForPageLoad();
  await this.waitForElement(this.searchResults, 5000);
}

// search.steps.ts
When('I search for {string}', async function(this: ICustomWorld, term: string) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.searchFor(term);
});
```

---

## 💡 Beneficios del POM Correcto

### ✅ Mantenibilidad
**Si cambia el selector de un elemento, cambias UN solo lugar**
```typescript
// LoginPage.ts - Cambio en UN lugar
constructor(page: Page) {
  // Cambió de placeholder a id
  this.usernameInput = page.locator('#username');  // Antes: getByPlaceholder('Username')
}

// Todos los steps siguen funcionando sin cambios 🎉
```

### ✅ Reusabilidad
**Métodos reutilizables en múltiples steps**
```typescript
// Diferentes steps usan el mismo método
When('I enter username {string}', ...) {
  await loginPage.enterUsername(username);
}

When('I login quickly', ...) {
  await loginPage.enterUsername('Admin');  // Reutiliza
  await loginPage.enterPassword('admin123');
}
```

### ✅ Legibilidad
**Steps limpios y expresivos**
```typescript
// ✅ Fácil de leer y entender
When('I login with {string} and {string}', async function(user, pass) {
  await loginPage.login(user, pass);
});

// ❌ Difícil de leer y mantener
When('I login with {string} and {string}', async function(user, pass) {
  await this.page!.getByPlaceholder('Username').fill(user);
  await this.page!.getByPlaceholder('Password').fill(pass);
  await this.page!.getByRole('button', { name: 'Login' }).click();
  await this.page!.waitForLoadState('networkidle');
});
```

### ✅ Testabilidad
**Page Objects pueden tener su propia lógica de espera**
```typescript
// LoginPage.ts - Lógica de espera encapsulada
async clickLoginButton(): Promise<void> {
  await this.click(this.loginButton);
  
  // Espera inteligente basada en el contexto
  try {
    await this.page.waitForURL(/.*dashboard/, { timeout: 5000 });
  } catch {
    // Si no redirige, probablemente hay error
    await this.waitForElement(this.errorMessage, 2000);
  }
}
```

---

## 📝 Checklist de Refactorización

Antes de hacer commit, revisa:

- [ ] **¿Hay `this.page!.locator()` en step definitions?** → Mover a Page Object
- [ ] **¿Hay `this.page!.getByRole()` en step definitions?** → Mover a Page Object  
- [ ] **¿Hay `this.page!.getByPlaceholder()` en step definitions?** → Mover a Page Object
- [ ] **¿Hay CSS selectors en step definitions?** → Mover a Page Object
- [ ] **¿Los Page Objects tienen métodos para todas las acciones?** → Agregar métodos faltantes
- [ ] **¿Los steps solo llaman métodos de Page Objects?** → Refactorizar steps
- [ ] **¿Los métodos de Page Objects retornan tipos claros?** → `Promise<void>`, `Promise<boolean>`, `Promise<string>`
- [ ] **¿Los Page Objects extienden BasePage?** → Heredar métodos reutilizables

---

## 🎓 Ejemplos de Arquitectura Enterprise

### Opción 1: Page Object por Módulo
```
pages/
├── auth/
│   ├── LoginPage.ts
│   └── ForgotPasswordPage.ts
├── pim/
│   ├── EmployeeListPage.ts
│   └── AddEmployeePage.ts
└── leave/
    ├── LeaveListPage.ts
    └── ApplyLeavePage.ts
```

### Opción 2: Page Components (Componentes Compartidos)
```
pages/
├── components/
│   ├── NavigationComponent.ts      # Sidebar, header
│   ├── TableComponent.ts           # Tablas genéricas
│   └── FormComponent.ts            # Forms reutilizables
├── LoginPage.ts                    # Usa NavigationComponent
└── DashboardPage.ts                # Usa NavigationComponent + TableComponent
```

### Ejemplo de Component Reusable
```typescript
// NavigationComponent.ts
export class NavigationComponent extends BasePage {
  private readonly userDropdown: Locator;
  private readonly logoutOption: Locator;
  private readonly menuItems: Locator;
  
  async clickLogout(): Promise<void> {
    await this.click(this.userDropdown);
    await this.click(this.logoutOption);
  }
  
  async navigateToModule(moduleName: string): Promise<void> {
    const module = this.page.getByRole('link', { name: moduleName });
    await this.click(module);
  }
}

// DashboardPage.ts - Usa el componente
export class DashboardPage extends BasePage {
  readonly navigation: NavigationComponent;
  
  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);
  }
}

// dashboard.steps.ts
When('I logout', async function(this: ICustomWorld) {
  const dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.navigation.clickLogout();  // Usa componente reutilizable
});
```

---

## 🔗 Referencias

- **Martin Fowler - Page Object Pattern**: https://martinfowler.com/bliki/PageObject.html
- **Playwright Best Practices**: https://playwright.dev/docs/pom
- **Cucumber Anti-patterns**: https://cucumber.io/docs/guides/anti-patterns/

---

## 📊 Estado Actual del Proyecto

### Archivos que NECESITAN refactorización:
1. ✅ `src/step-definitions/login.steps.ts` - **Parcialmente refactorizado** (pasos 15-27 ya corregidos)
2. ❌ `src/step-definitions/login.steps.ts` - **Violaciones restantes** (pasos 48, 75, 82, 95, 101, 107, 113, 119, 125, 131, 149, 156, 164, 170)
3. ❌ `src/step-definitions/dashboard.steps.ts` - **Múltiples violaciones**

### Prioridad de refactorización:
1. **Alta**: Steps de validación de UI (locators hardcoded para verificaciones)
2. **Media**: Steps de navegación (usar DashboardPage/NavigationComponent)
3. **Baja**: Steps genéricos (ya tienen abstracción parcial)

### Tarea pendiente:
**Refactorizar completamente `login.steps.ts` y `dashboard.steps.ts` siguiendo esta guía**
