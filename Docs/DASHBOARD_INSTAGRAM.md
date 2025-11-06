# Dashboard Estilo Instagram

Este proyecto ahora incluye un dashboard funcional con el estilo estético de Instagram, integrado con todas las rutas y controladores de la red social.

## 🎨 Características

### Componentes Principales

1. **InstagramNav** (`resources/js/components/social/instagram-nav.tsx`)
   - Barra de navegación superior estilo Instagram
   - Búsqueda integrada
   - Iconos de navegación (Home, Explorar, Mensajes, Notificaciones, Crear)
   - Avatar del usuario

2. **StoriesBar** (`resources/js/components/social/stories-bar.tsx`)
   - Barra horizontal de historias/stories
   - Gradiente de Instagram para historias nuevas
   - Scroll horizontal sin scrollbar visible

3. **PostCard** (`resources/js/components/social/post-card.tsx`)
   - Tarjeta de post estilo Instagram
   - Imagen del post
   - Información del autor con avatar
   - Botones de reacción (Like, Comentar, Compartir, Guardar)
   - Contador de likes y comentarios
   - Tags/hashtags
   - Integración con API de reacciones

4. **SuggestionsSidebar** (`resources/js/components/social/suggestions-sidebar.tsx`)
   - Sidebar con sugerencias de usuarios
   - Información del usuario actual
   - Footer con enlaces

## 📁 Estructura de Archivos

```
resources/js/
├── components/
│   └── social/
│       ├── instagram-nav.tsx       # Navegación principal
│       ├── stories-bar.tsx         # Barra de historias
│       ├── post-card.tsx          # Tarjeta de post
│       └── suggestions-sidebar.tsx # Sidebar de sugerencias
├── pages/
│   ├── dashboard.tsx              # Dashboard principal (feed)
│   └── feed/
│       ├── index.tsx              # Vista de feed alternativa
│       └── explore.tsx            # Página de explorar
└── ...

app/Http/Controllers/Social/
├── FeedController.php             # Controlador del feed
├── ReactionController.php         # Controlador de reacciones
├── CommentController.php          # Controlador de comentarios
└── SearchController.php           # Controlador de búsqueda

routes/
├── web.php                        # Rutas principales
└── social.php                     # Rutas de red social
```

## 🚀 Funcionalidades

### Dashboard Principal (`/dashboard`)
- Feed de posts con roadmaps y nodos
- Stories/historias en la parte superior
- Sidebar con sugerencias de usuarios (desktop)
- Diseño responsive (mobile-first)

### Sistema de Reacciones
- Like/Unlike con animación
- Contador de reacciones en tiempo real
- Integración con `/reactions/toggle` endpoint

### Sistema de Comentarios
- Visualización de contador de comentarios
- Link para ver comentarios completos

### Navegación
- **Home**: Dashboard principal con feed
- **Explorar**: Grid de contenido popular
- **Crear**: Crear nuevo roadmap/nodo
- **Perfil**: Configuración de usuario

## 🎯 Endpoints Integrados

El dashboard está integrado con los siguientes endpoints:

### Feed
- `GET /feed` - Feed principal
- `GET /feed/trending` - Contenido trending
- `GET /feed/explore` - Explorar contenido

### Reacciones
- `POST /reactions/toggle` - Toggle like/unlike
- `GET /reactions/entity/{type}/{id}` - Obtener reacciones
- `GET /reactions/statistics/{type}/{id}` - Estadísticas

### Comentarios
- `POST /comments/nodes/{node}` - Comentar nodo
- `POST /comments/roadmaps/{roadmap}` - Comentar roadmap
- `GET /comments/nodes/{node}` - Obtener comentarios

### Búsqueda
- `GET /search` - Búsqueda global
- `GET /search/autocomplete` - Autocompletado

## 🎨 Estilos Personalizados

Se agregaron estilos CSS personalizados en `resources/css/app.css`:

```css
/* Ocultar scrollbar */
.scrollbar-hide

/* Gradiente de Instagram para stories */
.story-gradient
```

## 📱 Responsive Design

El dashboard está optimizado para:
- **Mobile**: Vista de una columna, navegación simplificada
- **Tablet**: Vista de dos columnas
- **Desktop**: Vista completa con sidebar

## 🔄 Flujo de Datos

1. El usuario accede a `/dashboard`
2. `FeedController@index` obtiene roadmaps y nodos recientes
3. Los datos se pasan a la vista `dashboard.tsx`
4. Los componentes renderizan el feed estilo Instagram
5. Las interacciones (likes, comentarios) se envían a los endpoints correspondientes

## 🛠️ Personalización

### Cambiar colores del tema
Edita las variables CSS en `resources/css/app.css`:
```css
:root {
    --primary: oklch(0.205 0 0);
    --background: oklch(1 0 0);
    /* ... más variables */
}
```

### Agregar más tipos de posts
1. Extiende la interfaz `PostCardProps` en `post-card.tsx`
2. Agrega lógica de renderizado condicional
3. Actualiza el controlador para incluir los nuevos datos

### Personalizar la navegación
Edita `instagram-nav.tsx` para agregar/quitar botones o cambiar enlaces.

## 📊 Datos de Ejemplo

Si no hay datos en la base de datos, el dashboard muestra posts de ejemplo con:
- Imágenes de Unsplash
- Títulos y descripciones de ejemplo
- Contadores de reacciones y comentarios simulados

## 🔐 Autenticación

Todas las rutas requieren autenticación:
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [FeedController::class, 'index']);
});
```

## 🎯 Próximos Pasos

Para mejorar el dashboard:
1. Implementar sistema de follows/seguidores
2. Agregar infinite scroll en el feed
3. Implementar stories funcionales
4. Agregar notificaciones en tiempo real
5. Mejorar el sistema de búsqueda con filtros avanzados
6. Agregar modo oscuro mejorado

## 📝 Notas

- Los warnings de CSS sobre `@source`, `@theme`, etc. son normales en Tailwind CSS v4
- Las imágenes de ejemplo usan Unsplash (requiere conexión a internet)
- El sistema de reacciones usa el endpoint `/reactions/toggle` que ya está implementado
