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
        Schema::create('contents', function (Blueprint $table) {
            $table->string('content_id')->primary(); // Según diagrama: content_id: string
            $table->json('video')->nullable();
            $table->json('image')->nullable();
            $table->json('text')->nullable();
            $table->string('node_id'); // Foreign key a nodes
            $table->foreign('node_id')->references('node_id')->on('nodes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
