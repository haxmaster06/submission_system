<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait ClearsLookupCache
{
    protected static function booted()
    {
        static::saved(function () {
            static::clearLookupCache();
        });

        static::deleted(function () {
            static::clearLookupCache();
        });
    }

    public static function clearLookupCache()
    {
        Cache::forget('lookups_all');
        Cache::forget('lookups_divisions');
        Cache::forget('lookups_jenis_pengajuan');
        Cache::forget('lookups_jenis_perjalanan');
        Cache::forget('lookups_uoms');
    }
}