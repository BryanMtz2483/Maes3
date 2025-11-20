import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
    user: {
        username: string;
        profile_pic?: string;
    };
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-2xl',
};

export default function UserAvatar({ user, className = '', size = 'md' }: UserAvatarProps) {
    return (
        <Avatar className={`${sizeClasses[size]} ${className}`}>
            <AvatarImage src={user.profile_pic} alt={user.username} />
            <AvatarFallback className="bg-yellow-500 text-black font-bold">
                {user.username[0]?.toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
}
