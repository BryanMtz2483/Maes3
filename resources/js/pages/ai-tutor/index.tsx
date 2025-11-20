import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Brain, 
    Sparkles, 
    TrendingUp, 
    Award, 
    Clock, 
    Target,
    BookOpen,
    CheckCircle2,
    Lightbulb,
    BarChart3,
    Users,
    Zap,
    ChevronDown,
    ChevronUp,
    Loader2,
    Database,
    Cpu,
    Network,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface AITutorProps {
    popularTags: string[];
    auth?: {
        user: {
            id: number;
            username: string;
            email: string;
            profile_pic?: string;
            account_name?: string;
        };
    };
}

interface Recommendation {
    roadmap_id: string;
    name: string;
    tags: string;
    quality_score: number;
    completion_rate: number;
    usefulness_score: number;
    efficiency_rate: number;
    dropout_rate?: number;
    engagement_score?: number;
    completion_count?: number;
    bookmark_count: number;
    avg_hours_spent: number;
    avg_nodes_completed?: number;
    confidence?: number;
    total_candidates?: number;
    ml_model_used?: boolean;
    model_type?: string;
    architecture?: string;
    activation?: string;
    optimizer?: string;
    similarity?: number;
    description?: string;
    cover_image?: string;
    roadmap_details?: {
        description: string;
        cover_image: string;
        created_at: string;
    };
}

interface PersonalizedRecommendations {
    similar: Recommendation[];
    new: Recommendation[];
    user_has_completed: number;
    user_nodes_completed: number;
    user_tags_count: number;
    total_available: number;
    model_type: string;
    personalized: boolean;
}

export default function AITutorIndex({ popularTags = [], auth }: AITutorProps) {
    const [tag, setTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Iniciando análisis...');
    const [loadingStep, setLoadingStep] = useState(0);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [personalizedRecs, setPersonalizedRecs] = useState<PersonalizedRecommendations | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [showPersonalized, setShowPersonalized] = useState(false);
    const [showCompletedDetails, setShowCompletedDetails] = useState(false);
    const [completedDetails, setCompletedDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);


    const handleAnalyze = async () => {
        if (!tag.trim()) {
            setError('Por favor ingresa un tag');
            return;
        }

        setLoading(true);
        setError(null);
        setRecommendation(null);
        setPersonalizedRecs(null);
        setAvailableTags([]);
        setShowPersonalized(false);
        setLoadingStep(0);
        
        // Animación de progreso con pasos - forzar progreso completo
        const steps = [
            { step: 0, delay: 0 },
            { step: 1, delay: 500 },
            { step: 2, delay: 1000 },
            { step: 3, delay: 1500 },
            { step: 4, delay: 2000 },
            { step: 5, delay: 2500 },
        ];
        
        steps.forEach(({ step, delay }) => {
            setTimeout(() => {
                setLoadingStep(step);
            }, delay);
        });

        try {
            // Usar ruta web sin CSRF (excluida en middleware)
            const response = await fetch('/tutor/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ tag: tag.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.message || 'Error al analizar');
                if (data.available_tags) {
                    setAvailableTags(data.available_tags);
                }
                return;
            }

            if (data.recommendation) {
                setLoadingMessage('Recomendación encontrada!');
                setRecommendation(data.recommendation);
            } else {
                setError('No se recibió recomendación del servidor');
            }
            
            // También procesar recomendaciones personalizadas si existen
            if (data.personalized) {
                setPersonalizedRecs(data.personalized);
            }
        } catch (err: any) {
            console.error('Error completo:', err);
            setError('Error de conexión: ' + (err.message || 'Verifica que el servidor esté ejecutándose'));
        } finally {
            setLoading(false);
            setLoadingMessage('Iniciando análisis...');
        }
    };

    const handleTagClick = (selectedTag: string) => {
        setTag(selectedTag);
        setError(null);
    };

    const getQualityColor = (score: number) => {
        if (score >= 0.8) return 'text-green-500';
        if (score >= 0.6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getQualityLabel = (score: number) => {
        if (score >= 0.8) return 'Excelente';
        if (score >= 0.6) return 'Bueno';
        if (score >= 0.4) return 'Regular';
        return 'Bajo';
    };

    const toggleCompletedDetails = async () => {
        if (!showCompletedDetails && !completedDetails) {
            setLoadingDetails(true);
            try {
                const response = await fetch('/progress/details');
                const data = await response.json();
                setCompletedDetails(data);
            } catch (error) {
                console.error('Error loading completed details:', error);
            } finally {
                setLoadingDetails(false);
            }
        }
        setShowCompletedDetails(!showCompletedDetails);
    };

    const getStepIcon = (step: number) => {
        switch(step) {
            case 0: return <Database className="w-5 h-5" />;
            case 1: return <Database className="w-5 h-5" />;
            case 2: return <Database className="w-5 h-5" />;
            case 3: return <Cpu className="w-5 h-5" />;
            case 4: return <Network className="w-5 h-5" />;
            case 5: return <BarChart3 className="w-5 h-5" />;
            default: return <Loader2 className="w-5 h-5" />;
        }
    };

    return (
        <>
            <Head title="IA Tutor - Recomendaciones Inteligentes" />
            <div className="min-h-screen bg-background">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-12 h-12 text-yellow-500" />
                            <h1 className="text-4xl font-bold text-foreground">IA Tutor</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Usa Machine Learning para encontrar el mejor roadmap según tus intereses.
                            Nuestro modelo analiza métricas de calidad, eficiencia y satisfacción.
                        </p>
                    </div>

                    {/* Search Section */}
                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 p-8 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-2xl font-bold text-foreground">Buscar por Categoría</h2>
                        </div>
                        
                        <div className="flex gap-4 mb-6">
                            <Input
                                type="text"
                                placeholder="Ej: javascript, python, react, machine learning..."
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                className="flex-1 text-lg border-yellow-500/20 focus:border-yellow-500"
                                disabled={loading}
                            />
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !tag.trim()}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {loadingMessage}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Analizar con IA
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Popular Tags */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">Tags populares:</p>
                            <div className="flex flex-wrap gap-2">
                                {popularTags.slice(0, 15).map((popularTag) => (
                                    <button
                                        key={popularTag}
                                        onClick={() => handleTagClick(popularTag)}
                                        className="px-4 py-2 text-sm rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                                    >
                                        {popularTag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Neural Network Animation */}
                    {loading && (
                        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 p-4 mb-8 relative overflow-hidden min-h-[400px]">
                            {/* Animated Neural Network Background */}
                            <div className="absolute inset-0 opacity-60">
                                <svg className="w-full h-full" viewBox="0 0 800 400">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    {/* Input Layer */}
                                    {[0, 1, 2, 3].map((i) => (
                                        <g key={`input-${i}`}>
                                            {loadingStep >= 0 && (
                                                <circle
                                                    cx="100"
                                                    cy={80 + i * 80}
                                                    r="25"
                                                    className="fill-purple-500"
                                                    opacity="0.3"
                                                >
                                                    <animate
                                                        attributeName="r"
                                                        values="15;30;15"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                    <animate
                                                        attributeName="opacity"
                                                        values="0.3;0;0.3"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                </circle>
                                            )}
                                            <circle
                                                cx="100"
                                                cy={80 + i * 80}
                                                r="15"
                                                className={`${loadingStep >= 0 ? 'fill-purple-500' : 'fill-gray-600'} transition-all duration-500`}
                                                filter={loadingStep >= 0 ? "url(#glow)" : ""}
                                            >
                                                {loadingStep >= 0 && (
                                                    <animate
                                                        attributeName="r"
                                                        values="15;20;15"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                )}
                                            </circle>
                                        </g>
                                    ))}
                                    
                                    {/* Hidden Layer 1 */}
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <g key={`hidden1-${i}`}>
                                            {loadingStep >= 2 && (
                                                <circle
                                                    cx="300"
                                                    cy={50 + i * 60}
                                                    r="20"
                                                    className="fill-blue-500"
                                                    opacity="0.3"
                                                >
                                                    <animate
                                                        attributeName="r"
                                                        values="12;25;12"
                                                        dur="1.2s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.15}s`}
                                                    />
                                                    <animate
                                                        attributeName="opacity"
                                                        values="0.3;0;0.3"
                                                        dur="1.2s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.15}s`}
                                                    />
                                                </circle>
                                            )}
                                            <circle
                                                cx="300"
                                                cy={50 + i * 60}
                                                r="12"
                                                className={`${loadingStep >= 2 ? 'fill-blue-500' : 'fill-gray-600'} transition-all duration-500`}
                                                filter={loadingStep >= 2 ? "url(#glow)" : ""}
                                            >
                                                {loadingStep >= 2 && (
                                                    <animate
                                                        attributeName="r"
                                                        values="12;16;12"
                                                        dur="1.2s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.15}s`}
                                                    />
                                                )}
                                            </circle>
                                        </g>
                                    ))}
                                    
                                    {/* Hidden Layer 2 */}
                                    {[0, 1, 2, 3].map((i) => (
                                        <g key={`hidden2-${i}`}>
                                            {loadingStep >= 4 && (
                                                <circle
                                                    cx="500"
                                                    cy={80 + i * 80}
                                                    r="20"
                                                    className="fill-cyan-500"
                                                    opacity="0.3"
                                                >
                                                    <animate
                                                        attributeName="r"
                                                        values="12;25;12"
                                                        dur="1.3s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                    <animate
                                                        attributeName="opacity"
                                                        values="0.3;0;0.3"
                                                        dur="1.3s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                </circle>
                                            )}
                                            <circle
                                                cx="500"
                                                cy={80 + i * 80}
                                                r="12"
                                                className={`${loadingStep >= 4 ? 'fill-cyan-500' : 'fill-gray-600'} transition-all duration-500`}
                                                filter={loadingStep >= 4 ? "url(#glow)" : ""}
                                            >
                                                {loadingStep >= 4 && (
                                                    <animate
                                                        attributeName="r"
                                                        values="12;16;12"
                                                        dur="1.3s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.2}s`}
                                                    />
                                                )}
                                            </circle>
                                        </g>
                                    ))}
                                    
                                    {/* Output Layer */}
                                    {[0, 1].map((i) => (
                                        <g key={`output-${i}`}>
                                            {loadingStep >= 5 && (
                                                <circle
                                                    cx="700"
                                                    cy={150 + i * 100}
                                                    r="30"
                                                    className="fill-green-500"
                                                    opacity="0.3"
                                                >
                                                    <animate
                                                        attributeName="r"
                                                        values="15;35;15"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.3}s`}
                                                    />
                                                    <animate
                                                        attributeName="opacity"
                                                        values="0.4;0;0.4"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.3}s`}
                                                    />
                                                </circle>
                                            )}
                                            <circle
                                                cx="700"
                                                cy={150 + i * 100}
                                                r="15"
                                                className={`${loadingStep >= 5 ? 'fill-green-500' : 'fill-gray-600'} transition-all duration-500`}
                                                filter={loadingStep >= 5 ? "url(#glow)" : ""}
                                            >
                                                {loadingStep >= 5 && (
                                                    <animate
                                                        attributeName="r"
                                                        values="15;22;15"
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                        begin={`${i * 0.3}s`}
                                                    />
                                                )}
                                            </circle>
                                        </g>
                                    ))}
                                    
                                    {/* Connections - Animated Lines */}
                                    {loadingStep >= 1 && [0, 1, 2, 3].map((i) =>
                                        [0, 1, 2, 3, 4, 5].map((j) => (
                                            <line
                                                key={`conn1-${i}-${j}`}
                                                x1="100"
                                                y1={80 + i * 80}
                                                x2="300"
                                                y2={50 + j * 60}
                                                className="stroke-purple-500"
                                                strokeWidth="2"
                                                filter="url(#glow)"
                                            >
                                                <animate
                                                    attributeName="stroke-opacity"
                                                    values="0.2;0.9;0.2"
                                                    dur="2s"
                                                    repeatCount="indefinite"
                                                    begin={`${(i + j) * 0.1}s`}
                                                />
                                            </line>
                                        ))
                                    )}
                                    
                                    {loadingStep >= 3 && [0, 1, 2, 3, 4, 5].map((i) =>
                                        [0, 1, 2, 3].map((j) => (
                                            <line
                                                key={`conn2-${i}-${j}`}
                                                x1="300"
                                                y1={50 + i * 60}
                                                x2="500"
                                                y2={80 + j * 80}
                                                className="stroke-blue-500"
                                                strokeWidth="2"
                                                filter="url(#glow)"
                                            >
                                                <animate
                                                    attributeName="stroke-opacity"
                                                    values="0.2;0.9;0.2"
                                                    dur="1.8s"
                                                    repeatCount="indefinite"
                                                    begin={`${(i + j) * 0.1}s`}
                                                />
                                            </line>
                                        ))
                                    )}
                                    
                                    {loadingStep >= 5 && [0, 1, 2, 3].map((i) =>
                                        [0, 1].map((j) => (
                                            <line
                                                key={`conn3-${i}-${j}`}
                                                x1="500"
                                                y1={80 + i * 80}
                                                x2="700"
                                                y2={150 + j * 100}
                                                className="stroke-cyan-500"
                                                strokeWidth="2"
                                                filter="url(#glow)"
                                            >
                                                <animate
                                                    attributeName="stroke-opacity"
                                                    values="0.2;1;0.2"
                                                    dur="1.5s"
                                                    repeatCount="indefinite"
                                                    begin={`${(i + j) * 0.15}s`}
                                                />
                                            </line>
                                        ))
                                    )}
                                </svg>
                            </div>
                            
                            <div className="relative z-10 flex flex-col items-center justify-center py-4">
                                <h3 className="text-2xl font-bold text-foreground mb-6">Generando resultados...</h3>
                                
                                {/* Progress Bar */}
                                <div className="w-full max-w-md">
                                    <div className="h-3 bg-muted rounded-full overflow-hidden shadow-lg">
                                        <div 
                                            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transition-all duration-500 ease-out relative"
                                            style={{ width: `${((loadingStep + 1) / 6) * 100}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-lg font-bold text-purple-400 mt-3">
                                        {Math.round(((loadingStep + 1) / 6) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Card className="bg-red-500/10 border-red-500/20 p-6 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-500 mb-2">Error</h3>
                                    <p className="text-red-400">{error}</p>
                                    
                                    {availableTags.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-red-400 mb-2">Prueba con estos tags:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {availableTags.map((availableTag) => (
                                                    <button
                                                        key={availableTag}
                                                        onClick={() => handleTagClick(availableTag)}
                                                        className="px-3 py-1 text-xs rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                                    >
                                                        {availableTag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Recommendation Result */}
                    {recommendation && (
                        <div className="space-y-6">
                            {/* Main Recommendation Card */}
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <Award className="w-12 h-12 text-green-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-bold text-foreground">{recommendation.name}</h2>
                                            {recommendation.ml_model_used && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    <Zap className="w-3 h-3 inline mr-1" />
                                                    ML Powered
                                                </span>
                                            )}
                                        </div>
                                        
                                        {recommendation.roadmap_details && (
                                            <p className="text-muted-foreground mb-4">
                                                {recommendation.roadmap_details.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {recommendation.tags.split(',').map((t, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                                >
                                                    #{t.trim()}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>Analizado de {recommendation.total_candidates} candidatos</span>
                                                <span>•</span>
                                                <span>Confianza: {recommendation.confidence}%</span>
                                            </div>
                                            {recommendation.model_type && (
                                                <div className="flex items-center gap-2 text-xs bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20">
                                                    <Zap className="w-4 h-4 text-purple-400" />
                                                    <span className="text-purple-400 font-semibold">{recommendation.model_type}</span>
                                                    {recommendation.architecture && (
                                                        <>
                                                            <span className="text-purple-400/50">•</span>
                                                            <span className="text-purple-400/80">Arquitectura: {recommendation.architecture}</span>
                                                        </>
                                                    )}
                                                    {recommendation.activation && (
                                                        <>
                                                            <span className="text-purple-400/50">•</span>
                                                            <span className="text-purple-400/80">Activación: {recommendation.activation}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {recommendation.roadmap_details?.cover_image && (
                                        <img
                                            src={recommendation.roadmap_details.cover_image}
                                            alt={recommendation.name}
                                            className="w-48 h-48 object-cover rounded-lg border-2 border-green-500/20"
                                        />
                                    )}
                                </div>

                                {/* Quality Score */}
                                <div className="bg-background/50 rounded-lg p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-foreground">Score de Calidad (ML)</h3>
                                        <div className="text-right">
                                            <div className={`text-4xl font-bold ${getQualityColor(recommendation.quality_score)}`}>
                                                {(recommendation.quality_score * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {getQualityLabel(recommendation.quality_score)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${recommendation.quality_score * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span className="text-sm text-muted-foreground">Tasa de Completación</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {(recommendation.completion_rate * 100).toFixed(1)}%
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-5 h-5 text-yellow-500" />
                                            <span className="text-sm text-muted-foreground">Utilidad</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {recommendation.usefulness_score.toFixed(1)}/5
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm text-muted-foreground">Eficiencia</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {recommendation.efficiency_rate.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-5 h-5 text-purple-500" />
                                            <span className="text-sm text-muted-foreground">Completados</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {recommendation.completion_count}
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-orange-500" />
                                            <span className="text-sm text-muted-foreground">Horas Promedio</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {recommendation.avg_hours_spent.toFixed(1)}h
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BookOpen className="w-5 h-5 text-cyan-500" />
                                            <span className="text-sm text-muted-foreground">Nodos Promedio</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {(recommendation.avg_nodes_completed || 0).toFixed(1)}
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-pink-500" />
                                            <span className="text-sm text-muted-foreground">Engagement</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {(recommendation.engagement_score || 0).toFixed(0)}
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-sm text-muted-foreground">Tasa de Abandono</span>
                                        </div>
                                        <div className="text-2xl font-bold text-foreground">
                                            {((recommendation.dropout_rate || 0) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        onClick={() => router.visit(`/roadmaps/${recommendation.roadmap_id}`)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-8"
                                        size="lg"
                                    >
                                        <BookOpen className="w-5 h-5 mr-2" />
                                        Ver Roadmap Completo
                                    </Button>
                                </div>
                            </Card>

                            {/* How it works */}
                            <Card className="border-border p-6">
                                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-yellow-500" />
                                    ¿Cómo funciona la Red Neuronal?
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-6">
                                    <div>
                                        <div className="font-semibold text-foreground mb-2">1. Filtrado</div>
                                        <p>Se filtran todos los roadmaps que contengan el tag buscado</p>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground mb-2">2. Red Neuronal</div>
                                        <p>Una Red Neuronal MLP con 3 capas ocultas (64→32→16 neuronas) analiza 9 métricas</p>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground mb-2">3. Recomendación</div>
                                        <p>Se selecciona el roadmap con el score más alto predicho por la red neuronal</p>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-purple-400" />
                                        Arquitectura de la Red Neuronal
                                    </h4>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Input Layer:</span>
                                            <span>9 features (métricas de calidad)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Hidden Layer 1:</span>
                                            <span>64 neuronas con activación ReLU</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Hidden Layer 2:</span>
                                            <span>32 neuronas con activación ReLU</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Hidden Layer 3:</span>
                                            <span>16 neuronas con activación ReLU</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Output Layer:</span>
                                            <span>1 neurona (quality score 0-1)</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-purple-500/20">
                                            <span className="text-purple-400 font-mono">Optimizador:</span>
                                            <span>Adam con learning rate adaptativo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400 font-mono">Regularización:</span>
                                            <span>L2 (alpha=0.001) + Early Stopping</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Personalized Recommendations */}
                    {personalizedRecs && (
                        <div className="space-y-6">
                            {/* Header */}
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-8 h-8 text-purple-500" />
                                        <h2 className="text-2xl font-bold text-foreground">Recomendaciones Personalizadas</h2>
                                    </div>
                                    <Button
                                        onClick={toggleCompletedDetails}
                                        variant="outline"
                                        size="sm"
                                        className="border-purple-500/30 hover:border-purple-500/50"
                                    >
                                        {showCompletedDetails ? (
                                            <>
                                                <ChevronUp className="w-4 h-4 mr-2" />
                                                Ocultar detalles
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4 mr-2" />
                                                Ver detalles
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-muted-foreground">
                                    Basado en {personalizedRecs.user_has_completed} roadmaps completados, {personalizedRecs.user_nodes_completed} nodos completados
                                    y {personalizedRecs.user_tags_count} temas que dominas
                                </p>
                                
                                {/* Completed Details Dropdown */}
                                {showCompletedDetails && (
                                    <div className="mt-6 pt-6 border-t border-purple-500/20">
                                        {loadingDetails ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                                                <span className="ml-2 text-muted-foreground">Cargando detalles...</span>
                                            </div>
                                        ) : completedDetails ? (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Completed Roadmaps */}
                                                <div>
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        Roadmaps Completados ({completedDetails.total_roadmaps})
                                                    </h3>
                                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                                        {completedDetails.completed_roadmaps.length > 0 ? (
                                                            completedDetails.completed_roadmaps.map((roadmap: any) => (
                                                                <Link
                                                                    key={roadmap.roadmap_id}
                                                                    href={`/roadmaps/${roadmap.roadmap_id}`}
                                                                    className="block p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-all"
                                                                >
                                                                    <div className="font-medium text-foreground">{roadmap.name}</div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        {roadmap.total_nodes} nodos • {roadmap.tags}
                                                                    </div>
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">No has completado ningún roadmap aún</p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Completed Nodes */}
                                                <div>
                                                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                                        Nodos Completados ({completedDetails.total_nodes})
                                                    </h3>
                                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                                        {completedDetails.completed_nodes.length > 0 ? (
                                                            completedDetails.completed_nodes.map((node: any) => (
                                                                <Link
                                                                    key={node.node_id}
                                                                    href={`/nodes/${node.node_id}`}
                                                                    className="block p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                                                                >
                                                                    <div className="font-medium text-foreground">{node.title}</div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        {node.topic || 'Sin tema'}
                                                                    </div>
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">No has completado ningún nodo aún</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </Card>

                            {/* Similar Roadmaps */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    <h3 className="text-xl font-bold text-foreground">Similares a lo que sabes</h3>
                                    <span className="text-sm text-muted-foreground">
                                        (Refuerza tus conocimientos)
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {personalizedRecs.similar.map((rec) => (
                                        <Card key={rec.roadmap_id} className="p-4 border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer" onClick={() => router.visit(`/roadmaps/${rec.roadmap_id}`)}>
                                            <h4 className="font-bold text-foreground mb-2">{rec.name}</h4>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex-1 bg-green-500/20 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(rec.similarity || 0) * 100}%`}}></div>
                                                </div>
                                                <span className="text-xs text-green-500 font-semibold">{((rec.similarity || 0) * 100).toFixed(0)}% similar</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                                <span>⭐ {rec.quality_score.toFixed(2)}</span>
                                                <span>📚 {rec.avg_hours_spent.toFixed(0)}h</span>
                                                <span>💾 {rec.bookmark_count}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {rec.tags.split(',').slice(0, 3).map((t, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                                                        #{t.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                {personalizedRecs.similar.length === 0 && (
                                    <Card className="p-8 text-center border-green-500/20">
                                        <p className="text-muted-foreground">No hay roadmaps similares disponibles</p>
                                    </Card>
                                )}
                            </div>

                            {/* New Roadmaps */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-xl font-bold text-foreground">Nuevo por Aprender</h3>
                                    <span className="text-sm text-muted-foreground">
                                        (Expande tus horizontes)
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {personalizedRecs.new.map((rec) => (
                                        <Card key={rec.roadmap_id} className="p-4 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => router.visit(`/roadmaps/${rec.roadmap_id}`)}>
                                            <h4 className="font-bold text-foreground mb-2">{rec.name}</h4>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                                <span className="text-xs text-blue-500 font-semibold">Tema nuevo para ti</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                                <span>⭐ {rec.quality_score.toFixed(2)}</span>
                                                <span>📚 {rec.avg_hours_spent.toFixed(0)}h</span>
                                                <span>💾 {rec.bookmark_count}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {rec.tags.split(',').slice(0, 3).map((t, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                                                        #{t.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                {personalizedRecs.new.length === 0 && (
                                    <Card className="p-8 text-center border-blue-500/20">
                                        <p className="text-muted-foreground">No hay roadmaps nuevos disponibles</p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
