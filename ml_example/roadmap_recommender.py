"""
Roadmap Recommender usando Redes Neuronales (Neural Networks)
Analiza el dataset y recomienda el mejor roadmap por categoría
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.ensemble import RandomForestRegressor
import joblib
import json
import sys
import os
import warnings
warnings.filterwarnings('ignore')

class RoadmapRecommender:
    def __init__(self, dataset_path):
        """Inicializar el recomendador con el dataset"""
        self.df = pd.read_csv(dataset_path)
        self.scaler = StandardScaler()
        self.model = None
        self.prepare_data()
        
    def prepare_data(self):
        """Preparar datos para el modelo"""
        # Crear score de calidad combinando múltiples métricas
        self.df['quality_score'] = (
            self.df['completion_rate'] * 0.35 +
            self.df['usefulness_score'] / 5 * 0.30 +
            (1 - self.df['dropout_rate']) * 0.20 +
            self.df['efficiency_rate'] / self.df['efficiency_rate'].max() * 0.15
        )
        
        # Normalizar engagement_score
        max_engagement = self.df['engagement_score'].max()
        if max_engagement > 0:
            self.df['quality_score'] += (self.df['engagement_score'] / max_engagement) * 0.10
        
        # Asegurar que esté entre 0 y 1
        self.df['quality_score'] = self.df['quality_score'].clip(0, 1)
        
    def train_model(self):
        """Entrenar RED NEURONAL (Neural Network) para predecir calidad"""
        features = [
            'completion_count', 'dropout_count', 'avg_hours_spent',
            'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
            'completion_rate', 'efficiency_rate', 'engagement_score'
        ]
        
        X = self.df[features]
        y = self.df['quality_score']
        
        # Escalar features
        X_scaled = self.scaler.fit_transform(X)
        
        # Entrenar RED NEURONAL (Multi-Layer Perceptron)
        # Arquitectura: 9 inputs -> 64 neurons -> 32 neurons -> 16 neurons -> 1 output
        self.model = MLPRegressor(
            hidden_layer_sizes=(64, 32, 16),  # 3 capas ocultas
            activation='relu',                 # Función de activación ReLU
            solver='adam',                     # Optimizador Adam
            alpha=0.001,                       # Regularización L2
            batch_size=32,                     # Tamaño de batch
            learning_rate='adaptive',          # Learning rate adaptativo
            learning_rate_init=0.001,          # Learning rate inicial
            max_iter=1000,                     # Máximo de iteraciones
            random_state=42,
            early_stopping=True,               # Early stopping
            validation_fraction=0.1,           # 10% para validación
            n_iter_no_change=50,               # Paciencia para early stopping
            verbose=False
        )
        
        # Entrenar sin imprimir (para no interferir con JSON output)
        self.model.fit(X_scaled, y)
        score = self.model.score(X_scaled, y)
        
        return score
    
    def get_best_roadmap_by_tag(self, tag):
        """Obtener el mejor roadmap para un tag específico usando ML"""
        tag = tag.lower().strip()
        
        # Filtrar roadmaps que contengan el tag
        filtered = self.df[
            self.df['tags'].str.lower().str.contains(tag, na=False, regex=False)
        ].copy()
        
        if filtered.empty:
            return None
        
        # Si el modelo está entrenado, usar predicciones
        if self.model is not None:
            features = [
                'completion_count', 'dropout_count', 'avg_hours_spent',
                'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
                'completion_rate', 'efficiency_rate', 'engagement_score'
            ]
            
            X = filtered[features]
            X_scaled = self.scaler.transform(X)
            
            # Predecir calidad con el modelo
            filtered['predicted_quality'] = self.model.predict(X_scaled)
            
            # Combinar predicción con score calculado
            filtered['final_score'] = (
                filtered['predicted_quality'] * 0.6 +
                filtered['quality_score'] * 0.4
            )
        else:
            filtered['final_score'] = filtered['quality_score']
        
        # Obtener el mejor roadmap
        best = filtered.nlargest(1, 'final_score').iloc[0]
        
        # Calcular confianza basada en cantidad de datos
        confidence = min(100, (len(filtered) / 10) * 100)
        
        return {
            'roadmap_id': best['roadmap_id'],
            'name': best['name'],
            'tags': best['tags'],
            'quality_score': round(float(best['final_score']), 4),
            'completion_rate': round(float(best['completion_rate']), 4),
            'usefulness_score': round(float(best['usefulness_score']), 2),
            'efficiency_rate': round(float(best['efficiency_rate']), 4),
            'dropout_rate': round(float(best['dropout_rate']), 4),
            'engagement_score': round(float(best['engagement_score']), 2),
            'completion_count': int(best['completion_count']),
            'bookmark_count': int(best['bookmark_count']),
            'avg_hours_spent': round(float(best['avg_hours_spent']), 2),
            'avg_nodes_completed': round(float(best['avg_nodes_completed']), 2),
            'confidence': round(confidence, 2),
            'total_candidates': len(filtered),
            'ml_model_used': self.model is not None,
            'model_type': 'Neural Network (MLP)',
            'architecture': '9-64-32-16-1',
            'activation': 'ReLU',
            'optimizer': 'Adam'
        }
    
    def get_top_roadmaps_by_tag(self, tag, top_n=5):
        """Obtener los top N roadmaps para un tag"""
        tag = tag.lower().strip()
        
        filtered = self.df[
            self.df['tags'].str.lower().str.contains(tag, na=False, regex=False)
        ].copy()
        
        if filtered.empty:
            return []
        
        if self.model is not None:
            features = [
                'completion_count', 'dropout_count', 'avg_hours_spent',
                'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
                'completion_rate', 'efficiency_rate', 'engagement_score'
            ]
            
            X = filtered[features]
            X_scaled = self.scaler.transform(X)
            filtered['predicted_quality'] = self.model.predict(X_scaled)
            filtered['final_score'] = (
                filtered['predicted_quality'] * 0.6 +
                filtered['quality_score'] * 0.4
            )
        else:
            filtered['final_score'] = filtered['quality_score']
        
        top_roadmaps = filtered.nlargest(top_n, 'final_score')
        
        results = []
        for idx, row in top_roadmaps.iterrows():
            results.append({
                'roadmap_id': row['roadmap_id'],
                'name': row['name'],
                'tags': row['tags'],
                'quality_score': round(float(row['final_score']), 4),
                'completion_rate': round(float(row['completion_rate']), 4),
                'usefulness_score': round(float(row['usefulness_score']), 2),
                'efficiency_rate': round(float(row['efficiency_rate']), 4),
            })
        
        return results
    
    def get_available_tags(self):
        """Obtener todos los tags disponibles"""
        all_tags = set()
        for tags_str in self.df['tags'].dropna():
            tags = [t.strip().lower() for t in str(tags_str).split(',')]
            all_tags.update(tags)
        
        return sorted(list(all_tags))
    
    def save_model(self, path='ml_example/models/'):
        """Guardar modelo entrenado"""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.model, f'{path}roadmap_model.pkl')
        joblib.dump(self.scaler, f'{path}scaler.pkl')
        
    def load_model(self, path='ml_example/models/'):
        """Cargar modelo entrenado"""
        try:
            self.model = joblib.load(f'{path}roadmap_model.pkl')
            self.scaler = joblib.load(f'{path}scaler.pkl')
            return True
        except:
            return False


def main():
    """Función principal para usar desde línea de comandos"""
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': 'Uso: python roadmap_recommender.py <dataset_path> <tag> [exclude_roadmaps]'
        }))
        sys.exit(1)
    
    dataset_path = sys.argv[1]
    tag = sys.argv[2]
    exclude_roadmaps = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else []
    
    try:
        # Inicializar recomendador
        recommender = RoadmapRecommender(dataset_path)
        
        # Filtrar roadmaps excluidos (completados por el usuario)
        if exclude_roadmaps:
            recommender.df = recommender.df[~recommender.df['roadmap_id'].isin(exclude_roadmaps)]
        
        # Intentar cargar modelo pre-entrenado
        if not recommender.load_model():
            # Si no existe, entrenar nuevo modelo
            score = recommender.train_model()
            recommender.save_model()
        
        # Obtener recomendación
        result = recommender.get_best_roadmap_by_tag(tag)
        
        if result is None:
            print(json.dumps({
                'error': f'No se encontraron roadmaps para el tag: {tag}',
                'available_tags': recommender.get_available_tags()[:20]
            }, ensure_ascii=False))
        else:
            print(json.dumps(result, indent=2, ensure_ascii=False))
    
    except Exception as e:
        print(json.dumps({
            'error': str(e)
        }, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
