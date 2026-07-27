import React, { useState, useEffect } from 'react';
import { X, Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Clock, Zap, HelpCircle } from 'lucide-react';

interface ApiStatusData {
  success: boolean;
  status: 'ONLINE' | 'RATE_LIMITED' | 'NO_KEY' | 'ERROR';
  quotaType?: 'RPM' | 'RPD' | 'GENERAL';
  latencyMs?: number;
  message: string;
  detail?: string;
  keyCount?: number;
  rawError?: string;
  timestamp?: string;
}

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReanalyzeAi?: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose, onReanalyzeAi }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<ApiStatusData | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/check-status');
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({
        success: false,
        status: 'ERROR',
        message: '서버와 통신할 수 없습니다.',
        detail: err?.message || '네트워크 연결 상태를 확인해주세요.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1015] border border-[#232733] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden font-mono text-white flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#141721] border-b border-[#232733] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-sm font-bold tracking-wider uppercase">
              Gemini API 실시간 상태 진단
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#232733] rounded text-[#A0A7BA] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status Display Box */}
          <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#232733] pb-3">
              <span className="text-xs text-[#A0A7BA] font-bold">API 연결 및 응답 상태</span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-1.5 text-[11px] bg-[#1C202B] hover:bg-[#282E3E] text-[#38BDF8] border border-[#38BDF8]/30 px-2.5 py-1 rounded transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? '테스트 중...' : '실시간 상태 조회'}</span>
              </button>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#38BDF8]">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Google Gemini 서버 핑 테스트 수행 중...</span>
              </div>
            ) : statusData ? (
              <div className="space-y-3">
                {/* Main Status Pill */}
                <div className="flex items-center gap-3">
                  {statusData.status === 'ONLINE' ? (
                    <div className="flex items-center gap-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-3 py-1.5 rounded-md font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🟢 정상 수신 가능 (ONLINE)</span>
                    </div>
                  ) : statusData.status === 'RATE_LIMITED' ? (
                    <div className="flex items-center gap-2 bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 px-3 py-1.5 rounded-md font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>🔴 한도 초과 상태 (429 QUOTA_EXCEEDED)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-3 py-1.5 rounded-md font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>⚠️ 연결 또는 설정 에러 ({statusData.status})</span>
                    </div>
                  )}

                  {statusData.latencyMs !== undefined && (
                    <span className="text-[11px] text-[#A0A7BA] bg-[#0D0F16] px-2 py-1 rounded border border-[#232733]">
                      응답속도: <strong className="text-white">{statusData.latencyMs}ms</strong>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {statusData.message}
                </p>

                {statusData.detail && (
                  <div className="p-3 bg-[#0D0F16] border border-[#232733] rounded text-[11px] text-[#A0A7BA] leading-relaxed">
                    <strong>세부 진단:</strong> {statusData.detail}
                  </div>
                )}

                {statusData.timestamp && (
                  <div className="text-[10px] text-[#71788B] text-right">
                    최종 조회 시각: {new Date(statusData.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Quota Rules Reference Card */}
          <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold border-b border-[#232733] pb-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span>Gemini 무료 티어 한도 및 정확한 리셋 타임</span>
            </div>

            <div className="space-y-2 text-[11px] text-[#A0A7BA] leading-relaxed font-sans">
              <div className="p-2.5 bg-[#0D0F16] rounded border border-[#232733] space-y-1">
                <span className="text-[#38BDF8] font-mono font-bold block">1. 분당 한도 (RPM: Requests Per Minute)</span>
                <p>
                  • <strong>초당/분당 제한(15회/분)</strong> 초과 시 발생합니다.<br />
                  • <strong>약 60초~90초 후</strong> 자동 해제되어 다시 스캔할 수 있습니다.
                </p>
              </div>

              <div className="p-2.5 bg-[#0D0F16] rounded border border-[#232733] space-y-1">
                <span className="text-[#F59E0B] font-mono font-bold block">2. 일일 한도 (RPD: Requests Per Day)</span>
                <p>
                  • 하루 총 무료 사용량(1,500회) 소진 시 60초가 지나도 안 됩니다.<br />
                  • <strong>매일 한국시간 오후 4시 (미국 PST 자정)</strong>에 완충 초기화됩니다.
                </p>
              </div>

              <div className="p-2.5 bg-[#0D0F16] rounded border border-[#232733] space-y-1">
                <span className="text-[#10B981] font-mono font-bold block">3. 이전 스캔 히스토리 활용</span>
                <p>
                  이미 한 번 분석된 이미지 결과는 API 호출 없이 <strong>[분석 히스토리]</strong>에서 즉시 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#141721] border-t border-[#232733] flex items-center justify-between gap-3">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#C2C8D6] bg-[#1C202B] hover:bg-[#282E3E] border border-[#3A3F52] px-3.5 py-2 rounded transition-all active:scale-95 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>재검사</span>
          </button>

          <div className="flex items-center gap-2">
            {statusData?.status === 'ONLINE' && onReanalyzeAi && (
              <button
                onClick={() => {
                  onClose();
                  onReanalyzeAi();
                }}
                className="bg-[#10B981] hover:bg-[#0D9668] text-white font-bold px-4 py-2 text-xs uppercase transition-all shadow flex items-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>AI 스캔 즉시 실행</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-[#232733] hover:bg-[#2E3444] text-white font-bold px-4 py-2 text-xs uppercase transition-all active:scale-95"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
