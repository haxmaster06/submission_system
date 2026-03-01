<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $table = 'app_settings';

    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key with caching.
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting_{$key}", 60, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value and clear cache.
     */
    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
        ['key' => $key],
        ['value' => $value]
        );
        Cache::forget("setting_{$key}");
    }

    /**
     * Check if maintenance mode is active.
     */
    public static function isMaintenanceMode(): bool
    {
        return static::get('maintenance_mode', 'false') === 'true';
    }
}