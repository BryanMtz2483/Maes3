import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Type,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Video,
    Link as LinkIcon,
    List,
    ListOrdered,
    Code,
    Quote,
    Plus,
    GripVertical,
    Trash2,
    MoveUp,
    MoveDown,
} from 'lucide-react';

export interface ContentBlock {
    id: string;
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'video' | 'link' | 'list' | 'orderedList' | 'code' | 'quote';
    content: string;
    metadata?: {
        url?: string;
        alt?: string;
        items?: string[];
    };
}

interface RichContentEditorProps {
    initialBlocks?: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

export default function RichContentEditor({ initialBlocks = [], onChange }: RichContentEditorProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>(
        initialBlocks.length > 0 ? initialBlocks : [{ id: '1', type: 'paragraph', content: '' }]
    );
    const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

    const updateBlocks = (newBlocks: ContentBlock[]) => {
        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    const addBlock = (afterId: string, type: ContentBlock['type'] = 'paragraph') => {
        const index = blocks.findIndex(b => b.id === afterId);
        const newBlock: ContentBlock = {
            id: Date.now().toString(),
            type,
            content: '',
            metadata: type === 'list' || type === 'orderedList' ? { items: [''] } : {},
        };
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        updateBlocks(newBlocks);
        setShowBlockMenu(null);
    };

    const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
        updateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const deleteBlock = (id: string) => {
        if (blocks.length > 1) {
            updateBlocks(blocks.filter(b => b.id !== id));
        }
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < blocks.length - 1)) {
            const newBlocks = [...blocks];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
            updateBlocks(newBlocks);
        }
    };

    const blockTypes = [
        { type: 'paragraph' as const, icon: Type, label: 'Texto' },
        { type: 'heading1' as const, icon: Heading1, label: 'Título 1' },
        { type: 'heading2' as const, icon: Heading2, label: 'Título 2' },
        { type: 'heading3' as const, icon: Heading3, label: 'Título 3' },
        { type: 'image' as const, icon: ImageIcon, label: 'Imagen' },
        { type: 'video' as const, icon: Video, label: 'Video' },
        { type: 'link' as const, icon: LinkIcon, label: 'Enlace' },
        { type: 'list' as const, icon: List, label: 'Lista' },
        { type: 'orderedList' as const, icon: ListOrdered, label: 'Lista Numerada' },
        { type: 'code' as const, icon: Code, label: 'Código' },
        { type: 'quote' as const, icon: Quote, label: 'Cita' },
    ];

    const renderBlock = (block: ContentBlock, index: number) => {
        const commonClasses = "w-full bg-gray-900 border-yellow-500/20 text-gray-200 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";

        return (
            <div key={block.id} className="group relative">
                {/* Block Controls */}
                <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-yellow-400"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                    >
                        <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-yellow-400 cursor-grab"
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-yellow-400"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                    >
                        <MoveDown className="h-4 w-4" />
                    </Button>
                </div>

                <Card className="p-4 border-yellow-500/20 bg-black/50 hover:border-yellow-500/40 transition-colors">
                    <div className="flex items-start gap-2">
                        <div className="flex-1">
                            {/* Paragraph */}
                            {block.type === 'paragraph' && (
                                <Textarea
                                    value={block.content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock(block.id, { content: e.target.value })}
                                    placeholder="Escribe tu contenido aquí..."
                                    className={commonClasses}
                                    rows={3}
                                />
                            )}

                            {/* Headings */}
                            {(block.type === 'heading1' || block.type === 'heading2' || block.type === 'heading3') && (
                                <Input
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                    placeholder={`Título ${block.type.slice(-1)}`}
                                    className={`${commonClasses} ${
                                        block.type === 'heading1' ? 'text-3xl font-bold' :
                                        block.type === 'heading2' ? 'text-2xl font-bold' :
                                        'text-xl font-semibold'
                                    }`}
                                />
                            )}

                            {/* Image */}
                            {block.type === 'image' && (
                                <div className="space-y-2">
                                    <Input
                                        value={block.metadata?.url || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { 
                                            metadata: { ...block.metadata, url: e.target.value } 
                                        })}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        placeholder="URL de la imagen"
                                        className={commonClasses}
                                    />
                                    <Input
                                        value={block.metadata?.alt || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBlock(block.id, { 
                                            metadata: { ...block.metadata, alt: e.target.value } 
                                        })}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        placeholder="Texto alternativo"
                                        className={commonClasses}
                                    />
                                    {block.metadata?.url && (
                                        <img 
                                            src={block.metadata.url} 
                                            alt={block.metadata.alt || 'Preview'} 
                                            className="rounded-lg max-h-64 object-cover"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Video */}
                            {block.type === 'video' && (
                                <div className="space-y-2">
                                    <Input
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        placeholder="URL del video (YouTube, Vimeo, etc.)"
                                        className={commonClasses}
                                    />
                                    {block.content && (
                                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                                            <Video className="w-12 h-12 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Link */}
                            {block.type === 'link' && (
                                <div className="space-y-2">
                                    <Input
                                        value={block.content}
                                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        placeholder="Texto del enlace"
                                        className={commonClasses}
                                    />
                                    <Input
                                        value={block.metadata?.url || ''}
                                        onChange={(e) => updateBlock(block.id, { 
                                            metadata: { ...block.metadata, url: e.target.value } 
                                        })}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        placeholder="URL"
                                        className={commonClasses}
                                    />
                                </div>
                            )}

                            {/* Lists */}
                            {(block.type === 'list' || block.type === 'orderedList') && (
                                <div className="space-y-2">
                                    {(block.metadata?.items || ['']).map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-yellow-400 mt-2">
                                                {block.type === 'list' ? '•' : `${idx + 1}.`}
                                            </span>
                                            <Input
                                                value={item}
                                                onChange={(e) => {
                                                    const newItems = [...(block.metadata?.items || [''])];
                                                    newItems[idx] = e.target.value;
                                                    updateBlock(block.id, { 
                                                        metadata: { ...block.metadata, items: newItems } 
                                                    });
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                                placeholder="Elemento de lista"
                                                className={commonClasses}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newItems = [...(block.metadata?.items || ['']), ''];
                                            updateBlock(block.id, { 
                                                metadata: { ...block.metadata, items: newItems } 
                                            });
                                        }}
                                        className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Agregar elemento
                                    </Button>
                                </div>
                            )}

                            {/* Code */}
                            {block.type === 'code' && (
                                <Textarea
                                    value={block.content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock(block.id, { content: e.target.value })}
                                    placeholder="// Tu código aquí"
                                    className={`${commonClasses} font-mono`}
                                    rows={5}
                                />
                            )}

                            {/* Quote */}
                            {block.type === 'quote' && (
                                <div className="border-l-4 border-yellow-500 pl-4">
                                    <Textarea
                                        value={block.content}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateBlock(block.id, { content: e.target.value })}
                                        placeholder="Escribe una cita..."
                                        className={`${commonClasses} italic`}
                                        rows={2}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBlock(block.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={blocks.length === 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Add Block Menu */}
                    <div className="mt-2 relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
                            className="text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar bloque
                        </Button>

                        {showBlockMenu === block.id && (
                            <Card className="absolute left-0 top-full mt-2 z-10 p-2 border-yellow-500/20 bg-black shadow-xl">
                                <div className="grid grid-cols-3 gap-2 w-80">
                                    {blockTypes.map((bt) => {
                                        const Icon = bt.icon;
                                        return (
                                            <Button
                                                key={bt.type}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addBlock(block.id, bt.type)}
                                                className="flex flex-col items-center gap-1 h-auto py-3 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-xs">{bt.label}</span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-4 pl-12">
            {blocks.map((block, index) => renderBlock(block, index))}
        </div>
    );
}
