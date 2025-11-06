<?php

namespace App\Services\AWS;

use Aws\Sqs\SqsClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

class SQSService
{
    protected $sqsClient;
    protected $queueUrl;

    public function __construct()
    {
        $this->sqsClient = new SqsClient([
            'version' => 'latest',
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'credentials' => [
                'key' => env('AWS_ACCESS_KEY_ID'),
                'secret' => env('AWS_SECRET_ACCESS_KEY'),
            ],
        ]);

        $this->queueUrl = env('AWS_SQS_QUEUE_URL');
    }

    /**
     * Enviar mensaje a la cola
     */
    public function sendMessage($messageBody, $attributes = [])
    {
        try {
            $params = [
                'QueueUrl' => $this->queueUrl,
                'MessageBody' => is_array($messageBody) ? json_encode($messageBody) : $messageBody,
            ];

            if (!empty($attributes)) {
                $params['MessageAttributes'] = $attributes;
            }

            $result = $this->sqsClient->sendMessage($params);

            return [
                'success' => true,
                'message_id' => $result['MessageId'],
            ];
        } catch (AwsException $e) {
            Log::error('SQS Send Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Recibir mensajes de la cola
     */
    public function receiveMessages($maxMessages = 1, $waitTime = 0)
    {
        try {
            $result = $this->sqsClient->receiveMessage([
                'QueueUrl' => $this->queueUrl,
                'MaxNumberOfMessages' => $maxMessages,
                'WaitTimeSeconds' => $waitTime,
            ]);

            $messages = [];
            if (isset($result['Messages'])) {
                foreach ($result['Messages'] as $message) {
                    $messages[] = [
                        'id' => $message['MessageId'],
                        'receipt_handle' => $message['ReceiptHandle'],
                        'body' => json_decode($message['Body'], true) ?? $message['Body'],
                    ];
                }
            }

            return $messages;
        } catch (AwsException $e) {
            Log::error('SQS Receive Error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Eliminar mensaje de la cola
     */
    public function deleteMessage($receiptHandle)
    {
        try {
            $this->sqsClient->deleteMessage([
                'QueueUrl' => $this->queueUrl,
                'ReceiptHandle' => $receiptHandle,
            ]);

            return ['success' => true];
        } catch (AwsException $e) {
            Log::error('SQS Delete Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enviar mensaje para procesamiento de IA
     */
    public function sendAIProcessingJob($data)
    {
        return $this->sendMessage([
            'type' => 'ai_processing',
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Enviar notificación
     */
    public function sendNotificationJob($userId, $type, $data)
    {
        return $this->sendMessage([
            'type' => 'notification',
            'user_id' => $userId,
            'notification_type' => $type,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
