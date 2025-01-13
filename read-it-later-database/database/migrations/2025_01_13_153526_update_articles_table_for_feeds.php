<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateArticlesTableForFeeds extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('feed_id')->nullable()->constrained('feeds')->cascadeOnDelete(); // Feed association
            $table->boolean('is_from_feed')->default(false); // Indicates if the article is from a feed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropForeign(['feed_id']);
            $table->dropColumn('feed_id');
            $table->dropColumn('is_from_feed');
        });
    }
}

