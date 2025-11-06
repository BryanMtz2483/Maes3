<?php

namespace App\Services\AWS;

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

class S3Service
{
    protected $s3Client;
    protected $bucket;

    public function __construct()
    {
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);

        $this->bucket = env('AWS_BUCKET');
    }

    /**
     * Subir archivo a S3
     */
    public function uploadFile($file, $path = 'uploads')
    {
        try {
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $path . '/' . $fileName;

            $result = $this->s3Client->putObject([
                'Bucket' => $this->bucket,
                'Key' => $filePath,
                'Body' => fopen($file->getRealPath(), 'r'),
                'ACL' => 'public-read',
                'ContentType' => $file->getMimeType(),
            ]);

            return [
                'success' => true,
                'url' => $result['ObjectURL'],
                'key' => $filePath,
            ];
        } catch (AwsException $e) {
            Log::error('S3 Upload Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Eliminar archivo de S3
     */
    public function deleteFile($key)
    {
        try {
            $this->s3Client->deleteObject([
                'Bucket' => $this->bucket,
                'Key' => $key,
            ]);

            return ['success' => true];
        } catch (AwsException $e) {
            Log::error('S3 Delete Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Obtener URL firmada temporal
     */
    public function getSignedUrl($key, $expiration = '+20 minutes')
    {
        try {
            $cmd = $this->s3Client->getCommand('GetObject', [
                'Bucket' => $this->bucket,
                'Key' => $key,
            ]);

            $request = $this->s3Client->createPresignedRequest($cmd, $expiration);
            return (string) $request->getUri();
        } catch (AwsException $e) {
            Log::error('S3 Signed URL Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Listar archivos en un directorio
     */
    public function listFiles($prefix = '')
    {
        try {
            $result = $this->s3Client->listObjects([
                'Bucket' => $this->bucket,
                'Prefix' => $prefix,
            ]);

            $files = [];
            if (isset($result['Contents'])) {
                foreach ($result['Contents'] as $object) {
                    $files[] = [
                        'key' => $object['Key'],
                        'size' => $object['Size'],
                        'last_modified' => $object['LastModified'],
                    ];
                }
            }

            return $files;
        } catch (AwsException $e) {
            Log::error('S3 List Error: ' . $e->getMessage());
            return [];
        }
    }
}
