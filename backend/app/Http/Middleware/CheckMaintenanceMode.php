<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::isMaintenanceMode()) {
            $user = $request->user();

            // Super Admin always passes through
            if ($user && $user->hasRole('Super Admin')) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Sistem sedang dalam mode perawatan. Silakan coba lagi nanti.',
                'maintenance' => true,
            ], 503);
        }

        return $next($request);
    }
}