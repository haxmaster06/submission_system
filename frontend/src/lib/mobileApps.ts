import api from './api';

export interface MobileAppRelease {
  id: number;
  platform: 'android' | 'ios';
  version: string;
  filename: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export const mobileAppsApi = {
  getAll: async (activeOnly: boolean = false, page?: number) => {
    const params: any = {};
    if (activeOnly) params.active_only = true;
    if (page) params.page = page;
    const res = await api.get<any>(
      '/mobile-apps', { params }
    );
    return res.data;
  },
  
  create: async (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    const res = await api.post<{ success: boolean; message: string; data: MobileAppRelease }>(
      '/mobile-apps',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return res.data;
  },

  createChunked: async (file: File, metadata: any, onProgress?: (pct: number) => void) => {
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB for smoother progress on slow connections
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    // 1. Initialize
    const initRes = await api.post<{ upload_id: string }>('/chunked-upload/init', {
      filename: file.name,
      size: file.size
    });
    const uploadId = initRes.data.upload_id;

    // Give immediate feedback that init succeeded
    if (onProgress) onProgress(1);

    // 2. Upload Chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk_index', i.toString());
      formData.append('file', chunk, file.name);

      // Simple retry logic (up to 3 times)
      let retries = 0;
      let success = false;
      while (retries < 3 && !success) {
        try {
          await api.post(`/chunked-upload/${uploadId}/chunk`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              if (onProgress && progressEvent.total) {
                // Calculate how much of the current chunk is uploaded (0 to 1)
                const chunkProgress = progressEvent.loaded / progressEvent.total;
                // Calculate overall percentage (chunks represent 1% to 90% of total progress)
                // We reserve the first 1% for init, and the last 10% for complete/merge.
                const overallPct = 1 + Math.round(((i + chunkProgress) / totalChunks) * 89);
                onProgress(Math.min(90, Math.max(1, overallPct)));
              }
            }
          });
          success = true;
        } catch (err) {
          retries++;
          if (retries >= 3) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    // 3. Complete (Merge chunks)
    const completeRes = await api.post<{ temp_path: string }> (
      `/chunked-upload/${uploadId}/complete`,
      { filename: file.name, total_chunks: totalChunks }
    );

    // 4. Save Release Metadata
    const finalRes = await api.post<{ success: boolean; message: string; data: MobileAppRelease }>(
      '/mobile-apps/chunked',
      {
        ...metadata,
        temp_path: completeRes.data.temp_path,
        filename: file.name
      }
    );

    if (onProgress) onProgress(100);
    return finalRes.data;
  },
  
  update: async (id: number, data: { version?: string; description?: string; is_active?: boolean }) => {
    const res = await api.put<{ success: boolean; message: string }>(`/mobile-apps/${id}`, data);
    return res.data;
  },
  
  delete: async (id: number) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/mobile-apps/${id}`);
    return res.data;
  },

  getDownloadUrl: (id: number) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/mobile-apps/download/${id}`;
  }
};
