import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Clock,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AnalysisResult } from '../types';
import {
  getLocalHistory,
  deleteLocalHistoryRecord,
  clearAllLocalHistory,
  HistoryRecord,
} from '../utils/historyManager';

export interface HistoryItem {
  id: string;
  cacheKey?: string;
  title: string;
  systemNameKo: string;
  confidence: number;
  createdAt: string;
  imageBase64: string;
  analysisData?: AnalysisResult;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryItem: (imageBase64: string, analysisData: AnalysisResult) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectHistoryItem,
}) => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    // 1. Load from browser localStorage first
    const localItems = getLocalHistory();
    let combined: HistoryItem[] = [...localItems];

    try {
      // 2. Fetch from server API if available
      const res = await fetch('/api/history');
      const json = await res.json();
      if (json.success && Array.isArray(json.history)) {
        // Merge without duplicating IDs or cacheKeys
        json.history.forEach((srvItem: HistoryItem) => {
          if (!combined.some((c) => c.id === srvItem.id || (srvItem.cacheKey && c.cacheKey === srvItem.cacheKey))) {
            combined.push(srvItem);
          }
        });
      }
    } catch (err) {
      console.warn('Server history fetch notice:', err);
    } finally {
      setHistoryList(combined);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleSelect = async (item: HistoryItem) => {
    setLoadingItemId(item.id);
    try {
      // If item has analysisData in local record, use it immediately!
      if (item.analysisData) {
        onSelectHistoryItem(item.imageBase64, item.analysisData);
        onClose();
        return;
      }

      // Check if it's in localStorage
      const localRecords = getLocalHistory();
      const matched = localRecords.find((r) => r.id === item.id || (item.cacheKey && r.cacheKey === item.cacheKey));
      if (matched && matched.analysisData) {
        onSelectHistoryItem(matched.imageBase64, matched.analysisData);
        onClose();
        return;
      }

      // Fallback: Fetch from server API
      const res = await fetch(`/api/history/${item.id}`);
      const json = await res.json();
      if (json.success && json.item) {
        onSelectHistoryItem(json.item.imageBase64, json.item.analysisData);
        onClose();
      }
    } catch (err) {
      console.error('Failed to load history item:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('이 포스터 분석 히스토리를 삭제하시겠습니까?')) return;
    deleteLocalHistoryRecord(id);
    setHistoryList((prev) => prev.filter((h) => h.id !== id));

    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server item delete notice:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('모든 분석 히스토리 기록을 삭제하시겠습니까?')) return;
    clearAllLocalHistory();
    setHistoryList([]);

    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch (err) {
      console.warn('Server history clear notice:', err);
    }
  };

  const filteredList = historyList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.systemNameKo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0F1015] border border-[#232733] text-white rounded-xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-6 max-h-[90vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C93A6] hover:text-white p-1.5 rounded-lg hover:bg-[#1C202B] transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="pb-4 border-b border-[#232733] shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#10B981]" />
              <span>POSTER ANALYSIS HISTORY</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#10B981]" />
            <span>포스터 분석 히스토리 (History)</span>
          </h2>
          <p className="text-xs text-[#8C93A6] mt-1">
            이전에 분석했던 포스터 분석 결과를 빠르게 다시 확인하고 불러옵니다.
          </p>
        </div>

        {/* Toolbar: Search & Refresh & Clear */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#5C6479] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="포스터 제목/그리드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141721] border border-[#232733] rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#5C6479] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs font-mono">
            <button
              onClick={fetchHistory}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#161821] hover:bg-[#1E2230] border border-[#232733] text-[#8C93A6] hover:text-white rounded transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>

            {historyList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/30 text-[#FF6B60] rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>전체 삭제</span>
              </button>
            )}
          </div>
        </div>

        {/* History Item Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-[280px]">
          {isLoading && historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#8C93A6] space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#10B981]" />
              <p className="text-xs font-mono">히스토리 목록 불러오는 중...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-[#141721] border border-[#232733] rounded-lg">
              <AlertCircle className="w-8 h-8 text-[#5C6479]" />
              <div>
                <p className="text-sm font-bold text-white font-mono">저장된 분석 히스토리가 없습니다.</p>
                <p className="text-xs text-[#8C93A6] mt-1">
                  포스터 이미지를 업로드하고 분석하면 여기에 저장되어 재활용할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group relative p-3.5 bg-[#141721] hover:bg-[#1A1E2B] border border-[#232733] hover:border-[#10B981]/50 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail Image */}
                  <div className="w-16 h-20 sm:w-14 sm:h-18 bg-black border border-[#232733] rounded overflow-hidden shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                    <img
                      src={item.imageBase64}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Poster Metadata */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded">
                        {item.systemNameKo}
                      </span>
                      <span className="text-[10px] font-mono text-[#8C93A6] bg-[#0F1015] border border-[#232733] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#5C6479]" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#38BDF8]" />
                        저장됨
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors truncate font-mono">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#8C93A6] font-mono">
                      신뢰도 <span className="text-white font-bold">{item.confidence}%</span>
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-[#5C6479] hover:text-[#FF6B60] hover:bg-[#FF3B30]/10 rounded transition-colors"
                    title="히스토리에서 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    disabled={loadingItemId === item.id}
                    className="flex items-center gap-1.5 bg-[#10B981] hover:bg-[#0D9668] text-white font-mono font-bold text-xs px-3.5 py-2 rounded transition-all active:scale-95 shadow-md"
                  >
                    {loadingItemId === item.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>불러오기</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t border-[#232733] flex items-center justify-between shrink-0 text-xs text-[#5C6479] font-mono">
          <span>총 {historyList.length}개의 분석 결과 저장됨</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161821] hover:bg-[#232733] text-white rounded transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
