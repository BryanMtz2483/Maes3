import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import RoadmapBuilder, { RoadmapNode } from '@/components/roadmap/roadmap-builder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Eye, Map } from 'lucide-react';
import axios from 'axios';

interface RoadmapEditProps {
    roadmap: {
        roadmap_id: string;
        name: string;
        description?: string;
        tags?: string;
        cover_image?: string;
        nodes?: Array<{
            node_id: string;
            title: string;
            description?: string;
            topic?: string;
            cover_image?: string;
            pivot?: {
                order: number;
                parent_node_id?: string;
            };
        }>;
    };
}

export default function RoadmapEdit({ roadmap }: RoadmapEditProps) {
    const { auth } = usePage().props as any;
    const [name, setName] = useState(roadmap.name || '');
    const [description, setDescription] = useState(roadmap.description || '');
    const [tags, setTags] = useState(roadmap.tags || '');
    const [coverImage, setCoverImage] = useState(roadmap.cover_image || '');
    const [selectedNodes, setSelectedNodes] = useState<RoadmapNode[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Inicializar nodos seleccionados
    useState(() => {
        if (roadmap.nodes && roadmap.nodes.length > 0) {
            const nodes: RoadmapNode[] = roadmap.nodes.map(node => ({
                node_id: node.node_id,
                title: node.title,
                topic: node.topic,
                cover_image: node.cover_image,
                order: node.pivot?.order || 0,
                parent_id: node.pivot?.parent_node_id || null,
                children: [],
            }));
            setSelectedNodes(nodes);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.put(`/roadmaps/${roadmap.roadmap_id}`, {
                name,
                description,
                tags,
                cover_image: coverImage,
                nodes: selectedNodes.map((node, index) => ({
                    node_id: node.node_id,
                    order: index,
                    parent_id: node.parent_id,
                })),
            });

            if (response.data.success) {
                router.visit(`/roadmaps/${roadmap.roadmap_id}`);
            }
        } catch (error: any) {
            console.error('Error updating roadmap:', error);
            alert(error.response?.data?.message || 'Error al actualizar el roadmap');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title={`Editar: ${roadmap.name}`} />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-7xl pt-8 px-4 pb-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.visit(`/roadmaps/${roadmap.roadmap_id}`)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                                    Editar Roadmap
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Actualiza tu ruta de aprendizaje
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
                                disabled={isSubmitting || !name || selectedNodes.length === 0}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </div>

                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <Card className="p-6 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                <h2 className="text-xl font-bold text-yellow-400 mb-4">Información del Roadmap</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nombre del Roadmap *
                                        </label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej: Desarrollo Full Stack 2024"
                                            className="bg-gray-900 border-yellow-500/20 text-gray-200 text-lg font-semibold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Descripción
                                        </label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe el objetivo y contenido de este roadmap..."
                                            className="bg-gray-900 border-yellow-500/20 text-gray-200"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Tags (separados por comas)
                                            </label>
                                            <Input
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                placeholder="fullstack, react, node, backend"
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

                            {/* Roadmap Builder */}
                            <Card className="p-6 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-yellow-400 mb-2">
                                        Estructura del Roadmap
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Selecciona los nodos y organízalos en una estructura de árbol con rutas paralelas
                                    </p>
                                </div>
                                
                                <RoadmapBuilder
                                    selectedNodes={selectedNodes}
                                    onChange={setSelectedNodes}
                                />
                            </Card>
                        </div>
                    ) : (
                        /* Preview Mode */
                        <div className="space-y-6">
                            <Card className="p-8 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black">
                                {coverImage && (
                                    <img
                                        src={coverImage}
                                        alt={name}
                                        className="w-full h-64 object-cover rounded-lg mb-6"
                                    />
                                )}
                                
                                <div className="flex items-center gap-3 mb-4">
                                    <Map className="w-8 h-8 text-purple-400" />
                                    <h1 className="text-4xl font-bold text-purple-400">{name || 'Sin nombre'}</h1>
                                </div>
                                
                                {description && (
                                    <p className="text-gray-300 text-lg mb-6">{description}</p>
                                )}

                                {tags && (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {tags.split(',').map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-yellow-500/20 pt-6">
                                    <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                                        Nodos del Roadmap ({selectedNodes.length})
                                    </h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedNodes.map((node, idx) => (
                                            <Card
                                                key={node.node_id}
                                                className="p-4 border-yellow-500/20 bg-gray-900/50"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        {node.cover_image && (
                                                            <img
                                                                src={node.cover_image}
                                                                alt={node.title}
                                                                className="w-full h-24 object-cover rounded mb-2"
                                                            />
                                                        )}
                                                        <p className="text-sm font-medium text-gray-200">
                                                            {node.title}
                                                        </p>
                                                        {node.topic && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {node.topic}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
