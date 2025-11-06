<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Obtener perfil del usuario autenticado
     * GET /api/v1/user/profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'score' => $user->score ?? 0,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Actualizar perfil
     * PUT /api/v1/user/profile
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|max:255|unique:users,username,' . $request->user()->id,
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'avatar' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $user->update($request->only(['username', 'email', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado',
            'data' => $user,
        ]);
    }

    /**
     * Cambiar contraseña
     * POST /api/v1/user/change-password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Contraseña actual incorrecta',
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada',
        ]);
    }

    /**
     * Obtener estadísticas del usuario
     * GET /api/v1/user/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'roadmaps_created' => $user->roadmaps()->count(),
            'nodes_created' => $user->nodes()->count(),
            'total_likes' => $user->reactions()->where('type', 'like')->count(),
            'total_comments' => $user->comments()->count(),
            'score' => $user->score ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Buscar usuarios
     * GET /api/v1/users/search?q=nombre
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Query debe tener al menos 2 caracteres',
            ], 400);
        }

        $users = User::where('username', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->limit(20)
            ->get(['id', 'username', 'email', 'avatar', 'score']);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Obtener perfil público de usuario
     * GET /api/v1/users/{id}
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'score' => $user->score ?? 0,
                'roadmaps_count' => $user->roadmaps()->count(),
                'nodes_count' => $user->nodes()->count(),
            ]
        ]);
    }
}
