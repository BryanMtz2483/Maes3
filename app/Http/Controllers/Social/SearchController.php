<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Roadmap;
use App\Models\Node;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Global search across all entities
     */
    public function search(Request $request)
    {
        $query = $request->get('q');

        if (empty($query)) {
            return Inertia::render('search/index', [
                'results' => [
                    'roadmaps' => [],
                    'nodes' => [],
                    'users' => [],
                    'tags' => [],
                ],
                'query' => '',
            ]);
        }

        $roadmaps = Roadmap::where('name', 'like', "%{$query}%")
            ->with(['tags'])
            ->withCount(['reactions', 'comments'])
            ->limit(10)
            ->get();

        $nodes = Node::where('title', 'like', "%{$query}%")
            ->orWhere('author', 'like', "%{$query}%")
            ->orWhere('topic', 'like', "%{$query}%")
            ->withCount(['reactions', 'comments'])
            ->limit(10)
            ->get();

        $users = User::where('username', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('account_name', 'like', "%{$query}%")
            ->select(['id', 'username', 'email', 'account_name', 'profile_pic', 'score'])
            ->limit(10)
            ->get();

        $tags = Tag::where('name', 'like', "%{$query}%")
            ->withCount('roadmaps')
            ->limit(10)
            ->get();

        return Inertia::render('search/index', [
            'results' => [
                'roadmaps' => $roadmaps,
                'nodes' => $nodes,
                'users' => $users,
                'tags' => $tags,
            ],
            'query' => $query,
        ]);
    }

    /**
     * Search only roadmaps
     */
    public function searchRoadmaps(Request $request)
    {
        $query = $request->get('q');

        $roadmaps = Roadmap::where('name', 'like', "%{$query}%")
            ->with(['tags', 'nodes'])
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($roadmaps);
    }

    /**
     * Search only nodes
     */
    public function searchNodes(Request $request)
    {
        $query = $request->get('q');

        $nodes = Node::where('title', 'like', "%{$query}%")
            ->orWhere('author', 'like', "%{$query}%")
            ->orWhere('topic', 'like', "%{$query}%")
            ->with(['contents', 'roadmaps'])
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($nodes);
    }

    /**
     * Search only users
     */
    public function searchUsers(Request $request)
    {
        $query = $request->get('q');

        $users = User::where('username', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('account_name', 'like', "%{$query}%")
            ->select(['id', 'username', 'email', 'account_name', 'profile_pic', 'score'])
            ->orderBy('score', 'desc')
            ->paginate(15);

        return response()->json($users);
    }

    /**
     * Search only tags
     */
    public function searchTags(Request $request)
    {
        $query = $request->get('q');

        $tags = Tag::where('name', 'like', "%{$query}%")
            ->withCount('roadmaps')
            ->orderBy('roadmaps_count', 'desc')
            ->paginate(15);

        return response()->json($tags);
    }

    /**
     * Get autocomplete suggestions
     */
    public function autocomplete(Request $request)
    {
        $query = $request->get('q');
        $type = $request->get('type', 'all'); // all, roadmaps, nodes, users, tags

        $suggestions = [];

        if ($type === 'all' || $type === 'roadmaps') {
            $suggestions['roadmaps'] = Roadmap::where('name', 'like', "%{$query}%")
                ->select(['roadmap_id', 'name'])
                ->limit(5)
                ->get();
        }

        if ($type === 'all' || $type === 'nodes') {
            $suggestions['nodes'] = Node::where('title', 'like', "%{$query}%")
                ->select(['node_id', 'title'])
                ->limit(5)
                ->get();
        }

        if ($type === 'all' || $type === 'users') {
            $suggestions['users'] = User::where('username', 'like', "%{$query}%")
                ->select(['id', 'username', 'profile_pic'])
                ->limit(5)
                ->get();
        }

        if ($type === 'all' || $type === 'tags') {
            $suggestions['tags'] = Tag::where('name', 'like', "%{$query}%")
                ->select(['tag_id', 'name'])
                ->limit(5)
                ->get();
        }

        return response()->json($suggestions);
    }
}
