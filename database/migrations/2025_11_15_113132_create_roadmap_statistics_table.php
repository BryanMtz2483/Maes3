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
        Schema::create('roadmap_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('roadmap_id');
            $table->integer('completion_count')->default(0);
            $table->integer('dropout_count')->default(0);
            $table->decimal('avg_hours_spent', 8, 2)->default(0);
            $table->decimal('avg_nodes_completed', 8, 2)->default(0);
            $table->integer('bookmark_count')->default(0);
            $table->decimal('usefulness_score', 3, 2)->default(0);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('roadmap_id')
                  ->references('roadmap_id')
                  ->on('roadmaps')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roadmap_statistics');
    }
};
