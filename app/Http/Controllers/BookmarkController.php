<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Roadmap;
use App\Models\Node;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    /**
     * Mostrar todos los guardados del usuario
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Obtener bookmarks de roadmaps
        $roadmapBookmarks = Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_type', 'App\\Models\\Roadmap')
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener bookmarks de nodos
        $nodeBookmarks = Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_type', 'App\\Models\\Node')
            ->orderBy('created_at', 'desc')
            ->get();

        $roadmaps = [];
        $nodes = [];

        // Procesar roadmaps
        foreach ($roadmapBookmarks as $bookmark) {
            $roadmap = Roadmap::where('roadmap_id', $bookmark->bookmarkable_id)->first();
            
            if ($roadmap) {
                // Cargar contadores
                $roadmap->loadCount([
                    'reactions as reactions_count' => function($q) {
                        $q->where('reaction_type', 'like');
                    },
                    'reactions as dislikes_count' => function($q) {
                        $q->where('reaction_type', 'dislike');
                    },
                    'comments as comments_count'
                ]);

                $roadmaps[] = [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'description' => $roadmap->description ?? '',
                    'cover_image' => $roadmap->cover_image,
                    'tags' => $roadmap->tags,
                    'reactions_count' => $roadmap->reactions_count ?? 0,
                    'dislikes_count' => $roadmap->dislikes_count ?? 0,
                    'comments_count' => $roadmap->comments_count ?? 0,
                    'bookmarked_at' => $bookmark->created_at->diffForHumans(),
                ];
            }
        }

        // Procesar nodos
        foreach ($nodeBookmarks as $bookmark) {
            $node = Node::where('node_id', $bookmark->bookmarkable_id)->first();
            
            if ($node) {
                // Cargar contadores
                $node->loadCount([
                    'reactions as reactions_count' => function($q) {
                        $q->where('reaction_type', 'like');
                    },
                    'reactions as dislikes_count' => function($q) {
                        $q->where('reaction_type', 'dislike');
                    },
                    'comments as comments_count'
                ]);

                $nodes[] = [
                    'node_id' => $node->node_id,
                    'title' => $node->title,
                    'description' => $node->description ?? '',
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'reactions_count' => $node->reactions_count ?? 0,
                    'dislikes_count' => $node->dislikes_count ?? 0,
                    'comments_count' => $node->comments_count ?? 0,
                    'bookmarked_at' => $bookmark->created_at->diffForHumans(),
                ];
            }
        }

        return Inertia::render('bookmarks/index', [
            'roadmaps' => $roadmaps,
            'nodes' => $nodes,
        ]);
    }

    /**
     * Guardar/Quitar guardado de un roadmap o nodo
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'type' => 'required|in:roadmap,node',
            'id' => 'required|string',
        ]);

        $user = $request->user();
        $type = $request->type === 'roadmap' ? 'App\\Models\\Roadmap' : 'App\\Models\\Node';
        $id = $request->id;

        // Verificar que el roadmap/nodo existe
        if ($request->type === 'roadmap') {
            $exists = Roadmap::where('roadmap_id', $id)->exists();
            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Roadmap no encontrado',
                ], 404);
            }
        } else {
            $exists = Node::where('node_id', $id)->exists();
            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nodo no encontrado',
                ], 404);
            }
        }

        // Verificar si ya existe el bookmark
        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_type', $type)
            ->where('bookmarkable_id', $id)
            ->first();

        if ($bookmark) {
            // Si existe, eliminarlo
            $bookmark->delete();
            
            return response()->json([
                'success' => true,
                'bookmarked' => false,
                'message' => 'Eliminado de guardados',
            ]);
        } else {
            // Si no existe, crearlo
            $newBookmark = Bookmark::create([
                'user_id' => $user->id,
                'bookmarkable_type' => $type,
                'bookmarkable_id' => $id,
            ]);
            
            return response()->json([
                'success' => true,
                'bookmarked' => true,
                'message' => 'Guardado exitosamente',
                'bookmark_id' => $newBookmark->id,
            ]);
        }
    }

    /**
     * Verificar si un item está guardado
     */
    public function check(Request $request)
    {
        $request->validate([
            'type' => 'required|in:roadmap,node',
            'id' => 'required|string',
        ]);

        $user = $request->user();
        $type = $request->type === 'roadmap' ? 'App\\Models\\Roadmap' : 'App\\Models\\Node';
        $id = $request->id;

        $bookmarked = Bookmark::where('user_id', $user->id)
            ->where('bookmarkable_type', $type)
            ->where('bookmarkable_id', $id)
            ->exists();

        return response()->json([
            'bookmarked' => $bookmarked,
        ]);
    }
}
