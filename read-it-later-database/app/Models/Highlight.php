<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Highlight extends Model
{
    use HasFactory;

    protected $primaryKey = 'id'; // Define the primary key as 'id'

    protected $fillable = [
        'highlighted_text', 
        'color', 
        'note',
        'article_id', 
        'user_id',

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
