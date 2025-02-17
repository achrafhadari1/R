<?php


namespace App\Http\Controllers;

use App\Models\Feed;
use App\Models\Article;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Gate;

class ArticleController extends Controller implements HasMiddleware
{
   
    public static function middleware(){
        return [
            new Middleware('auth:sanctum',except:['index','show'])
        ];
    }
    public function index()
    {
        // Fetch articles for the currently authenticated user
        return Article::where('user_id',auth()->id())
            ->with('user') // Load the associated user for each article
            ->latest() // Order the articles by latest
            ->get();    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
     $articlefields =  $request->validate([
        'title' => 'required|string',
        'content' => 'required|string',
        'lead_image' => 'nullable|string',
        'date_published' => 'nullable|string',
        'url' => 'nullable|string',
        'domain' => 'nullable|string',
        'excerpt' => 'nullable|string',
        'word_count' => 'nullable|integer|min:0',
        'author' => 'nullable|string|max:100',
        'progress' => 'nullable|integer|min:0',

       ]);
      $article = $request->user()->articles()->create($articlefields);

       return ['article'=>$article, 'user'=> $article->user];
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
{
    // Check if the authenticated user is the owner of the article
    if ($article->user_id !== auth()->id()) {
        // If the article does not belong to the authenticated user, return a forbidden response
        return response()->json(['message' => 'Forbidden'], 403);
    }

    // If the authenticated user owns the article, return the article data
    return ['article' => $article, 'user' => $article->user];
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Article $article)
    {
        Gate::authorize('modify', $article);
    
        $articlefields = $request->validate([
            'title' => 'required|string',
            'content' => 'required',
            'lead_image' => 'nullable|string',
            'date_published' => 'nullable|string',
            'author' => 'nullable|string|max:100',
            'progress' => 'nullable|integer|min:0|max:100', // Track progress
            'url' => 'nullable|string',
            'domain' => 'nullable|string',
            'excerpt' => 'nullable|string',
            'word_count' => 'nullable|integer|min:0',
        ]);
    
        $article->update($articlefields);
    
        return ['article' => $article, 'user' => $article->user];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        Gate::authorize('modify',$article);
        $article->delete();
        return ["message"=> "post was deleted"];
    }


    public function storeFromFeed(Request $request)
    {
        // Get the authenticated user
        $user = auth()->user();
    
        // Validate the request
        $request->validate([
            'feed_id' => 'required|exists:feeds,id', // Ensure the feed exists
            'articles' => 'required|array', // Expect an array of articles
            'articles.*.title' => 'required|string',
            'articles.*.url' => 'required|url',
            'articles.*.domain' => 'nullable|string',
            'articles.*.excerpt' => 'nullable|string',
            'articles.*.word_count' => 'nullable|integer|min:0',
            'articles.*.author' => 'nullable|string|max:100',
            'articles.*.date_published' => 'nullable|string',
            'articles.*.lead_image' => 'nullable|string',
        ]);
    
        // Ensure the feed exists and belongs to the authenticated user
        $feed = Feed::where('id', $request->feed_id)
                    ->where('user_id', $user->id)
                    ->firstOrFail();
    
        $savedArticles = [];
    
        // Iterate over each article and save
        foreach ($request->articles as $articleData) {
            $article = $feed->articles()->create(array_merge($articleData, [
                'user_id' => $user->id, // Explicitly associate with the authenticated user
                'is_from_feed' => true,
            ]));
    
            $savedArticles[] = $article;
        }
    
        return response()->json(['articles' => $savedArticles], 201);
    }
    
    

}
