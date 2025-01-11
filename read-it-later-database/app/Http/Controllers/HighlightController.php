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
public function getHighlight($highlightId)
{
    // Fetch the highlight by ID
    $highlight = Highlight::findOrFail($highlightId);

    // Return the highlight in JSON format
    return response()->json($highlight, 200);
}

public function updateNote(Request $request, $highlightId)
{
    // Validate the incoming request
    $request->validate([
        'note' => 'required|string', // Ensure the note field is provided and is a string
    ]);

    // Fetch the highlight by ID
    $highlight = Highlight::findOrFail($highlightId);

    // Check if the authenticated user is the one who created the highlight
    if ($highlight->user_id !== auth()->user()->id) {
        return response()->json(['error' => 'You are not authorized to update this note.'], 403);
    }

    // Update the note field
    $highlight->note = $request->input('note');

    // Save the changes
    $highlight->save();

    // Return the updated highlight
    return response()->json($highlight, 200);
}


}
