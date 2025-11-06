# 📱 API Mobile - Documentación para React Native

Base URL: `https://your-domain.com/api/v1/mobile`

**Autenticación:** Todas las rutas requieren token Bearer en el header:
```
Authorization: Bearer {token}
```

---

## 🚀 Rutas Disponibles (15 endpoints)

### 1. **Inicialización de la App**
```
GET /api/v1/mobile/init
```

**Descripción:** Obtiene datos iniciales al abrir la app (feed, temas, stats del usuario)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "https://...",
      "stats": {
        "roadmaps_created": 5,
        "nodes_created": 12,
        "score": 450
      }
    },
    "feed": [...],
    "topics": ["React", "Laravel", "Python", ...]
  }
}
```

---

### 2. **Obtener Feed Paginado**
```
GET /api/v1/mobile/feed?page=1&limit=10
```

**Query Params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "node",
      "title": "Introducción a React",
      "description": "...",
      "cover_image": "https://...",
      "topic": "React",
      "author": {
        "username": "johndoe",
        "avatar": "https://..."
      },
      "stats": {
        "likes": 42,
        "comments": 8
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}
```

---

### 3. **Buscar Contenido**
```
GET /api/v1/mobile/search?q=react
```

**Query Params:**
- `q` (requerido): Término de búsqueda (mínimo 2 caracteres)

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "roadmaps": [...],
    "total": 15
  }
}
```

---

### 4. **Contenido Trending**
```
GET /api/v1/mobile/trending?period=week
```

**Query Params:**
- `period` (opcional): `week`, `month`, `all` (default: week)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "node",
      "title": "...",
      "stats": {
        "likes": 234
      }
    }
  ]
}
```

---

### 5. **Obtener Detalles de Item**
```
GET /api/v1/mobile/item/{type}/{id}
```

**Path Params:**
- `type`: `node` o `roadmap`
- `id`: UUID del item

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "node",
    "title": "...",
    "description": "...",
    "cover_image": "https://...",
    "author": {...},
    "stats": {...},
    "user_reaction": "like",
    "comments": [...],
    "created_at": "..."
  }
}
```

---

### 6. **Toggle Reacción (Like/Dislike)**
```
POST /api/v1/mobile/toggle-reaction
```

**Body:**
```json
{
  "entity_type": "node",
  "entity_id": "uuid",
  "type": "like"
}
```

**Response:**
```json
{
  "success": true,
  "action": "added",
  "data": {
    "likes_count": 43,
    "dislikes_count": 2,
    "user_reaction": "like"
  }
}
```

---

### 7. **Agregar Comentario**
```
POST /api/v1/mobile/add-comment
```

**Body:**
```json
{
  "entity_type": "node",
  "entity_id": "uuid",
  "content": "Excelente contenido!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comentario agregado",
  "data": {
    "id": 123,
    "content": "...",
    "author": {...},
    "created_at": "..."
  }
}
```

---

### 8. **Obtener Todos los Temas**
```
GET /api/v1/mobile/topics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "React",
      "count": 45
    },
    {
      "name": "Laravel",
      "count": 32
    }
  ]
}
```

---

### 9. **Obtener Nodos por Tema**
```
GET /api/v1/mobile/topics/{topic}
```

**Path Params:**
- `topic`: Nombre del tema

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "React",
    "nodes": [...],
    "count": 45
  }
}
```

---

### 10. **Obtener Perfil de Usuario**
```
GET /api/v1/mobile/profile/{username}
```

**Path Params:**
- `username`: Username del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "account_name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "bio": "...",
      "score": 450
    },
    "stats": {
      "nodes_count": 12,
      "roadmaps_count": 5,
      "total_likes": 234
    },
    "nodes": [...],
    "roadmaps": [...]
  }
}
```

---

### 11. **Actualizar Perfil**
```
PUT /api/v1/mobile/profile
```

**Body:**
```json
{
  "account_name": "John Doe",
  "bio": "Full Stack Developer",
  "avatar": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado",
  "data": {...}
}
```

---

### 12. **Obtener Mis Creaciones**
```
GET /api/v1/mobile/my-content?type=all
```

**Query Params:**
- `type` (opcional): `all`, `nodes`, `roadmaps` (default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "roadmaps": [...]
  }
}
```

---

### 13. **Obtener Estadísticas del Usuario**
```
GET /api/v1/mobile/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes_created": 12,
    "roadmaps_created": 5,
    "total_likes": 234,
    "total_comments": 87,
    "score": 450,
    "member_since": "2024-01-15"
  }
}
```

---

### 14. **Obtener Notificaciones**
```
GET /api/v1/mobile/notifications
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "like",
      "title": "Nueva reacción",
      "message": "A Juan le gustó tu roadmap",
      "read": false,
      "created_at": "..."
    }
  ],
  "unread_count": 2
}
```

---

### 15. **Marcar Notificación como Leída**
```
POST /api/v1/mobile/notifications/{id}/read
```

**Path Params:**
- `id`: ID de la notificación

**Response:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

---

### 16. **Obtener Configuración de la App**
```
GET /api/v1/mobile/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "app_version": "1.0.0",
    "min_version": "1.0.0",
    "features": {
      "tutor_mode": true,
      "dark_mode": true,
      "offline_mode": false
    },
    "api_version": "v1"
  }
}
```

---

## 🔐 Autenticación

### Login
```
POST /api/v1/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": {...}
  }
}
```

### Register
```
POST /api/v1/auth/register
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

---

## 📊 Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## 💡 Ejemplo de Uso en React Native

```javascript
import axios from 'axios';

const API_URL = 'https://your-domain.com/api/v1';
const token = 'your-bearer-token';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Obtener feed
const getFeed = async (page = 1) => {
  try {
    const response = await api.get(`/mobile/feed?page=${page}&limit=10`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Toggle like
const toggleLike = async (entityType, entityId) => {
  try {
    const response = await api.post('/mobile/toggle-reaction', {
      entity_type: entityType,
      entity_id: entityId,
      type: 'like',
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Buscar contenido
const searchContent = async (query) => {
  try {
    const response = await api.get(`/mobile/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎯 Flujo Recomendado para la App

1. **Login/Register** → Obtener token
2. **Init** → Cargar datos iniciales
3. **Feed** → Mostrar contenido principal
4. **Interacciones** → Likes, comentarios, búsqueda
5. **Perfil** → Ver y editar perfil del usuario
6. **Notificaciones** → Mantener al usuario informado

---

## 📝 Notas Importantes

- Todos los endpoints requieren autenticación excepto login/register
- Los UUIDs son strings, no integers
- Las fechas están en formato ISO 8601
- Las imágenes son URLs completas
- La paginación usa `page` y `limit`
- Los errores de validación retornan código 422 con detalles

---

## 🚀 Próximas Funcionalidades

- [ ] Bookmarks/Guardados
- [ ] Compartir contenido
- [ ] Seguir usuarios
- [ ] Chat/Mensajería
- [ ] Modo offline
- [ ] Push notifications
