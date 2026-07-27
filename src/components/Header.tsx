import React from 'react';
import { Grid, FileDown, Sparkles, RefreshCw, Upload, BookOpen, History } from 'lucide-react';

interface HeaderProps {
  onOpenExportModal: () => void;
  onOpenManualModal?: () => void;
  onOpenHistoryModal?: () => void;
  onReanalyzeAi?: () => void;
  onUploadClick?: () => void;
  hasImage: boolean;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExportModal,
  onOpenManualModal,
  onOpenHistoryModal,
  onReanalyzeAi,
  onUploadClick,
  hasImage,
  isAnalyzing,
}) => {
  return (
    <header className="bg-[#0F1015] border-b border-[#232733] text-white px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title - Indie Swiss Studio Style */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF3B30] text-black font-extrabold flex items-center justify-center border border-white/20 shadow-md">
            <Grid className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-mono uppercase">
              POSTER GRID INSPECTOR
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenHistoryModal && (
            <button
              onClick={onOpenHistoryModal}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3.5 py-2 bg-[#1A1D26] hover:bg-[#252A38] text-[#10B981] border border-[#10B981]/30 transition-all active:scale-95 shadow-sm"
              title="이전에 분석했던 포스터 히스토리 목록을 확인하고 불러옵니다"
            >
              <History className="w-4 h-4 text-[#10B981]" />
              <span className="hidden md:inline">분석 히스토리</span>
              <span className="md:hidden">히스토리</span>
            </button>
          )}

          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3.5 py-2 bg-[#1A1D26] hover:bg-[#252A38] text-[#38BDF8] border border-[#38BDF8]/30 transition-all active:scale-95 shadow-sm"
              title="분석 기준, 용어 정의 및 매뉴얼 가이드를 확인합니다"
            >
              <BookOpen className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden md:inline">분석 매뉴얼 Guide</span>
              <span className="md:hidden">매뉴얼</span>
            </button>
          )}

          {hasImage && onUploadClick && (
            <button
              onClick={onUploadClick}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3.5 py-2 bg-[#1A1D26] hover:bg-[#252A38] text-[#C2C8D6] border border-[#2D3345] transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-[#FF3B30]" />
              <span>이미지 변경</span>
            </button>
          )}

          {hasImage && onReanalyzeAi && (
            <button
              onClick={onReanalyzeAi}
              disabled={isAnalyzing}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3.5 py-2 transition-all border ${
                isAnalyzing
                  ? 'bg-[#181B24] text-[#5C6479] border-[#2A2E3B] cursor-not-allowed'
                  : 'bg-[#FF3B30]/15 hover:bg-[#FF3B30]/25 text-[#FF6B60] border-[#FF3B30]/40 active:scale-95'
              }`}
              title="포스터를 Gemini Vision AI로 다시 분석합니다"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#FF3B30]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#FF3B30]" />
              )}
              <span className="hidden sm:inline">AI 비전 스캔</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            disabled={!hasImage || isAnalyzing}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-4 py-2 transition-all shadow-md ${
              hasImage && !isAnalyzing
                ? 'bg-[#FF3B30] hover:bg-[#E03126] text-white active:scale-95'
                : 'bg-[#181B24] text-[#484E61] cursor-not-allowed border border-[#232733]'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>SVG 내보내기</span>
          </button>
        </div>
      </div>
    </header>
  );
};


