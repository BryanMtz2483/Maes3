import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name?: string; // Opcional porque algunos usuarios pueden tener solo 'username'
    username?: string; // Campo alternativo para el nombre
    email: string;
    avatar?: string;
    profile_pic?: string; // Alias alternativo para avatar
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    two_factor_confirmed_at?: string | null;
    birth_date?: string | null;
    score?: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
