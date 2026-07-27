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

export const saveLocalHistoryRecord = (record: HistoryRecord): HistoryRecord[] => {
  try {
    const current = getLocalHistory();
    // Prevent duplicates by cacheKey or ID or title
    const filtered = current.filter(
      (item) =>
        (record.cacheKey && item.cacheKey === record.cacheKey) ||
        item.id === record.id
    );
    const updated = [record, ...current.filter((i) => !filtered.includes(i))].slice(0, 35);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
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
