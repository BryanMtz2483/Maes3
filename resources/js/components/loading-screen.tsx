import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

interface LoadingScreenProps {
    onLoadingComplete?: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simular carga y luego ocultar
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onLoadingComplete) {
                onLoadingComplete();
            }
        }, 2500); // 2.5 segundos

        return () => clearTimeout(timer);
    }, [onLoadingComplete]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent animate-pulse"></div>
            </div>

            {/* Logo animado */}
            <div className="relative z-10 animate-logo-entrance">
                <div className="relative">
                    {/* Círculo de fondo con pulso */}
                    <div className="absolute inset-0 -m-8 rounded-full bg-yellow-500/20 blur-3xl animate-pulse"></div>
                    
                    {/* Logo con animación */}
                    <div className="relative flex aspect-square size-32 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/50 animate-logo-spin-zoom">
                        <AppLogoIcon className="size-20 fill-current text-black" />
                    </div>
                </div>

                {/* Texto debajo del logo */}
                <div className="mt-8 text-center animate-fade-in-up">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        MAES3
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">Cargando tu experiencia...</p>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 animate-loading-bar"></div>
                </div>
            </div>
        </div>
    );
}
