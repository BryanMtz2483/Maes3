<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login y obtener token
     * POST /api/v1/auth/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        // Crear token
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'score' => $user->score ?? 0,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    /**
     * Registro de usuario
     * POST /api/v1/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'score' => 0,
        ]);

        // Crear token
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'score' => $user->score,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }

    /**
     * Logout (revocar token)
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout exitoso',
        ]);
    }

    /**
     * Refresh token
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Revocar token actual
        $request->user()->currentAccessToken()->delete();
        
        // Crear nuevo token
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token renovado',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    /**
     * Verificar si el token es válido
     * GET /api/v1/auth/verify
     */
    public function verify(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Token válido',
            'data' => [
                'user' => [
                    'id' => $request->user()->id,
                    'username' => $request->user()->username,
                    'email' => $request->user()->email,
                ]
            ]
        ]);
    }
}
