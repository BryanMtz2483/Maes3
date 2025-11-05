<?php

namespace App\Http\Controllers;

use App\Models\Node;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $nodes = Node::orderBy('name', 'asc')->paginate();
        return view('node.index', compact('nodes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('node.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tittle' => 'required',
            'author' => 'required',
            'created_date' => 'required',
            'topic' => 'required',
        ]);

        Node::create($request->all());

        return redirect()->route('node.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Node $node)
    {
        $nodeDetail = Node::find($node);
        return view('node.show', compact('nodeDetail'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(Node $node)
    {
        $nodeDetail = Node::find($node);
        return view('node.update', compact('nodeDetail'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function change(Request $request, Node $node)
    {
        $request->validate([
            'tittle' => 'string',
            'author' => 'string',
            'created_date' => 'date',
            'topic' => 'string',
        ]);

        $node->update($request->all());

        return redirect()->route('node.index');
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
