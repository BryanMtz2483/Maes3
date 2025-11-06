import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, ThumbsDown, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import CommentsModal from './comments-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

interface PostCardProps {
    post: {
        id: string;
        type: 'roadmap' | 'node';
        title: string;
        description?: string;
        author?: {
            name: string;
            username: string;
            avatar?: string;
        };
        author_id?: number;
        user_id?: number;
        image?: string;
        cover_image?: string;
        reactions_count: number;
        comments_count: number;
        created_at: string;
        tags?: Array<{ name: string }>;
    };
}

export default function PostCard({ post }: PostCardProps) {
    const { auth } = usePage().props as any;
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(post.reactions_count);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(post.comments_count);
    const [showComments, setShowComments] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);

    // Verificar si el usuario actual es el propietario del post
    const isOwner = auth?.user && (post.author_id === auth.user.id || post.user_id === auth.user.id);

    const handleEdit = () => {
        const editUrl = post.type === 'node' 
            ? `/nodes/${post.id}/edit` 
            : `/roadmaps/${post.id}/edit`;
        router.visit(editUrl);
    };

    // Cargar estado inicial de reacciones y bookmark del usuario
    useEffect(() => {
        const loadUserReactions = async () => {
            try {
                const response = await axios.get(`/reactions/statistics/${post.type}/${post.id}`);
                setLiked(response.data.user_liked || false);
                setDisliked(response.data.user_disliked || false);
                setLikesCount(response.data.likes_count || 0);
                setDislikesCount(response.data.dislikes_count || 0);
            } catch (error) {
                console.error('Error loading reactions:', error);
            }
        };

        const loadBookmarkStatus = async () => {
            try {
                const response = await axios.get('/bookmarks/check', {
                    params: {
                        type: post.type,
                        id: post.id
                    }
                });
                setSaved(response.data.bookmarked || false);
            } catch (error) {
                console.error('Error loading bookmark status:', error);
            }
        };

        loadUserReactions();
        loadBookmarkStatus();
    }, [post.id, post.type]);

    const handleLike = async () => {
        if (isLiking) return;
        
        setIsLiking(true);
        const newLikedState = !liked;
        
        // Si ya tiene dislike, quitarlo primero
        if (disliked && newLikedState) {
            setDisliked(false);
            setDislikesCount(Math.max(0, dislikesCount - 1));
        }
        
        // Actualización optimista
        setLiked(newLikedState);
        setLikesCount(newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1));
        
        try {
            // Llamar a la API de reacciones
            const response = await axios.post('/reactions/toggle', {
                entity_type: post.type,
                entity_id: post.id,
                reaction_type: 'like',
            });

            // Obtener el contador actualizado del servidor
            const statsResponse = await axios.get(`/reactions/statistics/${post.type}/${post.id}`);
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
            
        } catch (error: any) {
            // Revertir en caso de error
            setLiked(!newLikedState);
            console.error('Error al dar like:', error);
            alert(`Error al dar like: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDislike = async () => {
        if (isDisliking) return;
        
        setIsDisliking(true);
        const newDislikedState = !disliked;
        
        // Si ya tiene like, quitarlo primero
        if (liked && newDislikedState) {
            setLiked(false);
            setLikesCount(Math.max(0, likesCount - 1));
        }
        
        // Actualización optimista
        setDisliked(newDislikedState);
        setDislikesCount(newDislikedState ? dislikesCount + 1 : Math.max(0, dislikesCount - 1));
        
        try {
            // Llamar a la API de reacciones
            const response = await axios.post('/reactions/toggle', {
                entity_type: post.type,
                entity_id: post.id,
                reaction_type: 'dislike',
            });

            // Obtener el contador actualizado del servidor
            const statsResponse = await axios.get(`/reactions/statistics/${post.type}/${post.id}`);
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
            
        } catch (error: any) {
            // Revertir en caso de error
            setDisliked(!newDislikedState);
            console.error('Error al dar dislike:', error);
            alert(`Error al dar dislike: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsDisliking(false);
        }
    };

    const handleSave = async () => {
        const newSavedState = !saved;
        setSaved(newSavedState);
        
        try {
            const response = await axios.post('/bookmarks/toggle', {
                type: post.type,
                id: post.id,
            });
            
            setSaved(response.data.bookmarked);
        } catch (error: any) {
            setSaved(!newSavedState);
            console.error('Error al guardar:', error);
            alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/${post.type}s/${post.id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.description || post.title,
                    url: url,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(url);
            alert('Enlace copiado al portapapeles');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Hace unos minutos';
        if (hours < 24) return `Hace ${hours}h`;
        if (hours < 168) return `Hace ${Math.floor(hours / 24)}d`;
        return date.toLocaleDateString();
    };

    return (
        <Card className="overflow-hidden border border-yellow-500/20 rounded-lg bg-gradient-to-br from-gray-900 to-black shadow-lg shadow-yellow-500/5">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/10">
                <Link href={`/profile/${post.author?.username || 'usuario'}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10 border-2 border-yellow-500">
                        <AvatarImage src={post.author?.avatar} />
                        <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                            {post.author?.name?.[0] || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-yellow-400">{post.author?.username || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                </Link>
                
                {isOwner && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black border-yellow-500/20">
                            <DropdownMenuItem 
                                onClick={handleEdit}
                                className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 cursor-pointer"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar {post.type === 'node' ? 'nodo' : 'roadmap'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Cover Image */}
            {(post.cover_image || post.image) && (
                <div className="relative aspect-video w-full bg-black border-y border-yellow-500/10">
                    <img
                        src={post.cover_image || post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                    />
                    {/* Título superpuesto en la imagen */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{post.title}</h2>
                        {post.description && (
                            <p className="text-sm text-gray-300 line-clamp-2">{post.description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Título sin imagen */}
            {!post.cover_image && !post.image && (
                <div className="p-6 border-b border-yellow-500/10">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">{post.title}</h2>
                    {post.description && (
                        <p className="text-sm text-gray-300">{post.description}</p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-50"
                            onClick={handleLike}
                            disabled={isLiking}
                        >
                            <Heart
                                className={`h-6 w-6 transition-all ${liked ? 'fill-yellow-400 text-yellow-400 scale-110' : ''}`}
                            />
                        </Button>
                        {likesCount > 0 && (
                            <span className="text-sm font-semibold text-yellow-400">{likesCount}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                            onClick={handleDislike}
                            disabled={isDisliking}
                        >
                            <ThumbsDown
                                className={`h-6 w-6 transition-all ${disliked ? 'fill-red-400 text-red-400 scale-110' : ''}`}
                            />
                        </Button>
                        {dislikesCount > 0 && (
                            <span className="text-sm font-semibold text-red-400">{dislikesCount}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            onClick={() => setShowComments(true)}
                        >
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                        {commentsCount > 0 && (
                            <span className="text-sm font-semibold text-yellow-400">{commentsCount}</span>
                        )}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                        onClick={handleShare}
                    >
                        <Share2 className="h-6 w-6" />
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                    onClick={handleSave}
                >
                    <Bookmark className={`h-6 w-6 ${saved ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <p className="text-sm font-semibold mb-2 text-yellow-400">{likesCount} me gusta</p>
                <div className="text-sm mb-2">
                    <span className="font-semibold mr-2 text-yellow-400">{post.author?.username}</span>
                    <span className="text-gray-300">{post.title}</span>
                </div>
                {post.description && (
                    <p className="text-sm text-gray-400 mt-1">{post.description}</p>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-3">
                    {post.type === 'node' && (
                        <Link href={`/nodes/${post.id}`}>
                            <Button 
                                size="sm" 
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs"
                            >
                                Ver completo
                            </Button>
                        </Link>
                    )}
                    {post.type === 'roadmap' && (
                        <Link href={`/roadmaps/${post.id}`}>
                            <Button 
                                size="sm" 
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs"
                            >
                                Ver roadmap
                            </Button>
                        </Link>
                    )}
                    {commentsCount > 0 && (
                        <button 
                            className="text-sm text-gray-500 hover:text-yellow-400 transition-colors"
                            onClick={() => setShowComments(true)}
                        >
                            Ver los {commentsCount} comentarios
                        </button>
                    )}
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Comments Modal */}
            <CommentsModal
                open={showComments}
                onClose={() => setShowComments(false)}
                post={{
                    id: post.id,
                    type: post.type,
                    title: post.title,
                    author: post.author,
                    image: post.image,
                }}
                onCommentAdded={() => setCommentsCount(commentsCount + 1)}
            />
        </Card>
    );
}
