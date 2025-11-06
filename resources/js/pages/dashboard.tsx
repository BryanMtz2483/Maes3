import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import PostCard from '@/components/social/post-card';
import SuggestionsSidebar from '@/components/social/suggestions-sidebar';
import LoadingScreen from '@/components/loading-screen';
import { usePage } from '@inertiajs/react';

interface DashboardProps {
    feed?: Array<{
        roadmap_id?: string;
        node_id?: string;
        name?: string;
        title?: string;
        description?: string;
        tags?: Array<{ name: string }>;
        reactions_count: number;
        comments_count: number;
        created_at: string;
    }>;
}

export default function Dashboard({ feed = [] }: DashboardProps) {
    const { auth } = usePage().props as any;
    const [isLoading, setIsLoading] = useState(true);

    // Posts de ejemplo con imágenes atractivas
    const examplePosts = [
        {
            id: '1',
            type: 'roadmap' as const,
            title: 'Roadmap de Desarrollo Full Stack 2024',
            description: 'Una guía completa para convertirte en desarrollador full stack moderno. Incluye React, Node.js, bases de datos y deployment.',
            author: {
                name: auth?.user?.account_name || 'Usuario Demo',
                username: auth?.user?.username || 'usuario_demo',
                avatar: auth?.user?.profile_pic,
            },
            author_id: auth?.user?.id,
            user_id: auth?.user?.id,
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=800&fit=crop',
            reactions_count: 42,
            comments_count: 8,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            tags: [{ name: 'react' }, { name: 'javascript' }, { name: 'frontend' }],
        },
        {
            id: '2',
            type: 'node' as const,
            title: 'Introducción a React Hooks',
            description: 'Aprende los conceptos básicos de React Hooks y cómo usarlos en tus proyectos. useState, useEffect y más.',
            author: {
                name: auth?.user?.account_name || 'Usuario Demo',
                username: auth?.user?.username || 'usuario_demo',
                avatar: auth?.user?.profile_pic,
            },
            author_id: auth?.user?.id,
            user_id: auth?.user?.id,
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
            description: 'Todo lo que necesitas saber para dominar Laravel. Desde lo básico hasta conceptos avanzados.',
            author: {
                name: auth?.user?.account_name || 'Usuario Demo',
                username: auth?.user?.username || 'usuario_demo',
                avatar: auth?.user?.profile_pic,
            },
            author_id: auth?.user?.id,
            user_id: auth?.user?.id,
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop',
            reactions_count: 95,
            comments_count: 15,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            tags: [{ name: 'laravel' }, { name: 'php' }, { name: 'backend' }],
        },
        {
            id: '4',
            type: 'node' as const,
            title: 'TypeScript para principiantes',
            description: 'Domina TypeScript y lleva tu JavaScript al siguiente nivel con tipos estáticos.',
            author: {
                name: auth?.user?.account_name || 'Usuario Demo',
                username: auth?.user?.username || 'usuario_demo',
                avatar: auth?.user?.profile_pic,
            },
            author_id: auth?.user?.id,
            user_id: auth?.user?.id,
            image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=800&fit=crop',
            reactions_count: 67,
            comments_count: 12,
            created_at: new Date(Date.now() - 10800000).toISOString(),
            tags: [{ name: 'typescript' }, { name: 'javascript' }],
        },
        {
            id: '5',
            type: 'roadmap' as const,
            title: 'Arquitectura de Microservicios',
            description: 'Aprende a diseñar y construir sistemas escalables con microservicios.',
            author: {
                name: auth?.user?.account_name || 'Usuario Demo',
                username: auth?.user?.username || 'usuario_demo',
                avatar: auth?.user?.profile_pic,
            },
            author_id: auth?.user?.id,
            user_id: auth?.user?.id,
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop',
            reactions_count: 156,
            comments_count: 34,
            created_at: new Date(Date.now() - 14400000).toISOString(),
            tags: [{ name: 'microservicios' }, { name: 'arquitectura' }, { name: 'cloud' }],
        },
    ];

    const displayPosts = feed.length > 0 ? feed.map((item: any) => {
        // Determinar el autor del post
        let authorName = 'Usuario';
        let authorUsername = 'usuario';
        let authorAvatar = undefined;

        if (item.user) {
            // Si tiene relación user, usarla
            authorName = item.user.account_name || item.user.username;
            authorUsername = item.user.username;
            authorAvatar = item.user.profile_pic;
        } else if (item.author_name) {
            // Si tiene author_name del backend, usarlo
            authorName = item.author_name;
            authorUsername = item.author_username || item.author_name;
            authorAvatar = item.author_avatar;
        } else if (item.author) {
            // Si es un nodo con campo author (string), usarlo
            authorName = item.author;
            authorUsername = item.author;
        }

        return {
            id: item.roadmap_id || item.node_id || '',
            type: (item.roadmap_id ? 'roadmap' : 'node') as 'roadmap' | 'node',
            title: item.name || item.title || 'Sin título',
            description: item.description,
            cover_image: item.cover_image,
            author: {
                name: authorName,
                username: authorUsername,
                avatar: authorAvatar,
            },
            author_id: item.author_id,
            user_id: item.user_id,
            reactions_count: item.reactions_count || 0,
            comments_count: item.comments_count || 0,
            created_at: item.created_at,
            tags: item.tags,
        };
    }) : examplePosts;

    return (
        <>
            <Head title="Dashboard" />
            {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8">
                        {/* Sidebar Izquierdo - Más estrecho */}
                        <div className="hidden lg:block lg:col-span-3">
                            <SuggestionsSidebar currentUser={auth?.user} />
                        </div>

                        {/* Main Feed - Más ancho */}
                        <div className="lg:col-span-9 space-y-6">
                            {displayPosts.map((post, index) => (
                                <PostCard key={index} post={post} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
