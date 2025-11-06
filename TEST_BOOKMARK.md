# 🧪 TEST DE BOOKMARKS - INSTRUCCIONES

## Paso 1: Recargar la Página
1. Presiona `Ctrl + Shift + R` (recarga forzada) o `F5`
2. Esto cargará el nuevo código JavaScript compilado

## Paso 2: Abrir Consola del Navegador
1. Presiona `F12`
2. Ve a la pestaña **Console**
3. Limpia la consola (botón 🚫 o `Ctrl + L`)

## Paso 3: Ir a un Roadmap
1. Ve a cualquier roadmap, por ejemplo:
   - `http://127.0.0.1:8000/roadmaps/fullstack-2025`
   - O cualquier otro roadmap que tengas

## Paso 4: Click en el Botón de Bookmark
1. Busca el botón de **Bookmark** (icono de marcador 🔖)
2. Haz click en él
3. **INMEDIATAMENTE** deberías ver:
   - Una **ALERTA** en pantalla
   - **LOGS** en la consola

## ✅ Si Funciona Correctamente Verás:

### En la Consola:
```
🔖 FUNCIÓN handleSave EJECUTADA
Estado actual saved: false
Roadmap ID: fullstack-2025
📤 Enviando petición POST a /bookmarks/toggle
Datos: {type: 'roadmap', id: 'fullstack-2025'}
📥 Respuesta recibida: {success: true, bookmarked: true, message: "Guardado exitosamente", bookmark_id: 1}
✅ Guardado exitosamente
```

### En Pantalla:
- Una **alerta** que dice: `✅ Roadmap guardado exitosamente`
- El icono de bookmark se **llena de amarillo**

## ❌ Si NO Funciona:

### Caso 1: No aparece NADA (ni logs ni alerta)
**Problema:** El botón no está ejecutando la función
**Solución:** 
1. Verifica que recargaste la página con `Ctrl + Shift + R`
2. Verifica que el build se completó correctamente
3. Comparte screenshot del botón

### Caso 2: Aparece log "🔖 FUNCIÓN handleSave EJECUTADA" pero luego error
**Problema:** Hay un error en la petición HTTP
**Solución:**
1. Copia TODO el error de la consola
2. Compártelo conmigo
3. Verifica que estés autenticado (logged in)

### Caso 3: Aparece alerta de error
**Problema:** El servidor rechazó la petición
**Solución:**
1. Lee el mensaje de error en la alerta
2. Comparte el mensaje completo
3. Verifica los logs de Laravel

## Paso 5: Verificar en /bookmarks
1. Ve a: `http://127.0.0.1:8000/bookmarks`
2. Deberías ver el roadmap que guardaste
3. Debe aparecer en la pestaña "Roadmaps"

## 📸 Screenshots Necesarios si Falla:

1. **Consola del navegador** (F12 → Console)
2. **La alerta** que aparece (si aparece alguna)
3. **El botón de bookmark** en la página
4. **La página /bookmarks** después de guardar

## 🔍 Verificación en Base de Datos

Si quieres verificar manualmente:
```sql
SELECT * FROM bookmarks WHERE user_id = TU_USER_ID;
```

---

## ⚡ IMPORTANTE:

1. **DEBES recargar la página** con `Ctrl + Shift + R`
2. **DEBES tener la consola abierta** ANTES de hacer click
3. **DEBES estar autenticado** (logged in)
4. Si no ves el log "🔖 FUNCIÓN handleSave EJECUTADA", el código no se cargó

---

## 🎯 Qué Esperar:

- ✅ Logs en consola
- ✅ Alerta en pantalla
- ✅ Icono cambia de color
- ✅ Aparece en /bookmarks

Si NO ves los logs, el problema es que el código no se está ejecutando.
Si VES los logs pero hay error, el problema es con la petición HTTP.
