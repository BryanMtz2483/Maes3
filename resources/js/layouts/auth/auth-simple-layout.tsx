import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 md:p-10 relative overflow-hidden">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium group"
                        >
                            <div className="flex aspect-square size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl shadow-yellow-500/50 transition-transform group-hover:scale-105">
                                <AppLogoIcon className="size-12 fill-current text-black" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                MAES3
                            </span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-yellow-400">{title}</h1>
                            <p className="text-center text-sm text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Card con el formulario */}
                    <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black p-8 shadow-xl shadow-yellow-500/5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
