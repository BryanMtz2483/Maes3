<?php

namespace App\Http\Controllers;

use App\Models\Node_Comment;
use Illuminate\Http\Request;

class NodeCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $node_comments = Node_Comment::orderBy('created_at', 'desc')->paginate();
        return view('node_comment.index', compact('node_comments'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('node_comment.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required',
            'node_id' => 'required',
        ]);

        Node_Comment::create($request->all());

        return redirect()->route('node_comment.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Node_Comment $node_Comment)
    {
        $commentDetail = Node_Comment::find($node_Comment);
        return view('node_comment.show', compact('commentDetail'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(Node_Comment $node_Comment)
    {
        $lastComment = Node_Comment::find($node_Comment);
        return view('node_comment.update', compact('lastComment'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function change(Request $request, Node_Comment $node_Comment)
    {
        $request->validate([
            'text' => 'string',
            'node_id' => 'string',
        ]);

        $node_Comment->update($request->all());

        return redirect()->route('node_comment.index');
    }

    public function destroy(Node_Comment $node_Comment)
    {
        $delete = Node_Comment::find($node_Comment);
        $delete->delete();
        return redirect()->route('node_comment.index');
    }
}
