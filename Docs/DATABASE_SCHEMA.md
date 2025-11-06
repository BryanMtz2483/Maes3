# 📊 Esquema de Base de Datos - Maes3

## ✅ Estado: Implementado y Migrado

Todas las tablas han sido creadas según el diagrama proporcionado, respetando el orden de dependencias.

---

## 📋 Orden de Creación de Tablas

### Nivel 1: Tablas Independientes (sin dependencias)
1. ✅ **users** - Tabla base de usuarios
2. ✅ **tags** - Etiquetas para roadmaps
3. ✅ **features** - Características de usuarios

### Nivel 2: Tablas que dependen de Nivel 1
4. ✅ **roadmaps** - Rutas de aprendizaje (depende de users)
5. ✅ **nodes** - Nodos de contenido (independiente según diagrama)

### Nivel 3: Tablas que dependen de Nivel 2
6. ✅ **contents** - Contenido multimedia (depende de nodes)
7. ✅ **node_comments** - Comentarios en nodos (depende de nodes)
8. ✅ **roadmap_comments** - Comentarios en roadmaps (depende de roadmaps)
9. ✅ **reactions** - Reacciones a nodes/roadmaps (depende de users, nodes, roadmaps)

### Nivel 4: Tablas Pivot (relaciones N:N)
10. ✅ **node_roadmap** - Relación entre roadmaps y nodes
11. ✅ **roadmap_tag** - Relación entre roadmaps y tags

### Nivel 5: Restricciones Adicionales
12. ✅ **roadmaps.roadmap_id_fk** - Auto-referencia en roadmaps

---

## 📐 Estructura de Tablas

### 1. **users**
```sql
- id: bigint (PK, auto-increment)
- username: string (unique)
- account_name: string (nullable) -- Agregado
- email: string (unique)
- password: string
- birth_date: date (nullable)
- profile_pic: string (nullable)
- score: int (default: 0)
- email_verified_at: timestamp (nullable)
- remember_token: string (nullable)
- two_factor_secret: text (nullable)
- two_factor_recovery_codes: text (nullable)
- two_factor_confirmed_at: timestamp (nullable)
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `hasMany` → features
- `hasMany` → reactions
- `belongsToMany` → roadmaps (a través de user_roadmap, si aplica)

---

### 2. **features**
```sql
- id: bigint (PK, auto-increment)
- profile_pic: string (nullable)
- account_name: string
- user_id: bigint (FK → users.id, cascade)
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsTo` → users

---

### 3. **tags**
```sql
- tag_id: string (PK)
- name: string
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsToMany` → roadmaps (a través de roadmap_tag)

---

### 4. **roadmaps**
```sql
- roadmap_id: string (PK)
- name: string
- tags: string (nullable)
- roadmap_id_fk: string (nullable, FK → roadmaps.roadmap_id, cascade) -- Auto-referencia
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsTo` → roadmaps (auto-referencia, parent roadmap)
- `hasMany` → roadmaps (children roadmaps)
- `hasMany` → roadmap_comments
- `belongsToMany` → nodes (a través de node_roadmap)
- `belongsToMany` → tags (a través de roadmap_tag)
- `morphMany` → reactions

---

### 5. **nodes**
```sql
- node_id: string (PK)
- title: string
- author: string
- created_date: date
- topic: string (nullable) -- "logic" en el diagrama
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `hasMany` → contents
- `hasMany` → node_comments
- `belongsToMany` → roadmaps (a través de node_roadmap)
- `morphMany` → reactions

---

### 6. **contents**
```sql
- content_id: string (PK)
- video: json (nullable)
- image: json (nullable)
- text: json (nullable)
- node_id: string (FK → nodes.node_id, cascade)
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsTo` → nodes

---

### 7. **node_comments**
```sql
- node_comment_id: string (PK)
- text: text
- node_id: string (FK → nodes.node_id, cascade)
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsTo` → nodes

---

### 8. **roadmap_comments**
```sql
- roadmap_comment_id: string (PK)
- text: text
- roadmap_id: string (FK → roadmaps.roadmap_id, cascade)
- created_at: timestamp
- updated_at: timestamp
```

**Relaciones:**
- `belongsTo` → roadmaps

---

### 9. **reactions**
```sql
- reaction_id: string (PK)
- user_id: bigint (FK → users.id, cascade)
- entity_type: string -- 'node' o 'roadmap'
- entity_id: string -- node_id o roadmap_id
- reaction_type: string
- created_at: timestamp
- updated_at: timestamp
- UNIQUE(user_id, entity_type, entity_id, reaction_type)
```

**Relaciones:**
- `belongsTo` → users
- `morphTo` → reactable (nodes o roadmaps)

**Nota:** Esta tabla usa polimorfismo para relacionarse con nodes y roadmaps.

---

### 10. **node_roadmap** (Tabla Pivot)
```sql
- roadmap_id: string (FK → roadmaps.roadmap_id, cascade)
- node_id: string (FK → nodes.node_id, cascade)
- created_at: timestamp
- updated_at: timestamp
- PRIMARY KEY(roadmap_id, node_id)
```

**Propósito:** Relación N:N entre roadmaps y nodes.

---

### 11. **roadmap_tag** (Tabla Pivot)
```sql
- roadmap_id: string (FK → roadmaps.roadmap_id, cascade)
- tag_id: string (FK → tags.tag_id, cascade)
- created_at: timestamp
- updated_at: timestamp
- PRIMARY KEY(roadmap_id, tag_id)
```

**Propósito:** Relación N:N entre roadmaps y tags.

---

## 🔗 Diagrama de Dependencias

```
users (independiente)
  ├─→ features
  └─→ reactions

tags (independiente)
  └─→ roadmap_tag

roadmaps (independiente, con auto-referencia)
  ├─→ roadmap_comments
  ├─→ roadmap_tag
  ├─→ node_roadmap
  └─→ reactions (polimórfica)

nodes (independiente)
  ├─→ contents
  ├─→ node_comments
  ├─→ node_roadmap
  └─→ reactions (polimórfica)
```

---

## 🛠️ Buenas Prácticas Implementadas

### ✅ Orden de Creación Respetado
Las migraciones están numeradas para ejecutarse en el orden correcto:
1. Tablas independientes primero
2. Tablas con foreign keys después
3. Tablas pivot al final
4. Auto-referencias en migración separada

### ✅ Integridad Referencial
- Todas las foreign keys tienen `onDelete('cascade')`
- Índices únicos en combinaciones lógicas (reactions)
- Primary keys compuestas en tablas pivot

### ✅ Tipos de Datos Consistentes
- IDs de entidades principales: `string` (para UUIDs o slugs)
- IDs de usuarios: `bigint` (auto-increment)
- Campos JSON para contenido multimedia flexible
- Timestamps automáticos en todas las tablas

### ✅ Nomenclatura Clara
- Nombres de tablas en plural
- Foreign keys con sufijo `_id`
- Tablas pivot con nombres combinados ordenados alfabéticamente

---

## 📝 Migraciones Ejecutadas

```bash
✅ 0001_01_01_000000_create_users_table
✅ 0001_01_01_000001_create_cache_table
✅ 0001_01_01_000002_create_jobs_table
✅ 2025_08_26_100418_add_two_factor_columns_to_users_table
✅ 2025_11_04_000025_create_features_table
✅ 2025_11_04_000546_create_nodes_table
✅ 2025_11_04_000720_create_node__comments_table
✅ 2025_11_04_000734_create_contents_table
✅ 2025_11_04_000753_create_tags_table
✅ 2025_11_04_000804_create_roadmaps_table
✅ 2025_11_04_000821_create_roadmap__comments_table
✅ 2025_11_04_000844_create_reactions_table
✅ 2025_11_04_033506_create_node_roadmap_table (incluye roadmap_tag)
✅ 2025_11_05_093024_update_users_table_add_account_name
✅ 2025_11_05_093948_fix_roadmaps_self_reference
```

---

## 🚀 Comandos Útiles

### Ejecutar migraciones
```bash
php artisan migrate
```

### Limpiar y recrear base de datos
```bash
php artisan migrate:fresh
```

### Limpiar, recrear y poblar con seeders
```bash
php artisan migrate:fresh --seed
```

### Ver estado de migraciones
```bash
php artisan migrate:status
```

### Revertir última migración
```bash
php artisan migrate:rollback
```

### Revertir todas las migraciones
```bash
php artisan migrate:reset
```

---

## 📊 Estadísticas

- **Total de tablas:** 11 (+ 3 de sistema: cache, jobs, sessions)
- **Tablas independientes:** 3 (users, tags, features)
- **Tablas con FK:** 6 (roadmaps, nodes, contents, comments, reactions)
- **Tablas pivot:** 2 (node_roadmap, roadmap_tag)
- **Total de relaciones:** 12+
- **Foreign keys:** 15+

---

## ⚠️ Notas Importantes

### Auto-referencia en Roadmaps
La tabla `roadmaps` tiene una auto-referencia (`roadmap_id_fk`) que permite crear jerarquías de roadmaps. Esta FK se agrega en una migración separada para evitar errores de creación circular.

### Reacciones Polimórficas
La tabla `reactions` usa `entity_type` y `entity_id` para relacionarse con múltiples tipos de entidades (nodes y roadmaps). Esto permite un sistema de reacciones flexible.

### IDs como Strings
Las tablas principales usan `string` como tipo de ID para soportar UUIDs o slugs legibles. Esto facilita URLs amigables y mejor seguridad.

### Campos JSON
Los campos de contenido (video, image, text) son JSON para permitir almacenar metadatos adicionales como URLs, dimensiones, duración, etc.

---

**Última actualización:** 2025-11-05  
**Estado:** ✅ Base de datos completamente implementada y funcional
