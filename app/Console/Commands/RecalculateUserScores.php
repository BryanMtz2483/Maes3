<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RecalculateUserScores extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:recalculate-scores {--user-id= : ID específico de usuario}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula los scores de todos los usuarios basándose en nodos completados';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');

        if ($userId) {
            // Recalcular score de un usuario específico
            $user = User::find($userId);
            
            if (!$user) {
                $this->error("Usuario con ID {$userId} no encontrado");
                return 1;
            }

            $oldScore = $user->score;
            $newScore = $user->updateScore();
            
            $this->info("Usuario: {$user->username}");
            $this->info("Score anterior: {$oldScore}");
            $this->info("Score nuevo: {$newScore}");
            $this->info("Nodos completados: " . $user->completedNodes()->count());
            
            return 0;
        }

        // Recalcular scores de todos los usuarios
        $this->info('Recalculando scores de todos los usuarios...');
        
        $users = User::all();
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $totalUpdated = 0;
        $totalScoreChange = 0;

        foreach ($users as $user) {
            $oldScore = $user->score;
            $newScore = $user->updateScore();
            
            if ($oldScore !== $newScore) {
                $totalUpdated++;
                $totalScoreChange += ($newScore - $oldScore);
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Resumen
        $this->info("✓ Proceso completado");
        $this->table(
            ['Métrica', 'Valor'],
            [
                ['Total de usuarios', $users->count()],
                ['Usuarios actualizados', $totalUpdated],
                ['Cambio total de puntos', $totalScoreChange],
            ]
        );

        return 0;
    }
}
