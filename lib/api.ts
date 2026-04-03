import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';

const API_BASE = 'https://tax-it-api-production.up.railway.app';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function uploadReceipt(
  imageUri: string,
  receiptData: {
    merchant_name: string | null;
    date: string | null;
    total_amount: number | null;
    vat_amount: number | null;
    excl_vat_amount: number | null;
    vat_number: string | null;
    category_id: string | null;
    line_items: { description: string; amount: number }[];
  },
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload image to Supabase Storage
  const uuid = Crypto.randomUUID();
  const filePath = `${user.id}/${uuid}.jpg`;

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, blob, { contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath);

  // Create receipt record via API
  const record = await api.post('/api/receipts', {
    ...receiptData,
    image_url: urlData.publicUrl,
    storage_path: filePath,
  });

  return record;
}
