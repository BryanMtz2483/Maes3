import { Head } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Card } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Heart, MessageCircle, ThumbsDown } from 'lucide-react';

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
    height: number; // Para tamaños dinámicos
}

export default function Explore({ roadmaps, nodes }: ExploreProps) {
    const { auth } = usePage().props as any;
    const [selectedTag, setSelectedTag] = useState<string>('all');

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

    // Si no hay datos reales, usar ejemplos
    const galleryItems: GalleryItem[] = allItems.length > 0 ? allItems : [
        {
            id: '1',
            type: 'roadmap',
            title: 'Full Stack Development 2024',
            description: 'Guía completa para convertirte en desarrollador full stack',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
            likes: 1234,
            dislikes: 12,
            comments: 56,
            tag: 'Desarrollo Web',
            height: 350,
        },
        {
            id: '2',
            type: 'node',
            title: 'React Hooks Avanzados',
            description: 'Domina los hooks de React',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
            likes: 2341,
            dislikes: 23,
            comments: 89,
            tag: 'Frontend',
            height: 300,
        },
        {
            id: '3',
            type: 'roadmap',
            title: 'Machine Learning para Principiantes',
            description: 'Aprende ML desde cero',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
            likes: 987,
            dislikes: 8,
            comments: 34,
            tag: 'IA',
            height: 400,
        },
        {
            id: '4',
            type: 'node',
            title: 'TypeScript Best Practices',
            description: 'Mejores prácticas de TypeScript',
            image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop',
            likes: 1567,
            dislikes: 15,
            comments: 67,
            tag: 'Backend',
            height: 280,
        },
        {
            id: '5',
            type: 'roadmap',
            title: 'DevOps Completo',
            description: 'De principiante a experto en DevOps',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
            likes: 3456,
            dislikes: 34,
            comments: 123,
            tag: 'DevOps',
            height: 450,
        },
        {
            id: '6',
            type: 'node',
            title: 'CSS Grid y Flexbox',
            description: 'Layouts modernos con CSS',
            image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop',
            likes: 2109,
            dislikes: 21,
            comments: 78,
            tag: 'Frontend',
            height: 320,
        },
        {
            id: '7',
            type: 'roadmap',
            title: 'Arquitectura de Software',
            description: 'Diseña sistemas escalables',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
            likes: 1876,
            dislikes: 18,
            comments: 92,
            tag: 'Arquitectura',
            height: 380,
        },
        {
            id: '8',
            type: 'node',
            title: 'API REST con Laravel',
            description: 'Crea APIs profesionales',
            image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
            likes: 2543,
            dislikes: 25,
            comments: 101,
            tag: 'Backend',
            height: 340,
        },
        {
            id: '9',
            type: 'roadmap',
            title: 'Mobile Development',
            description: 'Apps nativas y multiplataforma',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            likes: 1432,
            dislikes: 14,
            comments: 45,
            tag: 'Mobile',
            height: 290,
        },
        {
            id: '10',
            type: 'node',
            title: 'Docker para Desarrolladores',
            description: 'Containeriza tus aplicaciones',
            image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&h=400&fit=crop',
            likes: 1987,
            dislikes: 19,
            comments: 67,
            tag: 'DevOps',
            height: 360,
        },
        {
            id: '11',
            type: 'roadmap',
            title: 'UI/UX Design Fundamentals',
            description: 'Diseña interfaces increíbles',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
            likes: 2876,
            dislikes: 28,
            comments: 112,
            tag: 'Diseño',
            height: 420,
        },
        {
            id: '12',
            type: 'node',
            title: 'GraphQL vs REST',
            description: 'Comparativa completa',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
            likes: 1654,
            dislikes: 16,
            comments: 54,
            tag: 'Backend',
            height: 310,
        },
    ];

    // Extraer tags únicos
    const allTags = ['all', ...Array.from(new Set(galleryItems.map(item => item.tag)))];

    // Filtrar por tag seleccionado
    const filteredItems = selectedTag === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.tag === selectedTag);

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
                        <p className="text-gray-400">Descubre roadmaps y nodos increíbles</p>
                    </div>

                    {/* Filtros por Tags */}
                    <div className="mb-8 flex flex-wrap gap-3">
                        {allTags.map((tag) => (
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
                    
                    {/* Galería Masonry con tamaños dinámicos */}
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
                                                    <div className="flex items-center gap-2 text-yellow-400">
                                                        <Heart className="w-5 h-5 fill-current" />
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
