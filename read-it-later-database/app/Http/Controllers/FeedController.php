<?php

namespace App\Http\Controllers;

use App\Models\Feed;
use Illuminate\Http\Request;
class FeedController extends Controller
{
    /**
     * Store a new RSS feed for the user.
     */

    public function store(Request $request)
    {
        $request->validate([
            'feed_url' => 'required|url', // Validate the feed URL
        ]);

        $feed = Feed::create([
            'user_id' => auth()->id(), // Get the logged-in user
            'feed_url' => $request->feed_url,
        ]);

        return response()->json($feed, 201);
    }


    /**
     * Fetch all feeds for the logged-in user.
     */
    public function index()
    {
        $feeds = Feed::where('user_id', auth()->id())->get();

        return response()->json($feeds);
    }
    public function show($id)
    {
        $feed = Feed::where('user_id', auth()->id())
                    ->where('id', $id)
                    ->first();
    
        if (!$feed) {
            return response()->json(['message' => 'Feed not found'], 404);
        }
    
        return response()->json($feed);
    }
    
public function checkStatus(Request $request) {
    $url = $request->query('url');

    if (!$url) {
        return response()->json(['error' => 'URL is required'], 400);
    }

    // Simulated example: Replace with real DB lookup
    $feed = Feed::where('url', $url)->first();

    if (!$feed) {
        return response()->json(['status' => 'not_found']);
    }

    return response()->json(['status' => $feed->processing_complete ? 'ready' : 'processing']);
}

    public function getArticlesByFeedId($feedId)
{
    $user = auth()->user();

    // Validate feed ownership
    $feed = Feed::where('id', $feedId)
        ->where('user_id', $user->id)
        ->firstOrFail();

    // Get articles belonging to this feed
    $articles = $feed->articles()->where('feed_id', $feedId)->get();

    return response()->json($articles);
}
    /**
     * Delete a feed.
     */
    public function destroy($id)
    {
        $feed = Feed::where('user_id', auth()->id())->findOrFail($id);
        $feed->delete();

        return response()->json(['message' => 'Feed deleted successfully']);
    }
    public function update(Request $request, $id)
{
    $feed = Feed::where('user_id', auth()->id())->findOrFail($id);

    // Validate incoming request
    $request->validate([
        'title' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'link' => 'nullable|string',
    ]);

    // Update the feed with provided data
    $feed->update($request->only(['title', 'description', 'link']));

    return response()->json(['message' => 'Feed updated successfully', 'feed' => $feed]);
}

}

