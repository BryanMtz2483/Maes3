<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Node_Comment;
use App\Models\Roadmap_Comment;
use App\Models\Node;
use App\Models\Roadmap;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    // ==================== NODE COMMENTS ====================
    
    /**
     * Store a comment on a node
     */
    public function storeNodeComment(Request $request, string $node_id)
    {
        $node = Node::where('node_id', $node_id)->firstOrFail();

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $comment = Node_Comment::create([
            'node_comment_id' => 'nc-' . Str::uuid(),
            'node_id' => $node_id,
            'user_id' => auth()->id(),
            'text' => $validated['text'],
        ]);

        // Cargar la relación con usuario
        $comment->load('user');

        return response()->json([
            'message' => 'Comentario agregado exitosamente',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Update a node comment
     */
    public function updateNodeComment(Request $request, string $comment_id)
    {
        $comment = Node_Comment::where('node_comment_id', $comment_id)->firstOrFail();

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $comment->update($validated);

        return response()->json([
            'message' => 'Comentario actualizado exitosamente',
            'comment' => $comment,
        ]);
    }

    /**
     * Delete a node comment
     */
    public function destroyNodeComment(string $comment_id)
    {
        $comment = Node_Comment::where('node_comment_id', $comment_id)->firstOrFail();
        $comment->delete();

        return response()->json([
            'message' => 'Comentario eliminado exitosamente',
        ]);
    }

    /**
     * Get comments for a node
     */
    public function getNodeComments(string $node_id)
    {
        $comments = Node_Comment::with('user')
            ->where('node_id', $node_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($comments);
    }

    // ==================== ROADMAP COMMENTS ====================
    
    /**
     * Store a comment on a roadmap
     */
    public function storeRoadmapComment(Request $request, string $roadmap_id)
    {
        $roadmap = Roadmap::where('roadmap_id', $roadmap_id)->firstOrFail();

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $comment = Roadmap_Comment::create([
            'roadmap_comment_id' => 'rc-' . Str::uuid(),
            'roadmap_id' => $roadmap_id,
            'user_id' => auth()->id(),
            'text' => $validated['text'],
        ]);

        // Cargar la relación con usuario
        $comment->load('user');

        return response()->json([
            'message' => 'Comentario agregado exitosamente',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Update a roadmap comment
     */
    public function updateRoadmapComment(Request $request, string $comment_id)
    {
        $comment = Roadmap_Comment::where('roadmap_comment_id', $comment_id)->firstOrFail();

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $comment->update($validated);

        return response()->json([
            'message' => 'Comentario actualizado exitosamente',
            'comment' => $comment,
        ]);
    }

    /**
     * Delete a roadmap comment
     */
    public function destroyRoadmapComment(string $comment_id)
    {
        $comment = Roadmap_Comment::where('roadmap_comment_id', $comment_id)->firstOrFail();
        $comment->delete();

        return response()->json([
            'message' => 'Comentario eliminado exitosamente',
        ]);
    }

    /**
     * Get comments for a roadmap
     */
    public function getRoadmapComments(string $roadmap_id)
    {
        $comments = Roadmap_Comment::with('user')
            ->where('roadmap_id', $roadmap_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($comments);
    }
}
