import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePage } from '@inertiajs/react';
import { MapPin, Calendar, Award, Grid3x3, Bookmark as BookmarkIcon, Settings } from 'lucide-react';

interface ProfileProps {
    user: {
        id: number;
        username: string;
        account_name?: string;
        email: string;
        profile_pic?: string;
        bio?: string;
        location?: string;
        website?: string;
        score?: number;
        created_at: string;
    };
    nodes: Array<{
        node_id: string;
        title: string;
        description?: string;
        cover_image?: string;
        topic?: string;
        reactions_count: number;
        comments_count: number;
        created_at: string;
    }>;
    roadmaps: Array<{
        roadmap_id: string;
        name: string;
        description?: string;
        cover_image?: string;
        tags?: string;
        reactions_count: number;
        comments_count: number;
        nodes_count: number;
        created_at: string;
    }>;
    stats: {
        nodes_count: number;
        roadmaps_count: number;
        total_reactions: number;
        total_comments: number;
    };
}

export default function Profile({ user, nodes, roadmaps, stats }: ProfileProps) {
    const { auth } = usePage().props as any;
    const [activeTab, setActiveTab] = useState('nodes');
    const isOwnProfile = auth?.user?.id === user.id;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    };

    return (
        <>
            <Head title={`@${user.username}`} />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-5xl pt-8 px-4 pb-12">
                    {/* Profile Header */}
                    <Card className="p-8 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black mb-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar */}
                            <div className="flex justify-center md:justify-start">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-yellow-500">
                                    <AvatarImage src={user.profile_pic} />
                                    <AvatarFallback className="bg-yellow-500 text-black font-bold text-4xl">
                                        {user.username[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-bold text-yellow-400">
                                        @{user.username}
                                    </h1>
                                    {isOwnProfile && (
                                        <Link href="/settings/profile">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Editar perfil
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {user.account_name && (
                                    <p className="text-xl text-gray-300 mb-4">{user.account_name}</p>
                                )}

                                {/* Stats */}
                                <div className="flex gap-8 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{stats.nodes_count}</p>
                                        <p className="text-sm text-gray-400">Nodos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{stats.roadmaps_count}</p>
                                        <p className="text-sm text-gray-400">Roadmaps</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{stats.total_reactions}</p>
                                        <p className="text-sm text-gray-400">Reacciones</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-400">{user.score || 0}</p>
                                        <p className="text-sm text-gray-400">Puntos</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {user.bio && (
                                    <p className="text-gray-300 mb-4 whitespace-pre-wrap">{user.bio}</p>
                                )}

                                {/* Additional Info */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    {user.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Se unió en {formatDate(user.created_at)}</span>
                                    </div>
                                    {user.score && user.score > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Award className="w-4 h-4 text-yellow-500" />
                                            <span className="text-yellow-500">{user.score} puntos</span>
                                        </div>
                                    )}
                                </div>

                                {user.website && (
                                    <a 
                                        href={user.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 inline-block"
                                    >
                                        🔗 {user.website}
                                    </a>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full bg-gray-900 border border-yellow-500/20 mb-6">
                            <TabsTrigger 
                                value="nodes" 
                                className="flex-1 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
                            >
                                <Grid3x3 className="w-4 h-4 mr-2" />
                                Nodos ({stats.nodes_count})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="roadmaps" 
                                className="flex-1 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400"
                            >
                                <BookmarkIcon className="w-4 h-4 mr-2" />
                                Roadmaps ({stats.roadmaps_count})
                            </TabsTrigger>
                        </TabsList>

                        {/* Nodes Grid */}
                        <TabsContent value="nodes">
                            {nodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {nodes.map((node) => (
                                        <Link key={node.node_id} href={`/nodes/${node.node_id}`}>
                                            <Card className="group overflow-hidden border-yellow-500/20 bg-gray-900/50 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer h-full">
                                                {node.cover_image && (
                                                    <div className="aspect-video w-full overflow-hidden bg-black">
                                                        <img
                                                            src={node.cover_image}
                                                            alt={node.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-yellow-400 mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                                                        {node.title}
                                                    </h3>
                                                    {node.description && (
                                                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                                            {node.description}
                                                        </p>
                                                    )}
                                                    {node.topic && (
                                                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                                            {node.topic}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                        <span>❤️ {node.reactions_count}</span>
                                                        <span>💬 {node.comments_count}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 border-yellow-500/20 bg-gray-900/50 text-center">
                                    <Grid3x3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg mb-2">
                                        {isOwnProfile ? 'Aún no has creado ningún nodo' : 'Este usuario no ha creado nodos aún'}
                                    </p>
                                    {isOwnProfile && (
                                        <Link href="/nodes/create">
                                            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black">
                                                Crear tu primer nodo
                                            </Button>
                                        </Link>
                                    )}
                                </Card>
                            )}
                        </TabsContent>

                        {/* Roadmaps Grid */}
                        <TabsContent value="roadmaps">
                            {roadmaps.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {roadmaps.map((roadmap) => (
                                        <Link key={roadmap.roadmap_id} href={`/roadmaps/${roadmap.roadmap_id}`}>
                                            <Card className="group overflow-hidden border-yellow-500/20 bg-gray-900/50 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer h-full">
                                                {roadmap.cover_image && (
                                                    <div className="aspect-video w-full overflow-hidden bg-black">
                                                        <img
                                                            src={roadmap.cover_image}
                                                            alt={roadmap.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-purple-400 mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                                                        {roadmap.name}
                                                    </h3>
                                                    {roadmap.description && (
                                                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                                            {roadmap.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                                            📚 {roadmap.nodes_count} nodos
                                                        </span>
                                                    </div>
                                                    {roadmap.tags && (
                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {roadmap.tags.split(',').slice(0, 2).map((tag, idx) => (
                                                                <span key={idx} className="text-xs text-gray-500">
                                                                    #{tag.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>❤️ {roadmap.reactions_count}</span>
                                                        <span>💬 {roadmap.comments_count}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 border-yellow-500/20 bg-gray-900/50 text-center">
                                    <BookmarkIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg mb-2">
                                        {isOwnProfile ? 'Aún no has creado ningún roadmap' : 'Este usuario no ha creado roadmaps aún'}
                                    </p>
                                    {isOwnProfile && (
                                        <Link href="/roadmaps/create">
                                            <Button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black">
                                                Crear tu primer roadmap
                                            </Button>
                                        </Link>
                                    )}
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
