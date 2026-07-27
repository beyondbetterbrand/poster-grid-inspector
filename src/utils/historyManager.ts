import { AnalysisResult } from '../types';

export interface HistoryRecord {
  id: string;
  cacheKey?: string;
  title: string;
  systemNameKo: string;
  confidence: number;
  createdAt: string;
  imageBase64: string;
  analysisData: AnalysisResult;
}

const STORAGE_KEY = 'poster_inspector_history_v1';

export const getLocalHistory = (): HistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read history from localStorage:', err);
    return [];
  }
};

/**
 * Compresses base64 image to lightweight JPEG to avoid hitting localStorage 5MB limit
 */
export const compressBase64Image = (base64: string, maxWidth = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64 || !base64.startsWith('data:image')) {
      return resolve(base64);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};

export const saveLocalHistoryRecord = async (record: HistoryRecord): Promise<HistoryRecord[]> => {
  try {
    // 1. Compress image Base64 to lightweight JPEG if it's large
    if (record.imageBase64 && record.imageBase64.length > 200000) {
      try {
        record.imageBase64 = await compressBase64Image(record.imageBase64, 800, 0.75);
      } catch (e) {
        console.warn('Image compression failed, proceeding with original:', e);
      }
    }

    const current = getLocalHistory();
    // Prevent duplicates by cacheKey or ID
    const filtered = current.filter(
      (item) =>
        (record.cacheKey && item.cacheKey === record.cacheKey) ||
        item.id === record.id
    );

    let updated = [record, ...current.filter((i) => !filtered.includes(i))].slice(0, 30);

    // 2. Safe setItem loop with eviction on QuotaExceededError
    while (updated.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      } catch (err) {
        // If quota exceeded, drop oldest history item and try again
        if (updated.length > 1) {
          updated.pop();
        } else {
          break;
        }
      }
    }
    return getLocalHistory();
  } catch (err) {
    console.warn('Failed to save history to localStorage:', err);
    return getLocalHistory();
  }
};

export const deleteLocalHistoryRecord = (id: string): HistoryRecord[] => {
  try {
    const current = getLocalHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete history item from localStorage:', err);
    return getLocalHistory();
  }
};

export const clearAllLocalHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear local history:', err);
  }
};

