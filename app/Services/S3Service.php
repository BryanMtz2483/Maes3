<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class S3Service
{
    /**
     * Subir imagen de perfil a S3
     *
     * @param UploadedFile $file
     * @param int $userId
     * @return string URL de la imagen
     */
    public function uploadProfilePicture(UploadedFile $file, int $userId): string
    {
        // Validar que sea una imagen
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('El archivo debe ser una imagen válida');
        }

        // Validar tamaño (máximo 5MB)
        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \Exception('La imagen no debe superar los 5MB');
        }

        // Generar nombre único
        $extension = $file->getClientOriginalExtension();
        $filename = "profile-pictures/{$userId}/" . Str::uuid() . ".{$extension}";

        // Subir a S3
        $path = Storage::disk('s3')->putFileAs(
            "profile-pictures/{$userId}",
            $file,
            Str::uuid() . ".{$extension}",
            'public'
        );

        // Retornar URL pública
        return Storage::disk('s3')->url($path);
    }

    /**
     * Eliminar imagen de perfil anterior de S3
     *
     * @param string $url
     * @return bool
     */
    public function deleteProfilePicture(string $url): bool
    {
        try {
            // Extraer el path del URL
            $path = parse_url($url, PHP_URL_PATH);
            $path = ltrim($path, '/');
            
            // Si el path contiene el bucket name, removerlo
            $bucketName = env('AWS_BUCKET');
            if (str_starts_with($path, $bucketName . '/')) {
                $path = substr($path, strlen($bucketName) + 1);
            }

            return Storage::disk('s3')->delete($path);
        } catch (\Exception $e) {
            \Log::error('Error al eliminar imagen de S3: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Verificar si S3 está configurado correctamente
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty(env('AWS_ACCESS_KEY_ID')) 
            && !empty(env('AWS_SECRET_ACCESS_KEY'))
            && !empty(env('AWS_DEFAULT_REGION'))
            && !empty(env('AWS_BUCKET'));
    }
}
