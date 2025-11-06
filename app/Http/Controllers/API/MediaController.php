<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AWS\S3Service;
use App\Services\AWS\LambdaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    protected $s3Service;
    protected $lambdaService;

    public function __construct(S3Service $s3Service, LambdaService $lambdaService)
    {
        $this->s3Service = $s3Service;
        $this->lambdaService = $lambdaService;
    }

    /**
     * Subir imagen o archivo
     * POST /api/media/upload
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:image,document,video',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $type = $request->input('type');
        $path = $type . 's/' . auth()->id();

        $result = $this->s3Service->uploadFile($file, $path);

        if ($result['success']) {
            // Si es imagen, procesarla con Lambda
            if ($type === 'image') {
                $this->lambdaService->invokeAsync(env('AWS_LAMBDA_IMAGE_PROCESSOR'), [
                    'action' => 'optimize',
                    'image_url' => $result['url'],
                    'user_id' => auth()->id(),
                ]);
            }

            return response()->json([
                'success' => true,
                'url' => $result['url'],
                'key' => $result['key'],
                'message' => 'Archivo subido exitosamente',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al subir archivo',
            'error' => $result['error'],
        ], 500);
    }

    /**
     * Eliminar archivo
     * DELETE /api/media/{key}
     */
    public function delete($key)
    {
        $result = $this->s3Service->deleteFile($key);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Archivo eliminado exitosamente',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al eliminar archivo',
        ], 500);
    }

    /**
     * Obtener URL temporal firmada
     * GET /api/media/signed-url/{key}
     */
    public function getSignedUrl($key)
    {
        $url = $this->s3Service->getSignedUrl($key);

        if ($url) {
            return response()->json([
                'success' => true,
                'url' => $url,
                'expires_in' => '20 minutes',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al generar URL',
        ], 500);
    }

    /**
     * Procesar imagen con IA
     * POST /api/media/process-image
     */
    public function processImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image_url' => 'required|url',
            'operations' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->processImage(
            $request->input('image_url'),
            $request->input('operations', ['ocr', 'labels'])
        );

        return response()->json($result);
    }
}
