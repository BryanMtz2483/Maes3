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
        Schema::table('nodes', function (Blueprint $table) {
            $table->string('cover_image')->nullable()->after('topic');
        });

        Schema::table('roadmaps', function (Blueprint $table) {
            $table->string('cover_image')->nullable()->after('tags');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nodes', function (Blueprint $table) {
            $table->dropColumn('cover_image');
        });

        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropColumn('cover_image');
        });
    }
};
