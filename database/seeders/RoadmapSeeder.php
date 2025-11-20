<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Roadmap;
use App\Models\User;
use App\Models\Node;
use App\Models\RoadmapStatistics;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class RoadmapSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // URLs de imágenes aleatorias para roadmaps
        $coverImages = [
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
            'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
            'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
            'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
            'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800',
            'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
            'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
            'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
        ];

        // Crear usuarios si no existen (para evitar conflictos con null)
        $users = [];
        for ($i = 1; $i <= 50; $i++) {
            $users[] = User::firstOrCreate(
                ['email' => "user{$i}@roadmap.test"],
                [
                    'username' => "user{$i}",
                    'account_name' => "User {$i}",
                    'password' => Hash::make('password'),
                ]
            );
        }

        // Crear nodos base si no existen (para evitar conflictos con null)
        $nodes = [];
        for ($i = 1; $i <= 100; $i++) {
            $randomUser = $users[array_rand($users)];
            $nodes[] = Node::firstOrCreate(
                ['node_id' => 'node-' . Str::uuid()],
                [
                    'title' => "Node {$i}",
                    'description' => "Description for node {$i}",
                    'author' => $randomUser->account_name ?? $randomUser->username,
                    'author_id' => $randomUser->id,
                    'user_id' => $randomUser->id,
                    'topic' => ['JavaScript', 'Python', 'React', 'Laravel', 'Vue'][array_rand(['JavaScript', 'Python', 'React', 'Laravel', 'Vue'])],
                    'created_date' => now(),
                ]
            );
        }

        // Temas principales para los roadmaps (para crear variaciones)
        $themes = [
            'JavaScript' => [
                'Curso de JavaScript',
                'JavaScript Bootcamp',
                'JavaScript Avanzado',
                'JavaScript desde Cero',
                'Roadmap de JavaScript',
                'JavaScript - Nivel Básico',
                'JavaScript - Nivel Intermedio',
                'JavaScript - Nivel Avanzado',
                'JavaScript Full Stack',
                'JavaScript Moderno',
            ],
            'Python' => [
                'Curso de Python',
                'Python para Principiantes',
                'Python Avanzado',
                'Python Data Science',
                'Roadmap de Python',
                'Python - Nivel 1',
                'Python - Nivel 2',
                'Python - Nivel 3',
                'Python Full Stack',
                'Python Profesional',
            ],
            'React' => [
                'Curso de React',
                'React desde Cero',
                'React Avanzado',
                'React Hooks Masterclass',
                'Roadmap de React',
                'React - Básico',
                'React - Intermedio',
                'React - Avanzado',
                'React Full Course',
                'React Profesional',
            ],
            'Laravel' => [
                'Curso de Laravel',
                'Laravel Bootcamp',
                'Laravel Avanzado',
                'Laravel desde Cero',
                'Roadmap de Laravel',
                'Laravel - Nivel 1',
                'Laravel - Nivel 2',
                'Laravel - Nivel 3',
                'Laravel Full Stack',
                'Laravel Profesional',
            ],
            'Vue' => [
                'Curso de Vue.js',
                'Vue.js Bootcamp',
                'Vue.js Avanzado',
                'Vue.js desde Cero',
                'Roadmap de Vue.js',
                'Vue.js - Básico',
                'Vue.js - Intermedio',
                'Vue.js - Avanzado',
                'Vue.js Full Course',
                'Vue.js Profesional',
            ],
            'Decibilidad' => [
                'Curso de Decibilidad y Ética',
                'Decibilidad en la Sociedad Moderna',
                'Valores de Decibilidad Fundamentales',
                'Educación en Decibilidad y Ciudadanía',
                'Roadmap de Decibilidad',
                'Decibilidad - Nivel Básico',
                'Decibilidad - Nivel Intermedio',
                'Decibilidad - Nivel Avanzado',
                'Formación en Decibilidad Integral',
                'Ética y Decibilidad Profesional',
            ],
        ];

        $roadmapCount = 0;
        $targetCount = 500;

        // Generar exactamente 500 roadmaps con variaciones
        $this->command->info("Generando {$targetCount} roadmaps...");
        
        while ($roadmapCount < $targetCount) {
            foreach ($themes as $topic => $variations) {
                foreach ($variations as $variation) {
                    // Crear múltiples versiones de cada variación
                    for ($version = 1; $version <= 10; $version++) {
                        if ($roadmapCount >= $targetCount) {
                            break 3;
                        }

                        $randomUser = $users[array_rand($users)];
                        $roadmapId = 'roadmap-' . Str::uuid();
                        
                        // Seleccionar imagen aleatoria
                        $coverImage = $coverImages[array_rand($coverImages)];
                        
                        // Definir tags según el tema
                        $tags = strtolower($topic);
                        if ($topic === 'Decibilidad') {
                            $tags .= ',decibilidad,ética,valores,ciudadanía,educación cívica';
                        } else {
                            $tags .= ',web,programming,development';
                        }
                        
                        $roadmap = Roadmap::create([
                            'roadmap_id' => $roadmapId,
                            'name' => $variation . ($version > 1 ? " - Versión {$version}" : ''),
                            'description' => "Este es un roadmap completo de {$topic}. Versión {$version} con contenido actualizado y optimizado para el aprendizaje.",
                            'tags' => $tags,
                            'author_id' => $randomUser->id,
                            'user_id' => $randomUser->id,
                            'cover_image' => $coverImage,
                        ]);

                        // Asociar nodos aleatorios al roadmap
                        $randomNodes = array_rand($nodes, rand(5, 15));
                        if (!is_array($randomNodes)) {
                            $randomNodes = [$randomNodes];
                        }
                        foreach ($randomNodes as $nodeIndex) {
                            $roadmap->nodes()->attach($nodes[$nodeIndex]->node_id);
                        }

                        // Crear estadísticas para cada roadmap (GARANTIZADO)
                        RoadmapStatistics::create([
                            'roadmap_id' => $roadmapId,
                            'completion_count' => rand(10, 500),
                            'dropout_count' => rand(0, 300),
                            'avg_hours_spent' => rand(100, 8000) / 100, // 1.00 a 80.00
                            'avg_nodes_completed' => rand(100, 5000) / 100, // 1.00 a 50.00
                            'bookmark_count' => rand(5, 200),
                            'usefulness_score' => rand(100, 500) / 100, // 1.00 a 5.00
                        ]);

                        $roadmapCount++;

                        // Mostrar progreso cada 50 roadmaps
                        if ($roadmapCount % 50 == 0) {
                            $this->command->info("  Progreso: {$roadmapCount}/{$targetCount} roadmaps creados...");
                        }
                    }
                }
            }
        }

        $this->command->info("Se crearon {$roadmapCount} roadmaps con sus estadísticas.");

        // GARANTIZAR creación de roadmaps de Decibilidad
        $this->command->info("Creando roadmaps de Decibilidad...");
        
        $decibilidadTitles = [
            'Introducción a la Decibilidad',
            'Decibilidad en la Vida Cotidiana',
            'Principios de Decibilidad',
            'Decibilidad y Convivencia',
            'Curso Básico de Decibilidad',
            'Decibilidad Avanzada',
            'Decibilidad en el Trabajo',
            'Decibilidad y Ética Profesional',
            'Fundamentos de Decibilidad',
            'Decibilidad para Todos',
            'Decibilidad en la Educación',
            'Decibilidad y Valores',
            'Práctica de la Decibilidad',
            'Decibilidad Social',
            'Decibilidad Comunitaria',
            'Decibilidad y Respeto',
            'Decibilidad en Acción',
            'Decibilidad Integral',
            'Decibilidad y Ciudadanía',
            'Decibilidad Moderna',
        ];

        $decibilidadCount = 0;
        foreach ($decibilidadTitles as $title) {
            $randomUser = $users[array_rand($users)];
            $roadmapId = 'roadmap-decibilidad-' . Str::uuid();
            
            $roadmap = Roadmap::create([
                'roadmap_id' => $roadmapId,
                'name' => $title,
                'description' => "Roadmap enfocado en {$title}. Contenido educativo sobre valores, ética y convivencia social.",
                'tags' => 'decibilidad,ética,valores,ciudadanía,educación,convivencia',
                'author_id' => $randomUser->id,
                'user_id' => $randomUser->id,
                'cover_image' => null,
            ]);

            // Asociar nodos aleatorios al roadmap
            $randomNodes = array_rand($nodes, rand(3, 8));
            if (!is_array($randomNodes)) {
                $randomNodes = [$randomNodes];
            }
            foreach ($randomNodes as $nodeIndex) {
                $roadmap->nodes()->attach($nodes[$nodeIndex]->node_id);
            }

            // Crear estadísticas para cada roadmap
            RoadmapStatistics::create([
                'roadmap_id' => $roadmapId,
                'completion_count' => rand(10, 500),
                'dropout_count' => rand(0, 300),
                'avg_hours_spent' => rand(100, 8000) / 100,
                'avg_nodes_completed' => rand(100, 5000) / 100,
                'bookmark_count' => rand(5, 200),
                'usefulness_score' => rand(100, 500) / 100,
            ]);

            $decibilidadCount++;
        }

        $this->command->info("Se crearon {$decibilidadCount} roadmaps de Decibilidad.");
        $this->command->info("Total de roadmaps: " . ($roadmapCount + $decibilidadCount));
        $this->command->info("Se crearon " . count($users) . " usuarios.");
        $this->command->info("Se crearon " . count($nodes) . " nodos.");
    }
}
