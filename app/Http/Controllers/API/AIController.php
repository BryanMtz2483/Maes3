<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AWS\LambdaService;
use App\Services\AWS\SQSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AIController extends Controller
{
    protected $lambdaService;
    protected $sqsService;

    public function __construct(LambdaService $lambdaService, SQSService $sqsService)
    {
        $this->lambdaService = $lambdaService;
        $this->sqsService = $sqsService;
    }

    /**
     * Generar recomendaciones personalizadas
     * GET /api/ai/recommendations
     */
    public function getRecommendations(Request $request)
    {
        $userId = auth()->id();
        $preferences = $request->input('preferences', []);

        $result = $this->lambdaService->generateContentRecommendations($userId, $preferences);

        return response()->json($result);
    }

    /**
     * Analizar contenido con IA
     * POST /api/ai/analyze-content
     */
    public function analyzeContent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'type' => 'in:text,code,markdown',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->analyzeContent(
            $request->input('content'),
            $request->input('type', 'text')
        );

        return response()->json($result);
    }

    /**
     * Generar resumen automático
     * POST /api/ai/summarize
     */
    public function generateSummary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|min:100',
            'max_length' => 'integer|min:50|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->generateSummary(
            $request->input('text'),
            $request->input('max_length', 200)
        );

        return response()->json($result);
    }

    /**
     * Detectar temas y tags automáticamente
     * POST /api/ai/detect-topics
     */
    public function detectTopics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->detectTopics($request->input('content'));

        return response()->json($result);
    }

    /**
     * Generar preguntas de tutor IA
     * POST /api/ai/tutor/generate-questions
     */
    public function generateTutorQuestions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string',
            'difficulty' => 'in:easy,medium,hard',
            'count' => 'integer|min:1|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->generateTutorQuestions(
            $request->input('topic'),
            $request->input('difficulty', 'medium')
        );

        return response()->json($result);
    }

    /**
     * Evaluar respuesta del estudiante
     * POST /api/ai/tutor/evaluate
     */
    public function evaluateAnswer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string',
            'answer' => 'required|string',
            'context' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->lambdaService->evaluateAnswer(
            $request->input('question'),
            $request->input('answer'),
            $request->input('context', [])
        );

        return response()->json($result);
    }

    /**
     * Procesar tarea en segundo plano (async)
     * POST /api/ai/process-async
     */
    public function processAsync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:content_analysis,recommendation,summary',
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Enviar a SQS para procesamiento asíncrono
        $result = $this->sqsService->sendAIProcessingJob([
            'type' => $request->input('type'),
            'data' => $request->input('data'),
            'user_id' => auth()->id(),
        ]);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Tarea enviada para procesamiento',
                'job_id' => $result['message_id'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al enviar tarea',
        ], 500);
    }
}
