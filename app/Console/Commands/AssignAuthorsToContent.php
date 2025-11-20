<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Node;
use App\Models\Roadmap;
use App\Models\User;

class AssignAuthorsToContent extends Command
{
    protected $signature = 'content:assign-authors';
    protected $description = 'Asigna autores a nodos y roadmaps que no tienen author_id';

    public function handle()
    {
        $this->info('Asignando autores a contenido...');

        // Obtener el usuario autenticado o el primero disponible
        $defaultUser = User::first();
        
        if (!$defaultUser) {
            $this->error('No hay usuarios en la base de datos');
            return 1;
        }

        // Asignar autor a nodos sin author_id
        $nodesUpdated = Node::whereNull('author_id')->update(['author_id' => $defaultUser->id]);
        $this->info("{$nodesUpdated} nodos actualizados");

        // Asignar autor a roadmaps sin author_id
        $roadmapsUpdated = Roadmap::whereNull('author_id')->update(['author_id' => $defaultUser->id]);
        $this->info("{$roadmapsUpdated} roadmaps actualizados");

        $this->info('Proceso completado exitosamente');
        return 0;
    }
}
