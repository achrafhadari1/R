<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\HighlightController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->apiResource('articles', ArticleController::class);
Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::post('/logout', [AuthController::class,'logout'])->middleware('auth:sanctum');
Route::post('/articles/{articleId}/highlights', [HighlightController::class, 'store'])->middleware('auth:sanctum');
Route::post('/articles/saveArticlesFeed', [ArticleController::class, 'storeFromFeed'])->middleware('auth:sanctum');
Route::put('/articles/{articleId}/remove-from-feed', [ArticleController::class, 'removeFromFeed']);
Route::put('/article/{articleId}/progress', [ArticleController::class, 'updateProgress'])->middleware('auth:sanctum');
Route::put('/articles/{article}/archive', [ArticleController::class, 'archive'])->middleware('auth:sanctum');
Route::put('/articles/{article}/unarchive', [ArticleController::class, 'unarchive'])->middleware('auth:sanctum');;
Route::get('/articles/archived', [ArticleController::class, 'archived'])->middleware('auth:sanctum');;
Route::get('/articles/non-archived', [ArticleController::class, 'nonArchived'])->middleware('auth:sanctum');;


// Get highlights for a specific article
Route::get('/articles/{articleId}/highlights', [HighlightController::class, 'getHighlightsForArticle']);
Route::delete('/highlights/{highlightId}', [ArticleController::class, 'deleteHighlight']);


// Delete a specific highlight
Route::delete('/highlights/{highlightId}', [HighlightController::class, 'deleteHighlight'])->middleware('auth:sanctum');


Route::get('articles/highlights/{highlightId}', [HighlightController::class, 'getHighlight']);
Route::put('articles/highlights/{highlightId}/note', [HighlightController::class, 'updateNote'])->middleware('auth:sanctum');

// Routes for feed management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/feeds', [FeedController::class, 'index']); // Get all feeds
    Route::post('/feeds', [FeedController::class, 'store']); // Add a new feed
    Route::delete('/feeds/{id}', [FeedController::class, 'destroy']); // Delete a feed
    Route::put('/feeds/{id}', [FeedController::class, 'update']); // Update a feed
    Route::get('/feeds/{feedId}/articles', [FeedController::class, 'getArticlesByFeedId']);
    Route::get('/feeds/{id}', [FeedController::class, 'show']); // Delete a feed
    Route::get('/feeds/status', [FeedController::class, 'checkStatus']); 
});
