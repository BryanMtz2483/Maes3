import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { FileText, Map, Image, Video, Link as LinkIcon, Sparkles } from 'lucide-react';

export default function CreateIndex() {
    const { auth } = usePage().props as any;

    const publicationTypes = [
        {
            type: 'node',
            title: 'Crear Nodo',
            description: 'Crea un nodo de conocimiento con contenido rico: texto, imágenes, videos y más',
            icon: FileText,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600',
            href: '/nodes/create',
        },
        {
            type: 'roadmap',
            title: 'Crear Roadmap',
            description: 'Diseña un roadmap de aprendizaje con estructura de árbol y rutas personalizadas',
            icon: Map,
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600',
            href: '/roadmaps/create',
        },
    ];

    const features = [
        {
            icon: Image,
            title: 'Imágenes',
            description: 'Agrega imágenes para ilustrar tus ideas',
        },
        {
            icon: Video,
            title: 'Videos',
            description: 'Embebe videos de YouTube, Vimeo y más',
        },
        {
            icon: LinkIcon,
            title: 'Enlaces',
            description: 'Comparte recursos externos relevantes',
        },
        {
            icon: Sparkles,
            title: 'Formato Rico',
            description: 'Títulos, listas, código y más',
        },
    ];

    return (
        <>
            <Head title="Crear Publicación" />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-6xl pt-12 px-4 pb-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
                            ¿Qué quieres crear hoy?
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Comparte tu conocimiento con la comunidad. Crea nodos de contenido o diseña roadmaps completos de aprendizaje.
                        </p>
                    </div>

                    {/* Publication Type Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {publicationTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <Link key={type.type} href={type.href}>
                                    <Card className="group relative overflow-hidden border-2 border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black hover:border-yellow-500/60 transition-all duration-300 cursor-pointer h-full">
                                        {/* Animated Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                        
                                        <div className="relative p-8">
                                            {/* Icon */}
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>

                                            {/* Content */}
                                            <h3 className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300 transition-colors">
                                                {type.title}
                                            </h3>
                                            <p className="text-gray-400 text-base leading-relaxed mb-6">
                                                {type.description}
                                            </p>

                                            {/* CTA */}
                                            <Button 
                                                className={`w-full bg-gradient-to-r ${type.gradient} hover:opacity-90 text-white font-semibold`}
                                            >
                                                Comenzar →
                                            </Button>
                                        </div>

                                        {/* Decorative Element */}
                                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors duration-300"></div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Features Section */}
                    <div className="bg-gradient-to-br from-gray-900/50 to-black border border-yellow-500/20 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                            Herramientas de Contenido Rico
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.title} className="text-center">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                                            <Icon className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-200 mb-1">
                                            {feature.title}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-12 bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 p-6 rounded-r-lg">
                        <h3 className="text-lg font-bold text-yellow-400 mb-2">
                            💡 Consejos para crear contenido de calidad
                        </h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">•</span>
                                <span><strong>Nodos:</strong> Enfócate en un tema específico y proporciona contenido detallado y bien estructurado</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">•</span>
                                <span><strong>Roadmaps:</strong> Organiza los nodos en una secuencia lógica con rutas alternativas para diferentes niveles</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">•</span>
                                <span><strong>Multimedia:</strong> Usa imágenes y videos para hacer tu contenido más atractivo y fácil de entender</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
