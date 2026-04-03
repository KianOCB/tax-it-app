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

// --- Vehicle API ---
export const getVehicles = () => api.get<any[]>('/api/vehicles');
export const addVehicle = (data: Record<string, unknown>) => api.post<any>('/api/vehicles', data);
export const updateVehicle = (id: string, data: Record<string, unknown>) =>
  api.put<any>(`/api/vehicles/${id}`, data);
export const deleteVehicle = (id: string) => api.delete(`/api/vehicles/${id}`);

// --- Logbook API ---
export const getLogbookEntries = (month?: string, vehicleId?: string) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (vehicleId) params.set('vehicle_id', vehicleId);
  const qs = params.toString();
  return api.get<any[]>(`/api/logbook${qs ? `?${qs}` : ''}`);
};
export const addLogbookEntry = (data: Record<string, unknown>) =>
  api.post<any>('/api/logbook', data);
export const deleteLogbookEntry = (id: string) => api.delete(`/api/logbook/${id}`);
export const getLogbookSummary = (month?: string, vehicleId?: string) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (vehicleId) params.set('vehicle_id', vehicleId);
  const qs = params.toString();
  return api.get<any>(`/api/logbook/summary${qs ? `?${qs}` : ''}`);
};

// --- Tax API ---
export const getTaxDashboard = () => api.get<any>('/api/tax/dashboard');
export const getTaxCalculation = (vehicleId: string, period: string) =>
  api.get<any>(`/api/tax/calculate?vehicle_id=${vehicleId}&period=${period}`);
export const getVat201 = (periodStart: string, periodEnd: string) =>
  api.get<any>(`/api/tax/vat201?period_start=${periodStart}&period_end=${periodEnd}`);
export const getProvisionalTax = (year: number) =>
  api.get<any>(`/api/tax/provisional?year=${year}`);

// --- Reports API ---
export const generateReport = (type: string, params: Record<string, unknown>) =>
  api.post<any>(`/api/reports/${type}`, params);
export const getReports = () => api.get<any[]>('/api/reports');
export const getReportDownloadUrl = (reportId: string) =>
  `https://tax-it-api-production.up.railway.app/api/reports/${reportId}/download`;

// --- Billing API ---
export const getSubscription = () => api.get<any>('/api/billing/subscription');
export const subscribe = (plan: string, billingPeriod: string) =>
  api.post<any>('/api/billing/subscribe', { plan, billing_period: billingPeriod });
export const cancelSubscription = () => api.post<any>('/api/billing/cancel', {});
export const getCheckoutUrl = (plan: string) =>
  api.post<{ url: string }>('/api/billing/checkout', { plan });

// --- Notifications API ---
export const getNotifications = () => api.get<any[]>('/api/auth/notifications');
export const markNotificationRead = (id: string) => api.post<any>(`/api/auth/notifications/${id}/read`, {});
export const getUnreadCount = () => api.get<{ count: number }>('/api/auth/notifications/unread-count');

// --- Income API ---
export const addIncome = (data: Record<string, unknown>) => api.post<any>('/api/income', data);
export const getIncomeRecords = (month?: string, platform?: string) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (platform) params.set('platform', platform);
  const qs = params.toString();
  return api.get<any[]>(`/api/income${qs ? `?${qs}` : ''}`);
};
export const getIncomeSummary = (month?: string) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  const qs = params.toString();
  return api.get<any>(`/api/income/summary${qs ? `?${qs}` : ''}`);
};
export const updateIncome = (id: string, data: Record<string, unknown>) =>
  api.put<any>(`/api/income/${id}`, data);
export const deleteIncome = (id: string) => api.delete(`/api/income/${id}`);

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
