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
}

