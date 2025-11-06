<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Roadmap;
use App\Models\Node;
use App\Models\Roadmap_Comment;
use App\Models\Node_Comment;
use App\Observers\RoadmapObserver;
use App\Observers\NodeObserver;
use App\Observers\RoadmapCommentObserver;
use App\Observers\NodeCommentObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar observers para actualizaciones
        Roadmap::observe(RoadmapObserver::class);
        Node::observe(NodeObserver::class);
        
        // Registrar observers para comentarios
        Roadmap_Comment::observe(RoadmapCommentObserver::class);
        Node_Comment::observe(NodeCommentObserver::class);
    }
}
