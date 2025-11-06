<?php

use App\Http\Controllers\RoadmapController;
use App\Http\Controllers\NodeController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\Social\ReactionController;
use App\Http\Controllers\Social\CommentController;
use App\Http\Controllers\Social\FeedController;
use App\Http\Controllers\Social\SearchController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Social & Content Routes
|--------------------------------------------------------------------------
|
| Rutas para funcionalidades de red social y gestión de contenido
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // ==================== CREATE/PUBLISH ====================
    Route::get('/create', function () {
        return \Inertia\Inertia::render('create/index');
    })->name('create.index');

    // ==================== PROFILE ====================
    Route::get('/profile/{username}', [ProfileController::class, 'show'])->name('profile.show');

    // ==================== ROADMAPS ====================
    Route::prefix('roadmaps')->name('roadmaps.')->group(function () {
        Route::get('/', [RoadmapController::class, 'index'])->name('index');
        Route::get('/create', [RoadmapController::class, 'create'])->name('create');
        Route::post('/', [RoadmapController::class, 'store'])->name('store');
        Route::get('/{roadmap}', [RoadmapController::class, 'show'])->name('show');
        Route::get('/{roadmap}/edit', [RoadmapController::class, 'edit'])->name('edit');
        Route::put('/{roadmap}', [RoadmapController::class, 'update'])->name('update');
        Route::delete('/{roadmap}', [RoadmapController::class, 'destroy'])->name('destroy');
        
        // Acciones adicionales
        Route::post('/{roadmap}/nodes', [RoadmapController::class, 'attachNode'])->name('attach-node');
        Route::delete('/{roadmap}/nodes/{node}', [RoadmapController::class, 'detachNode'])->name('detach-node');
        Route::get('/{roadmap}/hierarchy', [RoadmapController::class, 'hierarchy'])->name('hierarchy');
    });

    // ==================== NODES ====================
    Route::prefix('nodes')->name('nodes.')->group(function () {
        Route::get('/', [NodeController::class, 'index'])->name('index');
        Route::get('/create', [NodeController::class, 'create'])->name('create');
        Route::post('/', [NodeController::class, 'store'])->name('store');
        Route::get('/{node}', [NodeController::class, 'show'])->name('show');
        Route::get('/{node}/edit', [NodeController::class, 'edit'])->name('edit');
        Route::put('/{node}', [NodeController::class, 'update'])->name('update');
        Route::delete('/{node}', [NodeController::class, 'destroy'])->name('destroy');
        
        // Contenidos
        Route::post('/{node}/contents', [NodeController::class, 'attachContent'])->name('attach-content');
        Route::delete('/{node}/contents/{content}', [NodeController::class, 'detachContent'])->name('detach-content');
    });

    // ==================== CONTENTS ====================
    Route::prefix('contents')->name('contents.')->group(function () {
        Route::get('/', [ContentController::class, 'index'])->name('index');
        Route::post('/', [ContentController::class, 'store'])->name('store');
        Route::get('/{content}', [ContentController::class, 'show'])->name('show');
        Route::put('/{content}', [ContentController::class, 'update'])->name('update');
        Route::delete('/{content}', [ContentController::class, 'destroy'])->name('destroy');
    });

    // ==================== TAGS ====================
    Route::prefix('tags')->name('tags.')->group(function () {
        Route::get('/', [TagController::class, 'index'])->name('index');
        Route::post('/', [TagController::class, 'store'])->name('store');
        Route::get('/{tag}', [TagController::class, 'show'])->name('show');
        Route::put('/{tag}', [TagController::class, 'update'])->name('update');
        Route::delete('/{tag}', [TagController::class, 'destroy'])->name('destroy');
        Route::get('/{tag}/roadmaps', [TagController::class, 'roadmaps'])->name('roadmaps');
    });

    // ==================== REACTIONS ====================
    Route::prefix('reactions')->name('reactions.')->group(function () {
        Route::post('/', [ReactionController::class, 'store'])->name('store');
        Route::delete('/{reaction}', [ReactionController::class, 'destroy'])->name('destroy');
        Route::post('/toggle', [ReactionController::class, 'toggle'])->name('toggle');
        Route::get('/entity/{type}/{id}', [ReactionController::class, 'getByEntity'])->name('by-entity');
        Route::get('/user/{user?}', [ReactionController::class, 'getByUser'])->name('by-user');
        Route::get('/statistics/{type}/{id}', [ReactionController::class, 'statistics'])->name('statistics');
    });

    // ==================== COMMENTS ====================
    Route::prefix('comments')->name('comments.')->group(function () {
        // Node Comments
        Route::post('/nodes/{node}', [CommentController::class, 'storeNodeComment'])->name('nodes.store');
        Route::get('/nodes/{node}', [CommentController::class, 'getNodeComments'])->name('nodes.index');
        Route::put('/nodes/{comment}', [CommentController::class, 'updateNodeComment'])->name('nodes.update');
        Route::delete('/nodes/{comment}', [CommentController::class, 'destroyNodeComment'])->name('nodes.destroy');
        
        // Roadmap Comments
        Route::post('/roadmaps/{roadmap}', [CommentController::class, 'storeRoadmapComment'])->name('roadmaps.store');
        Route::get('/roadmaps/{roadmap}', [CommentController::class, 'getRoadmapComments'])->name('roadmaps.index');
        Route::put('/roadmaps/{comment}', [CommentController::class, 'updateRoadmapComment'])->name('roadmaps.update');
        Route::delete('/roadmaps/{comment}', [CommentController::class, 'destroyRoadmapComment'])->name('roadmaps.destroy');
    });

    // ==================== FEED ====================
    Route::prefix('feed')->name('feed.')->group(function () {
        Route::get('/', [FeedController::class, 'index'])->name('index');
        Route::get('/trending', [FeedController::class, 'trending'])->name('trending');
        Route::get('/following', [FeedController::class, 'following'])->name('following');
        Route::get('/explore', [FeedController::class, 'explore'])->name('explore');
    });

    // ==================== SEARCH ====================
    Route::prefix('search')->name('search.')->group(function () {
        Route::get('/', [SearchController::class, 'search'])->name('index');
        Route::get('/roadmaps', [SearchController::class, 'searchRoadmaps'])->name('roadmaps');
        Route::get('/nodes', [SearchController::class, 'searchNodes'])->name('nodes');
        Route::get('/users', [SearchController::class, 'searchUsers'])->name('users');
        Route::get('/tags', [SearchController::class, 'searchTags'])->name('tags');
        Route::get('/autocomplete', [SearchController::class, 'autocomplete'])->name('autocomplete');
    });

    // ==================== BOOKMARKS ====================
    Route::prefix('bookmarks')->name('bookmarks.')->group(function () {
        Route::get('/', [BookmarkController::class, 'index'])->name('index');
        Route::post('/toggle', [BookmarkController::class, 'toggle'])->name('toggle');
        Route::get('/check', [BookmarkController::class, 'check'])->name('check');
    });

    // ==================== NOTIFICATIONS ====================
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/page', [NotificationController::class, 'show'])->name('show');
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/unread', [NotificationController::class, 'unread'])->name('unread');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/clear-read', [NotificationController::class, 'clearRead'])->name('clear-read');
    });
});

// Rutas públicas (sin autenticación)
Route::prefix('public')->name('public.')->group(function () {
    Route::get('/roadmaps', [RoadmapController::class, 'index'])->name('roadmaps');
    Route::get('/roadmaps/{roadmap}', [RoadmapController::class, 'show'])->name('roadmap');
    Route::get('/nodes', [NodeController::class, 'index'])->name('nodes');
    Route::get('/nodes/{node}', [NodeController::class, 'show'])->name('node');
    Route::get('/tags', [TagController::class, 'index'])->name('tags');
    Route::get('/tags/{tag}', [TagController::class, 'show'])->name('tag');
});
