import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Heart, MessageCircle, ThumbsDown, Map, FileText, ChevronLeft, ChevronRight, TrendingUp, CheckCircle } from 'lucide-react';

interface ExploreProps {
    roadmaps?: Array<{
        roadmap_id: string;
        name: string;
        description?: string;
        cover_image?: string;
        tags?: string;
        reactions_count: number;
        comments_count: number;
        dislikes_count?: number;
    }>;
    nodes?: Array<{
        node_id: string;
        title: string;
        description?: string;
        cover_image?: string;
        topic?: string;
        reactions_count: number;
        comments_count: number;
        dislikes_count?: number;
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
}

interface GalleryItem {
    id: string;
    type: 'roadmap' | 'node';
    title: string;
    description?: string;
    image: string;
    likes: number;
    dislikes: number;
    comments: number;
    tag: string;
    height: number;
}

export default function Explore({ 
    roadmaps, 
    nodes, 
    pagination,
    filter = 'all',
    totalRoadmaps = 0,
    totalNodes = 0,
    popularTopics = [],
    popularTags = {}
}: ExploreProps) {
    const { auth } = usePage().props as any;
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [activeFilter, setActiveFilter] = useState(filter);

    const handleFilterChange = (newFilter: string) => {
        setActiveFilter(newFilter);
        router.get('/feed/explore', { type: newFilter }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get('/feed/explore', { type: activeFilter, page }, { preserveState: true });
    };

    const handleTopicClick = (topic: string) => {
        router.get('/feed/explore', { topic, type: 'nodes' });
    };

    // Generar alturas aleatorias para efecto masonry
    const getRandomHeight = () => {
        const heights = [250, 300, 350, 400, 450];
        return heights[Math.floor(Math.random() * heights.length)];
    };

    // Asegurar que roadmaps y nodes sean arrays
    const safeRoadmaps = Array.isArray(roadmaps) ? roadmaps : [];
    const safeNodes = Array.isArray(nodes) ? nodes : [];

    // Combinar roadmaps y nodos en un solo array
    const allItems: GalleryItem[] = [
        ...safeRoadmaps.map(roadmap => ({
            id: roadmap.roadmap_id,
            type: 'roadmap' as const,
            title: roadmap.name,
            description: roadmap.description,
            image: roadmap.cover_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
            likes: roadmap.reactions_count || 0,
            dislikes: roadmap.dislikes_count || 0,
            comments: roadmap.comments_count || 0,
            tag: roadmap.tags?.split(',')[0]?.trim() || 'General',
            height: getRandomHeight(),
        })),
        ...safeNodes.map(node => ({
            id: node.node_id,
            type: 'node' as const,
            title: node.title,
            description: node.description,
            image: node.cover_image || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop',
            likes: node.reactions_count || 0,
            dislikes: node.dislikes_count || 0,
            comments: node.comments_count || 0,
            tag: node.topic || 'General',
            height: getRandomHeight(),
        })),
    ];

    const galleryItems = allItems;

    // Extraer tags únicos
    const allTags = ['all', ...Array.from(new Set(galleryItems.map(item => item.tag)))];

    // Filtrar por tag seleccionado
    const filteredItems = selectedTag === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.tag === selectedTag);

    const totalItems = activeFilter === 'roadmaps' ? totalRoadmaps : activeFilter === 'nodes' ? totalNodes : totalRoadmaps + totalNodes;

    return (
        <>
            <Head title="Explorar" />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-7xl pt-8 px-4 pb-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Explorar Contenido
                        </h1>
                        <p className="text-gray-400">
                            Mostrando <span className="font-bold text-yellow-400">{totalItems}</span> artículos
                            {activeFilter !== 'all' && (
                                <span className="text-sm"> ({activeFilter === 'roadmaps' ? 'Roadmaps' : 'Nodos'})</span>
                            )}
                        </p>
                    </div>

                    {/* Filtros de Tipo */}
                    <div className="mb-6 flex gap-3">
                        <Button
                            onClick={() => handleFilterChange('all')}
                            variant={activeFilter === 'all' ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${
                                activeFilter === 'all'
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
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
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
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
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Nodos ({totalNodes})
                        </Button>
                    </div>

                    {/* Barras de Tendencias */}
                    {popularTopics.length > 0 && (
                        <div className="mb-6 bg-gray-900 border border-yellow-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-yellow-400">Temas Populares</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {popularTopics.map((topic) => (
                                    <button
                                        key={topic.topic}
                                        onClick={() => handleTopicClick(topic.topic)}
                                        className="px-3 py-1 bg-gray-800 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-400 rounded-full text-sm border border-gray-700 hover:border-yellow-500/40 transition-all"
                                    >
                                        {topic.topic} <span className="text-yellow-400">({topic.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filtros por Tags */}
                    <div className="mb-8 flex flex-wrap gap-3">
                        {allTags.slice(0, 10).map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                    selectedTag === tag
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                                }`}
                            >
                                {tag === 'all' ? 'Todos' : tag}
                            </button>
                        ))}
                    </div>
                    
                    {/* Galería Masonry */}
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        {filteredItems.map((item) => {
                            const href = item.type === 'roadmap' 
                                ? `/roadmaps/${item.id}` 
                                : `/nodes/${item.id}`;

                            return (
                                <Link key={item.id} href={href}>
                                    <Card 
                                        className="relative overflow-hidden group cursor-pointer border border-yellow-500/20 bg-black hover:border-yellow-500/60 transition-all duration-300 break-inside-avoid mb-4"
                                        style={{ height: `${item.height}px` }}
                                    >
                                        {/* Imagen */}
                                        <div className="relative h-full">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                            
                                            {/* Gradiente inferior siempre visible */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                                                <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        item.type === 'roadmap' 
                                                            ? 'bg-yellow-500/20 text-yellow-400' 
                                                            : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {item.type === 'roadmap' ? 'Roadmap' : 'Nodo'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {item.tag}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Preview de stats al hacer hover */}
                                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-6">
                                                <h3 className="text-yellow-400 font-bold text-xl text-center line-clamp-3">
                                                    {item.title}
                                                </h3>
                                                
                                                {item.description && (
                                                    <p className="text-gray-300 text-sm text-center line-clamp-3">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center gap-6 mt-4">
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle className="w-5 h-5 fill-current" />
                                                        <span className="font-semibold">{item.likes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <ThumbsDown className="w-5 h-5 fill-current" />
                                                        <span className="font-semibold">{item.dislikes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <MessageCircle className="w-5 h-5 fill-current" />
                                                        <span className="font-semibold">{item.comments}</span>
                                                    </div>
                                                </div>

                                                {/* Botón de acción */}
                                                <button className="mt-4 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-colors">
                                                    Ver {item.type === 'roadmap' ? 'Roadmap' : 'Nodo'}
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Paginación */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                variant="outline"
                                className="bg-gray-900 border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            <span className="text-sm text-gray-400">
                                Página {pagination.current_page} de {pagination.last_page}
                            </span>
                            
                            <Button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                variant="outline"
                                className="bg-gray-900 border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Mensaje si no hay resultados */}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">
                                No se encontraron resultados para "{selectedTag}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
