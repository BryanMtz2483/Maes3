<?php

namespace App\Http\Controllers;

use App\Models\Node;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Si es una petición AJAX/API, devolver JSON
        if ($request->wantsJson() || $request->expectsJson()) {
            $nodes = Node::with('user')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($node) {
                    return [
                        'node_id' => $node->node_id,
                        'title' => $node->title,
                        'description' => $node->description,
                        'topic' => $node->topic,
                        'cover_image' => $node->cover_image,
                        'author' => [
                            'username' => $node->user->username ?? 'Usuario',
                            'account_name' => $node->user->account_name ?? null,
                        ],
                    ];
                });

            return response()->json([
                'success' => true,
                'nodes' => $nodes,
            ]);
        }

        // Vista tradicional
        $nodes = Node::orderBy('created_at', 'desc')->paginate();
        return view('node.index', compact('nodes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('nodes/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'topic' => 'nullable|string|max:100',
            'cover_image' => 'nullable|url',
            'content_blocks' => 'nullable|json',
        ]);

        $user = $request->user();
        
        // Crear el nodo
        $node = Node::create([
            'node_id' => 'node-' . \Illuminate\Support\Str::uuid(),
            'title' => $request->title,
            'description' => $request->description,
            'topic' => $request->topic,
            'cover_image' => $request->cover_image,
            'author' => $user->username,
            'author_id' => $user->id,
            'user_id' => $user->id,
            'created_date' => now(),
        ]);

        // Guardar bloques de contenido
        if ($request->content_blocks) {
            $blocks = json_decode($request->content_blocks, true);
            foreach ($blocks as $index => $block) {
                $node->contents()->create([
                    'type' => $block['type'],
                    'content' => $block['content'],
                    'metadata' => $block['metadata'] ?? null,
                    'order' => $index,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Nodo creado exitosamente',
            'node' => $node,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $node_id)
    {
        $node = Node::where('node_id', $node_id)
            ->with(['contents' => function($query) {
                $query->orderBy('order', 'asc');
            }, 'roadmaps', 'user'])
            ->withCount(['reactions', 'comments'])
            ->firstOrFail();

        // Asignar datos del usuario si existe
        if ($node->user) {
            $node->author_name = $node->user->account_name ?: $node->user->username;
            $node->author_username = $node->user->username;
            $node->author_avatar = $node->user->profile_pic;
        }

        // Obtener comentarios con usuarios
        $comments = $node->comments()->with('user')->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('nodes/show', [
            'node' => $node,
            'comments' => $comments,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $node_id)
    {
        $node = Node::where('node_id', $node_id)
            ->with(['contents' => function($query) {
                $query->orderBy('order', 'asc');
            }])
            ->firstOrFail();

        // Verificar que el usuario sea el propietario
        if ($node->user_id !== auth()->id()) {
            abort(403, 'No tienes permiso para editar este nodo');
        }

        return Inertia::render('nodes/edit', [
            'node' => $node,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $node_id)
    {
        $node = Node::where('node_id', $node_id)->firstOrFail();

        // Verificar que el usuario sea el propietario
        if ($node->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para editar este nodo'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'topic' => 'nullable|string|max:100',
            'cover_image' => 'nullable|url',
            'content_blocks' => 'nullable|json',
        ]);

        // Actualizar el nodo
        $node->update([
            'title' => $request->title,
            'description' => $request->description,
            'topic' => $request->topic,
            'cover_image' => $request->cover_image,
        ]);

        // Actualizar bloques de contenido
        if ($request->content_blocks) {
            // Eliminar bloques antiguos
            $node->contents()->delete();

            // Crear nuevos bloques
            $blocks = json_decode($request->content_blocks, true);
            foreach ($blocks as $index => $block) {
                $node->contents()->create([
                    'type' => $block['type'],
                    'content' => $block['content'],
                    'metadata' => $block['metadata'] ?? null,
                    'order' => $index,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Nodo actualizado exitosamente',
            'node' => $node,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Node $node)
    {
        $delete = Node::find($node);
        $delete-> delete();
        return redirect()->route('node.index');
    }
}
