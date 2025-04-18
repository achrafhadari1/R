<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       
Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->text('title');
$table->text('lead_image');
$table->longText('content')->nullable(); // Removed default('text') for longText
    $table->string('date_published')->nullable();
    $table->string('url');
    $table->string('domain');
    $table->string('excerpt');
    $table->integer('word_count')->nullable();
    $table->string('author', 100)->nullable()->default('text');
    $table->integer('progress')->unsigned()->nullable()->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
