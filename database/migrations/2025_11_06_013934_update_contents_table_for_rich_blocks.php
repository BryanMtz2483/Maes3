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
        Schema::table('contents', function (Blueprint $table) {
            // Agregar columnas para bloques de contenido rico
            $table->string('type')->nullable()->after('node_id'); // tipo de bloque
            $table->longText('content')->nullable()->after('type'); // contenido del bloque
            $table->json('metadata')->nullable()->after('content'); // metadata adicional
            $table->integer('order')->default(0)->after('metadata'); // orden del bloque
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn(['type', 'content', 'metadata', 'order']);
        });
    }
};
