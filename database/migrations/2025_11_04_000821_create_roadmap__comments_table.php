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
        Schema::create('roadmap_comments', function (Blueprint $table) {
            $table->string('roadmap_comment_id')->primary(); // Según diagrama: roadmap_comment_id: string
            $table->text('text');
            $table->string('roadmap_id'); // Foreign key a roadmaps
            $table->foreign('roadmap_id')->references('roadmap_id')->on('roadmaps')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roadmap_comments');
    }
};
