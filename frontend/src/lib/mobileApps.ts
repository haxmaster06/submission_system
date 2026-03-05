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
    const res = await api.get<{ success: boolean; data: any }>(
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
