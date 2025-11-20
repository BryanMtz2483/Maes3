<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\S3Service;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Update profile picture using S3
     */
    public function updateProfilePicture(Request $request, S3Service $s3Service)
    {
        $request->validate([
            'profile_pic' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        try {
            $user = $request->user();
            
            // Eliminar foto anterior si existe y está en S3
            if ($user->profile_pic && str_contains($user->profile_pic, 's3.amazonaws.com')) {
                $s3Service->deleteProfilePicture($user->profile_pic);
            }

            // Subir nueva foto a S3
            $url = $s3Service->uploadProfilePicture($request->file('profile_pic'), $user->id);
            
            // Actualizar usuario
            $user->profile_pic = $url;
            $user->save();

            return response()->json([
                'message' => 'Foto de perfil actualizada correctamente',
                'profile_pic' => $url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al subir la imagen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete profile picture
     */
    public function deleteProfilePicture(Request $request, S3Service $s3Service)
    {
        try {
            $user = $request->user();
            
            // Eliminar de S3 si existe
            if ($user->profile_pic && str_contains($user->profile_pic, 's3.amazonaws.com')) {
                $s3Service->deleteProfilePicture($user->profile_pic);
            }

            // Actualizar usuario
            $user->profile_pic = null;
            $user->save();

            return response()->json([
                'message' => 'Foto de perfil eliminada correctamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la imagen: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
