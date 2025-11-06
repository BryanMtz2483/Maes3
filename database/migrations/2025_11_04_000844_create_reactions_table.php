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
        Schema::create('reactions', function (Blueprint $table) {
            $table->string('reaction_id')->primary(); // Según diagrama: reaction_id: string
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_type'); // 'node' o 'roadmap'
            $table->string('entity_id'); // node_id o roadmap_id (ambos son strings)
            $table->string('reaction_type');
            $table->timestamps();
            
            // Índice compuesto para evitar reacciones duplicadas
            $table->unique(['user_id', 'entity_type', 'entity_id', 'reaction_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
