import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ContentBlock {
    content_id: string;
    type: string;
    content: string;
    metadata?: {
        url?: string;
        alt?: string;
        items?: string[];
    };
    order?: number;
}

interface RichContentRendererProps {
    blocks: ContentBlock[];
}

export default function RichContentRenderer({ blocks }: RichContentRendererProps) {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No hay contenido disponible</p>
            </div>
        );
    }

    // Ordenar bloques por orden
    const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="space-y-6">
            {sortedBlocks.map((block) => (
                <div key={block.content_id}>
                    {/* Paragraph */}
                    {block.type === 'paragraph' && (
                        <p className="text-gray-300 leading-relaxed text-base">
                            {block.content}
                        </p>
                    )}

                    {/* Heading 1 */}
                    {block.type === 'heading1' && (
                        <h1 className="text-4xl font-bold text-yellow-400 mt-8 mb-4">
                            {block.content}
                        </h1>
                    )}

                    {/* Heading 2 */}
                    {block.type === 'heading2' && (
                        <h2 className="text-3xl font-bold text-yellow-400 mt-6 mb-3">
                            {block.content}
                        </h2>
                    )}

                    {/* Heading 3 */}
                    {block.type === 'heading3' && (
                        <h3 className="text-2xl font-semibold text-yellow-400 mt-4 mb-2">
                            {block.content}
                        </h3>
                    )}

                    {/* Image */}
                    {block.type === 'image' && block.metadata?.url && (
                        <div className="my-6">
                            <img
                                src={block.metadata.url}
                                alt={block.metadata.alt || 'Imagen'}
                                className="w-full rounded-lg shadow-lg border border-yellow-500/20"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            {block.metadata.alt && (
                                <p className="text-sm text-gray-500 text-center mt-2 italic">
                                    {block.metadata.alt}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Video */}
                    {block.type === 'video' && block.content && (
                        <div className="my-6">
                            {/* Detectar YouTube */}
                            {(block.content.includes('youtube.com') || block.content.includes('youtu.be')) ? (
                                <div className="aspect-video rounded-lg overflow-hidden border border-yellow-500/20 shadow-lg">
                                    <iframe
                                        src={getYouTubeEmbedUrl(block.content)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : block.content.includes('vimeo.com') ? (
                                <div className="aspect-video rounded-lg overflow-hidden border border-yellow-500/20 shadow-lg">
                                    <iframe
                                        src={getVimeoEmbedUrl(block.content)}
                                        className="w-full h-full"
                                        allow="autoplay; fullscreen; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <video
                                    src={block.content}
                                    controls
                                    className="w-full rounded-lg shadow-lg border border-yellow-500/20"
                                />
                            )}
                        </div>
                    )}

                    {/* Link */}
                    {block.type === 'link' && block.metadata?.url && (
                        <a
                            href={block.metadata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:text-yellow-300 transition-colors group"
                        >
                            <LinkIcon className="w-5 h-5" />
                            <span className="font-medium">{block.content || block.metadata.url}</span>
                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </a>
                    )}

                    {/* Unordered List */}
                    {block.type === 'list' && block.metadata?.items && (
                        <ul className="space-y-2 ml-6">
                            {block.metadata.items.map((item, idx) => (
                                <li key={idx} className="text-gray-300 flex items-start gap-3">
                                    <span className="text-yellow-400 mt-1">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Ordered List */}
                    {block.type === 'orderedList' && block.metadata?.items && (
                        <ol className="space-y-2 ml-6 list-decimal list-inside">
                            {block.metadata.items.map((item, idx) => (
                                <li key={idx} className="text-gray-300">
                                    <span className="ml-2">{item}</span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {/* Code */}
                    {block.type === 'code' && (
                        <div className="my-6">
                            <pre className="bg-gray-950 border border-yellow-500/20 rounded-lg p-4 overflow-x-auto shadow-lg">
                                <code className="text-green-400 font-mono text-sm">
                                    {block.content}
                                </code>
                            </pre>
                        </div>
                    )}

                    {/* Quote */}
                    {block.type === 'quote' && (
                        <blockquote className="border-l-4 border-yellow-500 pl-6 py-2 my-6 bg-yellow-500/5 rounded-r-lg">
                            <p className="text-gray-300 italic text-lg">
                                "{block.content}"
                            </p>
                        </blockquote>
                    )}
                </div>
            ))}
        </div>
    );
}

// Helper functions para URLs de video
function getYouTubeEmbedUrl(url: string): string {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

function getVimeoEmbedUrl(url: string): string {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}
