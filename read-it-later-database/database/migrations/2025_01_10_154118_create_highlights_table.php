<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CreateHighlightsTable extends Migration
{
    public function up()
{
    Schema::create('highlights', function (Blueprint $table) {
        $table->id(); // Auto-incrementing ID for the highlight
        $table->text('highlighted_text'); // The highlighted text
        $table->string('color');
        $table->string('note')->nullable(); // Color of the highlight
        $table->unsignedBigInteger('article_id'); // Foreign key to the articles table (unsignedBigInteger)
        $table->unsignedBigInteger('user_id'); // Foreign key to the users table (unsignedBigInteger)
        $table->timestamps(); // Created at and updated at timestamps

        // Foreign key constraints
        $table->foreign('article_id')->references('id')->on('articles')->onDelete('cascade');
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

public function down()
{
    Schema::dropIfExists('highlights');
}

}
