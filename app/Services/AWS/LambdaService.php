<?php

namespace App\Services\AWS;

use Aws\Lambda\LambdaClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

class LambdaService
{
    protected $lambdaClient;

    public function __construct()
    {
        $this->lambdaClient = new LambdaClient([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);
    }

    /**
     * Invocar función Lambda de forma síncrona
     */
    public function invoke($functionName, $payload = [])
    {
        try {
            $result = $this->lambdaClient->invoke([
                'FunctionName' => $functionName,
                'InvocationType' => 'RequestResponse',
                'Payload' => json_encode($payload),
            ]);

            $response = json_decode($result['Payload']->getContents(), true);

            return [
                'success' => true,
                'data' => $response,
                'status_code' => $result['StatusCode'],
            ];
        } catch (AwsException $e) {
            Log::error('Lambda Invoke Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Invocar función Lambda de forma asíncrona
     */
    public function invokeAsync($functionName, $payload = [])
    {
        try {
            $result = $this->lambdaClient->invoke([
                'FunctionName' => $functionName,
                'InvocationType' => 'Event',
                'Payload' => json_encode($payload),
            ]);

            return [
                'success' => true,
                'status_code' => $result['StatusCode'],
            ];
        } catch (AwsException $e) {
            Log::error('Lambda Async Invoke Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generar recomendaciones de contenido usando IA
     */
    public function generateContentRecommendations($userId, $preferences = [])
    {
        return $this->invoke(env('AWS_LAMBDA_RECOMMENDATIONS'), [
            'action' => 'generate_recommendations',
            'user_id' => $userId,
            'preferences' => $preferences,
        ]);
    }

    /**
     * Analizar contenido con IA
     */
    public function analyzeContent($content, $type = 'text')
    {
        return $this->invoke(env('AWS_LAMBDA_CONTENT_ANALYZER'), [
            'action' => 'analyze',
            'content' => $content,
            'type' => $type,
        ]);
    }

    /**
     * Generar resumen automático
     */
    public function generateSummary($text, $maxLength = 200)
    {
        return $this->invoke(env('AWS_LAMBDA_TEXT_PROCESSOR'), [
            'action' => 'summarize',
            'text' => $text,
            'max_length' => $maxLength,
        ]);
    }

    /**
     * Detectar temas y tags automáticamente
     */
    public function detectTopics($content)
    {
        return $this->invoke(env('AWS_LAMBDA_CONTENT_ANALYZER'), [
            'action' => 'detect_topics',
            'content' => $content,
        ]);
    }

    /**
     * Generar preguntas de tutor IA
     */
    public function generateTutorQuestions($topic, $difficulty = 'medium')
    {
        return $this->invoke(env('AWS_LAMBDA_TUTOR_AI'), [
            'action' => 'generate_questions',
            'topic' => $topic,
            'difficulty' => $difficulty,
        ]);
    }

    /**
     * Evaluar respuesta del estudiante
     */
    public function evaluateAnswer($question, $answer, $context = [])
    {
        return $this->invoke(env('AWS_LAMBDA_TUTOR_AI'), [
            'action' => 'evaluate_answer',
            'question' => $question,
            'answer' => $answer,
            'context' => $context,
        ]);
    }

    /**
     * Procesar imagen (OCR, análisis)
     */
    public function processImage($imageUrl, $operations = ['ocr', 'labels'])
    {
        return $this->invoke(env('AWS_LAMBDA_IMAGE_PROCESSOR'), [
            'action' => 'process',
            'image_url' => $imageUrl,
            'operations' => $operations,
        ]);
    }
}
