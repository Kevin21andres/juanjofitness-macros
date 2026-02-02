# 🥗 JuanjoFitness Macros

## 🚦 Estado del proyecto

**JuanjoFitness Macros v1.0**  
La aplicación ha alcanzado su **primera versión estable**, con todas las funcionalidades base implementadas y operativas en entorno de producción.

Incluye:
- Gestión completa de clientes
- Creación y edición de dietas
- Cálculo automático de macronutrientes
- Generación de PDFs profesionales
- Compartición segura de dietas mediante enlace
- Interfaz responsive y coherente

A partir de esta versión, el desarrollo se centra en **mejoras incrementales y nuevas funcionalidades**.


Aplicación web para **gestión nutricional profesional**, orientada a entrenadores y nutricionistas.  
Permite crear clientes, diseñar dietas por comidas, calcular macronutrientes, generar PDFs profesionales y compartir dietas mediante enlaces públicos seguros.

---

## ✨ Características principales

### 👤 Gestión de clientes
- Crear, editar y eliminar clientes
- Información de contacto (email, teléfono)
- Notas personalizadas por cliente
- Historial completo de dietas

### 🍽️ Planificación de dietas
- Creación de dietas por **comidas diarias**
- Selección de alimentos con cantidades en gramos
- Cálculo automático de:
  - Calorías
  - Proteína
  - Carbohidratos
  - Grasas
- Dieta activa + histórico de dietas anteriores

### 📝 Notas y recomendaciones
- Campo de notas por dieta
- Ideal para:
  - Suplementación
  - Indicaciones generales
  - Ajustes personalizados
- Visible en app, PDF y enlace compartido

### 📊 Visualización de macros
- Resumen diario
- Gráficos visuales (donut de macronutrientes)
- Totales por comida y por día

### 📄 Exportación y compartición
- Generación de **PDF profesional**
- Enlaces públicos de dieta (sin login)
- Vista responsive para móvil y desktop

### 🔐 Autenticación
- Login privado con Supabase Auth
- Acceso restringido al panel
- Enlaces compartidos aislados por token

---

## 🖼️ Estilo visual

- Modo oscuro por defecto
- Identidad corporativa:
  - Fondo: `#0B0B0B`
  - Texto: `#FFFFFF`
  - Color acento: `#1E90FF` (azul eléctrico)
- UI consistente basada en cards
- Totalmente responsive

---

## 🧱 Stack tecnológico

### Frontend
- **Next.js 14 (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend / BBDD
- **Supabase**
  - PostgreSQL
  - Auth
  - Row Level Security (RLS)

### Generación de PDFs
- `jspdf`
- `jspdf-autotable`
- `@react-pdf/renderer` (para PDFs avanzados)

---

## 🗂️ Estructura del proyecto

/app
├─ login
├─ home
├─ clients
│ ├─ new
│ ├─ [id]
│ │ ├─ edit
│ │ └─ diet
├─ calculator
├─ components
│ ├─ DietPlanner
│ ├─ FoodCalculator
│ ├─ MacroDonut
│ ├─ SaveDietModal
/lib
├─ clientsApi.ts
├─ dietsApi.ts
├─ foodsApi.ts
├─ dashboardApi.ts
├─ supabaseBrowser.ts


---

## 🗄️ Modelo de datos (resumen)

### clients
- id (uuid)
- name
- email
- phone
- notes
- created_at

### diets
- id
- client_id
- name
- notes
- created_at
- is_active

### diet_meals
- id
- diet_id
- meal_index

### diet_items
- id
- meal_id
- food_id
- grams

### foods
- id
- name
- kcal_100
- protein_100
- carbs_100
- fat_100

### diet_shares
- id
- diet_id
- token
- created_at

---

## 🚀 Instalación y uso local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/juanjo-fitness-macros.git
cd juanjo-fitness-macros

---

## 🗄️ Modelo de datos (resumen)

### clients
- id (uuid)
- name
- email
- phone
- notes
- created_at

### diets
- id
- client_id
- name
- notes
- created_at
- is_active

### diet_meals
- id
- diet_id
- meal_index

### diet_items
- id
- meal_id
- food_id
- grams

### foods
- id
- name
- kcal_100
- protein_100
- carbs_100
- fat_100

### diet_shares
- id
- diet_id
- token
- created_at

---

## 🚀 Instalación y uso local

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/juanjo-fitness-macros.git
cd juanjo-fitness-macros

2️⃣ Instalar dependencias
npm install

3️⃣ Variables de entorno

Crear un archivo .env.local:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key

4️⃣ Ejecutar en local
npm run dev


La app estará disponible en:

http://localhost:3000