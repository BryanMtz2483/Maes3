"""
Recomendador Personalizado de Roadmaps
- Similares: Roadmaps con nodos en común con los que ya completó (like)
- Nuevos: Roadmaps con nodos diferentes para explorar
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
import json
import sys
import warnings
warnings.filterwarnings('ignore')

class PersonalizedRecommender:
    def __init__(self, dataset_path, user_data):
        """
        Inicializar recomendador personalizado
        
        Args:
            dataset_path: Ruta al CSV del dataset
            user_data: Dict con completed_roadmaps, completed_nodes, etc.
        """
        self.df = pd.read_csv(dataset_path)
        
        # Manejar ambos formatos: lista simple o dict con datos
        if isinstance(user_data, dict):
            self.user_roadmap_ids = user_data.get('completed_roadmaps', [])
            self.user_node_ids = user_data.get('completed_nodes', [])
            self.total_roadmaps_completed = user_data.get('total_roadmaps_completed', len(self.user_roadmap_ids))
            self.total_nodes_completed = user_data.get('total_nodes_completed', len(self.user_node_ids))
        else:
            # Compatibilidad con formato antiguo
            self.user_roadmap_ids = user_data if isinstance(user_data, list) else []
            self.user_node_ids = []
            self.total_roadmaps_completed = len(self.user_roadmap_ids)
            self.total_nodes_completed = 0
            
        self.scaler = StandardScaler()
        self.model = None
        self.prepare_data()
        
    def prepare_data(self):
        """Preparar datos y calcular quality score"""
        # Crear score de calidad
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
        """Entrenar Red Neuronal para predecir calidad"""
        features = [
            'completion_count', 'dropout_count', 'avg_hours_spent',
            'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
            'completion_rate', 'efficiency_rate', 'engagement_score'
        ]
        
        X = self.df[features]
        y = self.df['quality_score']
        
        # Escalar features
        X_scaled = self.scaler.fit_transform(X)
        
        # Red Neuronal
        self.model = MLPRegressor(
            hidden_layer_sizes=(64, 32, 16),
            activation='relu',
            solver='adam',
            alpha=0.001,
            batch_size=32,
            learning_rate='adaptive',
            learning_rate_init=0.001,
            max_iter=1000,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=50,
            verbose=False
        )
        
        self.model.fit(X_scaled, y)
        return self.model.score(X_scaled, y)
    
    def get_user_completed_nodes(self):
        """Obtener todos los nodos/tags que el usuario ha completado"""
        user_tags = set()
        
        # Si tenemos nodos completados directamente, usarlos
        if self.user_node_ids:
            # Los node_ids son los tags/temas reales
            user_tags.update([str(node_id).lower() for node_id in self.user_node_ids])
        
        # También incluir tags de roadmaps completados
        if self.user_roadmap_ids:
            user_roadmaps = self.df[self.df['roadmap_id'].isin(self.user_roadmap_ids)]
            for tags_str in user_roadmaps['tags'].dropna():
                tags = [t.strip().lower() for t in str(tags_str).split(',')]
                user_tags.update(tags)
        
        return user_tags
    
    def calculate_similarity(self, roadmap_tags, user_tags):
        """
        Calcular similitud entre un roadmap y los tags del usuario
        
        Returns:
            float: Porcentaje de tags en común (0 a 1)
        """
        if not user_tags:
            return 0.0
        
        roadmap_tag_set = set([t.strip().lower() for t in str(roadmap_tags).split(',')])
        
        # Intersección de tags
        common_tags = roadmap_tag_set.intersection(user_tags)
        
        # Similitud = tags en común / total de tags del roadmap
        if len(roadmap_tag_set) == 0:
            return 0.0
        
        return len(common_tags) / len(roadmap_tag_set)
    
    def get_recommendations(self, tag=None, top_n=5):
        """
        Obtener recomendaciones personalizadas en dos categorías
        
        Args:
            tag: Tag opcional para filtrar
            top_n: Número de recomendaciones por categoría
            
        Returns:
            dict: {
                'similar': [...],  # Roadmaps similares a los completados
                'new': [...]       # Roadmaps nuevos para explorar
            }
        """
        # Obtener tags del usuario
        user_tags = self.get_user_completed_nodes()
        
        # Filtrar roadmaps que el usuario ya completó
        available = self.df[~self.df['roadmap_id'].isin(self.user_roadmap_ids)].copy()
        
        # Si se especificó un tag, filtrar por él
        if tag:
            tag = tag.lower().strip()
            available = available[
                available['tags'].str.lower().str.contains(tag, na=False, regex=False)
            ]
        
        if available.empty:
            return {'similar': [], 'new': [], 'user_has_completed': len(self.user_roadmap_ids)}
        
        # Calcular similitud para cada roadmap
        available['similarity'] = available['tags'].apply(
            lambda tags: self.calculate_similarity(tags, user_tags)
        )
        
        # Entrenar modelo si no está entrenado
        if self.model is None:
            self.train_model()
        
        # Predecir calidad con ML
        features = [
            'completion_count', 'dropout_count', 'avg_hours_spent',
            'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
            'completion_rate', 'efficiency_rate', 'engagement_score'
        ]
        
        X = available[features]
        X_scaled = self.scaler.transform(X)
        available['predicted_quality'] = self.model.predict(X_scaled)
        
        # Score final combinando predicción ML y quality score
        available['final_score'] = (
            available['predicted_quality'] * 0.6 +
            available['quality_score'] * 0.4
        )
        
        # CATEGORÍA 1: SIMILARES (alta similitud con roadmaps completados)
        # Ordenar por similitud y luego por calidad
        similar = available[available['similarity'] > 0.2].copy()  # Al menos 20% de similitud
        similar['combined_score'] = similar['similarity'] * 0.5 + similar['final_score'] * 0.5
        similar = similar.nlargest(top_n, 'combined_score')
        
        # CATEGORÍA 2: NUEVOS (baja similitud, para explorar)
        # Ordenar por calidad pero con baja similitud
        new = available[available['similarity'] < 0.3].copy()  # Menos de 30% de similitud
        new = new.nlargest(top_n, 'final_score')
        
        # Formatear resultados
        similar_results = self._format_results(similar)
        new_results = self._format_results(new)
        
        return {
            'similar': similar_results,
            'new': new_results,
            'user_has_completed': self.total_roadmaps_completed,
            'user_nodes_completed': self.total_nodes_completed,
            'user_tags_count': len(user_tags),
            'total_available': len(available),
            'model_type': 'Neural Network (MLP)',
            'personalized': True
        }
    
    def _format_results(self, df):
        """Formatear resultados para JSON"""
        results = []
        for idx, row in df.iterrows():
            results.append({
                'roadmap_id': row['roadmap_id'],
                'name': row['name'],
                'tags': row['tags'],
                'quality_score': round(float(row['final_score']), 4),
                'similarity': round(float(row['similarity']), 4) if 'similarity' in row else 0,
                'completion_rate': round(float(row['completion_rate']), 4),
                'usefulness_score': round(float(row['usefulness_score']), 2),
                'efficiency_rate': round(float(row['efficiency_rate']), 4),
                'avg_hours_spent': round(float(row['avg_hours_spent']), 2),
                'bookmark_count': int(row['bookmark_count']),
            })
        return results


def main():
    """Función principal para usar desde línea de comandos"""
    if len(sys.argv) < 3:
        print(json.dumps({
            'error': 'Uso: python personalized_recommender.py <dataset_path> <user_roadmap_ids_json> [tag]'
        }))
        sys.exit(1)
    
    dataset_path = sys.argv[1]
    user_roadmap_ids_arg = sys.argv[2]
    tag = sys.argv[3] if len(sys.argv) > 3 else None
    
    try:
        # Parsear datos del usuario
        # Si empieza con @, leer desde archivo
        if user_roadmap_ids_arg.startswith('@'):
            file_path = user_roadmap_ids_arg[1:]  # Quitar el @
            with open(file_path, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
        else:
            user_data = json.loads(user_roadmap_ids_arg)
        
        # Inicializar recomendador
        recommender = PersonalizedRecommender(dataset_path, user_data)
        
        # Obtener recomendaciones
        recommendations = recommender.get_recommendations(tag=tag, top_n=5)
        
        print(json.dumps(recommendations, indent=2, ensure_ascii=False))
    
    except Exception as e:
        print(json.dumps({
            'error': str(e)
        }, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
