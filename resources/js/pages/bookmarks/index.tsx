import { Head } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Card } from '@/components/ui/card';
import { usePage, Link } from '@inertiajs/react';
import { Heart, MessageCircle, ThumbsDown, Bookmark } from 'lucide-react';

interface BookmarksProps {
    roadmaps: Array<{
        roadmap_id: string;
        name: string;
        description?: string;
        cover_image?: string;
        tags?: string;
        reactions_count: number;
        dislikes_count: number;
        comments_count: number;
        bookmarked_at: string;
    }>;
    nodes: Array<{
        node_id: string;
        title: string;
        description?: string;
        cover_image?: string;
        topic?: string;
        reactions_count: number;
        dislikes_count: number;
        comments_count: number;
        bookmarked_at: string;
    }>;
}

export default function BookmarksIndex({ roadmaps = [], nodes = [] }: BookmarksProps) {
    const { auth } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<'all' | 'roadmaps' | 'nodes'>('all');

    // Combinar y filtrar según tab activo
    const allItems = [
        ...roadmaps.map(r => ({ ...r, type: 'roadmap' as const })),
        ...nodes.map(n => ({ ...n, type: 'node' as const })),
    ];

    const filteredItems = activeTab === 'all' 
        ? allItems 
        : activeTab === 'roadmaps' 
            ? roadmaps.map(r => ({ ...r, type: 'roadmap' as const }))
            : nodes.map(n => ({ ...n, type: 'node' as const }));

    return (
        <>
            <Head title="Guardados" />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-7xl pt-8 px-4 pb-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Bookmark className="w-8 h-8 text-yellow-400" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                Guardados
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item guardado' : 'items guardados'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 flex gap-3">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                activeTab === 'all'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                        >
                            Todos ({allItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('roadmaps')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                activeTab === 'roadmaps'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                        >
                            Roadmaps ({roadmaps.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('nodes')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                activeTab === 'nodes'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                        >
                            Nodos ({nodes.length})
                        </button>
                    </div>
                    
                    {/* Grid de items guardados */}
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item) => {
                                const isRoadmap = item.type === 'roadmap';
                                const id = isRoadmap ? (item as any).roadmap_id : (item as any).node_id;
                                const title = isRoadmap ? (item as any).name : (item as any).title;
                                const href = isRoadmap ? `/roadmaps/${id}` : `/nodes/${id}`;
                                const tag = isRoadmap ? (item as any).tags?.split(',')[0] : (item as any).topic;

                                return (
                                    <Link key={`${item.type}-${id}`} href={href}>
                                        <Card className="relative overflow-hidden group cursor-pointer border border-yellow-500/20 bg-black hover:border-yellow-500/60 transition-all duration-300 h-80">
                                            {/* Imagen */}
                                            <div className="relative h-full">
                                                <img
                                                    src={(item as any).cover_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'}
                                                    alt={title}
                                                    className="h-full w-full object-cover"
                                                />
                                                
                                                {/* Badge de guardado */}
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-yellow-500 text-black p-2 rounded-full">
                                                        <Bookmark className="w-4 h-4 fill-current" />
                                                    </div>
                                                </div>

                                                {/* Gradiente inferior */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                                                    <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                                                        {title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            isRoadmap 
                                                                ? 'bg-yellow-500/20 text-yellow-400' 
                                                                : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                            {isRoadmap ? 'Roadmap' : 'Nodo'}
                                                        </span>
                                                        {tag && (
                                                            <span className="text-xs text-gray-400">
                                                                {tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Guardado {(item as any).bookmarked_at}
                                                    </p>
                                                </div>

                                                {/* Preview al hover */}
                                                <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-6">
                                                    <h3 className="text-yellow-400 font-bold text-xl text-center line-clamp-3">
                                                        {title}
                                                    </h3>
                                                    
                                                    {(item as any).description && (
                                                        <p className="text-gray-300 text-sm text-center line-clamp-3">
                                                            {(item as any).description}
                                                        </p>
                                                    )}

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-6 mt-2">
                                                        <div className="flex items-center gap-2 text-yellow-400">
                                                            <Heart className="w-5 h-5 fill-current" />
                                                            <span className="font-semibold">{(item as any).reactions_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-red-400">
                                                            <ThumbsDown className="w-5 h-5 fill-current" />
                                                            <span className="font-semibold">{(item as any).dislikes_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-blue-400">
                                                            <MessageCircle className="w-5 h-5 fill-current" />
                                                            <span className="font-semibold">{(item as any).comments_count}</span>
                                                        </div>
                                                    </div>

                                                    <button className="mt-4 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-colors">
                                                        Ver {isRoadmap ? 'Roadmap' : 'Nodo'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Bookmark className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">
                                No tienes items guardados
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Guarda roadmaps y nodos para acceder a ellos fácilmente
                            </p>
                            <Link
                                href="/feed/explore"
                                className="inline-block px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-colors"
                            >
                                Explorar Contenido
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
