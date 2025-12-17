<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'product_id',
        'type',
        'title',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    /**
     * Ensure user_one_id is always smaller than user_two_id for consistency
     * This helps with querying and prevents duplicate conversations
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conversation) {
            // user_one_idを常に小さい方のIDにする
            if ($conversation->user_one_id > $conversation->user_two_id) {
                $temp = $conversation->user_one_id;
                $conversation->user_one_id = $conversation->user_two_id;
                $conversation->user_two_id = $temp;
            }
        });
    }

    /**
     * Scope to find conversation between two users
     */
    public function scopeBetweenUsers(Builder $query, int $userId1, int $userId2): Builder
    {
        // 小さいIDをuser_one_id、大きいIDをuser_two_idとして検索
        $minId = min($userId1, $userId2);
        $maxId = max($userId1, $userId2);
        
        return $query->where('user_one_id', $minId)
            ->where('user_two_id', $maxId);
    }

    /**
     * Scope to find conversations for a user
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_one_id', $userId)
              ->orWhere('user_two_id', $userId);
        });
    }

    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'desc');
    }

    public function getOtherUser($userId)
    {
        return $userId === $this->user_one_id ? $this->userTwo : $this->userOne;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
