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
        Schema::create('node_comments', function (Blueprint $table) {
            $table->string('node_comment_id')->primary(); // Según diagrama: node_comment_id: string
            $table->text('text');
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
        Schema::dropIfExists('node_comments');
    }
};
