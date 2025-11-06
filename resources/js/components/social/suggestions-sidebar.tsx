import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Bot, Sparkles, Hash, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface SuggestionsSidebarProps {
    currentUser?: any;
}

export default function SuggestionsSidebar({ currentUser }: SuggestionsSidebarProps) {
    const topics = [
        { name: 'Desarrollo Web', count: '2.5k posts', icon: '💻' },
        { name: 'Inteligencia Artificial', count: '1.8k posts', icon: '🤖' },
        { name: 'Diseño UX/UI', count: '1.2k posts', icon: '🎨' },
        { name: 'DevOps', count: '980 posts', icon: '⚙️' },
        { name: 'Mobile Development', count: '850 posts', icon: '📱' },
    ];

    const trending = [
        { tag: 'React', posts: '1.2k' },
        { tag: 'Laravel', posts: '890' },
        { tag: 'TypeScript', posts: '756' },
        { tag: 'TailwindCSS', posts: '654' },
        { tag: 'NextJS', posts: '543' },
    ];

    return (
        <div className="space-y-4 sticky top-20">
            {/* Banner Modo Tutor */}
            <Card className="p-4 border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-gray-900 to-black relative overflow-hidden rounded-xl shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-yellow-500 rounded-lg">
                            <Bot className="h-5 w-5 text-black" />
                        </div>
                        <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-yellow-400 mb-1">Modo Tutor IA</h3>
                    <p className="text-xs text-gray-300 mb-3">Aprende a tu ritmo</p>
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs">
                        Probar ahora
                        <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </Card>

            {/* Temas que te podrían gustar */}
            <Card className="p-3 border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-yellow-400" />
                    <h3 className="text-sm font-bold text-yellow-400">Temas</h3>
                </div>
                <div className="space-y-2">
                    {topics.slice(0, 3).map((topic, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{topic.icon}</span>
                                <div>
                                    <p className="text-xs font-semibold text-yellow-400">{topic.name}</p>
                                    <p className="text-[10px] text-gray-500">{topic.count}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 text-[10px] h-6 px-2">
                                +
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tendencias */}
            <Card className="p-3 border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-yellow-400" />
                    <h3 className="text-sm font-bold text-yellow-400">Tendencias</h3>
                </div>
                <div className="space-y-1.5">
                    {trending.slice(0, 4).map((trend, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-400 font-bold text-sm">#{index + 1}</span>
                                <div>
                                    <p className="text-xs font-semibold text-yellow-400">#{trend.tag}</p>
                                    <p className="text-[10px] text-gray-500">{trend.posts}</p>
                                </div>
                            </div>
                            <TrendingUp className="h-3 w-3 text-yellow-400" />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Footer */}
            <div className="text-xs text-gray-600 space-y-2 px-2">
                <div className="flex flex-wrap gap-2">
                    <a href="#" className="hover:text-yellow-400 transition-colors">Información</a>
                    <span>·</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">Ayuda</a>
                    <span>·</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">API</a>
                    <span>·</span>
                    <a href="#" className="hover:text-yellow-400 transition-colors">Privacidad</a>
                </div>
                <p className="text-yellow-600">© 2024 MAES3</p>
            </div>
        </div>
    );
}
