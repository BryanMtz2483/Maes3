<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeederComplete extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar tablas en orden inverso a las dependencias
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        DB::table('roadmap_tag')->truncate();
        DB::table('node_roadmap')->truncate();
        DB::table('reactions')->truncate();
        DB::table('roadmap_comments')->truncate();
        DB::table('node_comments')->truncate();
        DB::table('contents')->truncate();
        DB::table('nodes')->truncate();
        DB::table('roadmaps')->truncate();
        DB::table('tags')->truncate();
        DB::table('features')->truncate();
        DB::table('users')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Crear usuarios
        $user1 = User::create([
            'username' => 'Era',
            'account_name' => 'Era Developer',
            'email' => 'era@example.com',
            'password' => Hash::make('password'),
            'birth_date' => '1995-05-15',
            'profile_pic' => null,
            'score' => 150,
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'username' => 'johndoe',
            'account_name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'birth_date' => '1990-03-20',
            'profile_pic' => null,
            'score' => 85,
            'email_verified_at' => now(),
        ]);

        // 2. Crear features
        DB::table('features')->insert([
            [
                'profile_pic' => '/images/profiles/era.jpg',
                'account_name' => 'Era Developer',
                'user_id' => $user1->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'profile_pic' => '/images/profiles/john.jpg',
                'account_name' => 'John Doe',
                'user_id' => $user2->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Crear tags
        $tags = [
            ['tag_id' => 'web-dev', 'name' => 'Web Development'],
            ['tag_id' => 'backend', 'name' => 'Backend'],
            ['tag_id' => 'frontend', 'name' => 'Frontend'],
            ['tag_id' => 'database', 'name' => 'Database'],
            ['tag_id' => 'devops', 'name' => 'DevOps'],
        ];

        foreach ($tags as $tag) {
            DB::table('tags')->insert([
                'tag_id' => $tag['tag_id'],
                'name' => $tag['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Crear roadmaps
        $roadmaps = [
            [
                'roadmap_id' => 'fullstack-2025',
                'name' => 'Full Stack Developer 2025',
                'tags' => 'web-dev,frontend,backend',
                'roadmap_id_fk' => null,
            ],
            [
                'roadmap_id' => 'laravel-master',
                'name' => 'Laravel Mastery',
                'tags' => 'backend,database',
                'roadmap_id_fk' => 'fullstack-2025', // Sub-roadmap
            ],
            [
                'roadmap_id' => 'react-advanced',
                'name' => 'React Advanced',
                'tags' => 'frontend',
                'roadmap_id_fk' => 'fullstack-2025', // Sub-roadmap
            ],
        ];

        foreach ($roadmaps as $roadmap) {
            DB::table('roadmaps')->insert([
                'roadmap_id' => $roadmap['roadmap_id'],
                'name' => $roadmap['name'],
                'tags' => $roadmap['tags'],
                'roadmap_id_fk' => $roadmap['roadmap_id_fk'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Crear nodes
        $nodes = [
            [
                'node_id' => 'intro-laravel',
                'title' => 'Introducción a Laravel',
                'author' => 'Era',
                'created_date' => now()->subDays(10),
                'topic' => 'PHP Framework',
            ],
            [
                'node_id' => 'react-hooks',
                'title' => 'React Hooks Avanzados',
                'author' => 'John Doe',
                'created_date' => now()->subDays(5),
                'topic' => 'React',
            ],
            [
                'node_id' => 'sql-optimization',
                'title' => 'Optimización de Consultas SQL',
                'author' => 'Era',
                'created_date' => now()->subDays(3),
                'topic' => 'Database',
            ],
        ];

        foreach ($nodes as $node) {
            DB::table('nodes')->insert([
                'node_id' => $node['node_id'],
                'title' => $node['title'],
                'author' => $node['author'],
                'created_date' => $node['created_date'],
                'topic' => $node['topic'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Crear contents
        $contents = [
            [
                'content_id' => 'content-intro-laravel',
                'node_id' => 'intro-laravel',
                'video' => json_encode(['url' => 'https://youtube.com/watch?v=example1', 'duration' => '15:30']),
                'image' => json_encode(['url' => '/images/laravel-intro.jpg', 'width' => 1920, 'height' => 1080]),
                'text' => json_encode(['content' => 'Laravel es un framework PHP moderno y elegante...']),
            ],
            [
                'content_id' => 'content-react-hooks',
                'node_id' => 'react-hooks',
                'video' => json_encode(['url' => 'https://youtube.com/watch?v=example2', 'duration' => '22:45']),
                'image' => null,
                'text' => json_encode(['content' => 'Los hooks de React permiten usar estado y otras características...']),
            ],
        ];

        foreach ($contents as $content) {
            DB::table('contents')->insert([
                'content_id' => $content['content_id'],
                'node_id' => $content['node_id'],
                'video' => $content['video'],
                'image' => $content['image'],
                'text' => $content['text'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Crear node_comments
        DB::table('node_comments')->insert([
            [
                'node_comment_id' => 'nc-' . Str::uuid(),
                'node_id' => 'intro-laravel',
                'text' => '¡Excelente introducción! Muy claro y conciso.',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'node_comment_id' => 'nc-' . Str::uuid(),
                'node_id' => 'react-hooks',
                'text' => 'Me ayudó mucho a entender useEffect.',
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
        ]);

        // 8. Crear roadmap_comments
        DB::table('roadmap_comments')->insert([
            [
                'roadmap_comment_id' => 'rc-' . Str::uuid(),
                'roadmap_id' => 'fullstack-2025',
                'text' => 'Este roadmap está muy completo, gracias!',
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
        ]);

        // 9. Crear reactions
        DB::table('reactions')->insert([
            [
                'reaction_id' => 'r-' . Str::uuid(),
                'user_id' => $user1->id,
                'entity_type' => 'node',
                'entity_id' => 'react-hooks',
                'reaction_type' => 'like',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'reaction_id' => 'r-' . Str::uuid(),
                'user_id' => $user2->id,
                'entity_type' => 'roadmap',
                'entity_id' => 'fullstack-2025',
                'reaction_type' => 'love',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 10. Crear relaciones node_roadmap
        DB::table('node_roadmap')->insert([
            [
                'roadmap_id' => 'fullstack-2025',
                'node_id' => 'intro-laravel',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'fullstack-2025',
                'node_id' => 'react-hooks',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'laravel-master',
                'node_id' => 'intro-laravel',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'laravel-master',
                'node_id' => 'sql-optimization',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 11. Crear relaciones roadmap_tag
        DB::table('roadmap_tag')->insert([
            [
                'roadmap_id' => 'fullstack-2025',
                'tag_id' => 'web-dev',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'fullstack-2025',
                'tag_id' => 'frontend',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'fullstack-2025',
                'tag_id' => 'backend',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'laravel-master',
                'tag_id' => 'backend',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'roadmap_id' => 'laravel-master',
                'tag_id' => 'database',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('✅ Base de datos poblada exitosamente!');
        $this->command->info('📊 Usuarios: 2');
        $this->command->info('📊 Roadmaps: 3');
        $this->command->info('📊 Nodes: 3');
        $this->command->info('📊 Tags: 5');
        $this->command->info('📊 Contents: 2');
        $this->command->info('📊 Comments: 3');
        $this->command->info('📊 Reactions: 2');
    }
}
