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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'roadmap_updated', 'node_updated', 'comment', 'reaction', etc.
            $table->string('notifiable_type'); // Tipo de entidad relacionada
            $table->string('notifiable_id'); // ID de la entidad
            $table->text('message'); // Mensaje de la notificación
            $table->json('data')->nullable(); // Datos adicionales
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['user_id', 'read', 'created_at']);
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
