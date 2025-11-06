import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MoreHorizontal, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface Comment {
    node_comment_id?: string;
    roadmap_comment_id?: string;
    text: string;
    created_at: string;
    user?: {
        username: string;
        avatar?: string;
    };
}

interface CommentsModalProps {
    open: boolean;
    onClose: () => void;
    post: {
        id: string;
        type: 'roadmap' | 'node';
        title: string;
        author?: {
            name: string;
            username: string;
            avatar?: string;
        };
        image?: string;
    };
    onCommentAdded?: () => void;
}

export default function CommentsModal({ open, onClose, post, onCommentAdded }: CommentsModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            loadComments();
        }
    }, [open, post.id]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const endpoint = post.type === 'node' 
                ? `/comments/nodes/${post.id}`
                : `/comments/roadmaps/${post.id}`;
            
            const response = await axios.get(endpoint);
            setComments(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const endpoint = post.type === 'node'
                ? `/comments/nodes/${post.id}`
                : `/comments/roadmaps/${post.id}`;

            console.log('Enviando comentario a:', endpoint);
            console.log('Texto:', newComment.trim());

            const response = await axios.post(endpoint, {
                text: newComment.trim(),
            });

            console.log('Respuesta del comentario:', response.data);

            // Agregar el nuevo comentario a la lista
            setComments([response.data.comment, ...comments]);
            setNewComment('');
            
            // Notificar al componente padre que se agregó un comentario
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (error: any) {
            console.error('Error completo al comentar:', error);
            console.error('Respuesta del servidor:', error.response?.data);
            console.error('Status:', error.response?.status);
            
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error
                || error.message 
                || 'Error desconocido';
            
            alert(`Error al publicar el comentario: ${errorMessage}`);
        } finally {
            setSubmitting(false);
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] p-0 bg-black border-yellow-500/20">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    {/* Image Section */}
                    {post.image && (
                        <div className="hidden md:block bg-black">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-yellow-500/10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-yellow-500">
                                    <AvatarImage src={post.author?.avatar} />
                                    <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                        {post.author?.name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-400">
                                        {post.author?.username || 'Usuario'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-yellow-400">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Post Description */}
                        <div className="p-4 border-b border-yellow-500/10">
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 border-2 border-yellow-500">
                                    <AvatarImage src={post.author?.avatar} />
                                    <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                        {post.author?.name?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <span className="font-semibold text-yellow-400 mr-2">
                                        {post.author?.username}
                                    </span>
                                    <span className="text-gray-300">{post.title}</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-gray-500">Cargando comentarios...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    No hay comentarios aún. ¡Sé el primero en comentar!
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment, index) => (
                                        <div key={comment.node_comment_id || comment.roadmap_comment_id || index} className="flex gap-3">
                                            <Avatar className="h-8 w-8 border-2 border-yellow-500">
                                                <AvatarImage src={comment.user?.avatar} />
                                                <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                                    {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="bg-gray-900 rounded-lg p-3 border border-yellow-500/10">
                                                    <p className="font-semibold text-yellow-400 text-sm mb-1">
                                                        {comment.user?.username || 'Usuario'}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">{comment.text}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 px-3">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(comment.created_at)}
                                                    </span>
                                                    <button className="text-xs text-gray-500 hover:text-yellow-400">
                                                        Me gusta
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleSubmitComment} className="p-4 border-t border-yellow-500/10">
                            <div className="flex gap-3">
                                <textarea
                                    placeholder="Agrega un comentario..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 min-h-[60px] bg-gray-900 border border-yellow-500/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-500 resize-none rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmitComment(e as any);
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-black"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
