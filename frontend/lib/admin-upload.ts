import api from '@/lib/axios';
import axios from 'axios';

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data.url;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const message = (err.response?.data as { error?: string } | undefined)?.error;
      throw new Error(message || 'Image upload failed');
    }

    throw new Error('Image upload failed');
  }
}
