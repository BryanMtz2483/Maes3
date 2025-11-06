# 📡 Documentación de APIs con AWS

## Índice
1. [Introducción](#introducción)
2. [Configuración AWS](#configuración-aws)
3. [APIs de Media (S3)](#apis-de-media-s3)
4. [APIs de IA (Lambda)](#apis-de-ia-lambda)
5. [APIs de Notificaciones (SQS)](#apis-de-notificaciones-sqs)
6. [Funciones Lambda](#funciones-lambda)
7. [Variables de Entorno](#variables-de-entorno)

---

## Introducción

Este proyecto integra múltiples servicios de AWS para proporcionar funcionalidades avanzadas:

- **AWS S3**: Almacenamiento de archivos (imágenes, documentos, videos)
- **AWS Lambda**: Procesamiento serverless con IA
- **AWS SQS**: Cola de mensajes para tareas asíncronas
- **AWS Rekognition**: Análisis de imágenes (opcional)
- **AWS Comprehend**: Análisis de texto (opcional)

### Ventajas de usar AWS Lambda
- ✅ **Escalabilidad automática**: Se ajusta según la demanda
- ✅ **Pago por uso**: Solo pagas por el tiempo de ejecución
- ✅ **Sin servidores**: No necesitas gestionar infraestructura
- ✅ **Integración con IA**: Fácil uso de modelos de ML
- ✅ **Procesamiento asíncrono**: Tareas pesadas sin bloquear la app

---

## Configuración AWS

### 1. Credenciales AWS

Agrega estas variables a tu `.env`:

```env
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=maes3-storage

# SQS
AWS_SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/maes3-queue

# Lambda Functions
AWS_LAMBDA_RECOMMENDATIONS=maes3-recommendations
AWS_LAMBDA_CONTENT_ANALYZER=maes3-content-analyzer
AWS_LAMBDA_TEXT_PROCESSOR=maes3-text-processor
AWS_LAMBDA_TUTOR_AI=maes3-tutor-ai
AWS_LAMBDA_IMAGE_PROCESSOR=maes3-image-processor
```

### 2. Instalar SDK de AWS

```bash
composer require aws/aws-sdk-php
```

### 3. Crear Bucket S3

```bash
aws s3 mb s3://maes3-storage --region us-east-1
aws s3api put-bucket-cors --bucket maes3-storage --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

---

## APIs de Media (S3)

### 📤 Subir Archivo

**Endpoint:** `POST /api/v1/media/upload`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```json
{
  "file": [archivo],
  "type": "image" // image, document, video
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "url": "https://maes3-storage.s3.amazonaws.com/images/123/file.jpg",
  "key": "images/123/file.jpg",
  "message": "Archivo subido exitosamente"
}
```

**Uso:**
- Subir portadas de roadmaps/nodos
- Subir avatares de usuarios
- Subir documentos PDF
- Subir videos educativos

---

### 🗑️ Eliminar Archivo

**Endpoint:** `DELETE /api/v1/media/{key}`

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplo:**
```
DELETE /api/v1/media/images/123/file.jpg
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

---

### 🔗 Obtener URL Temporal

**Endpoint:** `GET /api/v1/media/signed-url/{key}`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "url": "https://maes3-storage.s3.amazonaws.com/private/file.pdf?signature=...",
  "expires_in": "20 minutes"
}
```

**Uso:**
- Acceso temporal a archivos privados
- Compartir documentos con expiración
- Descargas seguras

---

### 🖼️ Procesar Imagen con IA

**Endpoint:** `POST /api/v1/media/process-image`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "operations": ["ocr", "labels", "faces"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "ocr": {
      "text": "Texto extraído de la imagen..."
    },
    "labels": [
      {"name": "Computer", "confidence": 98.5},
      {"name": "Programming", "confidence": 95.2}
    ],
    "faces": {
      "count": 2,
      "emotions": ["happy", "neutral"]
    }
  }
}
```

**Uso:**
- Extraer texto de capturas de pantalla
- Detectar contenido inapropiado
- Analizar diagramas y gráficos
- Reconocimiento facial

---

## APIs de IA (Lambda)

### 🎯 Obtener Recomendaciones

**Endpoint:** `GET /api/v1/ai/recommendations`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Params:**
```
?preferences[topics][]=react&preferences[topics][]=laravel
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "roadmap-123",
        "title": "Roadmap de React Avanzado",
        "score": 0.95,
        "reason": "Basado en tu interés en React"
      }
    ]
  }
}
```

**Uso:**
- Feed personalizado
- Sugerencias de contenido
- "Temas que te podrían gustar"

---

### 📊 Analizar Contenido

**Endpoint:** `POST /api/v1/ai/analyze-content`

**Body:**
```json
{
  "content": "Este es un tutorial sobre React Hooks...",
  "type": "text"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "topics": ["React", "JavaScript", "Frontend"],
    "difficulty": "intermediate",
    "estimated_time": "15 minutes",
    "quality_score": 8.5
  }
}
```

**Uso:**
- Clasificación automática de contenido
- Detección de calidad
- Moderación de contenido

---

### 📝 Generar Resumen

**Endpoint:** `POST /api/v1/ai/summarize`

**Body:**
```json
{
  "text": "Texto largo que necesita ser resumido...",
  "max_length": 200
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": "Resumen generado automáticamente...",
    "original_length": 1500,
    "summary_length": 180,
    "key_points": [
      "Punto clave 1",
      "Punto clave 2"
    ]
  }
}
```

**Uso:**
- Resúmenes de artículos largos
- Previews de contenido
- Descripciones automáticas

---

### 🏷️ Detectar Temas

**Endpoint:** `POST /api/v1/ai/detect-topics`

**Body:**
```json
{
  "content": "Tutorial completo de Laravel con Vue.js..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "topics": [
      {"name": "Laravel", "confidence": 0.98},
      {"name": "Vue.js", "confidence": 0.95},
      {"name": "PHP", "confidence": 0.87}
    ],
    "suggested_tags": ["laravel", "vuejs", "backend", "frontend"]
  }
}
```

**Uso:**
- Auto-tagging de contenido
- Categorización automática
- Mejora de búsqueda

---

### 🤖 Tutor IA - Generar Preguntas

**Endpoint:** `POST /api/v1/ai/tutor/generate-questions`

**Body:**
```json
{
  "topic": "React Hooks",
  "difficulty": "medium",
  "count": 5
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "¿Cuál es la diferencia entre useState y useEffect?",
        "type": "multiple_choice",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "B",
        "explanation": "..."
      }
    ]
  }
}
```

**Uso:**
- Modo tutor interactivo
- Evaluaciones automáticas
- Práctica personalizada

---

### ✅ Tutor IA - Evaluar Respuesta

**Endpoint:** `POST /api/v1/ai/tutor/evaluate`

**Body:**
```json
{
  "question": "¿Qué es un Hook en React?",
  "answer": "Los Hooks son funciones que permiten usar estado...",
  "context": {
    "topic": "React",
    "difficulty": "easy"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "score": 9.5,
    "feedback": "Excelente respuesta. Has explicado correctamente...",
    "suggestions": [
      "Podrías mencionar también useEffect"
    ],
    "next_topic": "useEffect Hook"
  }
}
```

**Uso:**
- Evaluación automática de respuestas
- Feedback personalizado
- Progresión adaptativa

---

### ⚡ Procesamiento Asíncrono

**Endpoint:** `POST /api/v1/ai/process-async`

**Body:**
```json
{
  "type": "content_analysis",
  "data": {
    "content_id": "node-123",
    "content": "..."
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Tarea enviada para procesamiento",
  "job_id": "abc-123-def"
}
```

**Uso:**
- Tareas pesadas sin bloquear
- Procesamiento en lote
- Análisis de grandes volúmenes

---

## APIs de Notificaciones (SQS)

### 📨 Enviar Notificación

**Endpoint:** `POST /api/v1/notifications/send`

**Body:**
```json
{
  "user_id": 123,
  "type": "like",
  "title": "Nueva reacción",
  "message": "A Juan le gustó tu roadmap",
  "data": {
    "roadmap_id": "abc-123",
    "user_avatar": "https://..."
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación enviada",
  "job_id": "msg-123"
}
```

**Tipos de notificaciones:**
- `like`: Me gusta
- `comment`: Nuevo comentario
- `follow`: Nuevo seguidor
- `mention`: Mención en contenido
- `system`: Notificación del sistema

---

### 📢 Broadcast (Notificación Masiva)

**Endpoint:** `POST /api/v1/notifications/broadcast`

**Body:**
```json
{
  "user_ids": [1, 2, 3, 4, 5],
  "type": "announcement",
  "title": "Nueva funcionalidad",
  "message": "Ahora puedes usar el modo tutor IA"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificaciones enviadas",
  "sent": 5,
  "failed": 0
}
```

**Uso:**
- Anuncios importantes
- Actualizaciones de la plataforma
- Campañas de marketing

---

## Funciones Lambda

### Estructura de una Lambda Function

**Ejemplo: maes3-content-analyzer**

```python
import json
import boto3

def lambda_handler(event, context):
    action = event.get('action')
    content = event.get('content')
    
    if action == 'analyze':
        result = analyze_content(content)
    elif action == 'detect_topics':
        result = detect_topics(content)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }

def analyze_content(content):
    # Usar AWS Comprehend o modelo de IA
    comprehend = boto3.client('comprehend')
    
    sentiment = comprehend.detect_sentiment(
        Text=content,
        LanguageCode='es'
    )
    
    entities = comprehend.detect_entities(
        Text=content,
        LanguageCode='es'
    )
    
    return {
        'sentiment': sentiment['Sentiment'],
        'entities': entities['Entities']
    }
```

### Lambdas Requeridas

1. **maes3-recommendations**: Genera recomendaciones personalizadas
2. **maes3-content-analyzer**: Analiza contenido con IA
3. **maes3-text-processor**: Procesa y resume texto
4. **maes3-tutor-ai**: Sistema de tutor inteligente
5. **maes3-image-processor**: Procesa imágenes (OCR, labels)

---

## Variables de Entorno

### Archivo .env completo

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_DEFAULT_REGION=us-east-1

# S3
AWS_BUCKET=maes3-storage
AWS_URL=https://maes3-storage.s3.amazonaws.com

# SQS
AWS_SQS_PREFIX=https://sqs.us-east-1.amazonaws.com/123456789
AWS_SQS_QUEUE_URL=${AWS_SQS_PREFIX}/maes3-queue

# Lambda Functions
AWS_LAMBDA_RECOMMENDATIONS=maes3-recommendations
AWS_LAMBDA_CONTENT_ANALYZER=maes3-content-analyzer
AWS_LAMBDA_TEXT_PROCESSOR=maes3-text-processor
AWS_LAMBDA_TUTOR_AI=maes3-tutor-ai
AWS_LAMBDA_IMAGE_PROCESSOR=maes3-image-processor

# Optional: AWS Rekognition
AWS_REKOGNITION_ENABLED=true

# Optional: AWS Comprehend
AWS_COMPREHEND_ENABLED=true
```

---

## Ejemplos de Uso

### Frontend - Subir Imagen

```typescript
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');

  const response = await fetch('/api/v1/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.url;
};
```

### Frontend - Obtener Recomendaciones

```typescript
const getRecommendations = async () => {
  const response = await fetch('/api/v1/ai/recommendations', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data.recommendations;
};
```

### Frontend - Tutor IA

```typescript
const askTutor = async (question: string, answer: string) => {
  const response = await fetch('/api/v1/ai/tutor/evaluate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, answer }),
  });

  const data = await response.json();
  return data.data;
};
```

---

## Costos Estimados AWS

### S3
- Almacenamiento: $0.023 por GB/mes
- Transferencia: Primeros 100GB gratis/mes

### Lambda
- 1M invocaciones gratis/mes
- $0.20 por 1M invocaciones adicionales
- $0.0000166667 por GB-segundo

### SQS
- 1M requests gratis/mes
- $0.40 por 1M requests adicionales

### Estimado mensual (uso moderado)
- S3 (10GB): ~$0.23
- Lambda (100K invocaciones): Gratis
- SQS (50K mensajes): Gratis
- **Total: ~$0.23/mes** 🎉

---

## Seguridad

### Best Practices

1. **IAM Roles**: Usa roles en lugar de credenciales hardcoded
2. **Bucket Policies**: Restringe acceso público
3. **Encryption**: Habilita encriptación en S3
4. **API Keys**: Nunca expongas keys en el frontend
5. **Rate Limiting**: Implementa límites de requests
6. **CORS**: Configura CORS correctamente

### Ejemplo de IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::maes3-storage/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:us-east-1:*:function:maes3-*"
    }
  ]
}
```

---

## Testing

### Test de S3

```bash
php artisan tinker
```

```php
$s3 = app(\App\Services\AWS\S3Service::class);
$files = $s3->listFiles('images/');
dd($files);
```

### Test de Lambda

```php
$lambda = app(\App\Services\AWS\LambdaService::class);
$result = $lambda->generateSummary('Texto de prueba...');
dd($result);
```

---

## Troubleshooting

### Error: Credentials not found
```bash
# Verifica que las credenciales estén en .env
php artisan config:clear
php artisan cache:clear
```

### Error: Access Denied S3
```bash
# Verifica permisos del bucket
aws s3api get-bucket-policy --bucket maes3-storage
```

### Error: Lambda timeout
```bash
# Aumenta el timeout en la configuración de Lambda
# Timeout recomendado: 30 segundos
```

---

## Conclusión

Este sistema de APIs con AWS proporciona:

✅ **Almacenamiento escalable** con S3  
✅ **Procesamiento IA** con Lambda  
✅ **Notificaciones asíncronas** con SQS  
✅ **Costos bajos** (casi gratis para empezar)  
✅ **Alta disponibilidad** (99.99% uptime)  
✅ **Escalabilidad automática**  

**Próximos pasos:**
1. Configurar credenciales AWS
2. Crear bucket S3
3. Desplegar funciones Lambda
4. Configurar cola SQS
5. Probar endpoints

¡Listo para usar! 🚀
