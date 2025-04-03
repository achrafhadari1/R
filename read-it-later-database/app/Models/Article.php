<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Feed;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'lead_image',
        'date_published',
        'url',
        'domain',
        'excerpt',
        'word_count',
        'author',
        'progress',
        'user_id', // Add this
    'feed_id', // Add this if it exists
    'is_from_feed',
    'is_archived', 
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function feed()
    {
        return $this->belongsTo(Feed::class);
    }
    

    // Relationship with Highlights
    public function highlights()
    {
        return $this->hasMany(Highlight::class);
    }
    
}
