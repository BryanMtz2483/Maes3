<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Node;
use App\Models\User;
use Illuminate\Support\Str;

class CreateSampleNodes extends Command
{
    protected $signature = 'content:create-samples';
    protected $description = 'Crea nodos de ejemplo con portadas';

    public function handle()
    {
        $this->info('Creando nodos de ejemplo con portadas...');

        $user = User::first();
        if (!$user) {
            $this->error('No hay usuarios en la base de datos');
            return 1;
        }

        $samples = [
            [
                'title' => 'Introducción a React Hooks',
                'topic' => 'Desarrollo Web',
                'cover_image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
            ],
            [
                'title' => 'Guía Completa de TypeScript',
                'topic' => 'Programación',
                'cover_image' => 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
            ],
            [
                'title' => 'Diseño de APIs RESTful',
                'topic' => 'Backend',
                'cover_image' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
            ],
            [
                'title' => 'Machine Learning para Principiantes',
                'topic' => 'Inteligencia Artificial',
                'cover_image' => 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=450&fit=crop',
            ],
            [
                'title' => 'Fundamentos de UX/UI Design',
                'topic' => 'Diseño',
                'cover_image' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
            ],
        ];

        foreach ($samples as $sample) {
            $node = Node::create([
                'node_id' => 'node-' . Str::uuid(),
                'title' => $sample['title'],
                'author' => $user->username,
                'author_id' => $user->id,
                'topic' => $sample['topic'],
                'cover_image' => $sample['cover_image'],
                'created_date' => now(),
            ]);

            $this->info("✓ Creado: {$node->title}");
        }

        $this->info("\n✓ " . count($samples) . " nodos creados exitosamente");
        return 0;
    }
}
