<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Social\FeedController;
use App\Http\Controllers\AI\AITutorController;
use App\Http\Controllers\NodeProgressController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [FeedController::class, 'index'])->name('dashboard');
    
    // IA Tutor Routes
    Route::get('/tutor', [AITutorController::class, 'index'])->name('ai-tutor.index');
    Route::post('/tutor/analyze', [AITutorController::class, 'analyze'])->name('ai-tutor.analyze');
    Route::post('/tutor/personalized', [AITutorController::class, 'personalizedRecommendations'])->name('ai-tutor.personalized');
    Route::get('/tutor/top/{tag}', [AITutorController::class, 'topByTag'])->name('ai-tutor.top');
    
    // Node Progress Routes
    Route::get('/progress/roadmap/{roadmapId}', [NodeProgressController::class, 'getRoadmapProgress'])->name('progress.roadmap');
    Route::get('/progress/nodes', [NodeProgressController::class, 'getCompletedNodes'])->name('progress.nodes');
    Route::post('/progress/toggle', [NodeProgressController::class, 'toggleNodeCompletion'])->name('progress.toggle');
    Route::get('/progress/stats', [NodeProgressController::class, 'getUserStats'])->name('progress.stats');
    Route::get('/progress/details', [NodeProgressController::class, 'getCompletedDetails'])->name('progress.details');
});

require __DIR__.'/settings.php';
require __DIR__.'/social.php';
