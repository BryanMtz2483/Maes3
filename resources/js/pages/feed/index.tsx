import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import PostCard from '@/components/social/post-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Map, FileText, ChevronLeft, ChevronRight, TrendingUp, BookOpen, Sparkles } from 'lucide-react';

interface FeedProps {
    feed: Array<{
        roadmap_id?: string;
        node_id?: string;
        name?: string;
        title?: string;
        description?: string;
        cover_image?: string;
        tags?: Array<{ name: string }>;
        reactions_count: number;
        comments_count: number;
        created_at: string;
    }>;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    filter?: string;
    totalRoadmaps?: number;
    totalNodes?: number;
    popularTopics?: Array<{ topic: string; count: number }>;
    popularTags?: Record<string, number>;
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

export default function FeedIndex({ feed = [], pagination, filter = 'all', totalRoadmaps = 0, totalNodes = 0, popularTopics = [], popularTags = {}, auth }: FeedProps) {
    const [activeFilter, setActiveFilter] = useState(filter);
    const handleFilterChange = (newFilter: string) => {
        setActiveFilter(newFilter);
        router.get('/feed', { type: newFilter }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get('/feed', { type: activeFilter, page }, { preserveState: true });
    };

    const handleTopicClick = (topic: string) => {
        router.get('/feed/explore', { topic, type: 'nodes' });
    };

    const handleTagClick = (tag: string) => {
        router.get('/feed/explore', { topic: tag });
    };

    // Transformar los datos del feed al formato esperado por PostCard
    const posts = feed.map((item: any) => ({
        id: item.roadmap_id || item.node_id || '',
        type: (item.roadmap_id ? 'roadmap' : 'node') as 'roadmap' | 'node',
        title: item.name || item.title || 'Sin título',
        description: item.description,
        image: item.cover_image,
        author: {
            name: item.author_name || item.user?.account_name || item.user?.username || 'Usuario',
            username: item.author_username || item.user?.username || 'usuario',
            avatar: item.author_avatar || item.user?.profile_pic,
        },
        reactions_count: item.reactions_count || 0,
        comments_count: item.comments_count || 0,
        created_at: item.created_at,
        tags: Array.isArray(item.tags) ? item.tags : [],
    }));

    // Posts de ejemplo si no hay datos
    const examplePosts = [
        {
            id: '1',
            type: 'roadmap' as const,
            title: 'Roadmap de Desarrollo Full Stack 2024',
            description: 'Una guía completa para convertirte en desarrollador full stack',
            author: {
                name: 'Usuario Demo',
                username: 'usuario_demo',
                avatar: '',
            },
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop',
            reactions_count: 42,
            comments_count: 8,
            created_at: new Date().toISOString(),
            tags: [{ name: 'fullstack' }, { name: 'desarrollo' }, { name: 'web' }],
        },
        {
            id: '2',
            type: 'node' as const,
            title: 'Introducción a React Hooks',
            description: 'Aprende los conceptos básicos de React Hooks y cómo usarlos',
            author: {
                name: 'Usuario Demo',
                username: 'usuario_demo',
                avatar: '',
            },
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=800&fit=crop',
            reactions_count: 128,
            comments_count: 23,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            tags: [{ name: 'react' }, { name: 'javascript' }, { name: 'frontend' }],
        },
        {
            id: '3',
            type: 'roadmap' as const,
            title: 'Aprende Laravel desde cero',
            description: 'Todo lo que necesitas saber para dominar Laravel',
            author: {
                name: 'Usuario Demo',
                username: 'usuario_demo',
                avatar: '',
            },
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop',
            reactions_count: 95,
            comments_count: 15,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            tags: [{ name: 'laravel' }, { name: 'php' }, { name: 'backend' }],
        },
    ];

    const displayPosts = posts.length > 0 ? posts : examplePosts;

    const totalItems = activeFilter === 'roadmaps' ? totalRoadmaps : activeFilter === 'nodes' ? totalNodes : totalRoadmaps + totalNodes;

    const topTags = Object.entries(popularTags || {}).slice(0, 10);

    return (
        <>
            <Head title="Feed" />
            <div className="min-h-screen bg-background">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-8">
                        {/* Sidebar Izquierdo - Tendencias y Temas */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Modo Tutor IA */}
                            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    <h3 className="font-bold text-yellow-500">Tutor IA</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Aprende con asistencia personalizada
                                </p>
                                <Button 
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                                    onClick={() => router.visit('/tutor')}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Iniciar Sesión
                                </Button>
                            </Card>

                            {/* Temas Populares */}
                            {popularTopics.length > 0 && (
                                <Card className="border-border p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                                        <h3 className="font-bold text-foreground">Temas Populares</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {popularTopics.map((topic) => (
                                            <button
                                                key={topic.topic}
                                                onClick={() => handleTopicClick(topic.topic)}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors text-left group"
                                            >
                                                <span className="text-sm text-foreground group-hover:text-yellow-500">
                                                    {topic.topic}
                                                </span>
                                                <span className="text-xs text-yellow-500 font-semibold">
                                                    {topic.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Tags Populares */}
                            {topTags.length > 0 && (
                                <Card className="border-border p-4">
                                    <h3 className="font-bold text-foreground mb-3">Tags Populares</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {topTags.map(([tag, count]) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagClick(tag)}
                                                className="px-3 py-1 text-xs rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-3">
                            
                            {/* Filtros y Contador */}
                            <div className="bg-card border border-border rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Mostrando <span className="font-bold text-foreground">{totalItems}</span> artículos
                                        </span>
                                        {activeFilter !== 'all' && (
                                            <span className="text-xs text-muted-foreground">
                                                ({activeFilter === 'roadmaps' ? 'Roadmaps' : 'Nodos'})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleFilterChange('all')}
                                        variant={activeFilter === 'all' ? 'default' : 'outline'}
                                        className={`flex items-center gap-2 ${
                                            activeFilter === 'all'
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                                : 'border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/10'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Todos
                                    </Button>
                                    <Button
                                        onClick={() => handleFilterChange('roadmaps')}
                                        variant={activeFilter === 'roadmaps' ? 'default' : 'outline'}
                                        className={`flex items-center gap-2 ${
                                            activeFilter === 'roadmaps'
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                                : 'border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/10'
                                        }`}
                                    >
                                        <Map className="w-4 h-4" />
                                        Roadmaps ({totalRoadmaps})
                                    </Button>
                                    <Button
                                        onClick={() => handleFilterChange('nodes')}
                                        variant={activeFilter === 'nodes' ? 'default' : 'outline'}
                                        className={`flex items-center gap-2 ${
                                            activeFilter === 'nodes'
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                                : 'border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/10'
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Nodos ({totalNodes})
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-0">
                                {displayPosts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>

                            {/* Paginación */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pb-6">
                                    <Button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        variant="outline"
                                        className="border-yellow-500/20 hover:border-yellow-500/40"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    
                                    <span className="text-sm text-muted-foreground">
                                        Página {pagination.current_page} de {pagination.last_page}
                                    </span>
                                    
                                    <Button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        variant="outline"
                                        className="border-yellow-500/20 hover:border-yellow-500/40"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
