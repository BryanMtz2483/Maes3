<?php

namespace App\Http\Controllers;

use App\Models\NodeProgress;
use App\Models\Roadmap;
use Illuminate\Http\Request;

class NodeProgressController extends Controller
{
    /**
     * Obtener progreso de un usuario para un roadmap específico
     */
    public function getRoadmapProgress($roadmapId)
    {
        $roadmap = Roadmap::where('roadmap_id', $roadmapId)->with('nodes')->first();
        
        if (!$roadmap) {
            return response()->json(['error' => 'Roadmap no encontrado'], 404);
        }

        $nodeIds = $roadmap->nodes->pluck('node_id')->toArray();
        $completedNodes = NodeProgress::where('user_id', auth()->id())
            ->whereIn('node_id', $nodeIds)
            ->where('completed', true)
            ->pluck('node_id')
            ->toArray();

        $totalNodes = count($nodeIds);
        $completedCount = count($completedNodes);
        $progressPercentage = $totalNodes > 0 ? ($completedCount / $totalNodes) * 100 : 0;

        return response()->json([
            'roadmap_id' => $roadmapId,
            'total_nodes' => $totalNodes,
            'completed_nodes' => $completedCount,
            'progress_percentage' => round($progressPercentage, 2),
            'completed_node_ids' => $completedNodes,
            'is_completed' => $progressPercentage >= 100,
        ]);
    }

    /**
     * Obtener todos los nodos completados del usuario
     */
    public function getCompletedNodes()
    {
        $completedNodes = NodeProgress::where('user_id', auth()->id())
            ->where('completed', true)
            ->with('node')
            ->get();

        return response()->json([
            'completed_nodes' => $completedNodes,
            'total_completed' => $completedNodes->count(),
        ]);
    }

    /**
     * Marcar/desmarcar un nodo como completado manualmente
     */
    public function toggleNodeCompletion(Request $request)
    {
        $validated = $request->validate([
            'node_id' => 'required|string|exists:nodes,node_id',
        ]);

        $progress = NodeProgress::where('user_id', auth()->id())
            ->where('node_id', $validated['node_id'])
            ->first();

        if ($progress && $progress->completed) {
            // Desmarcar
            NodeProgress::markAsIncomplete(auth()->id(), $validated['node_id']);
            
            // Actualizar score del usuario
            auth()->user()->updateScore();
            
            return response()->json([
                'message' => 'Nodo marcado como no completado',
                'completed' => false,
                'score' => auth()->user()->score,
            ]);
        } else {
            // Marcar como completado
            NodeProgress::markAsCompleted(auth()->id(), $validated['node_id']);
            
            // Actualizar score del usuario
            auth()->user()->updateScore();
            
            return response()->json([
                'message' => 'Nodo marcado como completado',
                'completed' => true,
                'score' => auth()->user()->score,
            ]);
        }
    }

    /**
     * Obtener estadísticas de progreso del usuario
     */
    public function getUserStats()
    {
        $completedNodes = NodeProgress::where('user_id', auth()->id())
            ->where('completed', true)
            ->count();

        // Obtener roadmaps completados (100% de nodos)
        $completedRoadmaps = Roadmap::whereHas('nodes', function ($query) {
            $completedNodeIds = NodeProgress::where('user_id', auth()->id())
                ->where('completed', true)
                ->pluck('node_id');
            
            $query->whereIn('node_id', $completedNodeIds);
        })->get()->filter(function ($roadmap) {
            $totalNodes = $roadmap->nodes->count();
            $completedNodes = NodeProgress::where('user_id', auth()->id())
                ->whereIn('node_id', $roadmap->nodes->pluck('node_id'))
                ->where('completed', true)
                ->count();
            
            return $totalNodes > 0 && $completedNodes === $totalNodes;
        });

        return response()->json([
            'total_nodes_completed' => $completedNodes,
            'total_roadmaps_completed' => $completedRoadmaps->count(),
            'completed_roadmap_ids' => $completedRoadmaps->pluck('roadmap_id'),
        ]);
    }

    /**
     * Obtener detalles completos de roadmaps y nodos completados
     */
    public function getCompletedDetails()
    {
        // Obtener nodos completados con detalles
        $completedNodeIds = NodeProgress::where('user_id', auth()->id())
            ->where('completed', true)
            ->pluck('node_id');

        $nodes = \App\Models\Node::whereIn('node_id', $completedNodeIds)
            ->select('node_id', 'title', 'topic', 'created_at')
            ->get();

        // Obtener roadmaps completados (100% de nodos)
        $completedRoadmaps = Roadmap::with('nodes')->get()->filter(function ($roadmap) {
            $totalNodes = $roadmap->nodes->count();
            if ($totalNodes === 0) return false;
            
            $completedNodes = NodeProgress::where('user_id', auth()->id())
                ->whereIn('node_id', $roadmap->nodes->pluck('node_id'))
                ->where('completed', true)
                ->count();
            
            return $completedNodes === $totalNodes;
        })->map(function ($roadmap) {
            return [
                'roadmap_id' => $roadmap->roadmap_id,
                'name' => $roadmap->name,
                'description' => $roadmap->description,
                'tags' => $roadmap->tags,
                'cover_image' => $roadmap->cover_image,
                'created_at' => $roadmap->created_at,
                'total_nodes' => $roadmap->nodes->count(),
            ];
        })->values();

        return response()->json([
            'completed_roadmaps' => $completedRoadmaps,
            'completed_nodes' => $nodes,
            'total_roadmaps' => $completedRoadmaps->count(),
            'total_nodes' => $nodes->count(),
        ]);
    }
}
