<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SignatureController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'signature' => 'required', // Base64 string or file object
            'type' => 'required|in:upload,canvas',
        ]);

        $user = Auth::user();
        $signature = $request->input('signature');
        $type = $request->input('type');
        $fileName = null;

        // Do NOT delete the old signature file here.
        // If we delete it, older submission PDFs that referenced the previous
        // signature path in `submission_approvals.signature_used` will break.

        if ($type === 'canvas') {
            $imageData = preg_replace('#^data:image/\w+;base64,#i', '', $signature);
            $imageContent = base64_decode($imageData);
            $fileName = 'signatures/' . $user->id . '_' . time() . '.png';
            Storage::disk('public')->put($fileName, $imageContent);
        }
        else {
            // Handle actual file upload
            if ($request->hasFile('signature')) {
                $file = $request->file('signature');
                $fileName = $file->storeAs('signatures', $user->id . '_' . time() . '.' . $file->getClientOriginalExtension(), 'public');
            }
            else if (is_string($signature) && !str_starts_with($signature, 'data:image')) {
                // If it's already a path (shouldn't happen with proper upload), just use it
                $fileName = $signature;
            }
        }

        if (!$fileName) {
            return response()->json(['message' => 'Gagal memproses file tanda tangan.'], 422);
        }

        $user->update([
            'signature_path' => $fileName,
            'signature_type' => $type,
        ]);

        return response()->json([
            'message' => 'Signature updated successfully',
            'signature_path' => Storage::url($fileName),
        ]);
    }

    public function destroy()
    {
        try {
            \Illuminate\Support\Facades\Log::info('Delete signature request for user ID: ' . Auth::id());
            $user = Auth::user();

            if ($user->signature_path) {
                // Ensure we use the relative path for deletion
                $relativePath = str_contains($user->signature_path, 'storage/')
                    ? explode('storage/', $user->signature_path)[1]
                    : $user->signature_path;

                Storage::disk('public')->delete($relativePath);
            }

            $user->update([
                'signature_path' => null,
                'signature_type' => null,
            ]);

            return response()->json(['message' => 'Signature deleted successfully']);
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Signature delete error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat menghapus: ' . $e->getMessage()], 500);
        }
    }

    public function show()
    {
        $user = Auth::user();
        return response()->json([
            'signature_path' => $user->signature_path ?Storage::url($user->signature_path) : null,
            'signature_type' => $user->signature_type,
        ]);
    }
}