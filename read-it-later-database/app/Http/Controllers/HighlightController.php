<?php

namespace App\Http\Controllers;
use App\Models\Article;
use App\Models\User;
use App\Models\Highlight;

use Illuminate\Http\Request;

class HighlightController extends Controller
{
    public function store(Request $request, $articleId)
    {
        $user = auth()->user(); // Get the authenticated user
    
        // Validate the incoming request
        $request->validate([
            'highlighted_text' => 'required|string',
            'color' => 'required|string|max:50',
            'note' => 'nullable|string',
            
        ]);
    
        // Ensure the article exists
        $article = Article::findOrFail($articleId);
    
        // Create a new highlight
        $highlight = new Highlight();
        $highlight->highlighted_text = $request->input('highlighted_text');
        $highlight->color = $request->input('color');
        $highlight->note = $request->input('note'); // Optional field
        $highlight->article_id = $article->id;
        $highlight->user_id = $user->id;
    
        // Save the highlight
        $highlight->save();

        return response()->json($highlight, 201); // 201 status code for resource creation
    }
    
public function getHighlightsForArticle($articleId)
{
    $article = Article::with('highlights')->findOrFail($articleId);

    return response()->json($article->highlights);
}
public function deleteHighlight($highlightId)
{
    $highlight = Highlight::findOrFail($highlightId);
    
    // Check if the authenticated user is the one who created the highlight
    if ($highlight->user_id !== auth()->user()->id) {
        return response()->json(['error' => 'You are not authorized to delete this highlight.'], 403);
    }

    $highlight->delete();

    return response()->json(['message' => 'Highlight deleted successfully.']);
}

}
