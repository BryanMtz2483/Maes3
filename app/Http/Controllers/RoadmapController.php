<?php

namespace App\Http\Controllers;

use App\Models\Roadmap;
use App\Models\Tag;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoadmapController extends Controller
{
    /**
     * Display a listing of roadmaps
     */
    public function index(Request $request)
    {
        $query = Roadmap::with(['tags', 'nodes', 'children'])
            ->withCount(['nodes', 'comments', 'reactions']);

        // Filtros
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('tag')) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('tag_id', $request->tag);
            });
        }

        // Solo roadmaps principales (sin padre)
        if ($request->boolean('roots_only')) {
            $query->roots();
        }

        $roadmaps = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('roadmaps/index', [
            'roadmaps' => $roadmaps,
            'filters' => $request->only(['search', 'tag', 'roots_only']),
        ]);
    }

    /**
     * Show form for creating a new roadmap
     */
    public function create()
    {
        return Inertia::render('roadmaps/create');
    }

    /**
     * Store a newly created roadmap
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tags' => 'nullable|string',
            'cover_image' => 'nullable|url',
            'nodes' => 'nullable|array',
            'nodes.*.node_id' => 'required|exists:nodes,node_id',
            'nodes.*.order' => 'required|integer',
            'nodes.*.parent_id' => 'nullable|string',
        ]);

        $user = $request->user();

        // Generar ID único
        $roadmapId = 'roadmap-' . Str::uuid();

        // Crear roadmap
        $roadmap = Roadmap::create([
            'roadmap_id' => $roadmapId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
            'author_id' => $user->id,
            'user_id' => $user->id,
        ]);

        // Asociar nodos con orden y estructura
        if (!empty($validated['nodes'])) {
            foreach ($validated['nodes'] as $nodeData) {
                $roadmap->nodes()->attach($nodeData['node_id'], [
                    'order' => $nodeData['order'],
                    'parent_node_id' => $nodeData['parent_id'] ?? null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Roadmap creado exitosamente',
            'roadmap' => $roadmap,
        ]);
    }

    /**
     * Display the specified roadmap
     */
    public function show(string $roadmap_id)
    {
        $roadmap = Roadmap::where('roadmap_id', $roadmap_id)
            ->with(['nodes', 'user'])
            ->withCount(['reactions', 'comments'])
            ->firstOrFail();

        // Asignar datos del usuario si existe
        if ($roadmap->user) {
            $roadmap->author_name = $roadmap->user->account_name ?: $roadmap->user->username;
            $roadmap->author_username = $roadmap->user->username;
            $roadmap->author_avatar = $roadmap->user->profile_pic;
        }

        // Obtener comentarios con usuarios
        $comments = $roadmap->comments()->with('user')->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('roadmaps/show', [
            'roadmap' => $roadmap,
            'comments' => $comments,
        ]);
    }

    /**
     * Show form for editing the roadmap
     */
    public function edit(string $roadmap_id)
    {
        $roadmap = Roadmap::where('roadmap_id', $roadmap_id)
            ->with(['nodes' => function($query) {
                $query->orderBy('order', 'asc');
            }])
            ->firstOrFail();

        // Verificar que el usuario sea el propietario
        if ($roadmap->user_id !== auth()->id()) {
            abort(403, 'No tienes permiso para editar este roadmap');
        }

        return Inertia::render('roadmaps/edit', [
            'roadmap' => $roadmap,
        ]);
    }

    /**
     * Update the specified roadmap
     */
    public function update(Request $request, string $roadmap_id)
    {
        $roadmap = Roadmap::where('roadmap_id', $roadmap_id)->firstOrFail();

        // Verificar que el usuario sea el propietario
        if ($roadmap->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para editar este roadmap'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tags' => 'nullable|string',
            'cover_image' => 'nullable|url',
            'nodes' => 'nullable|array',
            'nodes.*.node_id' => 'required|exists:nodes,node_id',
            'nodes.*.order' => 'required|integer',
            'nodes.*.parent_id' => 'nullable|string',
        ]);

        // Actualizar roadmap
        $roadmap->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'cover_image' => $validated['cover_image'] ?? null,
        ]);

        // Actualizar nodos con orden y estructura
        if (!empty($validated['nodes'])) {
            // Primero desasociar todos los nodos
            $roadmap->nodes()->detach();

            // Luego asociar con el nuevo orden
            foreach ($validated['nodes'] as $nodeData) {
                $roadmap->nodes()->attach($nodeData['node_id'], [
                    'order' => $nodeData['order'],
                    'parent_node_id' => $nodeData['parent_id'] ?? null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Roadmap actualizado exitosamente',
            'roadmap' => $roadmap,
        ]);
    }

    /**
     * Remove the specified roadmap
     */
    public function destroy(string $roadmap_id)
    {
        $roadmap = Roadmap::findOrFail($roadmap_id);
        $roadmap->delete();

        return redirect()->route('roadmaps.index')
            ->with('success', 'Roadmap eliminado exitosamente');
    }

    /**
     * Attach a node to the roadmap
     */
    public function attachNode(Request $request, string $roadmap_id)
    {
        $validated = $request->validate([
            'node_id' => 'required|exists:nodes,node_id',
        ]);

        $roadmap = Roadmap::findOrFail($roadmap_id);
        $roadmap->nodes()->syncWithoutDetaching([$validated['node_id']]);

        return back()->with('success', 'Nodo agregado al roadmap');
    }

    /**
     * Detach a node from the roadmap
     */
    public function detachNode(string $roadmap_id, string $node_id)
    {
        $roadmap = Roadmap::findOrFail($roadmap_id);
        $roadmap->nodes()->detach($node_id);

        return back()->with('success', 'Nodo removido del roadmap');
    }

    /**
     * Get roadmap hierarchy (parent and children)
     */
    public function hierarchy(string $roadmap_id)
    {
        $roadmap = Roadmap::with(['parent', 'children.nodes'])
            ->findOrFail($roadmap_id);

        return response()->json([
            'roadmap' => $roadmap,
            'hierarchy' => $this->buildHierarchy($roadmap),
        ]);
    }

    /**
     * Build hierarchy tree recursively
     */
    private function buildHierarchy(Roadmap $roadmap, $level = 0)
    {
        $tree = [
            'id' => $roadmap->roadmap_id,
            'name' => $roadmap->name,
            'level' => $level,
            'children' => [],
        ];

        foreach ($roadmap->children as $child) {
            $tree['children'][] = $this->buildHierarchy($child, $level + 1);
        }

        return $tree;
    }
}
