<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class Article extends Model
{
    /** @use HasFactory<\Database\Factories\ArticleFactory> */
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
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function highlights()
    {
        return $this->hasMany(Highlight::class);
    }
}
