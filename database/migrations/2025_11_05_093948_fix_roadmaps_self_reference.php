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
        Schema::table('roadmaps', function (Blueprint $table) {
            // Agregar foreign key de auto-referencia después de que la tabla existe
            $table->foreign('roadmap_id_fk')
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
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropForeign(['roadmap_id_fk']);
        });
    }
};
