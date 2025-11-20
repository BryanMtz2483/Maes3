# 🤖 Machine Learning - Roadmap Efficiency Classifier

Este directorio contiene scripts de ejemplo para entrenar modelos de machine learning que clasifican y rankean roadmaps por eficiencia.

## 📋 Requisitos

- Python 3.8+
- pip

## 🚀 Instalación

1. Crear un entorno virtual (recomendado):

```bash
python -m venv venv
```

2. Activar el entorno virtual:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

3. Instalar dependencias:

```bash
pip install -r requirements.txt
```

## 📊 Preparar Datos

Primero, exporta los datos desde Laravel:

```bash
# Desde el directorio raíz de Laravel
php artisan roadmap:export-dataset --format=csv
```

Esto generará un archivo CSV en `storage/app/roadmaps_ml_dataset_YYYY-MM-DD_HHMMSS.csv`

## 🎯 Entrenar Modelos

Ejecuta el script de entrenamiento:

```bash
python train_roadmap_classifier.py
```

### Modelos Entrenados

El script entrena dos modelos:

1. **Clasificador de Eficiencia** (Random Forest Classifier)
   - Clasifica roadmaps en: Low, Medium, High efficiency
   - Basado en completion_rate y usefulness_score

2. **Regresor de Utilidad** (Random Forest Regressor)
   - Predice el usefulness_score
   - Útil para estimar la calidad percibida

## 📈 Salidas

El script genera:

1. **Métricas de clasificación**: Precision, Recall, F1-Score
2. **Importancia de features**: Qué variables son más relevantes
3. **Visualizaciones**: `roadmap_analysis.png` con 4 gráficos:
   - Completion rate por tema
   - Eficiencia (horas vs nodos)
   - Distribución de usefulness score
   - Matriz de correlación

4. **Rankings**: Top 10 roadmaps por tema

## 🔍 Features Utilizados

### Para Clasificación:
- `completion_count`: Usuarios que completaron
- `dropout_count`: Usuarios que abandonaron
- `avg_hours_spent`: Horas promedio
- `avg_nodes_completed`: Nodos completados promedio
- `bookmark_count`: Guardados
- `usefulness_score`: Calificación de utilidad
- `topic_encoded`: Tema codificado

### Métricas Derivadas:
- `completion_rate`: completion_count / (completion_count + dropout_count)
- `efficiency_rate`: avg_nodes_completed / avg_hours_spent

## 📊 Ejemplo de Uso

```python
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

# Cargar modelo entrenado
clf = joblib.load('roadmap_classifier.pkl')
scaler = joblib.load('scaler.pkl')

# Preparar nuevo roadmap
new_roadmap = pd.DataFrame({
    'completion_count': [250],
    'dropout_count': [50],
    'avg_hours_spent': [35.5],
    'avg_nodes_completed': [28.0],
    'bookmark_count': [120],
    'usefulness_score': [4.2],
    'topic_encoded': [0]  # javascript
})

# Predecir
X_scaled = scaler.transform(new_roadmap)
prediction = clf.predict(X_scaled)
print(f"Eficiencia predicha: {prediction[0]}")
```

## 🎯 Aplicaciones

### 1. Sistema de Recomendaciones
Recomendar el mejor roadmap de un tema específico basado en:
- Tasa de completación
- Eficiencia temporal
- Satisfacción de usuarios

### 2. Optimización de Contenido
Identificar qué características hacen que un roadmap sea exitoso:
- Número óptimo de nodos
- Duración ideal
- Estructura de contenido

### 3. Detección de Roadmaps de Baja Calidad
Identificar roadmaps que necesitan mejoras basándose en:
- Alta tasa de abandono
- Baja calificación de utilidad
- Bajo engagement

### 4. Predicción de Éxito
Predecir el rendimiento de nuevos roadmaps antes de publicarlos.

## 📝 Personalización

### Ajustar Pesos del Score Compuesto

En la función `rank_roadmaps_by_topic()`:

```python
composite_score = (
    completion_rate * 0.4 +      # Peso de completación
    usefulness_score / 5 * 0.3 + # Peso de utilidad
    efficiency_rate * 0.2 +       # Peso de eficiencia
    bookmark_count * 0.1          # Peso de engagement
)
```

### Agregar Nuevos Features

1. Exporta datos adicionales desde Laravel
2. Agrégalos a la lista de `features` en el script
3. Re-entrena el modelo

## 🔧 Troubleshooting

### Error: "File not found"
- Verifica que el archivo CSV esté en la ruta correcta
- Actualiza `CSV_FILE` en el script

### Error: "No module named 'sklearn'"
- Asegúrate de haber instalado las dependencias: `pip install -r requirements.txt`

### Advertencias de convergencia
- Normal en datasets pequeños
- Aumenta `n_estimators` o ajusta `max_depth`

## 📚 Recursos Adicionales

- [Scikit-learn Documentation](https://scikit-learn.org/)
- [Random Forest Classifier](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html)
- [Feature Importance](https://scikit-learn.org/stable/auto_examples/ensemble/plot_forest_importances.html)

---

**Nota**: Este es un ejemplo educativo. Para producción, considera:
- Validación cruzada
- Optimización de hiperparámetros (GridSearchCV)
- Manejo de desbalanceo de clases
- Modelos más avanzados (XGBoost, Neural Networks)
