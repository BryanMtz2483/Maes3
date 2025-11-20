import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Loader2 } from 'lucide-react';

// Simple toast notification
const toast = {
    success: (message: string) => alert(message),
    error: (message: string) => alert(message),
};

interface ProfilePictureUploadProps {
    user: {
        id: number;
        username: string;
        profile_pic?: string;
    };
    size?: 'sm' | 'md' | 'lg' | 'xl';
    editable?: boolean;
}

const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
};

export default function ProfilePictureUpload({ 
    user, 
    size = 'lg', 
    editable = false 
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(user.profile_pic);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB');
            return;
        }

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Formato no válido. Usa JPEG, PNG, GIF o WEBP');
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload a S3
        setUploading(true);
        const formData = new FormData();
        formData.append('profile_pic', file);

        try {
            const response = await fetch('/settings/profile/picture', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();
            
            if (response.ok) {
                setPreview(data.profile_pic);
                toast.success('Foto de perfil actualizada correctamente');
                
                // Recargar la página para actualizar todos los avatares
                router.reload({ only: ['user'] });
            } else {
                toast.error(data.message || 'Error al subir la imagen');
                setPreview(user.profile_pic);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al subir la imagen');
            setPreview(user.profile_pic);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Eliminar foto de perfil?')) return;

        setUploading(true);
        try {
            const response = await fetch('/settings/profile/picture', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (response.ok) {
                setPreview(undefined);
                toast.success('Foto de perfil eliminada correctamente');
                router.reload({ only: ['user'] });
            } else {
                toast.error(data.message || 'Error al eliminar la imagen');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        if (editable && !uploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="relative inline-block">
            <div 
                className={`relative ${editable ? 'cursor-pointer' : ''} group`}
                onClick={handleClick}
            >
                <Avatar className={`${sizeClasses[size]} border-4 border-yellow-500 ${uploading ? 'opacity-50' : ''}`}>
                    <AvatarImage src={preview} alt={user.username} />
                    <AvatarFallback className="bg-yellow-500 text-black font-bold text-4xl">
                        {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay cuando es editable */}
                {editable && !uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                )}

                {/* Loading spinner */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                )}
            </div>

            {/* Botones de acción (solo en modo editable) */}
            {editable && (
                <div className="mt-4 flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                    
                    <Button
                        onClick={handleClick}
                        disabled={uploading}
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploading ? 'Subiendo...' : preview ? 'Cambiar foto' : 'Subir foto'}
                    </Button>

                    {preview && (
                        <Button
                            onClick={handleDelete}
                            disabled={uploading}
                            variant="outline"
                            size="sm"
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Indicador de subida */}
            {uploading && editable && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                    Subiendo a AWS S3...
                </p>
            )}
        </div>
    );
}
