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
        Schema::create('roadmaps', function (Blueprint $table) {
            $table->string('roadmap_id')->primary(); // Según diagrama: roadmap_id: string
            $table->string('name');
            $table->string('tags')->nullable(); // Campo tags según diagrama
            $table->string('roadmap_id_fk')->nullable(); // Auto-referencia (se agregará FK después)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roadmaps');
    }
};
