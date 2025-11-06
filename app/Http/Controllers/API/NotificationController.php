<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AWS\SQSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    protected $sqsService;

    public function __construct(SQSService $sqsService)
    {
        $this->sqsService = $sqsService;
    }

    /**
     * Enviar notificación
     * POST /api/notifications/send
     */
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:like,comment,follow,mention,system',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'data' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->sqsService->sendNotificationJob(
            $request->input('user_id'),
            $request->input('type'),
            [
                'title' => $request->input('title'),
                'message' => $request->input('message'),
                'data' => $request->input('data', []),
            ]
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Notificación enviada',
                'job_id' => $result['message_id'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error al enviar notificación',
        ], 500);
    }

    /**
     * Enviar notificación masiva
     * POST /api/notifications/broadcast
     */
    public function broadcast(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'type' => 'required|in:announcement,update,promotion',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userIds = $request->input('user_ids');
        $sent = 0;
        $failed = 0;

        foreach ($userIds as $userId) {
            $result = $this->sqsService->sendNotificationJob(
                $userId,
                $request->input('type'),
                [
                    'title' => $request->input('title'),
                    'message' => $request->input('message'),
                ]
            );

            if ($result['success']) {
                $sent++;
            } else {
                $failed++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Notificaciones enviadas',
            'sent' => $sent,
            'failed' => $failed,
        ]);
    }
}
