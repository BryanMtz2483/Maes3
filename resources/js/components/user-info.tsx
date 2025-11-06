import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    // Obtener el nombre del usuario de forma defensiva
    // Priorizar 'name', luego 'username', luego fallback
    const displayName = user.name || user.username || 'Usuario';
    
    // Obtener la imagen de perfil (puede ser 'avatar' o 'profile_pic')
    const profileImage = user.avatar || user.profile_pic;
    
    // Para debugging (puedes comentar esto después)
    // console.log('[UserInfo] user data:', { name: user.name, username: user.username, email: user.email });

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email || 'Sin email'}
                    </span>
                )}
            </div>
        </>
    );
}
