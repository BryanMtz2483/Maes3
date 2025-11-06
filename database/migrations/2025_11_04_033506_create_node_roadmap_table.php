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
        // Tabla pivot para relación N:N entre roadmaps y nodes
        Schema::create('node_roadmap', function (Blueprint $table) {
            $table->string('roadmap_id');
            $table->string('node_id');
            $table->timestamps();
            
            $table->foreign('roadmap_id')->references('roadmap_id')->on('roadmaps')->onDelete('cascade');
            $table->foreign('node_id')->references('node_id')->on('nodes')->onDelete('cascade');
            
            $table->primary(['roadmap_id', 'node_id']);
        });
        
        // Tabla pivot para relación N:N entre roadmaps y tags
        Schema::create('roadmap_tag', function (Blueprint $table) {
            $table->string('roadmap_id');
            $table->string('tag_id');
            $table->timestamps();
            
            $table->foreign('roadmap_id')->references('roadmap_id')->on('roadmaps')->onDelete('cascade');
            $table->foreign('tag_id')->references('tag_id')->on('tags')->onDelete('cascade');
            
            $table->primary(['roadmap_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('node_roadmap');
        Schema::dropIfExists('roadmap_tag');
    }
};
