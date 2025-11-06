import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import RichContentEditor, { ContentBlock } from '@/components/editor/rich-content-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import axios from 'axios';

export default function NodeCreate() {
    const { auth } = usePage().props as any;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [topic, setTopic] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/nodes', {
                title,
                description,
                topic,
                cover_image: coverImage,
                content_blocks: JSON.stringify(contentBlocks),
                author_id: auth.user.id,
            });

            if (response.data.success) {
                router.visit(`/nodes/${response.data.node.node_id}`);
            }
        } catch (error: any) {
            console.error('Error creating node:', error);
            alert(error.response?.data?.message || 'Error al crear el nodo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Crear Nodo" />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-5xl pt-8 px-4 pb-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.visit('/create')}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                    Crear Nodo de Conocimiento
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Comparte tu conocimiento con contenido rico y estructurado
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(!showPreview)}
                                className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {showPreview ? 'Editar' : 'Vista Previa'}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !title}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Publicando...' : 'Publicar Nodo'}
                            </Button>
                        </div>
                    </div>

                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card className="p-6 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                <h2 className="text-xl font-bold text-yellow-400 mb-4">Información Básica</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Título del Nodo *
                                        </label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ej: Introducción a React Hooks"
                                            className="bg-gray-900 border-yellow-500/20 text-gray-200 text-lg font-semibold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Descripción Corta
                                        </label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Breve descripción de lo que aprenderán..."
                                            className="bg-gray-900 border-yellow-500/20 text-gray-200"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Tema/Categoría
                                            </label>
                                            <Input
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="Ej: React, JavaScript, Frontend"
                                                className="bg-gray-900 border-yellow-500/20 text-gray-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Imagen de Portada (URL)
                                            </label>
                                            <Input
                                                value={coverImage}
                                                onChange={(e) => setCoverImage(e.target.value)}
                                                placeholder="https://..."
                                                className="bg-gray-900 border-yellow-500/20 text-gray-200"
                                            />
                                        </div>
                                    </div>

                                    {coverImage && (
                                        <div className="mt-4">
                                            <img
                                                src={coverImage}
                                                alt="Preview"
                                                className="rounded-lg max-h-48 object-cover"
                                                onError={() => setCoverImage('')}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Content Editor */}
                            <Card className="p-6 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-yellow-400">Contenido del Nodo</h2>
                                    <p className="text-sm text-gray-500">
                                        Usa bloques para estructurar tu contenido
                                    </p>
                                </div>
                                
                                <RichContentEditor
                                    initialBlocks={contentBlocks}
                                    onChange={setContentBlocks}
                                />
                            </Card>

                            {/* Tips */}
                            <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <h3 className="text-sm font-bold text-blue-400 mb-2">
                                    💡 Consejos para crear un buen nodo
                                </h3>
                                <ul className="space-y-1 text-gray-400 text-xs">
                                    <li>• Usa títulos para organizar el contenido en secciones</li>
                                    <li>• Agrega imágenes y videos para hacer el contenido más visual</li>
                                    <li>• Incluye ejemplos de código cuando sea relevante</li>
                                    <li>• Proporciona enlaces a recursos adicionales</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        /* Preview Mode */
                        <div className="space-y-6">
                            <Card className="p-8 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                {coverImage && (
                                    <img
                                        src={coverImage}
                                        alt={title}
                                        className="w-full h-64 object-cover rounded-lg mb-6"
                                    />
                                )}
                                
                                <h1 className="text-4xl font-bold text-yellow-400 mb-4">{title || 'Sin título'}</h1>
                                
                                {description && (
                                    <p className="text-gray-300 text-lg mb-6">{description}</p>
                                )}

                                {topic && (
                                    <div className="flex gap-2 mb-8">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                                            {topic}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {contentBlocks.map((block) => (
                                        <div key={block.id}>
                                            {block.type === 'paragraph' && (
                                                <p className="text-gray-300">{block.content}</p>
                                            )}
                                            {block.type === 'heading1' && (
                                                <h1 className="text-3xl font-bold text-yellow-400">{block.content}</h1>
                                            )}
                                            {block.type === 'heading2' && (
                                                <h2 className="text-2xl font-bold text-yellow-400">{block.content}</h2>
                                            )}
                                            {block.type === 'heading3' && (
                                                <h3 className="text-xl font-semibold text-yellow-400">{block.content}</h3>
                                            )}
                                            {block.type === 'image' && block.metadata?.url && (
                                                <img
                                                    src={block.metadata.url}
                                                    alt={block.metadata.alt || ''}
                                                    className="rounded-lg max-w-full"
                                                />
                                            )}
                                            {block.type === 'code' && (
                                                <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto">
                                                    <code className="text-green-400 font-mono text-sm">{block.content}</code>
                                                </pre>
                                            )}
                                            {block.type === 'quote' && (
                                                <blockquote className="border-l-4 border-yellow-500 pl-4 italic text-gray-400">
                                                    {block.content}
                                                </blockquote>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
