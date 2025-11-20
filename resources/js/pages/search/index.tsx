import { Head, Link } from '@inertiajs/react';
import InstagramNav from '@/components/social/instagram-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { MapPin, Users, BookOpen, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SearchProps {
    results: {
        roadmaps?: Array<{
            roadmap_id: string;
            name: string;
            reactions_count: number;
            comments_count: number;
            tags?: Array<{ name: string }>;
        }>;
        nodes?: Array<{
            node_id: string;
            title: string;
            author?: string;
            topic?: string;
            reactions_count: number;
            comments_count: number;
        }>;
        users?: Array<{
            id: number;
            username: string;
            account_name?: string;
            profile_pic?: string;
            score: number;
        }>;
        tags?: Array<{
            tag_id: string;
            name: string;
            roadmaps_count: number;
        }>;
    };
    query: string;
}

export default function SearchIndex({ results = {}, query = '' }: SearchProps) {
    const { auth } = usePage().props as any;
    const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'roadmaps' | 'nodes'>('all');

    const { roadmaps = [], nodes = [], users = [], tags = [] } = results;
    const totalResults = roadmaps.length + nodes.length + users.length;

    return (
        <>
            <Head title={`Buscar: ${query}`} />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-6xl pt-8 px-4">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Resultados para "{query}"
                        </h1>
                        <p className="text-gray-400 mt-1">{totalResults} resultados encontrados</p>
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <Button
                            onClick={() => setActiveFilter('all')}
                            className={activeFilter === 'all' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'}
                        >
                            Todos ({totalResults})
                        </Button>
                        <Button
                            onClick={() => setActiveFilter('users')}
                            className={activeFilter === 'users' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Usuarios ({users.length})
                        </Button>
                        <Button
                            onClick={() => setActiveFilter('roadmaps')}
                            className={activeFilter === 'roadmaps' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'}
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            Roadmaps ({roadmaps.length})
                        </Button>
                        <Button
                            onClick={() => setActiveFilter('nodes')}
                            className={activeFilter === 'nodes' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'}
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Nodos ({nodes.length})
                        </Button>
                    </div>

                    {/* Contenido Filtrado */}
                    <div className="mt-6">
                        {/* Todos */}
                        {activeFilter === 'all' && (
                            <div className="space-y-6">
                            {users.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-400 mb-4">Usuarios</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {users.slice(0, 6).map((user) => (
                                            <Card key={user.id} className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-12 w-12 border-2 border-yellow-500">
                                                        <AvatarImage src={user.profile_pic} />
                                                        <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                                            {user.username[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-yellow-400">{user.username}</p>
                                                        <p className="text-sm text-gray-400">{user.account_name || 'Usuario'}</p>
                                                        <p className="text-xs text-yellow-600">{user.score} puntos</p>
                                                    </div>
                                                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black">
                                                        Seguir
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {roadmaps.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-400 mb-4">Roadmaps</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {roadmaps.slice(0, 4).map((roadmap) => (
                                            <Link key={roadmap.roadmap_id} href={`/roadmaps/${roadmap.roadmap_id}`}>
                                                <Card className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                                                    <h3 className="font-semibold text-yellow-400 mb-2">{roadmap.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> {roadmap.reactions_count}</span>
                                                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {roadmap.comments_count}</span>
                                                    </div>
                                                    {roadmap.tags && roadmap.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {roadmap.tags.map((tag, idx) => (
                                                                <span key={idx} className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                                                                    #{tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {nodes.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-400 mb-4">Nodos</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {nodes.slice(0, 4).map((node) => (
                                            <Link key={node.node_id} href={`/nodes/${node.node_id}`}>
                                                <Card className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                                                    <h3 className="font-semibold text-yellow-400 mb-1">{node.title}</h3>
                                                    {node.author && (
                                                        <p className="text-sm text-gray-400 mb-2">Por {node.author}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> {node.reactions_count}</span>
                                                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {node.comments_count}</span>
                                                        {node.topic && <span className="text-yellow-600 flex items-center gap-1"><BookOpen className="w-4 h-4" /> {node.topic}</span>}
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {totalResults === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-lg">No se encontraron resultados para "{query}"</p>
                                    <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
                                </div>
                            )}
                            </div>
                        )}

                        {/* Usuarios */}
                        {activeFilter === 'users' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {users.map((user) => (
                                    <Card key={user.id} className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-yellow-500">
                                                <AvatarImage src={user.profile_pic} />
                                                <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                                    {user.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-yellow-400">{user.username}</p>
                                                <p className="text-sm text-gray-400">{user.account_name || 'Usuario'}</p>
                                                <p className="text-xs text-yellow-600">{user.score} puntos</p>
                                            </div>
                                            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black">
                                                Seguir
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            {users.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No se encontraron usuarios</p>
                            )}
                            </div>
                        )}

                        {/* Roadmaps */}
                        {activeFilter === 'roadmaps' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roadmaps.map((roadmap) => (
                                    <Link key={roadmap.roadmap_id} href={`/roadmaps/${roadmap.roadmap_id}`}>
                                        <Card className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                                            <h3 className="font-semibold text-yellow-400 mb-2">{roadmap.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {roadmap.reactions_count}</span>
                                                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {roadmap.comments_count}</span>
                                            </div>
                                            {roadmap.tags && roadmap.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {roadmap.tags.map((tag, idx) => (
                                                        <span key={idx} className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                                                            #{tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                ))}
                            {roadmaps.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No se encontraron roadmaps</p>
                            )}
                            </div>
                        )}

                        {/* Nodos */}
                        {activeFilter === 'nodes' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {nodes.map((node) => (
                                    <Link key={node.node_id} href={`/nodes/${node.node_id}`}>
                                        <Card className="p-4 bg-gradient-to-br from-gray-900 to-black border-yellow-500/20 hover:border-yellow-500/40 transition-all cursor-pointer">
                                            <h3 className="font-semibold text-yellow-400 mb-1">{node.title}</h3>
                                            {node.author && (
                                                <p className="text-sm text-gray-400 mb-2">Por {node.author}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {node.reactions_count}</span>
                                                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {node.comments_count}</span>
                                                {node.topic && <span className="text-yellow-600 flex items-center gap-1"><BookOpen className="w-4 h-4" /> {node.topic}</span>}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            {nodes.length === 0 && (
                                <p className="text-center text-gray-400 py-8">No se encontraron nodos</p>
                            )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
