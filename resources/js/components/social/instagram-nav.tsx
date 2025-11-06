import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Home,
    Compass,
    Bookmark,
    User,
    Bell,
    Plus,
    Search,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface InstagramNavProps {
    currentUser?: {
        username: string;
        email?: string;
        avatar?: string;
        score?: number;
    };
}

export default function InstagramNav({ currentUser }: InstagramNavProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Cargar contador de notificaciones no leídas
        const loadUnreadCount = async () => {
            try {
                const response = await axios.get('/notifications/unread');
                setUnreadCount(response.data.unread_count || 0);
            } catch (error) {
                console.error('Error loading unread notifications:', error);
            }
        };

        loadUnreadCount();
        
        // Actualizar cada 30 segundos
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery });
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black shadow-lg shadow-yellow-500/10">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50">
                            <AppLogoIcon className="size-6 fill-current text-black" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent hidden sm:block">
                            MAES3
                        </span>
                    </Link>

                    {/* Search Bar - Siempre visible */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" />
                            <Input
                                type="search"
                                placeholder="Buscar roadmaps, nodos, usuarios..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-900 border-yellow-500/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            />
                        </div>
                    </form>

                    {/* Navigation Icons */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300">
                                <Home className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/feed/explore">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300">
                                <Compass className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/roadmaps/create">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300">
                                <Plus className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/bookmarks">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300">
                                <Bookmark className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/notifications/page">
                            <Button variant="ghost" size="icon" className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 relative">
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 hover:bg-yellow-500/10 px-3">
                                    <Avatar className="h-8 w-8 border-2 border-yellow-500">
                                        <AvatarImage src={currentUser?.avatar} />
                                        <AvatarFallback className="bg-yellow-500 text-black font-semibold">
                                            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-yellow-400">
                                            {currentUser?.username || 'Usuario'}
                                        </span>
                                        <span className="text-xs text-yellow-600">
                                            {currentUser?.score || 0} puntos
                                        </span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-black border-yellow-500/20">
                                <DropdownMenuLabel className="text-yellow-400">Mi Cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-yellow-500/20" />
                                <DropdownMenuItem asChild>
                                    <Link href={`/profile/${currentUser?.username || 'usuario'}`} className="cursor-pointer text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10">
                                        <User className="mr-2 h-4 w-4" />
                                        Ver Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="cursor-pointer text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10">
                                        <User className="mr-2 h-4 w-4" />
                                        Editar Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/roadmaps" className="cursor-pointer text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10">
                                        Mis Roadmaps
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10">
                                        Configuración
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-yellow-500/20" />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="w-full cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                        Cerrar Sesión
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
