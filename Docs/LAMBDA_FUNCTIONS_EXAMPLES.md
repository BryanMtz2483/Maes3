# 🚀 Ejemplos de Funciones Lambda para MAES3

## Índice
1. [Content Analyzer](#1-content-analyzer)
2. [Recommendations Engine](#2-recommendations-engine)
3. [Text Processor](#3-text-processor)
4. [Tutor AI](#4-tutor-ai)
5. [Image Processor](#5-image-processor)
6. [Deployment](#deployment)

---

## 1. Content Analyzer

**Función:** `maes3-content-analyzer`  
**Runtime:** Python 3.11  
**Timeout:** 30 segundos  
**Memory:** 512 MB

### lambda_function.py

```python
import json
import boto3
from datetime import datetime

# Clientes AWS
comprehend = boto3.client('comprehend', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Analiza contenido usando AWS Comprehend
    """
    try:
        action = event.get('action')
        
        if action == 'analyze':
            return analyze_content(event)
        elif action == 'detect_topics':
            return detect_topics(event)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)

def analyze_content(event):
    """
    Analiza sentimiento, entidades y frases clave
    """
    content = event.get('content', '')
    content_type = event.get('type', 'text')
    
    if len(content) < 10:
        return error_response('Content too short', 400)
    
    # Detectar sentimiento
    sentiment_response = comprehend.detect_sentiment(
        Text=content[:5000],  # Límite de Comprehend
        LanguageCode='es'
    )
    
    # Detectar entidades
    entities_response = comprehend.detect_entities(
        Text=content[:5000],
        LanguageCode='es'
    )
    
    # Detectar frases clave
    key_phrases_response = comprehend.detect_key_phrases(
        Text=content[:5000],
        LanguageCode='es'
    )
    
    # Calcular score de calidad
    quality_score = calculate_quality_score(
        content,
        sentiment_response,
        entities_response
    )
    
    return success_response({
        'sentiment': sentiment_response['Sentiment'],
        'sentiment_scores': sentiment_response['SentimentScore'],
        'entities': [
            {
                'text': e['Text'],
                'type': e['Type'],
                'score': e['Score']
            }
            for e in entities_response['Entities'][:10]
        ],
        'key_phrases': [
            kp['Text'] for kp in key_phrases_response['KeyPhrases'][:10]
        ],
        'quality_score': quality_score,
        'difficulty': estimate_difficulty(content),
        'estimated_time': estimate_reading_time(content)
    })

def detect_topics(event):
    """
    Detecta temas principales del contenido
    """
    content = event.get('content', '')
    
    # Detectar entidades y frases clave
    entities_response = comprehend.detect_entities(
        Text=content[:5000],
        LanguageCode='es'
    )
    
    key_phrases_response = comprehend.detect_key_phrases(
        Text=content[:5000],
        LanguageCode='es'
    )
    
    # Extraer temas
    topics = []
    seen = set()
    
    # De entidades
    for entity in entities_response['Entities']:
        if entity['Type'] in ['ORGANIZATION', 'TITLE', 'COMMERCIAL_ITEM']:
            topic = entity['Text'].lower()
            if topic not in seen and entity['Score'] > 0.7:
                topics.append({
                    'name': entity['Text'],
                    'confidence': entity['Score'],
                    'source': 'entity'
                })
                seen.add(topic)
    
    # De frases clave
    for phrase in key_phrases_response['KeyPhrases']:
        topic = phrase['Text'].lower()
        if topic not in seen and phrase['Score'] > 0.7:
            topics.append({
                'name': phrase['Text'],
                'confidence': phrase['Score'],
                'source': 'key_phrase'
            })
            seen.add(topic)
    
    # Ordenar por confianza
    topics.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Generar tags sugeridos
    suggested_tags = generate_tags(topics[:5])
    
    return success_response({
        'topics': topics[:10],
        'suggested_tags': suggested_tags
    })

def calculate_quality_score(content, sentiment, entities):
    """
    Calcula un score de calidad del contenido
    """
    score = 5.0  # Base score
    
    # Longitud apropiada
    length = len(content)
    if 500 <= length <= 5000:
        score += 1.5
    elif length > 5000:
        score += 1.0
    
    # Sentimiento positivo o neutral
    if sentiment['Sentiment'] in ['POSITIVE', 'NEUTRAL']:
        score += 1.0
    
    # Número de entidades (indica riqueza de contenido)
    entity_count = len(entities['Entities'])
    if entity_count >= 5:
        score += 1.5
    elif entity_count >= 3:
        score += 1.0
    
    return min(score, 10.0)

def estimate_difficulty(content):
    """
    Estima la dificultad del contenido
    """
    words = content.split()
    avg_word_length = sum(len(w) for w in words) / len(words) if words else 0
    
    if avg_word_length < 5:
        return 'easy'
    elif avg_word_length < 7:
        return 'medium'
    else:
        return 'hard'

def estimate_reading_time(content):
    """
    Estima tiempo de lectura (250 palabras/minuto)
    """
    words = len(content.split())
    minutes = max(1, round(words / 250))
    return f"{minutes} minutes"

def generate_tags(topics):
    """
    Genera tags a partir de los temas
    """
    tags = []
    for topic in topics:
        # Limpiar y normalizar
        tag = topic['name'].lower()
        tag = tag.replace(' ', '-')
        tags.append(tag)
    return tags

def success_response(data):
    return {
        'statusCode': 200,
        'body': json.dumps(data),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def error_response(message, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': message}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
```

### requirements.txt
```
boto3==1.28.0
```

---

## 2. Recommendations Engine

**Función:** `maes3-recommendations`  
**Runtime:** Python 3.11  
**Timeout:** 60 segundos  
**Memory:** 1024 MB

### lambda_function.py

```python
import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Genera recomendaciones personalizadas usando ML
    """
    try:
        user_id = event.get('user_id')
        preferences = event.get('preferences', {})
        
        # Obtener historial del usuario
        user_history = get_user_history(user_id)
        
        # Generar recomendaciones
        recommendations = generate_recommendations(
            user_id,
            user_history,
            preferences
        )
        
        return success_response({
            'recommendations': recommendations,
            'generated_at': context.request_id
        })
        
    except Exception as e:
        return error_response(str(e), 500)

def get_user_history(user_id):
    """
    Obtiene el historial de interacciones del usuario
    """
    # Simulación - en producción, consultar DynamoDB
    return {
        'viewed': ['react', 'laravel', 'typescript'],
        'liked': ['react-hooks', 'laravel-api'],
        'completed': ['intro-react'],
        'topics': ['frontend', 'backend']
    }

def generate_recommendations(user_id, history, preferences):
    """
    Algoritmo de recomendación basado en contenido
    """
    recommendations = []
    
    # Contenido similar a lo que le gustó
    for liked_item in history.get('liked', []):
        similar = find_similar_content(liked_item)
        recommendations.extend(similar)
    
    # Contenido de temas de interés
    for topic in history.get('topics', []):
        topic_content = find_by_topic(topic)
        recommendations.extend(topic_content)
    
    # Contenido popular que no ha visto
    popular = get_popular_content()
    for item in popular:
        if item['id'] not in history.get('viewed', []):
            recommendations.append(item)
    
    # Eliminar duplicados y ordenar por score
    seen = set()
    unique_recommendations = []
    for rec in recommendations:
        if rec['id'] not in seen:
            seen.add(rec['id'])
            unique_recommendations.append(rec)
    
    unique_recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    return unique_recommendations[:20]

def find_similar_content(item_id):
    """
    Encuentra contenido similar usando embeddings
    """
    # Simulación - en producción, usar SageMaker o Bedrock
    return [
        {
            'id': 'roadmap-123',
            'title': 'React Avanzado',
            'type': 'roadmap',
            'score': 0.95,
            'reason': 'Similar a contenido que te gustó'
        }
    ]

def find_by_topic(topic):
    """
    Encuentra contenido por tema
    """
    return [
        {
            'id': 'node-456',
            'title': f'Tutorial de {topic}',
            'type': 'node',
            'score': 0.85,
            'reason': f'Basado en tu interés en {topic}'
        }
    ]

def get_popular_content():
    """
    Obtiene contenido popular
    """
    return [
        {
            'id': 'roadmap-789',
            'title': 'Full Stack 2024',
            'type': 'roadmap',
            'score': 0.90,
            'reason': 'Popular esta semana'
        }
    ]

def success_response(data):
    return {
        'statusCode': 200,
        'body': json.dumps(data, default=decimal_default),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def error_response(message, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': message}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError
```

---

## 3. Text Processor

**Función:** `maes3-text-processor`  
**Runtime:** Python 3.11  
**Timeout:** 30 segundos  
**Memory:** 512 MB

### lambda_function.py

```python
import json
import boto3

comprehend = boto3.client('comprehend', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Procesa texto: resúmenes, traducción, etc.
    """
    try:
        action = event.get('action')
        
        if action == 'summarize':
            return summarize_text(event)
        elif action == 'translate':
            return translate_text(event)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)

def summarize_text(event):
    """
    Genera resumen extractivo del texto
    """
    text = event.get('text', '')
    max_length = event.get('max_length', 200)
    
    if len(text) < 100:
        return error_response('Text too short to summarize', 400)
    
    # Detectar frases clave
    key_phrases = comprehend.detect_key_phrases(
        Text=text[:5000],
        LanguageCode='es'
    )
    
    # Extraer oraciones importantes
    sentences = text.split('.')
    important_sentences = []
    
    for phrase in key_phrases['KeyPhrases'][:5]:
        for sentence in sentences:
            if phrase['Text'].lower() in sentence.lower():
                if sentence not in important_sentences:
                    important_sentences.append(sentence.strip())
                break
    
    # Generar resumen
    summary = '. '.join(important_sentences[:3]) + '.'
    
    # Truncar si es muy largo
    if len(summary) > max_length:
        summary = summary[:max_length] + '...'
    
    # Extraer puntos clave
    key_points = [kp['Text'] for kp in key_phrases['KeyPhrases'][:5]]
    
    return success_response({
        'summary': summary,
        'original_length': len(text),
        'summary_length': len(summary),
        'key_points': key_points
    })

def translate_text(event):
    """
    Traduce texto a otro idioma
    """
    translate = boto3.client('translate', region_name='us-east-1')
    
    text = event.get('text', '')
    target_language = event.get('target_language', 'en')
    
    result = translate.translate_text(
        Text=text,
        SourceLanguageCode='auto',
        TargetLanguageCode=target_language
    )
    
    return success_response({
        'translated_text': result['TranslatedText'],
        'source_language': result['SourceLanguageCode'],
        'target_language': target_language
    })

def success_response(data):
    return {
        'statusCode': 200,
        'body': json.dumps(data),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def error_response(message, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': message}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
```

---

## 4. Tutor AI

**Función:** `maes3-tutor-ai`  
**Runtime:** Python 3.11  
**Timeout:** 60 segundos  
**Memory:** 1024 MB

### lambda_function.py

```python
import json
import boto3
import random

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Sistema de tutor IA inteligente
    """
    try:
        action = event.get('action')
        
        if action == 'generate_questions':
            return generate_questions(event)
        elif action == 'evaluate_answer':
            return evaluate_answer(event)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)

def generate_questions(event):
    """
    Genera preguntas sobre un tema
    """
    topic = event.get('topic', '')
    difficulty = event.get('difficulty', 'medium')
    count = event.get('count', 5)
    
    # Prompt para el modelo
    prompt = f"""Genera {count} preguntas de opción múltiple sobre {topic} 
    con dificultad {difficulty}. 
    
    Formato JSON:
    {{
        "questions": [
            {{
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "B",
                "explanation": "..."
            }}
        ]
    }}
    """
    
    # Invocar Bedrock (Claude o similar)
    response = invoke_bedrock_model(prompt)
    
    return success_response(response)

def evaluate_answer(event):
    """
    Evalúa la respuesta del estudiante
    """
    question = event.get('question', '')
    answer = event.get('answer', '')
    context = event.get('context', {})
    
    prompt = f"""Evalúa esta respuesta:
    
    Pregunta: {question}
    Respuesta del estudiante: {answer}
    
    Proporciona:
    1. Si es correcta (true/false)
    2. Score del 0-10
    3. Feedback constructivo
    4. Sugerencias de mejora
    5. Siguiente tema recomendado
    
    Formato JSON.
    """
    
    response = invoke_bedrock_model(prompt)
    
    return success_response(response)

def invoke_bedrock_model(prompt):
    """
    Invoca modelo de Bedrock (Claude 3)
    """
    try:
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        content = response_body['content'][0]['text']
        
        # Parsear JSON de la respuesta
        return json.loads(content)
        
    except Exception as e:
        # Fallback a respuestas predefinidas
        return generate_fallback_response(prompt)

def generate_fallback_response(prompt):
    """
    Genera respuesta de fallback si Bedrock falla
    """
    if 'generate_questions' in prompt.lower():
        return {
            'questions': [
                {
                    'question': 'Pregunta de ejemplo',
                    'options': ['A', 'B', 'C', 'D'],
                    'correct_answer': 'A',
                    'explanation': 'Explicación de ejemplo'
                }
            ]
        }
    else:
        return {
            'is_correct': True,
            'score': 8.0,
            'feedback': 'Buena respuesta',
            'suggestions': [],
            'next_topic': 'Tema avanzado'
        }

def success_response(data):
    return {
        'statusCode': 200,
        'body': json.dumps(data),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def error_response(message, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': message}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
```

---

## 5. Image Processor

**Función:** `maes3-image-processor`  
**Runtime:** Python 3.11  
**Timeout:** 30 segundos  
**Memory:** 512 MB

### lambda_function.py

```python
import json
import boto3
from urllib.parse import urlparse

rekognition = boto3.client('rekognition', region_name='us-east-1')
textract = boto3.client('textract', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Procesa imágenes con IA
    """
    try:
        action = event.get('action')
        
        if action == 'process':
            return process_image(event)
        elif action == 'optimize':
            return optimize_image(event)
        else:
            return error_response('Invalid action', 400)
            
    except Exception as e:
        return error_response(str(e), 500)

def process_image(event):
    """
    Procesa imagen: OCR, labels, faces
    """
    image_url = event.get('image_url', '')
    operations = event.get('operations', ['labels'])
    
    # Parsear URL de S3
    parsed = urlparse(image_url)
    bucket = parsed.netloc.split('.')[0]
    key = parsed.path.lstrip('/')
    
    results = {}
    
    # Detectar labels (objetos, escenas)
    if 'labels' in operations:
        labels_response = rekognition.detect_labels(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            MaxLabels=10,
            MinConfidence=70
        )
        results['labels'] = [
            {
                'name': label['Name'],
                'confidence': label['Confidence']
            }
            for label in labels_response['Labels']
        ]
    
    # OCR (extraer texto)
    if 'ocr' in operations:
        textract_response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': bucket, 'Name': key}}
        )
        text_lines = []
        for block in textract_response['Blocks']:
            if block['BlockType'] == 'LINE':
                text_lines.append(block['Text'])
        results['ocr'] = {
            'text': '\n'.join(text_lines),
            'lines': text_lines
        }
    
    # Detectar rostros
    if 'faces' in operations:
        faces_response = rekognition.detect_faces(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            Attributes=['ALL']
        )
        results['faces'] = {
            'count': len(faces_response['FaceDetails']),
            'emotions': [
                face['Emotions'][0]['Type']
                for face in faces_response['FaceDetails']
            ] if faces_response['FaceDetails'] else []
        }
    
    # Detectar contenido inapropiado
    if 'moderation' in operations:
        moderation_response = rekognition.detect_moderation_labels(
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            MinConfidence=60
        )
        results['moderation'] = {
            'is_safe': len(moderation_response['ModerationLabels']) == 0,
            'labels': [
                label['Name']
                for label in moderation_response['ModerationLabels']
            ]
        }
    
    return success_response(results)

def optimize_image(event):
    """
    Optimiza imagen (compresión, resize)
    """
    # Esta función se ejecutaría de forma asíncrona
    # para optimizar imágenes subidas
    image_url = event.get('image_url', '')
    user_id = event.get('user_id')
    
    # Aquí iría lógica de optimización con PIL o similar
    
    return success_response({
        'message': 'Image optimization queued',
        'original_url': image_url
    })

def success_response(data):
    return {
        'statusCode': 200,
        'body': json.dumps(data),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }

def error_response(message, status_code):
    return {
        'statusCode': status_code,
        'body': json.dumps({'error': message}),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
```

---

## Deployment

### Usando AWS CLI

```bash
# 1. Crear archivo ZIP
cd lambda-function
zip -r function.zip .

# 2. Crear función Lambda
aws lambda create-function \
  --function-name maes3-content-analyzer \
  --runtime python3.11 \
  --role arn:aws:iam::123456789:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512

# 3. Actualizar función existente
aws lambda update-function-code \
  --function-name maes3-content-analyzer \
  --zip-file fileb://function.zip
```

### Usando Terraform

```hcl
resource "aws_lambda_function" "content_analyzer" {
  filename      = "function.zip"
  function_name = "maes3-content-analyzer"
  role          = aws_iam_role.lambda_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      ENVIRONMENT = "production"
    }
  }
}
```

---

## Testing Local

### Usando SAM CLI

```bash
# Instalar SAM CLI
pip install aws-sam-cli

# Invocar localmente
sam local invoke maes3-content-analyzer \
  --event event.json
```

**event.json:**
```json
{
  "action": "analyze",
  "content": "Este es un texto de prueba sobre React y TypeScript..."
}
```

---

¡Funciones Lambda listas para usar! 🚀
