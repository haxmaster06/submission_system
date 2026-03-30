<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ChunkedUploadController extends Controller
{
    /**
     * Initialize a chunked upload.
     */
    public function init(Request $request)
    {
        $request->validate([
            'filename' => 'required|string',
            'size'     => 'required|integer',
        ]);

        $uploadId = Str::uuid()->toString();
        $tempDir = 'releases/temp_chunks/' . $uploadId;

        Storage::disk('public')->makeDirectory($tempDir);

        return response()->json([
            'success'   => true,
            'upload_id' => $uploadId,
        ]);
    }

    /**
     * Upload a chunk.
     */
    public function uploadChunk(Request $request, $uploadId)
    {
        $request->validate([
            'chunk_index' => 'required|integer',
            'file'        => 'required|file',
        ]);

        $tempDir = storage_path('app/public/releases/temp_chunks/' . $uploadId);
        
        if (!File::exists($tempDir)) {
            return response()->json([
                'success' => false,
                'message' => 'Upload session not found or expired.',
            ], 404);
        }

        $file = $request->file('file');
        $chunkIndex = $request->chunk_index;
        
        $file->move($tempDir, 'chunk_' . $chunkIndex);

        return response()->json([
            'success'     => true,
            'chunk_index' => $chunkIndex,
        ]);
    }

    /**
     * Complete the upload and merge chunks.
     */
    public function complete(Request $request, $uploadId)
    {
        $request->validate([
            'filename'     => 'required|string',
            'total_chunks' => 'required|integer',
        ]);

        $tempDir = storage_path('app/public/releases/temp_chunks/' . $uploadId);
        
        if (!File::exists($tempDir)) {
            return response()->json([
                'success' => false,
                'message' => 'Upload session not found.',
            ], 404);
        }

        $finalPath = storage_path('app/public/releases/temp_chunks/' . $uploadId . '_merged');
        $out = fopen($finalPath, 'wb');

        for ($i = 0; $i < $request->total_chunks; $i++) {
            $chunkPath = $tempDir . '/chunk_' . $i;
            if (!File::exists($chunkPath)) {
                fclose($out);
                unlink($finalPath);
                return response()->json([
                    'success' => false,
                    'message' => "Missing chunk $i",
                ], 422);
            }

            $in = fopen($chunkPath, 'rb');
            while ($buff = fread($in, 4096)) {
                fwrite($out, $buff);
            }
            fclose($in);
        }

        fclose($out);

        // Clean up chunks
        File::deleteDirectory($tempDir);

        // Hand over to MobileAppReleaseController logic but we need to mock a Request or call its logic
        // For simplicity, we manually call the store logic here or in MobileAppReleaseController
        
        return response()->json([
            'success'   => true,
            'temp_path' => $uploadId . '_merged',
            'filename'  => $request->filename,
        ]);
    }
}
