<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MobileAppRelease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MobileAppReleaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Parameter ?active_only=true digunakan oleh aplikasi web client/staff
        // Jika tidak ada (dipanggil admin), tampilkan semua
        $activeOnly = filter_var($request->query('active_only', false), FILTER_VALIDATE_BOOLEAN);

        $query = MobileAppRelease::query()->latest();

        if ($activeOnly) {
            $query->where('is_active', '=', true);
            // For dashboard banner — return all active (usually 1-2 per platform)
            return response()->json([
                'success' => true,
                'data'    => $query->get()
            ]);
        }

        // Admin view — paginated
        return response()->json([
            'success' => true,
            'data'    => $query->paginate($request->query('per_page', 25))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'platform'        => ['required', Rule::in(['android', 'ios'])],
            'version'         => 'required|string|max:50',
            'description'     => 'nullable|string',
            'is_active'       => 'boolean',
            'custom_filename' => 'nullable|string|max:255',
            'file'            => 'required|file|mimes:apk,ipa,zip|max:204800', // max 200MB
        ]);

        try {
            $file = $request->file('file');
            $originalName = $request->custom_filename ?: $file->getClientOriginalName();
            
            // Simpan di storage/app/public/releases
            $path = $file->storeAs('releases', uniqid() . '_' . $originalName, 'public');

            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

            // Jika rilis ini diset aktif, nonaktifkan rilis lain dengan platform yang sama
            if ($isActive) {
                MobileAppRelease::where('platform', $request->platform)
                    ->update(['is_active' => false]);
            }

            $release = MobileAppRelease::create([
                'platform'    => $request->platform,
                'version'     => $request->version,
                'filename'    => $originalName,
                'file_path'   => $path,
                'description' => $request->description,
                'is_active'   => $isActive,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rilis aplikasi berhasil diunggah',
                'data'    => $release
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah file. ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $release = MobileAppRelease::findOrFail($id);

        $request->validate([
            'version'     => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

            if ($isActive && !$release->is_active) {
                // Nonaktifkan rilis lain di platform yang sama
                MobileAppRelease::where('platform', $release->platform)
                    ->where('id', '!=', $release->id)
                    ->update(['is_active' => false]);
            }
            $release->is_active = $isActive;
        }

        if ($request->has('version')) $release->version = $request->version;
        if ($request->has('description')) $release->description = $request->description;

        $release->save();

        return response()->json([
            'success' => true,
            'message' => 'Rilis aplikasi berhasil diperbarui',
            'data'    => $release
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $release = MobileAppRelease::findOrFail($id);

        // Hapus file fisik
        if (Storage::disk('public')->exists($release->file_path)) {
            Storage::disk('public')->delete($release->file_path);
        }

        $release->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rilis aplikasi berhasil dihapus'
        ]);
    }

    /**
     * Download the specified app release.
     */
    public function download(string $id)
    {
        $release = MobileAppRelease::findOrFail($id);

        if (!Storage::disk('public')->exists($release->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan di server.'
            ], 404);
        }

        $path = Storage::disk('public')->path($release->file_path);
        
        return response()->download($path, $release->filename);
    }
}
