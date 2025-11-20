import { Head, Link } from '@inertiajs/react';
import InstagramNav from '@/components/social/instagram-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, MapPin, ThumbsDown, BookOpen, CheckCircle, Frown, Star, Edit, MoreHorizontal } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoadmapShowProps {
    roadmap: {
        roadmap_id: string;
        name: string;
        description?: string;
        cover_image?: string;
        tags?: string;
        created_at: string;
        nodes?: Array<{
            node_id: string;
            title: string;
            description?: string;
            cover_image?: string;
            author?: string;
            topic?: string;
            pivot?: {
                order: number;
                parent_node_id?: string;
            };
        }>;
        reactions_count: number;
        comments_count: number;
        author_name?: string;
        author_username?: string;
        author_avatar?: string;
        user?: {
            username: string;
            account_name?: string;
            profile_pic?: string;
        };
    };
    comments: {
        data: Array<{
            roadmap_comment_id: string;
            text: string;
            created_at: string;
            user?: {
                id: number;
                username: string;
                profile_pic?: string;
                account_name?: string;
            };
        }>;
    };
}

export default function RoadmapShow({ roadmap, comments }: RoadmapShowProps) {
    const { auth } = usePage().props as any;
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [commentsData, setCommentsData] = useState(comments?.data || []);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [progress, setProgress] = useState<{
        total_nodes: number;
        completed_nodes: number;
        progress_percentage: number;
        completed_node_ids: string[];
        is_completed: boolean;
    } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Cargar reacciones, bookmarks y progreso en paralelo
                const [reactionsResponse, bookmarkResponse, progressResponse] = await Promise.all([
                    axios.get(`/reactions/statistics/roadmap/${roadmap.roadmap_id}`),
                    axios.get('/bookmarks/check', {
                        params: {
                            type: 'roadmap',
                            id: roadmap.roadmap_id
                        }
                    }),
                    axios.get(`/progress/roadmap/${roadmap.roadmap_id}`)
                ]);

                // Actualizar estados con los datos del servidor
                setLiked(reactionsResponse.data.user_liked || false);
                setDisliked(reactionsResponse.data.user_disliked || false);
                setLikesCount(reactionsResponse.data.likes_count || 0);
                setDislikesCount(reactionsResponse.data.dislikes_count || 0);
                setSaved(bookmarkResponse.data.bookmarked || false);
                setProgress(progressResponse.data);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [roadmap.roadmap_id]);

    const handleLike = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        const previousLiked = liked;
        const previousDisliked = disliked;
        const previousLikesCount = likesCount;
        const previousDislikesCount = dislikesCount;
        
        // Actualización optimista (feedback inmediato)
        const newLikedState = !liked;
        setLiked(newLikedState);
        
        if (disliked && newLikedState) {
            setDisliked(false);
            setDislikesCount(Math.max(0, dislikesCount - 1));
        }
        
        setLikesCount(newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1));
        
        try {
            // Hacer el toggle en el servidor
            await axios.post('/reactions/toggle', {
                entity_type: 'roadmap',
                entity_id: roadmap.roadmap_id,
                reaction_type: 'like',
            });
            
            // Obtener el estado real del servidor y actualizar progreso
            const [statsResponse, progressResponse] = await Promise.all([
                axios.get(`/reactions/statistics/roadmap/${roadmap.roadmap_id}`),
                axios.get(`/progress/roadmap/${roadmap.roadmap_id}`)
            ]);
            
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
            setProgress(progressResponse.data);
        } catch (error) {
            // Revertir en caso de error
            setLiked(previousLiked);
            setDisliked(previousDisliked);
            setLikesCount(previousLikesCount);
            setDislikesCount(previousDislikesCount);
            console.error('Error al dar like:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDislike = async () => {
        if (isUpdating) return;
        
        setIsUpdating(true);
        const previousLiked = liked;
        const previousDisliked = disliked;
        const previousLikesCount = likesCount;
        const previousDislikesCount = dislikesCount;
        
        // Actualización optimista (feedback inmediato)
        const newDislikedState = !disliked;
        setDisliked(newDislikedState);
        
        if (liked && newDislikedState) {
            setLiked(false);
            setLikesCount(Math.max(0, likesCount - 1));
        }
        
        setDislikesCount(newDislikedState ? dislikesCount + 1 : Math.max(0, dislikesCount - 1));
        
        try {
            // Hacer el toggle en el servidor
            await axios.post('/reactions/toggle', {
                entity_type: 'roadmap',
                entity_id: roadmap.roadmap_id,
                reaction_type: 'dislike',
            });
            
            // Obtener el estado real del servidor
            const statsResponse = await axios.get(`/reactions/statistics/roadmap/${roadmap.roadmap_id}`);
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
        } catch (error) {
            // Revertir en caso de error
            setLiked(previousLiked);
            setDisliked(previousDisliked);
            setLikesCount(previousLikesCount);
            setDislikesCount(previousDislikesCount);
            console.error('Error al dar dislike:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSave = async () => {
        console.log('FUNCIÓN handleSave EJECUTADA');
        console.log('Estado actual saved:', saved);
        console.log('Roadmap ID:', roadmap.roadmap_id);
        
        const newSavedState = !saved;
        setSaved(newSavedState);
        
        try {
            console.log('Enviando petición POST a /bookmarks/toggle');
            console.log('Datos:', { type: 'roadmap', id: roadmap.roadmap_id });
            
            const response = await axios.post('/bookmarks/toggle', {
                type: 'roadmap',
                id: roadmap.roadmap_id,
            });
            
            console.log('Respuesta recibida:', response.data);
            setSaved(response.data.bookmarked);
            
            // Mostrar mensaje de éxito
            if (response.data.bookmarked) {
                console.log('Guardado exitosamente');
                alert('Roadmap guardado exitosamente');
            } else {
                console.log('Eliminado de guardados');
                alert('Roadmap eliminado de guardados');
            }
        } catch (error: any) {
            setSaved(!newSavedState);
            console.error('ERROR al guardar:', error);
            console.error('Detalles del error:', error.response?.data);
            console.error('Status:', error.response?.status);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/roadmaps/${roadmap.roadmap_id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: roadmap.name,
                    url: url,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`/comments/roadmaps/${roadmap.roadmap_id}`, {
                text: newComment.trim(),
            });

            setCommentsData([response.data.comment, ...commentsData]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error al publicar el comentario');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Verificar que roadmap existe
    if (!roadmap) {
        return (
            <>
                <Head title="Roadmap no encontrado" />
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Roadmap no encontrado</h1>
                        <Link href="/dashboard">
                            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black">
                                Volver al feed
                            </Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const authorName = roadmap.user?.account_name || roadmap.user?.username || roadmap.author_name || 'Usuario';
    const authorUsername = roadmap.user?.username || roadmap.author_username || 'usuario';
    const authorAvatar = roadmap.user?.profile_pic || roadmap.author_avatar;

    const parsedTags = roadmap.tags ? roadmap.tags.split(',').map(t => t.trim()) : [];

    return (
        <>
            <Head title={roadmap.name} />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-4xl pt-8 px-4 pb-12">
                    {/* Back Button */}
                    <Link href="/dashboard">
                        <Button variant="ghost" className="mb-6 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al feed
                        </Button>
                    </Link>

                    {/* Roadmap Card */}
                    <Card className="overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black shadow-lg shadow-yellow-500/5">
                        {/* Header */}
                        <div className="p-6 border-b border-yellow-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <Link href={`/profile/${authorUsername}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity group flex-1">
                                    <Avatar className="h-14 w-14 border-2 border-yellow-500 group-hover:border-yellow-400 transition-colors">
                                        <AvatarImage src={authorAvatar} />
                                        <AvatarFallback className="bg-yellow-500 text-black font-semibold text-lg">
                                            {authorName[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-sm font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                            @{authorUsername}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(roadmap.created_at)}
                                        </p>
                                    </div>
                                </Link>
                                
                                {auth?.user?.username === authorUsername && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-black border-yellow-500/20">
                                            <DropdownMenuItem 
                                                onClick={() => window.location.href = `/roadmaps/${roadmap.roadmap_id}/edit`}
                                                className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 cursor-pointer"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar roadmap
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <MapPin className="h-6 w-6 text-yellow-500" />
                                <h1 className="text-3xl font-bold text-yellow-400">{roadmap.name}</h1>
                                {progress?.is_completed && (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/50 flex items-center gap-1">
                                        ✓ Completado
                                    </span>
                                )}
                            </div>
                            
                            {/* Progress Bar */}
                            {progress && progress.total_nodes > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">
                                            Progreso: {progress.completed_nodes} / {progress.total_nodes} nodos
                                        </span>
                                        <span className="text-sm font-semibold text-yellow-400">
                                            {progress.progress_percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${
                                                progress.is_completed ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}
                                            style={{ width: `${progress.progress_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {parsedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {parsedTags.map((tag, index) => (
                                        <span key={index} className="text-sm bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        {roadmap.cover_image && (
                            <div className="w-full h-80 overflow-hidden">
                                <img
                                    src={roadmap.cover_image}
                                    alt={roadmap.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        {roadmap.description && (
                            <div className="p-6 border-b border-yellow-500/10">
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {roadmap.description}
                                </p>
                            </div>
                        )}

                        {/* Nodes */}
                        {roadmap.nodes && roadmap.nodes.length > 0 && (
                            <div className="p-6 border-b border-yellow-500/10">
                                <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6" /> Ruta de Aprendizaje ({roadmap.nodes.length} nodos)
                                </h3>
                                <div className="space-y-4">
                                    {roadmap.nodes
                                        .sort((a, b) => (a.pivot?.order || 0) - (b.pivot?.order || 0))
                                        .map((node, index) => (
                                        <Link key={node.node_id} href={`/nodes/${node.node_id}`}>
                                            <Card className="p-5 bg-gradient-to-r from-gray-900/80 to-gray-900/50 border-yellow-500/20 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer group">
                                                <div className="flex gap-4">
                                                    {/* Order Number */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-black font-bold text-lg shadow-lg">
                                                            {index + 1}
                                                        </div>
                                                    </div>

                                                    {/* Node Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4">
                                                            {/* Cover Image */}
                                                            {node.cover_image && (
                                                                <img
                                                                    src={node.cover_image}
                                                                    alt={node.title}
                                                                    className="w-24 h-24 rounded-lg object-cover border-2 border-yellow-500/30 group-hover:border-yellow-500/60 transition-colors"
                                                                />
                                                            )}

                                                            {/* Text Content */}
                                                            <div className="flex-1">
                                                                <h4 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 mb-2 transition-colors">
                                                                    {node.title}
                                                                </h4>
                                                                
                                                                {node.description && (
                                                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                                                        {node.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex items-center gap-3">
                                                                    {progress?.completed_node_ids.includes(node.node_id) && (
                                                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/50 flex items-center gap-1">
                                                                            ✓ Completado
                                                                        </span>
                                                                    )}
                                                                    {node.topic && (
                                                                        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                                                                            <BookOpen className="w-3 h-3" /> {node.topic}
                                                                        </span>
                                                                    )}
                                                                    {node.author && (
                                                                        <span className="text-xs text-gray-500">
                                                                            por @{node.author}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between p-6 border-b border-yellow-500/10">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 text-green-400 hover:text-green-300 hover:bg-green-500/10 relative"
                                        onClick={handleLike}
                                        disabled={loading || isUpdating}
                                    >
                                        <CheckCircle className={`h-7 w-7 transition-all ${liked ? 'fill-green-400 text-green-400 scale-110' : ''} ${loading ? 'opacity-50' : ''}`} />
                                        {liked && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                        )}
                                    </Button>
                                    <span className="text-lg font-semibold text-green-400">{likesCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        onClick={handleDislike}
                                        disabled={loading || isUpdating}
                                    >
                                        <Frown className={`h-7 w-7 transition-all ${disliked ? 'fill-red-400 text-red-400 scale-110' : ''} ${loading ? 'opacity-50' : ''}`} />
                                    </Button>
                                    <span className="text-lg font-semibold text-red-400">{dislikesCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-7 w-7 text-yellow-400" />
                                    <span className="text-lg font-semibold text-yellow-400">{commentsData.length}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-7 w-7" />
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                onClick={handleSave}
                            >
                                <Bookmark className={`h-7 w-7 transition-all ${saved ? 'fill-yellow-400 text-yellow-400 scale-110' : ''}`} />
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-yellow-400 mb-6">
                                Comentarios ({commentsData.length})
                            </h3>

                            {/* Add Comment */}
                            <form onSubmit={handleSubmitComment} className="mb-8">
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-yellow-500">
                                        <AvatarImage src={auth?.user?.profile_pic} />
                                        <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                            {auth?.user?.username?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-3">
                                        <textarea
                                            placeholder="Agrega un comentario..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="flex-1 min-h-[60px] bg-gray-900 border border-yellow-500/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-500 resize-none rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newComment.trim() || submitting}
                                            className="bg-yellow-500 hover:bg-yellow-400 text-black h-[60px]"
                                        >
                                            Publicar
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {commentsData.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        No hay comentarios aún. ¡Sé el primero en comentar!
                                    </p>
                                ) : (
                                    commentsData.map((comment) => (
                                        <div key={comment.roadmap_comment_id} className="flex gap-4">
                                            <Avatar className="h-10 w-10 border-2 border-yellow-500">
                                                <AvatarImage src={comment.user?.profile_pic} />
                                                <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                                    {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="bg-gray-900/50 rounded-lg p-4 border border-yellow-500/10">
                                                    <p className="font-semibold text-yellow-400 text-sm mb-2">
                                                        {comment.user?.username || 'Usuario'}
                                                    </p>
                                                    <p className="text-gray-300">{comment.text}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 ml-4">
                                                    {formatDate(comment.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
