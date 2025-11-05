<?php

namespace App\Http\Controllers;

use App\Models\Roadmap_Comment;
use Illuminate\Http\Request;

class RoadmapCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roadmap_comments = Roadmap_Comment::orderBy('created_at', 'desc')->paginate();
        return view('roadmap_comment.index', compact('roadmap_comments'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('roadmap_comment.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required',
            'roadmap_id' => 'required',
        ]);

        Roadmap_Comment::create($request->all());

        return redirect()->route('roadmap_comment.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Roadmap_Comment $roadmap_Comment)
    {
        $roadmap_comment = Roadmap_Comment::find($roadmap_Comment);
        return view('roadmap_comment.show', compact('roadmap_comment'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update(Roadmap_Comment $roadmap_Comment)
    {
        $roadmap_comment = Roadmap_Comment::find($roadmap_Comment);
        return view('roadmap_comment.edit', compact('roadmap_comment'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function change(Request $request, Roadmap_Comment $roadmap_Comment)
    {
        $request->validate([
            'text' => 'string',
            'roadmap_id' => 'string',
        ]);

        $roadmap_Comment->update($request->all());

        return redirect()->route('roadmap_comment.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Roadmap_Comment $roadmap_Comment)
    {
        $roadmap_Comment = Roadmap_Comment::find($roadmap_Comment);
        $roadmap_Comment->delete();
        return redirect()->route('roadmap_comment.index');
    }
}
