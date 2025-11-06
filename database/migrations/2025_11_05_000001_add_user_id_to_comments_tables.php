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
        // Agregar user_id a node_comments
        Schema::table('node_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('node_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Agregar user_id a roadmap_comments
        Schema::table('roadmap_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('roadmap_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('node_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('roadmap_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
