<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\FeedController;
use App\Http\Controllers\API\MobileController;
use App\Http\Controllers\API\MediaController;
use App\Http\Controllers\API\AIController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\RoadmapAnalyticsController;
use App\Http\Controllers\AI\AITutorController;

// ============================================
// APIs Públicas (sin autenticación)
// ============================================

Route::prefix('v1')->group(function () {
    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
    });
});

// ============================================
// APIs Protegidas (requieren autenticación)
// ============================================

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // ========== Autenticación ==========
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/verify', [AuthController::class, 'verify']);
    });

    // ========== Usuario ==========
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/change-password', [UserController::class, 'changePassword']);
        Route::get('/stats', [UserController::class, 'stats']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/search', [UserController::class, 'search']);
        Route::get('/{id}', [UserController::class, 'show']);
    });

    // ========== Feed ==========
    Route::prefix('feed')->group(function () {
        Route::get('/', [FeedController::class, 'index']);
        Route::get('/topic/{topic}', [FeedController::class, 'byTopic']);
        Route::get('/search', [FeedController::class, 'search']);
        Route::get('/trending', [FeedController::class, 'trending']);
    });

    // ========== Mobile Específico ==========
    Route::prefix('mobile')->group(function () {
        // Inicialización y configuración
        Route::get('/init', [MobileController::class, 'init']);
        Route::get('/config', [MobileController::class, 'config']);
        
        // Feed y contenido
        Route::get('/feed', [MobileController::class, 'feed']);
        Route::get('/trending', [MobileController::class, 'trending']);
        Route::get('/search', [MobileController::class, 'search']);
        Route::get('/item/{type}/{id}', [MobileController::class, 'getItem']);
        
        // Temas/Categorías
        Route::get('/topics', [MobileController::class, 'getTopics']);
        Route::get('/topics/{topic}', [MobileController::class, 'getByTopic']);
        
        // Perfil de usuario
        Route::get('/profile/{username}', [MobileController::class, 'getProfile']);
        Route::put('/profile', [MobileController::class, 'updateProfile']);
        Route::get('/my-content', [MobileController::class, 'myContent']);
        Route::get('/stats', [MobileController::class, 'stats']);
        
        // Interacciones
        Route::post('/toggle-reaction', [MobileController::class, 'toggleReaction']);
        Route::post('/add-comment', [MobileController::class, 'addComment']);
        
        // Notificaciones
        Route::get('/notifications', [MobileController::class, 'notifications']);
        Route::post('/notifications/{id}/read', [MobileController::class, 'markNotificationRead']);
    });

    // ========== Media (S3) ==========
    Route::prefix('media')->group(function () {
        Route::post('/upload', [MediaController::class, 'upload']);
        Route::delete('/{key}', [MediaController::class, 'delete']);
        Route::get('/signed-url/{key}', [MediaController::class, 'getSignedUrl']);
        Route::post('/process-image', [MediaController::class, 'processImage']);
    });

    // ========== AI (Lambda) ==========
    Route::prefix('ai')->group(function () {
        Route::get('/recommendations', [AIController::class, 'getRecommendations']);
        Route::post('/analyze-content', [AIController::class, 'analyzeContent']);
        Route::post('/summarize', [AIController::class, 'generateSummary']);
        Route::post('/detect-topics', [AIController::class, 'detectTopics']);
        Route::post('/process-async', [AIController::class, 'processAsync']);
        
        // Tutor IA
        Route::prefix('tutor')->group(function () {
            Route::post('/generate-questions', [AIController::class, 'generateTutorQuestions']);
            Route::post('/evaluate', [AIController::class, 'evaluateAnswer']);
        });
    });

    // ========== Notificaciones (SQS) ==========
    Route::prefix('notifications')->group(function () {
        Route::post('/send', [NotificationController::class, 'send']);
        Route::post('/broadcast', [NotificationController::class, 'broadcast']);
    });

    // ========== Roadmap Analytics (ML) ==========
    Route::prefix('roadmap-analytics')->group(function () {
        Route::get('/', [RoadmapAnalyticsController::class, 'index']);
        Route::get('/top', [RoadmapAnalyticsController::class, 'topRoadmaps']);
        Route::get('/recommend', [RoadmapAnalyticsController::class, 'recommend']);
        Route::get('/compare', [RoadmapAnalyticsController::class, 'compareRoadmaps']);
        Route::get('/analyze/{topic}', [RoadmapAnalyticsController::class, 'analyzeByTopic']);
        Route::get('/insights', [RoadmapAnalyticsController::class, 'insights']);
        Route::get('/{roadmapId}', [RoadmapAnalyticsController::class, 'show']);
    });

    // ========== IA Tutor (Neural Network) ==========
    Route::prefix('tutor')->group(function () {
        Route::post('/analyze', [AITutorController::class, 'analyze']);
        Route::get('/top/{tag}', [AITutorController::class, 'topByTag']);
    });
});

// ============================================
// IA Tutor - Rutas Web (con sesión web)
// ============================================
Route::middleware(['web', 'auth'])->prefix('v1/tutor')->group(function () {
    Route::post('/analyze', [AITutorController::class, 'analyze']);
    Route::get('/top/{tag}', [AITutorController::class, 'topByTag']);
});