# 📱 Documentación de APIs Simples y Mobile

## Índice
1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [APIs de Usuario](#apis-de-usuario)
4. [APIs de Feed](#apis-de-feed)
5. [APIs Mobile](#apis-mobile)
6. [Ejemplos React Native](#ejemplos-react-native)

---

## Introducción

Esta documentación cubre las APIs REST simples y optimizadas para aplicaciones mobile (React Native/Expo).

### Base URL
```
https://tu-dominio.com/api/v1
```

### Formato de Respuesta
Todas las APIs devuelven JSON con este formato:

**Éxito:**
```json
{
  "success": true,
  "data": {...},
  "message": "Mensaje opcional"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {...}
}
```

---

## Autenticación

### 🔐 Login

**Endpoint:** `POST /api/v1/auth/login`

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "username": "juan",
      "email": "juan@example.com",
      "avatar": "https://...",
      "score": 150
    },
    "token": "1|abcdef123456...",
    "token_type": "Bearer"
  }
}
```

---

### 📝 Registro

**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Respuesta:** Igual que login (201 Created)

---

### 🚪 Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### 🔄 Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token renovado",
  "data": {
    "token": "2|newtoken123...",
    "token_type": "Bearer"
  }
}
```

---

### ✅ Verificar Token

**Endpoint:** `GET /api/v1/auth/verify`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": 1,
      "username": "juan",
      "email": "juan@example.com"
    }
  }
}
```

---

## APIs de Usuario

### 👤 Obtener Perfil

**Endpoint:** `GET /api/v1/user/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juan@example.com",
    "avatar": "https://...",
    "score": 150,
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### ✏️ Actualizar Perfil

**Endpoint:** `PUT /api/v1/user/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "username": "nuevo_nombre",
  "email": "nuevo@email.com",
  "avatar": "https://nueva-imagen.jpg"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Perfil actualizado",
  "data": {
    "id": 1,
    "username": "nuevo_nombre",
    "email": "nuevo@email.com",
    "avatar": "https://nueva-imagen.jpg"
  }
}
```

---

### 🔑 Cambiar Contraseña

**Endpoint:** `POST /api/v1/user/change-password`

**Body:**
```json
{
  "current_password": "password123",
  "new_password": "newpassword456",
  "new_password_confirmation": "newpassword456"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Contraseña actualizada"
}
```

---

### 📊 Estadísticas del Usuario

**Endpoint:** `GET /api/v1/user/stats`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "roadmaps_created": 5,
    "nodes_created": 23,
    "total_likes": 145,
    "total_comments": 67,
    "score": 150
  }
}
```

---

### 🔍 Buscar Usuarios

**Endpoint:** `GET /api/v1/users/search?q=juan`

**Query Params:**
- `q`: Término de búsqueda (mínimo 2 caracteres)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "juan",
      "email": "juan@example.com",
      "avatar": "https://...",
      "score": 150
    }
  ]
}
```

---

### 👁️ Ver Perfil Público

**Endpoint:** `GET /api/v1/users/{id}`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "juan",
    "avatar": "https://...",
    "score": 150,
    "roadmaps_count": 5,
    "nodes_count": 23
  }
}
```

---

## APIs de Feed

### 📰 Obtener Feed Principal

**Endpoint:** `GET /api/v1/feed?page=1&limit=10`

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "roadmap-123",
      "type": "roadmap",
      "title": "Full Stack 2024",
      "description": "Guía completa...",
      "cover_image": "https://...",
      "author": {
        "id": 1,
        "username": "juan",
        "avatar": "https://..."
      },
      "stats": {
        "likes": 45,
        "comments": 12
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    },
    {
      "id": "node-456",
      "type": "node",
      "title": "Intro a React",
      "description": "Tutorial básico...",
      "cover_image": "https://...",
      "topic": "Frontend",
      "author": {
        "username": "maria",
        "avatar": "https://..."
      },
      "stats": {
        "likes": 23,
        "comments": 8
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

---

### 🏷️ Feed por Tema

**Endpoint:** `GET /api/v1/feed/topic/{topic}?limit=10`

**Ejemplo:** `GET /api/v1/feed/topic/Frontend`

**Respuesta:** Array de nodos del tema especificado

---

### 🔍 Buscar en Feed

**Endpoint:** `GET /api/v1/feed/search?q=react`

**Query Params:**
- `q`: Término de búsqueda (mínimo 2 caracteres)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "node-123",
      "type": "node",
      "title": "React Hooks",
      "description": "...",
      "cover_image": "https://...",
      "topic": "Frontend",
      "author": {
        "username": "juan"
      },
      "stats": {
        "likes": 45,
        "comments": 12
      }
    }
  ],
  "total": 1
}
```

---

### 🔥 Trending (Populares)

**Endpoint:** `GET /api/v1/feed/trending?limit=10`

**Respuesta:** Array de contenido más popular (ordenado por likes)

---

## APIs Mobile

### 🚀 Inicialización de App

**Endpoint:** `GET /api/v1/mobile/init`

**Descripción:** Obtiene todos los datos necesarios para iniciar la app

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "juan",
      "email": "juan@example.com",
      "avatar": "https://...",
      "stats": {
        "roadmaps_created": 5,
        "nodes_created": 23,
        "score": 150
      }
    },
    "feed": [
      {
        "id": "roadmap-123",
        "type": "roadmap",
        "title": "Full Stack 2024",
        "description": "...",
        "cover_image": "https://...",
        "author": {
          "username": "maria",
          "avatar": "https://..."
        },
        "stats": {
          "likes": 45,
          "comments": 12
        },
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "topics": [
      "Frontend",
      "Backend",
      "DevOps",
      "Mobile"
    ]
  }
}
```

**Uso:** Llamar al abrir la app para cargar datos iniciales

---

### ❤️ Toggle Reacción (Like/Dislike)

**Endpoint:** `POST /api/v1/mobile/toggle-reaction`

**Body:**
```json
{
  "entity_type": "node",
  "entity_id": "node-123",
  "type": "like"
}
```

**Parámetros:**
- `entity_type`: `node` o `roadmap`
- `entity_id`: ID del item
- `type`: `like` o `dislike`

**Respuesta:**
```json
{
  "success": true,
  "action": "added",
  "data": {
    "likes_count": 46,
    "dislikes_count": 2,
    "user_reaction": "like"
  }
}
```

**Acciones posibles:**
- `added`: Reacción agregada
- `removed`: Reacción eliminada
- `changed`: Cambió de like a dislike o viceversa

---

### 💬 Agregar Comentario

**Endpoint:** `POST /api/v1/mobile/add-comment`

**Body:**
```json
{
  "entity_type": "node",
  "entity_id": "node-123",
  "content": "Excelente tutorial!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Comentario agregado",
  "data": {
    "id": 789,
    "content": "Excelente tutorial!",
    "author": {
      "username": "juan",
      "avatar": "https://..."
    },
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 📄 Obtener Detalles de Item

**Endpoint:** `GET /api/v1/mobile/item/{type}/{id}`

**Ejemplo:** `GET /api/v1/mobile/item/node/node-123`

**Parámetros:**
- `type`: `node` o `roadmap`
- `id`: ID del item

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "node-123",
    "type": "node",
    "title": "Intro a React",
    "description": "Tutorial completo...",
    "cover_image": "https://...",
    "topic": "Frontend",
    "author": {
      "id": 1,
      "username": "juan",
      "avatar": "https://..."
    },
    "stats": {
      "likes": 46,
      "comments": 15
    },
    "user_reaction": "like",
    "comments": [
      {
        "id": 1,
        "content": "Excelente!",
        "author": {
          "username": "maria",
          "avatar": "https://..."
        },
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Si es roadmap, incluye:**
```json
{
  "nodes": [
    {
      "id": "node-456",
      "title": "Paso 1",
      "topic": "Frontend"
    }
  ]
}
```

---

### 🔔 Obtener Notificaciones

**Endpoint:** `GET /api/v1/mobile/notifications`

**Respuesta:**
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
      "created_at": "2024-01-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "type": "comment",
      "title": "Nuevo comentario",
      "message": "María comentó en tu nodo",
      "read": false,
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "unread_count": 2
}
```

**Tipos de notificaciones:**
- `like`: Me gusta
- `comment`: Comentario
- `follow`: Seguidor
- `mention`: Mención
- `system`: Sistema

---

### ✅ Marcar Notificación como Leída

**Endpoint:** `POST /api/v1/mobile/notifications/{id}/read`

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

---

### ⚙️ Configuración de App

**Endpoint:** `GET /api/v1/mobile/config`

**Respuesta:**
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

**Uso:** Verificar versión mínima, features disponibles

---

## Ejemplos React Native

### Setup Inicial

```bash
npm install axios @react-native-async-storage/async-storage
```

### API Service

```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://tu-dominio.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

### Login

```typescript
// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Guardar token
        await AsyncStorage.setItem('token', response.data.data.token);
        
        // Guardar usuario
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Navegar al home
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
```

---

### Cargar Feed

```typescript
// screens/FeedScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import api from '../services/api';

export default function FeedScreen({ navigation }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.get(`/feed?page=${page}&limit=10`);
      if (response.data.success) {
        setFeed(response.data.data);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}
      onPress={() => navigation.navigate('Detail', { type: item.type, id: item.id })}
    >
      {item.cover_image && (
        <Image
          source={{ uri: item.cover_image }}
          style={{ width: '100%', height: 200, borderRadius: 10 }}
        />
      )}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
        {item.title}
      </Text>
      <Text style={{ color: '#666', marginTop: 5 }}>
        {item.description}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Text>❤️ {item.stats.likes}</Text>
        <Text style={{ marginLeft: 15 }}>💬 {item.stats.comments}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadFeed}
      />
    </View>
  );
}
```

---

### Toggle Like

```typescript
// components/LikeButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import api from '../services/api';

export default function LikeButton({ entityType, entityId, initialLikes, initialUserReaction }) {
  const [likes, setLikes] = useState(initialLikes);
  const [userReaction, setUserReaction] = useState(initialUserReaction);

  const handleToggleLike = async () => {
    try {
      const response = await api.post('/mobile/toggle-reaction', {
        entity_type: entityType,
        entity_id: entityId,
        type: 'like',
      });

      if (response.data.success) {
        setLikes(response.data.data.likes_count);
        setUserReaction(response.data.data.user_reaction);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleToggleLike}>
      <Text style={{ fontSize: 16 }}>
        {userReaction === 'like' ? '❤️' : '🤍'} {likes}
      </Text>
    </TouchableOpacity>
  );
}
```

---

### Inicialización de App

```typescript
// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import LoadingScreen from './screens/LoadingScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Verificar token
        const response = await api.get('/auth/verify');
        if (response.data.success) {
          setIsLoggedIn(true);
          
          // Cargar datos iniciales
          await loadInitialData();
        }
      }
    } catch (error) {
      // Token inválido, limpiar
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const response = await api.get('/mobile/init');
      if (response.data.success) {
        // Guardar datos en contexto o estado global
        await AsyncStorage.setItem('initialData', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## Manejo de Errores

### Interceptor de Errores

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Redirigir a login
      // navigation.replace('Login');
    }
    return Promise.reject(error);
  }
);
```

---

## Testing

### Postman Collection

Importa esta colección en Postman:

```json
{
  "info": {
    "name": "MAES3 Mobile API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Conclusión

Estas APIs están optimizadas para:

✅ **Simplicidad**: Sin dependencias complejas  
✅ **Performance**: Respuestas rápidas y ligeras  
✅ **Mobile-First**: Diseñadas para React Native/Expo  
✅ **Offline-Ready**: Datos estructurados para caché  
✅ **Escalabilidad**: Paginación y límites configurables  

**Próximos pasos:**
1. Implementar caché local con AsyncStorage
2. Agregar modo offline
3. Implementar push notifications
4. Agregar analytics

¡Listo para tu app mobile! 📱🚀
