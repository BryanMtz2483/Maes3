<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar author_id a nodes
        Schema::table('nodes', function (Blueprint $table) {
            $table->unsignedBigInteger('author_id')->nullable()->after('author');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('set null');
        });

        // Agregar author_id a roadmaps
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->unsignedBigInteger('author_id')->nullable()->after('roadmap_id_fk');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('set null');
        });

        // Asignar un usuario por defecto a los registros existentes
        $defaultUserId = DB::table('users')->first()->id ?? 1;
        
        DB::table('nodes')->whereNull('author_id')->update(['author_id' => $defaultUserId]);
        DB::table('roadmaps')->whereNull('author_id')->update(['author_id' => $defaultUserId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nodes', function (Blueprint $table) {
            $table->dropForeign(['author_id']);
            $table->dropColumn('author_id');
        });

        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropForeign(['author_id']);
            $table->dropColumn('author_id');
        });
    }
};
