import api from '@/lib/axios';

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.url;
}
