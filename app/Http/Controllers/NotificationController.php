<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Mostrar página de notificaciones
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications->items(),
        ]);
    }

    /**
     * Obtener todas las notificaciones del usuario (API)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'notifications' => $notifications,
        ]);
    }

    /**
     * Obtener notificaciones no leídas
     */
    public function unread(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->unread()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = Notification::where('user_id', $user->id)
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída',
        ]);
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        Notification::where('user_id', $user->id)
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas',
        ]);
    }

    /**
     * Eliminar notificación
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificación eliminada',
        ]);
    }

    /**
     * Eliminar todas las notificaciones leídas
     */
    public function clearRead(Request $request)
    {
        $user = $request->user();
        
        Notification::where('user_id', $user->id)
            ->read()
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificaciones leídas eliminadas',
        ]);
    }
}
