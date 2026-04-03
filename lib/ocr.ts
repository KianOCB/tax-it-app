import { Platform } from 'react-native';

export interface OcrResult {
  text: string;
  source: 'on-device' | 'server';
}

async function recognizeOnDevice(imageUri: string): Promise<OcrResult> {
  const TextRecognition = require('@react-native-ml-kit/text-recognition').default;
  const result = await TextRecognition.recognize(imageUri);
  return { text: result.text, source: 'on-device' };
}

async function recognizeOnServer(imageUri: string): Promise<OcrResult> {
  const { supabase } = require('./supabase');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(imageUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, 'receipt.jpg');

  const API_BASE = 'https://tax-it-api-production.up.railway.app';
  const res = await fetch(`${API_BASE}/api/receipts/ocr`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`OCR API error: ${res.status}`);
  }

  const json = await res.json();
  return { text: json.text, source: 'server' };
}

export async function recognizeText(imageUri: string): Promise<OcrResult> {
  if (Platform.OS === 'web') {
    return recognizeOnServer(imageUri);
  }
  return recognizeOnDevice(imageUri);
}
