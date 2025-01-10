<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\HighlightController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->apiResource('articles', ArticleController::class);
Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);
Route::post('/logout', [AuthController::class,'logout'])->middleware('auth:sanctum');
Route::post('/articles/{articleId}/highlights', [HighlightController::class, 'store'])->middleware('auth:sanctum');

// Get highlights for a specific article
Route::get('/articles/{articleId}/highlights', [HighlightController::class, 'getHighlightsForArticle']);

// Delete a specific highlight
Route::delete('/highlights/{highlightId}', [HighlightController::class, 'deleteHighlight'])->middleware('auth:sanctum');


