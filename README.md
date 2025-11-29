# MAES3 - Plataforma de Aprendizaje Autodidacta con Machine Learning

## Descripcion General

MAES3 es una plataforma educativa diseñada para personas autodidactas que buscan aprender de forma estructurada y eficiente. El sistema organiza el conocimiento en dos niveles fundamentales: **Nodos** (unidades de contenido enfocadas en un solo tema) y **Roadmaps** (rutas de aprendizaje completas). La innovación principal radica en el uso de Machine Learning para recomendar los roadmaps más efectivos basándose en datos reales de uso.

![Arquitectura de MAES3](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=MAES3+Architecture)

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [Sistema de Machine Learning](#sistema-de-machine-learning)
- [API y Endpoints](#api-y-endpoints)
- [Comandos Artisan Personalizados](#comandos-artisan-personalizados)
- [Scripts de Python](#scripts-de-python)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características Principales

### 1. Sistema de Nodos y Roadmaps

**Nodos**: Unidades mínimas de aprendizaje centradas en un solo tema (unitema). Cada nodo contiene:
- Título y descripción
- Contenido educativo estructurado en bloques
- Autor y fecha de creación
- Imagen de portada
- Tags y categorías
- Sistema de comentarios
- Reacciones y valoraciones
- Seguimiento de progreso

**Roadmaps**: Estructuras jerárquicas que agrupan nodos en rutas de aprendizaje completas. Características:
- Nombre, descripción y objetivos
- Organización jerárquica de nodos con orden y dependencias
- Tags para categorización
- Estadísticas de uso y efectividad
- Sistema de comentarios y reacciones
- Imagen de portada personalizable
- Seguimiento de progreso por usuario

### 2. Sistema de Recomendación con Machine Learning

El sistema utiliza una Red Neuronal (Multi-Layer Perceptron) para analizar y recomendar roadmaps basándose en:
- Tasa de completación
- Tasa de abandono
- Horas promedio invertidas
- Nodos completados en promedio
- Calificación de utilidad (1-5)
- Nivel de engagement (guardados, interacciones)

**Arquitectura del Modelo**:
- Capa de entrada: 9 features
- Capa oculta 1: 64 neuronas (ReLU)
- Capa oculta 2: 32 neuronas (ReLU)
- Capa oculta 3: 16 neuronas (ReLU)
- Capa de salida: 1 neurona (predicción de calidad)
- Optimizador: Adam con learning rate adaptativo
- Regularización: L2 (alpha=0.001)

### 3. Sistema de Progreso y Analítica

**Seguimiento Individual**:
- Registro de nodos completados por usuario
- Tiempo invertido en cada nodo
- Progreso por roadmap
- Estadísticas personales de aprendizaje
- Historial de actividad

**Analítica de Roadmaps**:
- Métricas de completación agregadas
- Tasas de abandono
- Tiempo promedio de completación
- Nodos más populares
- Patrones de uso

### 4. Red Social de Aprendizaje

**Feed Personalizado**:
- Contenido relevante basado en intereses
- Roadmaps y nodos trending
- Actividad de usuarios seguidos
- Exploración de nuevo contenido

**Interacciones Sociales**:
- Sistema de reacciones (like, love, celebrate, etc.)
- Comentarios en nodos y roadmaps
- Perfiles de usuario personalizables
- Sistema de notificaciones en tiempo real
- Guardados y bookmarks

**Búsqueda y Descubrimiento**:
- Búsqueda global con autocompletado
- Filtros por roadmaps, nodos, usuarios y tags
- Búsqueda avanzada por categorías
- Recomendaciones personalizadas

### 5. Sistema de Autenticación y Seguridad

**Autenticación**:
- Registro y login con Laravel Fortify
- Verificación de email
- Recuperación de contraseña
- Autenticación de dos factores (2FA)
- Tokens de API con Laravel Sanctum

**Gestión de Perfil**:
- Edición de información personal
- Cambio de contraseña con throttling
- Foto de perfil con almacenamiento en AWS S3
- Configuración de privacidad
- Eliminación de cuenta

### 6. Sistema de Contenidos

**Bloques de Contenido**:
- Texto enriquecido (Markdown)
- Código con resaltado de sintaxis
- Imágenes y multimedia
- Enlaces y recursos externos
- Listas y tablas
- Citas y referencias

**Gestión de Contenidos**:
- Editor visual para creación de nodos
- Organización de contenidos en bloques
- Versionado y edición
- Previsualización en tiempo real

### 7. Sistema de Tags y Categorización

**Tags**:
- Etiquetado flexible de roadmaps y nodos
- Búsqueda por tags
- Roadmaps relacionados por tags
- Trending tags
- Autocompletado de tags

### 8. Sistema de Notificaciones

**Tipos de Notificaciones**:
- Nuevos comentarios en tu contenido
- Reacciones a tus publicaciones
- Nuevos seguidores
- Menciones en comentarios
- Actualizaciones de roadmaps guardados
- Logros y milestones

**Gestión**:
- Notificaciones en tiempo real
- Marcado de leídas/no leídas
- Eliminación individual o masiva
- Filtros y preferencias

### 9. Sistema de Bookmarks

**Funcionalidades**:
- Guardar roadmaps y nodos favoritos
- Organización de contenido guardado
- Acceso rápido desde el perfil
- Sincronización entre dispositivos

---

## Arquitectura del Sistema

### Stack Tecnológico

**Backend**:
- Laravel 12 (PHP 8.2+)
- Inertia.js para SSR
- Laravel Fortify (autenticación)
- Laravel Sanctum (API tokens)
- Laravel Wayfinder (routing)
- Livewire 3.6 (componentes reactivos)

**Frontend**:
- React 19.2
- TypeScript 5.7
- Tailwind CSS 4.0
- Radix UI (componentes accesibles)
- Lucide React (iconos)
- Vite 7.0 (build tool)

**Machine Learning**:
- Python 3.8+
- scikit-learn (MLPRegressor)
- pandas (procesamiento de datos)
- numpy (cálculos numéricos)
- matplotlib/seaborn (visualizaciones)

**Base de Datos**:
- SQLite (desarrollo)
- MySQL/PostgreSQL (producción)

**Almacenamiento**:
- AWS S3 (imágenes y archivos)
- Sistema de archivos local (desarrollo)

**Infraestructura**:
- Queue system para tareas asíncronas
- Cache con database driver
- Session management
- Broadcasting para notificaciones

### Flujo de Datos

1. **Usuario → Frontend (React)**: Interacción con la UI
2. **Frontend → Backend (Laravel)**: Peticiones HTTP vía Inertia.js
3. **Backend → Base de Datos**: Consultas con Eloquent ORM
4. **Backend → Python ML**: Ejecución de scripts para recomendaciones
5. **Python ML → Backend**: Respuestas JSON con predicciones
6. **Backend → Frontend**: Renderizado con Inertia.js
7. **Frontend → Usuario**: Actualización reactiva de la UI

---

## Tecnologías Utilizadas

### Backend (PHP)

```json
{
  "laravel/framework": "^12.0",
  "inertiajs/inertia-laravel": "^2.0",
  "laravel/fortify": "^1.30",
  "laravel/sanctum": "^4.2",
  "laravel/wayfinder": "^0.1.9",
  "livewire/livewire": "^3.6",
  "league/flysystem-aws-s3-v3": "^3.0"
}
```

### Frontend (JavaScript/TypeScript)

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@inertiajs/react": "^2.1.4",
  "typescript": "^5.7.2",
  "tailwindcss": "^4.0.0",
  "vite": "^7.0.4",
  "lucide-react": "^0.475.0",
  "@radix-ui/react-*": "latest"
}
```

### Machine Learning (Python)

```txt
pandas>=1.5.0
scikit-learn>=1.2.0
numpy>=1.23.0
matplotlib>=3.6.0
seaborn>=0.12.0
```

---

## Requisitos del Sistema

### Software Requerido

- **PHP**: 8.2 o superior
- **Composer**: 2.x
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Python**: 3.8 o superior
- **pip**: 21.x o superior
- **SQLite**: 3.x (desarrollo) o MySQL/PostgreSQL (producción)

### Extensiones PHP Requeridas

- OpenSSL
- PDO
- Mbstring
- Tokenizer
- XML
- Ctype
- JSON
- BCMath
- Fileinfo
- GD o Imagick

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/BryanMtz2483/Maes3.git
cd Maes3/webapp/Maes3
```

### 2. Instalar Dependencias de PHP

```bash
composer install
```

### 3. Instalar Dependencias de Node.js

```bash
npm install
```

### 4. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Generar la clave de aplicación
php artisan key:generate
```

### 5. Configurar la Base de Datos

Editar `.env` con la configuración de tu base de datos:

```env
DB_CONNECTION=sqlite
# O para MySQL/PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=maes3
# DB_USERNAME=root
# DB_PASSWORD=
```

### 6. Ejecutar Migraciones

```bash
php artisan migrate
```

### 7. Configurar AWS S3 (Opcional)

Para almacenamiento de imágenes en producción:

```env
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=tu_bucket
FILESYSTEM_DISK=s3
```

### 8. Instalar Dependencias de Python (ML)

```bash
cd ml_example
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 9. Compilar Assets del Frontend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
```

### 10. Iniciar el Servidor

```bash
# Opción 1: Servidor de desarrollo integrado
composer run dev

# Opción 2: Servidor PHP simple
php artisan serve

# Opción 3: Con queue listener
php artisan serve &
php artisan queue:listen
```

La aplicación estará disponible en `http://localhost:8000`

---

## Configuración

### Configuración de Email

Para notificaciones por email, configurar en `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_username
MAIL_PASSWORD=tu_password
MAIL_FROM_ADDRESS="noreply@maes3.com"
MAIL_FROM_NAME="MAES3"
```

### Configuración de Queue

Para procesamiento asíncrono:

```env
QUEUE_CONNECTION=database
```

Iniciar el worker:

```bash
php artisan queue:listen --tries=1
```

### Configuración de Cache

```env
CACHE_STORE=database
```

Limpiar cache:

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## Estructura de la Base de Datos

### Tablas Principales

**users**
- id (UUID)
- name, email, password
- account_name (username único)
- profile_picture_url
- two_factor_secret, two_factor_recovery_codes
- email_verified_at
- timestamps

**nodes**
- id (UUID)
- title, description
- author_id (FK → users)
- cover_image
- timestamps

**roadmaps**
- id (UUID)
- name, description
- tags (JSON)
- author_id (FK → users)
- cover_image
- timestamps

**node_roadmap** (Pivot)
- id
- node_id (FK → nodes)
- roadmap_id (FK → roadmaps)
- order (posición en el roadmap)
- parent_id (para jerarquía)
- timestamps

**contents**
- id (UUID)
- node_id (FK → nodes)
- type (text, code, image, etc.)
- content (JSON)
- order
- timestamps

**roadmap_statistics**
- id
- roadmap_id (FK → roadmaps)
- completion_count
- dropout_count
- avg_hours_spent
- avg_nodes_completed
- bookmark_count
- usefulness_score
- timestamps

**node_progress**
- id
- user_id (FK → users)
- node_id (FK → nodes)
- roadmap_id (FK → roadmaps, nullable)
- completed_at
- time_spent (minutos)
- timestamps

**bookmarks**
- id
- user_id (FK → users)
- bookmarkable_type (Node/Roadmap)
- bookmarkable_id
- timestamps

**reactions**
- id
- user_id (FK → users)
- reactable_type (Node/Roadmap/Comment)
- reactable_id
- type (like, love, celebrate, etc.)
- timestamps

**node_comments** / **roadmap_comments**
- id
- user_id (FK → users)
- node_id / roadmap_id
- content
- timestamps

**notifications**
- id (UUID)
- user_id (FK → users)
- type
- data (JSON)
- read_at
- timestamps

**tags**
- id
- name
- slug
- timestamps

---

## Funcionalidades Detalladas

### 1. Gestión de Roadmaps

**Crear Roadmap**:
```
POST /roadmaps
Body: {
  name: string,
  description: string,
  tags: string[],
  cover_image: File
}
```

**Listar Roadmaps**:
```
GET /roadmaps
Query params: ?search=vue&tag=javascript&sort=popular
```

**Ver Roadmap**:
```
GET /roadmaps/{id}
Retorna: roadmap con nodos organizados jerárquicamente
```

**Editar Roadmap**:
```
PUT /roadmaps/{id}
Body: { name, description, tags }
```

**Eliminar Roadmap**:
```
DELETE /roadmaps/{id}
```

**Agregar Nodo a Roadmap**:
```
POST /roadmaps/{id}/nodes
Body: { node_id, order, parent_id }
```

**Remover Nodo de Roadmap**:
```
DELETE /roadmaps/{id}/nodes/{node_id}
```

**Ver Jerarquía**:
```
GET /roadmaps/{id}/hierarchy
Retorna: estructura de árbol de nodos
```

### 2. Gestión de Nodos

**Crear Nodo**:
```
POST /nodes
Body: {
  title: string,
  description: string,
  cover_image: File
}
```

**Listar Nodos**:
```
GET /nodes
Query params: ?search=react&author=user_id
```

**Ver Nodo**:
```
GET /nodes/{id}
Retorna: nodo con contenidos y roadmaps asociados
```

**Editar Nodo**:
```
PUT /nodes/{id}
Body: { title, description }
```

**Eliminar Nodo**:
```
DELETE /nodes/{id}
```

**Agregar Contenido**:
```
POST /nodes/{id}/contents
Body: {
  type: 'text' | 'code' | 'image' | 'link',
  content: object,
  order: number
}
```

**Remover Contenido**:
```
DELETE /nodes/{id}/contents/{content_id}
```

### 3. Sistema de Progreso

**Marcar Nodo como Completado**:
```
POST /progress/toggle
Body: {
  node_id: string,
  roadmap_id: string (opcional),
  time_spent: number (minutos)
}
```

**Obtener Progreso de Roadmap**:
```
GET /progress/roadmap/{roadmap_id}
Retorna: {
  total_nodes: number,
  completed_nodes: number,
  percentage: number,
  time_spent: number,
  nodes: Array<{id, title, completed, completed_at}>
}
```

**Obtener Nodos Completados**:
```
GET /progress/nodes
Retorna: lista de nodos completados por el usuario
```

**Estadísticas del Usuario**:
```
GET /progress/stats
Retorna: {
  total_nodes_completed: number,
  total_roadmaps_started: number,
  total_roadmaps_completed: number,
  total_time_spent: number,
  streak_days: number
}
```

**Detalles de Completación**:
```
GET /progress/details
Query params: ?roadmap_id=uuid
Retorna: información detallada de progreso
```

### 4. Sistema de Reacciones

**Agregar/Quitar Reacción**:
```
POST /reactions/toggle
Body: {
  reactable_type: 'Node' | 'Roadmap' | 'Comment',
  reactable_id: string,
  type: 'like' | 'love' | 'celebrate' | 'insightful'
}
```

**Obtener Reacciones de una Entidad**:
```
GET /reactions/entity/{type}/{id}
Retorna: {
  reactions: Array<{type, count, users}>,
  user_reaction: string | null
}
```

**Obtener Reacciones del Usuario**:
```
GET /reactions/user/{user_id}
Retorna: lista de reacciones del usuario
```

**Estadísticas de Reacciones**:
```
GET /reactions/statistics/{type}/{id}
Retorna: {
  total: number,
  by_type: {like: number, love: number, ...}
}
```

### 5. Sistema de Comentarios

**Comentar en Nodo**:
```
POST /comments/nodes/{node_id}
Body: { content: string }
```

**Obtener Comentarios de Nodo**:
```
GET /comments/nodes/{node_id}
Retorna: lista de comentarios con autor y reacciones
```

**Editar Comentario**:
```
PUT /comments/nodes/{comment_id}
Body: { content: string }
```

**Eliminar Comentario**:
```
DELETE /comments/nodes/{comment_id}
```

**Comentar en Roadmap**:
```
POST /comments/roadmaps/{roadmap_id}
Body: { content: string }
```

**Obtener Comentarios de Roadmap**:
```
GET /comments/roadmaps/{roadmap_id}
```

### 6. Sistema de Búsqueda

**Búsqueda Global**:
```
GET /search?q=javascript
Retorna: {
  roadmaps: Array,
  nodes: Array,
  users: Array,
  tags: Array
}
```

**Búsqueda de Roadmaps**:
```
GET /search/roadmaps?q=vue&tag=frontend
```

**Búsqueda de Nodos**:
```
GET /search/nodes?q=react&author=user_id
```

**Búsqueda de Usuarios**:
```
GET /search/users?q=john
```

**Búsqueda de Tags**:
```
GET /search/tags?q=javascript
```

**Autocompletado**:
```
GET /search/autocomplete?q=jav
Retorna: sugerencias rápidas
```

### 7. Sistema de Feed

**Feed Principal**:
```
GET /feed
Retorna: contenido personalizado basado en intereses
```

**Contenido Trending**:
```
GET /feed/trending
Retorna: roadmaps y nodos más populares
```

**Contenido de Seguidos**:
```
GET /feed/following
Retorna: actividad de usuarios seguidos
```

**Explorar**:
```
GET /feed/explore
Retorna: contenido nuevo y diverso
```

### 8. Sistema de Bookmarks

**Guardar/Quitar Bookmark**:
```
POST /bookmarks/toggle
Body: {
  bookmarkable_type: 'Node' | 'Roadmap',
  bookmarkable_id: string
}
```

**Listar Bookmarks**:
```
GET /bookmarks
Query params: ?type=roadmap
Retorna: lista de contenido guardado
```

**Verificar Bookmark**:
```
GET /bookmarks/check?type=Node&id=uuid
Retorna: { bookmarked: boolean }
```

### 9. Sistema de Notificaciones

**Listar Notificaciones**:
```
GET /notifications
Retorna: todas las notificaciones del usuario
```

**Notificaciones No Leídas**:
```
GET /notifications/unread
Retorna: solo notificaciones no leídas
```

**Marcar como Leída**:
```
POST /notifications/{id}/read
```

**Marcar Todas como Leídas**:
```
POST /notifications/read-all
```

**Eliminar Notificación**:
```
DELETE /notifications/{id}
```

**Limpiar Leídas**:
```
DELETE /notifications/clear-read
```

### 10. Gestión de Perfil

**Ver Perfil**:
```
GET /profile/{username}
Retorna: información pública del usuario
```

**Editar Perfil**:
```
PATCH /settings/profile
Body: { name, email, account_name, bio }
```

**Actualizar Foto de Perfil**:
```
POST /settings/profile/picture
Body: FormData con imagen
```

**Eliminar Foto de Perfil**:
```
DELETE /settings/profile/picture
```

**Cambiar Contraseña**:
```
PUT /settings/password
Body: {
  current_password: string,
  password: string,
  password_confirmation: string
}
```

**Eliminar Cuenta**:
```
DELETE /settings/profile
Body: { password: string }
```

### 11. Sistema de Tags

**Listar Tags**:
```
GET /tags
Retorna: todos los tags disponibles
```

**Ver Tag**:
```
GET /tags/{slug}
Retorna: información del tag
```

**Roadmaps por Tag**:
```
GET /tags/{slug}/roadmaps
Retorna: roadmaps con ese tag
```

---

## Sistema de Machine Learning

### Arquitectura del Sistema ML

El sistema de Machine Learning está compuesto por tres componentes principales:

1. **Exportador de Datos** (Laravel)
2. **Modelos de ML** (Python)
3. **API de Recomendaciones** (Laravel + Python)

### 1. Exportador de Datos

**Comando**:
```bash
php artisan ml:export-dataset
```

**Funcionalidad**:
- Extrae datos de roadmaps y estadísticas
- Calcula métricas derivadas
- Genera archivo CSV para entrenamiento
- Ubicación: `storage/app/roadmaps_ml_dataset_YYYY-MM-DD_HHMMSS.csv`

**Métricas Exportadas**:
- roadmap_id
- name
- tags
- completion_count
- dropout_count
- avg_hours_spent
- avg_nodes_completed
- bookmark_count
- usefulness_score
- completion_rate (calculada)
- dropout_rate (calculada)
- efficiency_rate (calculada)
- engagement_score (calculada)

### 2. Modelos de Machine Learning

#### Roadmap Recommender (Recomendación Principal)

**Archivo**: `ml_example/roadmap_recommender.py`

**Características**:
- Red Neuronal (MLPRegressor)
- Arquitectura: 9-64-32-16-1
- Activación: ReLU
- Optimizador: Adam
- Regularización: L2

**Uso desde línea de comandos**:
```bash
python roadmap_recommender.py <dataset_path> <tag>
```

**Ejemplo**:
```bash
python roadmap_recommender.py ../storage/app/roadmaps_ml_dataset_2025-11-17.csv "vue"
```

**Salida JSON**:
```json
{
  "roadmap_id": "uuid",
  "name": "Dominando Vue",
  "tags": "vue, javascript, frontend",
  "quality_score": 0.8542,
  "completion_rate": 0.7234,
  "usefulness_score": 4.2,
  "efficiency_rate": 0.6543,
  "dropout_rate": 0.2766,
  "engagement_score": 84.0,
  "confidence": 85.5,
  "total_candidates": 15,
  "ml_model_used": true,
  "model_type": "Neural Network (MLP)"
}
```

#### Personalized Recommender (Recomendaciones Personalizadas)

**Archivo**: `ml_example/personalized_recommender.py`

**Características**:
- Considera historial del usuario
- Analiza preferencias de tags
- Calcula similitud con roadmaps completados
- Evita recomendar contenido ya visto

**Uso**:
```bash
python personalized_recommender.py <dataset_path> <user_id>
```

**Salida**:
```json
{
  "recommendations": [
    {
      "roadmap_id": "uuid",
      "name": "Advanced React Patterns",
      "score": 0.92,
      "reason": "Similar to completed roadmaps"
    }
  ],
  "user_preferences": {
    "favorite_tags": ["react", "javascript"],
    "avg_completion_rate": 0.78
  }
}
```

#### Roadmap Classifier (Clasificación de Eficiencia)

**Archivo**: `ml_example/train_roadmap_classifier.py`

**Características**:
- Random Forest Classifier
- Clasifica en: Low, Medium, High efficiency
- Genera visualizaciones de análisis
- Identifica features más importantes

**Uso**:
```bash
python train_roadmap_classifier.py
```

**Salidas**:
- `roadmap_classifier.pkl`: Modelo entrenado
- `scaler.pkl`: Scaler para normalización
- `roadmap_analysis.png`: Visualizaciones
- Métricas en consola

### 3. API de Recomendaciones

#### Endpoint: Analizar y Recomendar

**Ruta**: `POST /tutor/analyze`

**Body**:
```json
{
  "tag": "vue"
}
```

**Respuesta**:
```json
{
  "success": true,
  "roadmap": {
    "id": "uuid",
    "name": "Dominando Vue",
    "description": "...",
    "tags": ["vue", "javascript"],
    "cover_image": "url",
    "author": {...},
    "ml_analysis": {
      "quality_score": 0.8542,
      "completion_rate": 0.7234,
      "confidence": 85.5,
      "model_type": "Neural Network (MLP)"
    }
  }
}
```

#### Endpoint: Recomendaciones Personalizadas

**Ruta**: `POST /tutor/personalized`

**Respuesta**:
```json
{
  "success": true,
  "recommendations": [
    {
      "roadmap": {...},
      "score": 0.92,
      "reason": "Based on your learning history"
    }
  ]
}
```

#### Endpoint: Top Roadmaps por Tag

**Ruta**: `GET /tutor/top/{tag}`

**Respuesta**:
```json
{
  "success": true,
  "tag": "javascript",
  "roadmaps": [
    {
      "roadmap": {...},
      "rank": 1,
      "quality_score": 0.89
    }
  ]
}
```

### Flujo Completo de Recomendación

1. Usuario solicita recomendación para "vue"
2. Frontend envía: `POST /tutor/analyze` con `{tag: "vue"}`
3. Backend verifica existencia del dataset CSV
4. Si no existe, ejecuta: `php artisan ml:export-dataset`
5. Backend ejecuta: `python roadmap_recommender.py <dataset> "vue"`
6. Python carga/entrena modelo
7. Python filtra roadmaps con tag "vue"
8. Python predice calidad de cada candidato
9. Python retorna mejor roadmap en JSON
10. Backend enriquece con datos adicionales
11. Backend retorna respuesta al frontend
12. Frontend muestra recomendación al usuario

### Métricas de Calidad

El sistema calcula un `quality_score` compuesto por:

```python
quality_score = (
    completion_rate * 0.35 +           # 35% peso
    usefulness_score_norm * 0.30 +     # 30% peso
    (1 - dropout_rate) * 0.20 +        # 20% peso
    efficiency_rate_norm * 0.15 +      # 15% peso
    engagement_score_norm * 0.10       # 10% peso
)
```

### Reentrenamiento del Modelo

**Manual**:
```bash
# 1. Exportar nuevos datos
php artisan ml:export-dataset

# 2. Entrenar modelo
cd ml_example
python roadmap_recommender.py <dataset_path> --train-only
```

**Automático** (recomendado para producción):
- Configurar cron job para exportar datos semanalmente
- Script de reentrenamiento automático
- Validación de métricas antes de deployment

---

## API y Endpoints

### Autenticación

Todos los endpoints requieren autenticación excepto los marcados como públicos.

**Headers requeridos**:
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Endpoints Principales

#### Roadmaps

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/roadmaps` | Listar roadmaps | Sí |
| POST | `/roadmaps` | Crear roadmap | Sí |
| GET | `/roadmaps/{id}` | Ver roadmap | Sí |
| PUT | `/roadmaps/{id}` | Actualizar roadmap | Sí |
| DELETE | `/roadmaps/{id}` | Eliminar roadmap | Sí |
| POST | `/roadmaps/{id}/nodes` | Agregar nodo | Sí |
| DELETE | `/roadmaps/{id}/nodes/{node}` | Remover nodo | Sí |
| GET | `/roadmaps/{id}/hierarchy` | Ver jerarquía | Sí |

#### Nodos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/nodes` | Listar nodos | Sí |
| POST | `/nodes` | Crear nodo | Sí |
| GET | `/nodes/{id}` | Ver nodo | Sí |
| PUT | `/nodes/{id}` | Actualizar nodo | Sí |
| DELETE | `/nodes/{id}` | Eliminar nodo | Sí |
| POST | `/nodes/{id}/contents` | Agregar contenido | Sí |
| DELETE | `/nodes/{id}/contents/{content}` | Remover contenido | Sí |

#### IA Tutor

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/tutor` | Vista del tutor | Sí |
| POST | `/tutor/analyze` | Recomendar roadmap | Sí |
| POST | `/tutor/personalized` | Recomendaciones personalizadas | Sí |
| GET | `/tutor/top/{tag}` | Top roadmaps por tag | Sí |

#### Progreso

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/progress/roadmap/{id}` | Progreso de roadmap | Sí |
| GET | `/progress/nodes` | Nodos completados | Sí |
| POST | `/progress/toggle` | Marcar completado | Sí |
| GET | `/progress/stats` | Estadísticas usuario | Sí |
| GET | `/progress/details` | Detalles de progreso | Sí |

#### Social

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/reactions/toggle` | Agregar/quitar reacción | Sí |
| GET | `/reactions/entity/{type}/{id}` | Reacciones de entidad | Sí |
| POST | `/comments/nodes/{id}` | Comentar nodo | Sí |
| GET | `/comments/nodes/{id}` | Ver comentarios | Sí |
| POST | `/comments/roadmaps/{id}` | Comentar roadmap | Sí |
| GET | `/comments/roadmaps/{id}` | Ver comentarios | Sí |

#### Feed

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/feed` | Feed principal | Sí |
| GET | `/feed/trending` | Contenido trending | Sí |
| GET | `/feed/following` | Contenido de seguidos | Sí |
| GET | `/feed/explore` | Explorar | Sí |

#### Búsqueda

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/search` | Búsqueda global | Sí |
| GET | `/search/roadmaps` | Buscar roadmaps | Sí |
| GET | `/search/nodes` | Buscar nodos | Sí |
| GET | `/search/users` | Buscar usuarios | Sí |
| GET | `/search/tags` | Buscar tags | Sí |
| GET | `/search/autocomplete` | Autocompletado | Sí |

#### Bookmarks

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/bookmarks` | Listar guardados | Sí |
| POST | `/bookmarks/toggle` | Guardar/quitar | Sí |
| GET | `/bookmarks/check` | Verificar guardado | Sí |

#### Notificaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Listar todas | Sí |
| GET | `/notifications/unread` | No leídas | Sí |
| POST | `/notifications/{id}/read` | Marcar leída | Sí |
| POST | `/notifications/read-all` | Marcar todas leídas | Sí |
| DELETE | `/notifications/{id}` | Eliminar | Sí |
| DELETE | `/notifications/clear-read` | Limpiar leídas | Sí |

#### Perfil

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/profile/{username}` | Ver perfil | Sí |
| PATCH | `/settings/profile` | Actualizar perfil | Sí |
| POST | `/settings/profile/picture` | Actualizar foto | Sí |
| DELETE | `/settings/profile/picture` | Eliminar foto | Sí |
| PUT | `/settings/password` | Cambiar contraseña | Sí |
| DELETE | `/settings/profile` | Eliminar cuenta | Sí |

---

## Comandos Artisan Personalizados

### Exportar Dataset para ML

```bash
php artisan ml:export-dataset
```

Exporta datos de roadmaps y estadísticas a CSV para entrenamiento de modelos ML.

**Opciones**:
- `--format=csv`: Formato de salida (por defecto: csv)
- `--output=path`: Ruta de salida personalizada

**Salida**:
- Archivo CSV en `storage/app/roadmaps_ml_dataset_YYYY-MM-DD_HHMMSS.csv`

### Otros Comandos Útiles

```bash
# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Generar key de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate
php artisan migrate:fresh --seed

# Ejecutar tests
php artisan test

# Iniciar servidor
php artisan serve

# Iniciar queue worker
php artisan queue:listen

# Ver logs en tiempo real
php artisan pail
```

---

## Scripts de Python

### 1. roadmap_recommender.py

**Propósito**: Recomendar el mejor roadmap por tag usando Red Neuronal.

**Uso**:
```bash
python roadmap_recommender.py <dataset_path> <tag>
```

**Ejemplo**:
```bash
python roadmap_recommender.py ../storage/app/roadmaps_ml_dataset.csv "javascript"
```

**Funciones principales**:
- `load_and_prepare_data()`: Carga y preprocesa el dataset
- `train_model()`: Entrena la red neuronal
- `get_best_roadmap_by_tag(tag)`: Retorna mejor roadmap
- `save_model()`: Guarda modelo entrenado
- `load_model()`: Carga modelo existente

### 2. personalized_recommender.py

**Propósito**: Generar recomendaciones personalizadas basadas en historial del usuario.

**Uso**:
```bash
python personalized_recommender.py <dataset_path> <user_id>
```

**Características**:
- Analiza historial de completación
- Identifica tags preferidos
- Calcula similitud con roadmaps
- Evita duplicados

### 3. train_roadmap_classifier.py

**Propósito**: Entrenar clasificador de eficiencia y generar análisis.

**Uso**:
```bash
python train_roadmap_classifier.py
```

**Salidas**:
- Modelo clasificador (PKL)
- Scaler (PKL)
- Visualizaciones (PNG)
- Métricas de evaluación

---

## Desarrollo

### Estructura de Directorios

```
Maes3/
├── app/
│   ├── Console/Commands/       # Comandos Artisan personalizados
│   ├── Http/Controllers/       # Controladores
│   │   ├── AI/                # Controladores de IA
│   │   ├── API/               # Controladores de API
│   │   ├── Settings/          # Configuración de usuario
│   │   └── Social/            # Funcionalidades sociales
│   ├── Models/                # Modelos Eloquent
│   └── ...
├── database/
│   ├── migrations/            # Migraciones de BD
│   ├── seeders/               # Seeders
│   └── factories/             # Factories para testing
├── ml_example/                # Sistema de Machine Learning
│   ├── roadmap_recommender.py
│   ├── personalized_recommender.py
│   ├── train_roadmap_classifier.py
│   ├── requirements.txt
│   └── README.md
├── public/                    # Assets públicos
├── resources/
│   ├── js/                    # Código React/TypeScript
│   │   ├── components/       # Componentes React
│   │   ├── layouts/          # Layouts
│   │   ├── pages/            # Páginas Inertia
│   │   └── types/            # Tipos TypeScript
│   └── views/                # Vistas Blade (mínimas)
├── routes/
│   ├── web.php               # Rutas web principales
│   ├── api.php               # Rutas API
│   ├── social.php            # Rutas sociales
│   └── settings.php          # Rutas de configuración
├── storage/
│   ├── app/                  # Archivos de aplicación
│   ├── logs/                 # Logs
│   └── framework/            # Cache, sessions, views
├── tests/                     # Tests automatizados
├── .env.example              # Variables de entorno ejemplo
├── composer.json             # Dependencias PHP
├── package.json              # Dependencias Node.js
├── vite.config.ts            # Configuración Vite
├── tsconfig.json             # Configuración TypeScript
└── README.md                 # Este archivo
```

### Flujo de Trabajo de Desarrollo

1. **Crear rama de feature**:
```bash
git checkout -b feature/nueva-funcionalidad
```

2. **Desarrollar**:
- Backend: Crear controladores, modelos, migraciones
- Frontend: Crear componentes React, páginas Inertia
- ML: Actualizar scripts Python si es necesario

3. **Testing**:
```bash
# Tests PHP
php artisan test

# Linting JavaScript
npm run lint

# Type checking TypeScript
npm run types

# Formateo de código
npm run format
```

4. **Commit y Push**:
```bash
git add .
git commit -m "feat: descripción de la funcionalidad"
git push origin feature/nueva-funcionalidad
```

5. **Pull Request**:
- Crear PR en GitHub
- Esperar revisión
- Merge a main

### Convenciones de Código

**PHP (Laravel)**:
- PSR-12 coding standard
- Usar type hints
- Documentar métodos públicos
- Nombres descriptivos

**JavaScript/TypeScript**:
- ESLint + Prettier
- Componentes funcionales con hooks
- Props tipados con TypeScript
- Nombres en camelCase

**Python**:
- PEP 8 style guide
- Type hints cuando sea posible
- Docstrings para funciones
- Nombres en snake_case

### Hot Reload en Desarrollo

El comando `composer run dev` inicia tres procesos simultáneamente:

1. **Servidor PHP** (`php artisan serve`): Puerto 8000
2. **Queue Worker** (`php artisan queue:listen`): Procesa jobs
3. **Vite Dev Server** (`npm run dev`): Hot reload de assets

---

## Testing

### Tests de Backend (PHP)

**Ejecutar todos los tests**:
```bash
php artisan test
```

**Ejecutar tests específicos**:
```bash
php artisan test --filter=RoadmapTest
```

**Con coverage**:
```bash
php artisan test --coverage
```

**Estructura de tests**:
```
tests/
├── Feature/              # Tests de integración
│   ├── RoadmapTest.php
│   ├── NodeTest.php
│   ├── ProgressTest.php
│   └── ...
└── Unit/                 # Tests unitarios
    ├── ModelTest.php
    └── ...
```

### Tests de Frontend

**Linting**:
```bash
npm run lint
```

**Type checking**:
```bash
npm run types
```

**Formateo**:
```bash
npm run format
npm run format:check
```

### Tests de ML (Python)

Los scripts de Python incluyen validación interna:

```bash
# Validar modelo
python roadmap_recommender.py <dataset> --validate

# Métricas de clasificador
python train_roadmap_classifier.py
```

---

## Despliegue

### Requisitos de Producción

- Servidor con PHP 8.2+
- Base de datos MySQL/PostgreSQL
- Node.js para compilar assets
- Python 3.8+ para ML
- AWS S3 para almacenamiento de imágenes
- HTTPS configurado
- Dominio configurado

### Pasos de Despliegue

#### 1. Preparar Servidor

```bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring
sudo apt install mysql-server nginx
sudo apt install python3 python3-pip
```

#### 2. Clonar Repositorio

```bash
cd /var/www
git clone https://github.com/BryanMtz2483/Maes3.git
cd Maes3/webapp/Maes3
```

#### 3. Instalar Dependencias

```bash
# PHP
composer install --no-dev --optimize-autoloader

# Node.js
npm ci
npm run build

# Python
cd ml_example
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

#### 4. Configurar Entorno

```bash
cp .env.example .env
nano .env
```

Configurar variables de producción:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=maes3_prod
DB_USERNAME=usuario
DB_PASSWORD=contraseña_segura

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=tu_key
AWS_SECRET_ACCESS_KEY=tu_secret
AWS_BUCKET=tu_bucket

MAIL_MAILER=smtp
MAIL_HOST=smtp.tuservidor.com
```

#### 5. Preparar Base de Datos

```bash
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 6. Configurar Nginx

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/Maes3/webapp/Maes3/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 7. Configurar HTTPS con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

#### 8. Configurar Queue Worker

Crear servicio systemd:

```bash
sudo nano /etc/systemd/system/maes3-queue.service
```

```ini
[Unit]
Description=MAES3 Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/Maes3/webapp/Maes3/artisan queue:work --sleep=3 --tries=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable maes3-queue
sudo systemctl start maes3-queue
```

#### 9. Configurar Cron para Tareas Programadas

```bash
sudo crontab -e
```

Agregar:
```
* * * * * cd /var/www/Maes3/webapp/Maes3 && php artisan schedule:run >> /dev/null 2>&1
```

#### 10. Permisos

```bash
sudo chown -R www-data:www-data /var/www/Maes3
sudo chmod -R 755 /var/www/Maes3
sudo chmod -R 775 /var/www/Maes3/webapp/Maes3/storage
sudo chmod -R 775 /var/www/Maes3/webapp/Maes3/bootstrap/cache
```

### Monitoreo

**Logs de Laravel**:
```bash
tail -f storage/logs/laravel.log
```

**Logs de Nginx**:
```bash
tail -f /var/log/nginx/error.log
```

**Estado del Queue Worker**:
```bash
sudo systemctl status maes3-queue
```

### Actualización

```bash
cd /var/www/Maes3/webapp/Maes3
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart maes3-queue
sudo systemctl reload nginx
```

---

## Contribución

### Cómo Contribuir

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución

- Seguir las convenciones de código establecidas
- Escribir tests para nuevas funcionalidades
- Documentar cambios en el README si es necesario
- Mantener commits atómicos y descriptivos
- Actualizar documentación de API si se agregan endpoints

### Reportar Bugs

Usar GitHub Issues con la siguiente información:
- Descripción clara del bug
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del entorno (OS, versiones)

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## Contacto y Soporte

- **Repositorio**: https://github.com/BryanMtz2483/Maes3
- **Issues**: https://github.com/BryanMtz2483/Maes3/issues
- **Documentación**: Ver carpeta `docs/` para documentación adicional

---

## Agradecimientos

- Laravel Framework
- React y la comunidad de JavaScript
- scikit-learn y la comunidad de Python ML
- Todos los contribuidores del proyecto

---

## Changelog

### Version 1.0.0 (2025-11-17)

- Lanzamiento inicial
- Sistema de nodos y roadmaps
- Integración de Machine Learning
- Sistema de progreso y analítica
- Red social de aprendizaje
- Sistema de recomendaciones
- Autenticación y perfiles
- Sistema de notificaciones
- Búsqueda y descubrimiento

---

Desarrollado con dedicación para la comunidad de autodidactas.
