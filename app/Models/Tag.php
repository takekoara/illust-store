<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $slug = Str::slug($tag->name);
                // If slug is empty (e.g., for Japanese characters), use a hash
                if (empty($slug)) {
                    $slug = 'tag-' . md5($tag->name . time());
                }
                $tag->slug = $slug;
            }
        });
        
        static::updating(function ($tag) {
            if (empty($tag->slug)) {
                $slug = Str::slug($tag->name);
                // If slug is empty (e.g., for Japanese characters), use a hash
                if (empty($slug)) {
                    $slug = 'tag-' . md5($tag->name . $tag->id);
                }
                $tag->slug = $slug;
            }
        });
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)->withTimestamps();
    }
}
