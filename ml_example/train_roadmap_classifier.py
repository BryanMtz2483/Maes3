"""
Script de ejemplo para entrenar un modelo de Machine Learning
que clasifica y rankea roadmaps por eficiencia.

Requisitos:
    pip install pandas scikit-learn numpy matplotlib seaborn

Uso:
    python train_roadmap_classifier.py
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns

# Configuración
CSV_FILE = '../storage/app/roadmaps_ml_dataset.csv'  # Ajustar ruta según sea necesario

def load_data():
    """Cargar dataset desde CSV"""
    print("📂 Cargando dataset...")
    df = pd.read_csv(CSV_FILE)
    print(f"✓ Dataset cargado: {len(df)} registros")
    return df

def preprocess_data(df):
    """Preprocesar datos para ML"""
    print("\n🔧 Preprocesando datos...")
    
    # Crear etiquetas de eficiencia (clasificación)
    # Basado en completion_rate y usefulness_score
    df['efficiency_label'] = pd.cut(
        df['completion_rate'] * df['usefulness_score'],
        bins=[0, 1.5, 3.0, 5.0],
        labels=['Low', 'Medium', 'High']
    )
    
    # Extraer tema principal de los tags
    df['main_topic'] = df['tags'].str.split(',').str[0]
    
    # Codificar variables categóricas
    le_topic = LabelEncoder()
    df['topic_encoded'] = le_topic.fit_transform(df['main_topic'])
    
    print(f"✓ Temas encontrados: {df['main_topic'].unique()}")
    print(f"✓ Distribución de eficiencia:")
    print(df['efficiency_label'].value_counts())
    
    return df, le_topic

def train_classifier(df):
    """Entrenar clasificador de eficiencia"""
    print("\n🤖 Entrenando clasificador de eficiencia...")
    
    # Features
    features = [
        'completion_count', 'dropout_count', 'avg_hours_spent',
        'avg_nodes_completed', 'bookmark_count', 'usefulness_score',
        'topic_encoded'
    ]
    
    X = df[features]
    y = df['efficiency_label']
    
    # Eliminar filas con NaN
    mask = ~y.isna()
    X = X[mask]
    y = y[mask]
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Escalar features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Entrenar modelo
    clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    clf.fit(X_train_scaled, y_train)
    
    # Evaluar
    y_pred = clf.predict(X_test_scaled)
    
    print("\n📊 Resultados del Clasificador:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': clf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🎯 Importancia de Features:")
    print(feature_importance)
    
    return clf, scaler, feature_importance

def train_regressor(df):
    """Entrenar regresor para predecir usefulness_score"""
    print("\n🤖 Entrenando regresor de utilidad...")
    
    # Features
    features = [
        'completion_count', 'dropout_count', 'avg_hours_spent',
        'avg_nodes_completed', 'bookmark_count', 'completion_rate',
        'efficiency_rate', 'topic_encoded'
    ]
    
    X = df[features]
    y = df['usefulness_score']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Escalar
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Entrenar
    reg = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
    reg.fit(X_train_scaled, y_train)
    
    # Evaluar
    y_pred = reg.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n📊 Resultados del Regresor:")
    print(f"  MSE: {mse:.4f}")
    print(f"  R²: {r2:.4f}")
    print(f"  RMSE: {np.sqrt(mse):.4f}")
    
    return reg, scaler

def visualize_data(df):
    """Crear visualizaciones del dataset"""
    print("\n📈 Generando visualizaciones...")
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. Distribución de completion rate por tema
    df_plot = df.groupby('main_topic')['completion_rate'].mean().sort_values(ascending=False)
    df_plot.plot(kind='bar', ax=axes[0, 0], color='skyblue')
    axes[0, 0].set_title('Completion Rate Promedio por Tema')
    axes[0, 0].set_ylabel('Completion Rate')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # 2. Relación entre horas y nodos completados
    axes[0, 1].scatter(df['avg_hours_spent'], df['avg_nodes_completed'], 
                       c=df['usefulness_score'], cmap='viridis', alpha=0.6)
    axes[0, 1].set_xlabel('Avg Hours Spent')
    axes[0, 1].set_ylabel('Avg Nodes Completed')
    axes[0, 1].set_title('Eficiencia: Horas vs Nodos Completados')
    plt.colorbar(axes[0, 1].collections[0], ax=axes[0, 1], label='Usefulness Score')
    
    # 3. Distribución de usefulness score
    df['usefulness_score'].hist(bins=20, ax=axes[1, 0], color='coral', edgecolor='black')
    axes[1, 0].set_title('Distribución de Usefulness Score')
    axes[1, 0].set_xlabel('Usefulness Score')
    axes[1, 0].set_ylabel('Frecuencia')
    
    # 4. Heatmap de correlaciones
    corr_features = ['completion_count', 'dropout_count', 'avg_hours_spent',
                     'avg_nodes_completed', 'bookmark_count', 'usefulness_score']
    corr = df[corr_features].corr()
    sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=axes[1, 1])
    axes[1, 1].set_title('Matriz de Correlación')
    
    plt.tight_layout()
    plt.savefig('roadmap_analysis.png', dpi=300, bbox_inches='tight')
    print("✓ Visualizaciones guardadas en: roadmap_analysis.png")

def rank_roadmaps_by_topic(df, topic='javascript'):
    """Rankear roadmaps de un tema específico"""
    print(f"\n🏆 Top 10 Roadmaps de {topic.upper()}:")
    
    topic_df = df[df['main_topic'] == topic].copy()
    
    # Calcular score compuesto
    topic_df['composite_score'] = (
        topic_df['completion_rate'] * 0.4 +
        topic_df['usefulness_score'] / 5 * 0.3 +
        topic_df['efficiency_rate'] / topic_df['efficiency_rate'].max() * 0.2 +
        topic_df['bookmark_count'] / topic_df['bookmark_count'].max() * 0.1
    )
    
    top_roadmaps = topic_df.nlargest(10, 'composite_score')[
        ['name', 'completion_rate', 'usefulness_score', 'composite_score']
    ]
    
    print(top_roadmaps.to_string(index=False))
    
    return top_roadmaps

def main():
    """Función principal"""
    print("=" * 60)
    print("🚀 ROADMAP EFFICIENCY ML CLASSIFIER")
    print("=" * 60)
    
    # Cargar y preprocesar
    df = load_data()
    df, le_topic = preprocess_data(df)
    
    # Entrenar modelos
    clf, clf_scaler, feature_importance = train_classifier(df)
    reg, reg_scaler = train_regressor(df)
    
    # Visualizar
    visualize_data(df)
    
    # Rankear por tema
    for topic in df['main_topic'].unique()[:3]:
        rank_roadmaps_by_topic(df, topic)
    
    print("\n" + "=" * 60)
    print("✅ Entrenamiento completado exitosamente!")
    print("=" * 60)
    
    # Guardar modelos (opcional)
    # import joblib
    # joblib.dump(clf, 'roadmap_classifier.pkl')
    # joblib.dump(reg, 'roadmap_regressor.pkl')
    # print("\n💾 Modelos guardados")

if __name__ == "__main__":
    main()
