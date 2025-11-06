import { Head } from '@inertiajs/react';
import InstagramNav from '@/components/social/instagram-nav';
import StoriesBar from '@/components/social/stories-bar';
import PostCard from '@/components/social/post-card';
import SuggestionsSidebar from '@/components/social/suggestions-sidebar';

interface FeedProps {
    feed: Array<{
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

export default function FeedIndex({ feed = [], auth }: FeedProps) {
    // Transformar los datos del feed al formato esperado por PostCard
    const posts = feed.map((item) => ({
        id: item.roadmap_id || item.node_id || '',
        type: (item.roadmap_id ? 'roadmap' : 'node') as 'roadmap' | 'node',
        title: item.name || item.title || 'Sin título',
        description: item.description,
        author: {
            name: auth?.user?.account_name || auth?.user?.username || 'Usuario',
            username: auth?.user?.username || 'usuario',
            avatar: auth?.user?.profile_pic,
        },
        reactions_count: item.reactions_count || 0,
        comments_count: item.comments_count || 0,
        created_at: item.created_at,
        tags: item.tags,
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

    return (
        <>
            <Head title="Feed" />
            <div className="min-h-screen bg-background">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                        {/* Main Feed */}
                        <div className="lg:col-span-2">
                            <StoriesBar />
                            <div className="space-y-0">
                                {displayPosts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Hidden on mobile */}
                        <div className="hidden lg:block">
                            <SuggestionsSidebar currentUser={auth?.user} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
