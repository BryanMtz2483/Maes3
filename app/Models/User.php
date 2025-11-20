<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'birth_date',
        'profile_pic',
        'avatar',
        'account_name',
        'bio',
        'score',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Relación con los nodos creados por el usuario
     */
    public function nodes()
    {
        return $this->hasMany(Node::class, 'user_id');
    }

    /**
     * Relación con los roadmaps creados por el usuario
     */
    public function roadmaps()
    {
        return $this->hasMany(Roadmap::class, 'user_id');
    }

    /**
     * Relación con el progreso de nodos
     */
    public function nodeProgress()
    {
        return $this->hasMany(NodeProgress::class, 'user_id');
    }

    /**
     * Obtener nodos completados por el usuario
     */
    public function completedNodes()
    {
        return $this->nodeProgress()->where('completed', true);
    }

    /**
     * Calcular y actualizar el score basado en nodos completados
     * Cada nodo completado = 10 puntos
     */
    public function updateScore()
    {
        $completedNodesCount = $this->completedNodes()->count();
        $this->score = $completedNodesCount * 10;
        $this->save();
        
        return $this->score;
    }

    /**
     * Obtener roadmaps completados (100% de nodos)
     */
    public function completedRoadmaps()
    {
        $completedNodeIds = $this->completedNodes()->pluck('node_id')->toArray();
        
        return Roadmap::whereHas('nodes')->get()->filter(function ($roadmap) use ($completedNodeIds) {
            $roadmapNodeIds = $roadmap->nodes->pluck('node_id')->toArray();
            
            if (empty($roadmapNodeIds)) {
                return false;
            }
            
            // Verificar si todos los nodos del roadmap están completados
            return count(array_intersect($roadmapNodeIds, $completedNodeIds)) === count($roadmapNodeIds);
        });
    }

    /**
     * Obtener estadísticas completas del usuario
     */
    public function getStats()
    {
        $completedNodesCount = $this->completedNodes()->count();
        $completedRoadmaps = $this->completedRoadmaps();
        
        return [
            'nodes_created' => $this->nodes()->count(),
            'roadmaps_created' => $this->roadmaps()->count(),
            'nodes_completed' => $completedNodesCount,
            'roadmaps_completed' => $completedRoadmaps->count(),
            'score' => $this->score,
        ];
    }
}
