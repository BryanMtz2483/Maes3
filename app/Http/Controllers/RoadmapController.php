<?php

namespace App\Http\Controllers;

use App\Models\Roadmap;
use Illuminate\Http\Request;

class RoadmapController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roadmaps = Roadmap::orderBy('name', 'asc')->paginate();
        return view('roadmap.index', compact('roadmaps'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('roadmap.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'tags' => 'required',
        ]);

        Roadmap::create($request->all());

        return redirect()->route('roadmap.index');
    }

    /**
     * Display the specified resource.
     */
    public function show($roadmap)
    {
        $roadmapDetail = Roadmap::findOrFail($roadmap);
        return view('roadmap.show', compact('roadmapDetail'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function update($roadmap)
    {
        $lastRoadmap = Roadmap::find($roadmap);
        return view('roadmap.update', compact('lastRoadmap'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function change(Request $request, Roadmap $roadmap)
    {
        $request->validate([
            'name' => 'required',
            'tags' => 'required',
        ]);

        $roadmap->update($request->all());

        return redirect()->route('roadmap.index');
    }

    public function destroy($roadmap)
    {
        $delete = Roadmap::find($roadmap);
        $delete->delete();
        return redirect()->route('roadmap.index');
    }
}
