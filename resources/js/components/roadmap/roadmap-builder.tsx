import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    X,
    GripVertical,
    GitBranch,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import axios from 'axios';

export interface RoadmapNode {
    node_id: string;
    title: string;
    topic?: string;
    cover_image?: string;
    order: number;
    parent_id?: string | null;
    children?: RoadmapNode[];
}

interface RoadmapBuilderProps {
    selectedNodes: RoadmapNode[];
    onChange: (nodes: RoadmapNode[]) => void;
}

interface AvailableNode {
    node_id: string;
    title: string;
    topic?: string;
    cover_image?: string;
    description?: string;
    author?: {
        username: string;
        account_name?: string;
    };
}

export default function RoadmapBuilder({ selectedNodes, onChange }: RoadmapBuilderProps) {
    const [availableNodes, setAvailableNodes] = useState<AvailableNode[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadAvailableNodes();
    }, []);

    const loadAvailableNodes = async () => {
        try {
            const response = await axios.get('/nodes');
            setAvailableNodes(response.data.nodes || []);
        } catch (error) {
            console.error('Error loading nodes:', error);
        }
    };

    const addNode = (node: AvailableNode, parentId: string | null = null) => {
        const newNode: RoadmapNode = {
            node_id: node.node_id,
            title: node.title,
            topic: node.topic,
            cover_image: node.cover_image,
            order: selectedNodes.length,
            parent_id: parentId,
            children: [],
        };

        onChange([...selectedNodes, newNode]);
    };

    const removeNode = (nodeId: string) => {
        onChange(selectedNodes.filter(n => n.node_id !== nodeId));
    };

    const addChildNode = (parentId: string, childNode: AvailableNode) => {
        addNode(childNode, parentId);
    };

    const toggleExpanded = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const buildTree = (): RoadmapNode[] => {
        const nodeMap = new Map<string, RoadmapNode>();
        const roots: RoadmapNode[] = [];

        // Create map of all nodes
        selectedNodes.forEach(node => {
            nodeMap.set(node.node_id, { ...node, children: [] });
        });

        // Build tree structure
        selectedNodes.forEach(node => {
            const treeNode = nodeMap.get(node.node_id)!;
            if (node.parent_id && nodeMap.has(node.parent_id)) {
                const parent = nodeMap.get(node.parent_id)!;
                parent.children!.push(treeNode);
            } else {
                roots.push(treeNode);
            }
        });

        return roots;
    };

    const renderTreeNode = (node: RoadmapNode, level: number = 0): React.ReactElement => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.node_id);

        return (
            <div key={node.node_id} className="mb-2">
                <Card 
                    className="p-3 border-yellow-500/20 bg-gray-900/50 hover:border-yellow-500/40 transition-colors"
                    style={{ marginLeft: `${level * 24}px` }}
                >
                    <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />

                        {/* Expand/Collapse */}
                        {hasChildren && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-yellow-400"
                                onClick={() => toggleExpanded(node.node_id)}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </Button>
                        )}

                        {/* Node Info */}
                        <div className="flex-1 flex items-center gap-3">
                            {node.cover_image && (
                                <img
                                    src={node.cover_image}
                                    alt={node.title}
                                    className="w-10 h-10 rounded object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-200">{node.title}</p>
                                {node.topic && (
                                    <p className="text-xs text-gray-500">{node.topic}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                onClick={() => {
                                    // Show add child dialog
                                }}
                                title="Agregar ruta paralela"
                            >
                                <GitBranch className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => removeNode(node.node_id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Render children */}
                {hasChildren && isExpanded && (
                    <div className="mt-2">
                        {node.children!.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const filteredNodes = availableNodes.filter(node =>
        !selectedNodes.some(sn => sn.node_id === node.node_id) &&
        (node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         node.topic?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const tree = buildTree();

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Available Nodes */}
            <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-4">Nodos Disponibles</h3>
                
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar nodos..."
                        className="pl-10 bg-gray-900 border-yellow-500/20 text-gray-200"
                    />
                </div>

                {/* Node List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {filteredNodes.length > 0 ? (
                        filteredNodes.map(node => (
                            <Card
                                key={node.node_id}
                                className="p-3 border-yellow-500/20 bg-gray-900/50 hover:border-yellow-500/40 transition-colors cursor-pointer"
                                onClick={() => addNode(node)}
                            >
                                <div className="flex items-center gap-3">
                                    {node.cover_image && (
                                        <img
                                            src={node.cover_image}
                                            alt={node.title}
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-200">{node.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {node.topic && (
                                                <span className="text-xs text-gray-500">{node.topic}</span>
                                            )}
                                            {node.author && (
                                                <>
                                                    <span className="text-xs text-gray-600">•</span>
                                                    <span className="text-xs text-gray-600">
                                                        por @{node.author.username}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {node.description && (
                                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                                {node.description}
                                            </p>
                                        )}
                                    </div>
                                    <Plus className="w-5 h-5 text-yellow-400" />
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? 'No se encontraron nodos' : 'No hay nodos disponibles'}
                        </div>
                    )}
                </div>
            </div>

            {/* Roadmap Structure */}
            <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-4">
                    Estructura del Roadmap ({selectedNodes.length} nodos)
                </h3>

                {selectedNodes.length > 0 ? (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {tree.map(node => renderTreeNode(node))}
                    </div>
                ) : (
                    <Card className="p-8 border-yellow-500/20 bg-gray-900/50 text-center">
                        <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-2">No hay nodos en el roadmap</p>
                        <p className="text-sm text-gray-600">
                            Selecciona nodos de la lista para agregarlos
                        </p>
                    </Card>
                )}

                {selectedNodes.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 p-3 rounded-r-lg">
                        <p className="text-xs text-gray-400">
                            💡 Usa el icono <GitBranch className="w-3 h-3 inline" /> para crear rutas paralelas y alternativas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
