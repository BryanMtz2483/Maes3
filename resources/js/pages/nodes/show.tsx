import { Head, Link } from '@inertiajs/react';
import InstagramNav from '@/components/social/instagram-nav';
import RichContentRenderer from '@/components/content/rich-content-renderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, ThumbsDown, CheckCircle, Frown, Star, Edit, MoreHorizontal } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NodeShowProps {
    node: {
        node_id: string;
        title: string;
        author?: string;
        topic?: string;
        created_date?: string;
        created_at: string;
        description?: string;
        cover_image?: string;
        contents?: Array<{
            content_id: string;
            type: string;
            content: string;
            metadata?: {
                url?: string;
                alt?: string;
                items?: string[];
            };
            order?: number;
        }>;
        reactions_count: number;
        comments_count: number;
        author_name?: string;
        author_username?: string;
        author_avatar?: string;
    };
    comments: {
        data: Array<{
            node_comment_id: string;
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

export default function NodeShow({ node, comments }: NodeShowProps) {
    const { auth } = usePage().props as any;
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(node.reactions_count);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [commentsData, setCommentsData] = useState(comments.data || []);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [showSurvey, setShowSurvey] = useState(false);

    useEffect(() => {
        const loadUserReactions = async () => {
            try {
                const response = await axios.get(`/reactions/statistics/node/${node.node_id}`);
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
                        type: 'node',
                        id: node.node_id
                    }
                });
                setSaved(response.data.bookmarked || false);
            } catch (error) {
                console.error('Error loading bookmark status:', error);
            }
        };

        loadUserReactions();
        loadBookmarkStatus();
    }, [node.node_id]);

    const handleLike = async () => {
        const newLikedState = !liked;
        
        if (disliked && newLikedState) {
            setDisliked(false);
            setDislikesCount(Math.max(0, dislikesCount - 1));
        }
        
        setLiked(newLikedState);
        setLikesCount(newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1));
        
        try {
            await axios.post('/reactions/toggle', {
                entity_type: 'node',
                entity_id: node.node_id,
                reaction_type: 'like',
            });
            
            const statsResponse = await axios.get(`/reactions/statistics/node/${node.node_id}`);
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
        } catch (error) {
            setLiked(!newLikedState);
            console.error('Error al dar like:', error);
        }
    };

    const handleDislike = async () => {
        const newDislikedState = !disliked;
        
        if (liked && newDislikedState) {
            setLiked(false);
            setLikesCount(Math.max(0, likesCount - 1));
        }
        
        setDisliked(newDislikedState);
        setDislikesCount(newDislikedState ? dislikesCount + 1 : Math.max(0, dislikesCount - 1));
        
        try {
            await axios.post('/reactions/toggle', {
                entity_type: 'node',
                entity_id: node.node_id,
                reaction_type: 'dislike',
            });
            
            const statsResponse = await axios.get(`/reactions/statistics/node/${node.node_id}`);
            setLiked(statsResponse.data.user_liked || false);
            setDisliked(statsResponse.data.user_disliked || false);
            setLikesCount(statsResponse.data.likes_count || 0);
            setDislikesCount(statsResponse.data.dislikes_count || 0);
        } catch (error) {
            setDisliked(!newDislikedState);
            console.error('Error al dar dislike:', error);
        }
    };

    const handleSave = async () => {
        console.log('🔖 FUNCIÓN handleSave EJECUTADA (NODO)');
        console.log('Estado actual saved:', saved);
        console.log('Node ID:', node.node_id);
        
        const newSavedState = !saved;
        setSaved(newSavedState);
        
        try {
            console.log('📤 Enviando petición POST a /bookmarks/toggle');
            console.log('Datos:', { type: 'node', id: node.node_id });
            
            const response = await axios.post('/bookmarks/toggle', {
                type: 'node',
                id: node.node_id,
            });
            
            console.log('📥 Respuesta recibida:', response.data);
            setSaved(response.data.bookmarked);
            
            // Mostrar mensaje de éxito
            if (response.data.bookmarked) {
                console.log('✅ Guardado exitosamente');
                alert('✅ Nodo guardado exitosamente');
            } else {
                console.log('❌ Eliminado de guardados');
                alert('❌ Nodo eliminado de guardados');
            }
        } catch (error: any) {
            setSaved(!newSavedState);
            console.error('❌ ERROR al guardar:', error);
            console.error('Detalles del error:', error.response?.data);
            console.error('Status:', error.response?.status);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/nodes/${node.node_id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: node.title,
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
            const response = await axios.post(`/comments/nodes/${node.node_id}`, {
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

    return (
        <>
            <Head title={node.title} />
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

                    {/* Node Card */}
                    <Card className="overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black shadow-lg shadow-yellow-500/5">
                        {/* Header */}
                        <div className="p-6 border-b border-yellow-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <Link href={`/profile/${node.author_username || node.author || 'usuario'}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity group flex-1">
                                    <Avatar className="h-14 w-14 border-2 border-yellow-500 group-hover:border-yellow-400 transition-colors">
                                        <AvatarImage src={node.author_avatar} />
                                        <AvatarFallback className="bg-yellow-500 text-black font-semibold text-lg">
                                            {node.author_name?.[0] || node.author?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-sm font-semibold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                            @{node.author_username || node.author || 'Usuario'}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(node.created_at)}
                                        </p>
                                    </div>
                                </Link>
                                
                                {auth?.user?.username === (node.author_username || node.author) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-black border-yellow-500/20">
                                            <DropdownMenuItem 
                                                onClick={() => window.location.href = `/nodes/${node.node_id}/edit`}
                                                className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 cursor-pointer"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar nodo
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-yellow-400 mb-2">{node.title}</h1>
                            
                            {node.topic && (
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-sm bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                                        📚 {node.topic}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        {node.cover_image && (
                            <div className="w-full h-80 overflow-hidden">
                                <img
                                    src={node.cover_image}
                                    alt={node.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        {node.description && (
                            <div className="p-6 border-b border-yellow-500/10">
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {node.description}
                                </p>
                            </div>
                        )}

                        {/* Rich Content */}
                        {node.contents && node.contents.length > 0 && (
                            <div className="p-6 border-b border-yellow-500/10">
                                <RichContentRenderer blocks={node.contents} />
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
                                    >
                                        <CheckCircle className={`h-7 w-7 transition-all ${liked ? 'fill-green-400 text-green-400 scale-110' : ''}`} />
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
                                    >
                                        <Frown className={`h-7 w-7 transition-all ${disliked ? 'fill-red-400 text-red-400 scale-110' : ''}`} />
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

                        {/* Survey Button */}
                        <div className="px-6 py-4 border-b border-yellow-500/10">
                            <Button
                                onClick={() => setShowSurvey(!showSurvey)}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                            >
                                <Star className="w-5 h-5 mr-2" />
                                {showSurvey ? 'Ocultar Encuesta' : 'Calificar este Nodo'}
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
                                        <div key={comment.node_comment_id} className="flex gap-4">
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

                    {/* Satisfaction Survey */}
                    {showSurvey && (
                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-8 mt-6 animate-in fade-in slide-in-from-top duration-500">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-2">¿Qué te pareció este nodo?</h3>
                            <p className="text-muted-foreground mb-6">Califica del 1 al 5</p>
                            
                            <div className="flex justify-center gap-3 mb-4">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                        key={rating}
                                        onClick={() => setSatisfactionRating(rating)}
                                        variant={satisfactionRating === rating ? "default" : "outline"}
                                        className={`w-14 h-14 text-lg font-bold transition-all ${
                                            satisfactionRating === rating 
                                                ? 'bg-purple-500 hover:bg-purple-600 text-white scale-110' 
                                                : 'hover:scale-105'
                                        }`}
                                    >
                                        {rating}
                                    </Button>
                                ))}
                            </div>
                            
                            {satisfactionRating && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <p className="text-lg font-semibold text-purple-400">
                                        Gracias por tu calificación de {satisfactionRating}/5
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                    )}
                </div>
            </div>
        </>
    );
}
