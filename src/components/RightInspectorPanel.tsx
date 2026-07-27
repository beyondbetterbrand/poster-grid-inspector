import React, { useState, useEffect } from 'react';
import { AnalysisResult, GridParams } from '../types';
import { optimizeGridToElements } from '../utils/gridOptimizer';
import { formatTypeHierarchyRating } from '../utils/imageUtils';
import {
  Layers,
  Palette,
  Eye,
  Sparkles,
  CheckCircle2,
  Award,
  Sliders,
  FileText,
  Compass,
  Clock,
  Loader2,
  RotateCcw,
  AlertCircle,
  Zap,
  RefreshCw,
  Timer,
  HelpCircle,
} from 'lucide-react';

interface RightInspectorPanelProps {
  analysis: AnalysisResult | null;
  hoveredElementId: string | null;
  onHoverElement: (id: string | null) => void;
  isAnalyzing: boolean;
  isAiAnalyzed?: boolean;
  analysisError?: string | null;
  onReanalyzeAi?: () => void;
  onRunLocalAnalysis?: () => void;
  gridParams: GridParams;
  onChangeParams: (newParams: GridParams) => void;
  onResetGridParams?: () => void;
  onOpenManualModal?: () => void;
  onOpenHistoryModal?: () => void;
}

const COLOR_PRESETS = [
  { name: '스위스 레드', hex: '#FF3B30' },
  { name: '일렉트릭 시안', hex: '#00F0FF' },
  { name: '에메랄드 라임', hex: '#10B981' },
  { name: '앰버 오렌지', hex: '#F59E0B' },
  { name: '모노 화이트', hex: '#FFFFFF' },
];

const AnalysisLoadingView: React.FC = () => {
  const [progress, setProgress] = useState(5);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const diff = Math.max(1, Math.floor((95 - prev) / 8));
        return prev + diff;
      });
      setElapsed((prev) => Math.round((prev + 0.5) * 10) / 10);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const getStepText = (prog: number) => {
    if (prog < 35) return '1단계: AI 비전 OCR & 포스터 레이아웃 요소 인지 중...';
    if (prog < 70) return '2단계: 스위스 모듈 컬럼 & 여백 베이스라인 계산 중...';
    return '3단계: 그리드 후보군 매칭 및 타이포그래피 리포트 생성 중...';
  };

  return (
    <div className="bg-[#0F1015] border border-[#232733] p-6 sm:p-8 text-center text-[#8C93A6] flex flex-col items-center justify-center gap-6 min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full sticky top-4">
      {/* Animated Spinner Icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#232733] border-t-[#FF3B30] animate-spin" />
        <Sparkles className="w-7 h-7 text-[#FF3B30] absolute" />
      </div>

      <div className="space-y-3 w-full max-w-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#FF3B30] font-bold tracking-wider flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            SWISS_VISION_AI_SCANNING
          </span>
          <span className="text-white font-bold font-mono text-sm">{progress}%</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#181A22] h-3 border border-[#2B3040] overflow-hidden relative shadow-inner">
          <div
            className="bg-gradient-to-r from-[#FF3B30] via-[#FF6B00] to-[#FF3B30] h-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white animate-pulse shadow-[0_0_8px_#FFFFFF]" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#161821] border border-[#232733] p-2.5 text-[11px] text-[#C2C8D6] font-mono text-left flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping shrink-0" />
          <p className="leading-tight">{getStepText(progress)}</p>
        </div>
      </div>

      {/* Time Notice Card */}
      <div className="bg-[#141620] border border-[#2B3040] p-4 text-left space-y-2 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <Clock className="w-4 h-4 text-[#FF3B30] shrink-0" />
            <span>분석 소요 시간 안내</span>
          </div>
          <span className="text-[10px] font-mono text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 border border-[#FF3B30]/30 font-bold">
            약 5초 ~ 10초
          </span>
        </div>
        <p className="text-[11px] text-[#A2A9B8] font-sans leading-relaxed">
          실제 포스터 텍스트 배치, 이미지 영역 및 여백 수치를 정밀 분석 중입니다.
          (진행 시간: <span className="text-white font-bold font-mono">{elapsed}초</span>)
        </p>
        <div className="pt-1 border-t border-[#232733] text-[10px] text-[#6C748A] font-sans">
          💡 무료 API 환경에서 이용자가 몰릴 경우 약간의 대기 시간이 추가될 수 있습니다.
        </div>
      </div>
    </div>
  );
};

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  analysis,
  hoveredElementId,
  onHoverElement,
  isAnalyzing,
  isAiAnalyzed = true,
  analysisError,
  onReanalyzeAi,
  onRunLocalAnalysis,
  gridParams,
  onChangeParams,
  onResetGridParams,
  onOpenManualModal,
  onOpenHistoryModal,
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'elements' | 'options' | 'report'>('candidates');

  const updateParam = <K extends keyof GridParams>(key: K, value: GridParams[K]) => {
    onChangeParams({
      ...gridParams,
      [key]: value,
    });
  };

  if (isAnalyzing) {
    return <AnalysisLoadingView />;
  }

  if (!analysis) {
    if (analysisError) {
      return (
        <QuotaErrorView
          analysisError={analysisError}
          onOpenHistoryModal={onOpenHistoryModal}
          onReanalyzeAi={onReanalyzeAi}
        />
      );
    }

    return (
      <div className="bg-[#0F1015] border border-[#232733] p-6 text-center text-[#5C6479] flex flex-col items-center justify-center gap-2 min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full">
        <Layers className="w-8 h-8 text-[#3A3F52] mb-1" />
        <p className="text-xs font-mono font-bold text-[#C2C8D6] uppercase">NO_GRID_DATA_LOADED</p>
        <p className="text-[11px] text-[#8C93A6]">
          포스터 이미지를 올려주시거나 아카이브 샘플을 선택하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1015] border border-[#232733] text-white p-5 sm:p-6 shadow-2xl flex flex-col min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full sticky top-4">
      {/* Panel Top Title Header */}
      <div className="pb-3.5 border-b border-[#232733] shrink-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2.5 py-1 uppercase whitespace-nowrap shrink-0">
              {analysis.systemNameKo}
            </span>
            <span className="text-xs font-mono text-[#8C93A6] bg-[#161821] px-2 py-1 border border-[#232733] whitespace-nowrap shrink-0">
              신뢰도 {analysis.confidence <= 1 ? Math.round(analysis.confidence * 100) : Math.round(analysis.confidence)}%
            </span>
          </div>

          {analysis.typeHierarchyRating && (
            <div
              className="flex items-center gap-1.5 bg-[#161821] px-2.5 py-1 border border-[#232733] max-w-full"
              title={formatTypeHierarchyRating(analysis.typeHierarchyRating)}
            >
              <Award className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="text-xs font-mono font-bold text-[#F59E0B] break-words">
                {formatTypeHierarchyRating(analysis.typeHierarchyRating)}
              </span>
            </div>
          )}
        </div>

        <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug font-mono uppercase tracking-wide break-words" title={analysis.title}>
          {analysis.title}
        </h2>
      </div>

      {/* AI Vision Status Banner */}
      {onReanalyzeAi && (
        <div className="mt-2.5 shrink-0">
          {!isAiAnalyzed || analysisError ? (
            <div className="bg-[#2A1D15] border border-[#F59E0B]/40 p-3 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0 space-y-0.5">
                <span className="font-mono font-bold text-[#F59E0B] block text-xs uppercase">
                  [CANVAS_SMART_VISION_ACTIVE]
                </span>
                <span className="text-xs text-[#D1D5DB] block truncate">
                  {analysisError || '실물 포스터 이미지 기반 캔버스 스마트 비전 밀착 적용'}
                </span>
              </div>
              <button
                onClick={onReanalyzeAi}
                className="shrink-0 bg-[#FF3B30] hover:bg-[#E03126] text-white font-mono font-bold px-3 py-1.5 text-xs uppercase transition-all active:scale-95 flex items-center gap-1 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 스캔</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#12221A] border border-[#10B981]/40 p-3 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#10B981] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>AI OCR 인지 완료 ({analysis.detectedElements.length}개 요소 추출)</span>
                </span>
                <button
                  onClick={onReanalyzeAi}
                  className="text-[#8C93A6] hover:text-white underline text-xs shrink-0"
                >
                  재스캔
                </button>
              </div>
              <p className="text-xs text-[#C2C8D6] font-sans leading-relaxed">
                포스터 내 핵심 텍스트와 이미지 위치를 인지하여, 외곽 마진(좌우:{gridParams.marginLeft}% / 상하:{gridParams.marginTop}%)과 {gridParams.columns}컬럼 세로축 그리드를 자동으로 산출했습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 my-3.5 bg-[#14161F] p-1.5 border border-[#232733] shrink-0 text-xs font-mono">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`py-2 px-1.5 font-bold transition-all flex items-center justify-center gap-1.5 uppercase ${
            activeTab === 'candidates'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>그리드 가설</span>
        </button>

        <button
          onClick={() => setActiveTab('elements')}
          className={`py-2 px-1.5 font-bold transition-all flex items-center justify-center gap-1.5 uppercase ${
            activeTab === 'elements'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>요소 위치</span>
        </button>

        <button
          onClick={() => setActiveTab('options')}
          className={`py-2 px-1.5 font-bold transition-all flex items-center justify-center gap-1.5 uppercase ${
            activeTab === 'options'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>직접 조정</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`py-2 px-1.5 font-bold transition-all flex items-center justify-center gap-1.5 uppercase ${
            activeTab === 'report'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>분석 요약</span>
        </button>
      </div>

      {/* Main Tab Contents Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono text-xs custom-scrollbar">
        {/* TAB 1: Grid Candidates Hypothesis Comparison */}
        {activeTab === 'candidates' && (
          <div className="space-y-3">
            <div className="bg-[#141621] p-3 border border-[#232733] text-xs text-[#C2C8D6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-white uppercase text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
                  <span>GRID_HYPOTHESIS_SIMULATION</span>
                </span>
                <span className="text-[9px] bg-[#FF3B30]/20 text-[#FF3B30] px-1.5 py-0.5 border border-[#FF3B30]/30 font-bold">
                  {analysis?.candidateGrids?.length || 0} HYPOTHESES
                </span>
              </div>
              <p className="text-[11px] text-[#8C93A6] font-sans leading-relaxed">
                포스터 이미지 외곽선을 기준으로 도출된 스위스 레이아웃 가설들입니다. 클릭 시 실시간으로 스냅됩니다.
              </p>

              {/* Auto-Snap Button */}
              {analysis?.detectedElements && analysis.detectedElements.length > 0 && (
                <button
                  onClick={() => {
                    const snapped = optimizeGridToElements(analysis.detectedElements, gridParams);
                    onChangeParams(snapped);
                  }}
                  className="w-full mt-1 bg-[#FF3B30] hover:bg-[#E03126] text-white font-bold py-2 px-3 text-[11px] uppercase transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  <Compass className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '6s' }} />
                  <span>AUTO-SNAP TO CONTENT OUTLINES</span>
                </button>
              )}
            </div>

            {/* List of Candidate Grid Cards */}
            <div className="space-y-2">
              {analysis?.candidateGrids?.map((cand) => {
                const isActive =
                  gridParams.columns === cand.gridParams.columns &&
                  gridParams.rows === cand.gridParams.rows &&
                  Math.abs(gridParams.marginLeft - cand.gridParams.marginLeft) < 1.5;

                return (
                  <div
                    key={cand.id}
                    onClick={() => onChangeParams(cand.gridParams)}
                    className={`p-3 border transition-all cursor-pointer space-y-2 ${
                      isActive
                        ? 'bg-[#1C1F2B] border-[#FF3B30] text-white shadow-lg'
                        : 'bg-[#12141C] border-[#232733] text-[#8C93A6] hover:border-[#3A3F52] hover:bg-[#161822]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-2 text-white">
                        <span className={`w-2 h-2 ${isActive ? 'bg-[#FF3B30]' : 'bg-[#3A3F52]'}`} />
                        <span>{cand.name}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                        cand.fitScore >= 90
                          ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                      }`}>
                        FIT: {cand.fitScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#A6ADB8] font-sans leading-relaxed">
                      {cand.rationale}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#8C93A6] pt-1.5 border-t border-[#232733]">
                      <span>GRID: {cand.gridParams.columns}C × {cand.gridParams.rows}R</span>
                      <span>MARGIN: L{cand.gridParams.marginLeft}% / T{cand.gridParams.marginTop}%</span>
                      {isActive && (
                        <span className="text-[#FF3B30] font-bold flex items-center gap-1 uppercase">
                          <CheckCircle2 className="w-3 h-3 text-[#FF3B30]" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Detected Elements List */}
        {activeTab === 'elements' && (
          <div className="space-y-3">
            <div className="bg-[#141621] p-3 border border-[#232733] text-[11px] text-[#A6ADB8] flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-[#FF3B30] shrink-0" />
              <span>
                마우스 커서를 올리면 캔버스 상의 해당 텍스트/이미지 바운딩 박스가 실시간 하이라이트됩니다.
              </span>
            </div>

            <div className="space-y-2">
              {analysis.detectedElements.map((el) => {
                const isHovered = hoveredElementId === el.id;
                return (
                  <div
                    key={el.id}
                    onMouseEnter={() => onHoverElement(el.id)}
                    onMouseLeave={() => onHoverElement(null)}
                    className={`p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isHovered
                        ? 'bg-[#2A1719] border-[#FF3B30] text-white shadow-lg'
                        : 'bg-[#12141C] border-[#232733] text-[#8C93A6] hover:border-[#3A3F52]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold text-[#FF3B30] bg-[#FF3B30]/15 border border-[#FF3B30]/30 px-1.5 py-0.5 uppercase">
                          {el.type}
                        </span>
                        <span className="text-xs font-bold text-white truncate font-sans">{el.label}</span>
                      </div>
                      {el.alignmentNote && (
                        <p className="text-[11px] text-[#8C93A6] font-sans leading-snug">{el.alignmentNote}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-[#C2C8D6] bg-[#1C1F2B] px-2 py-0.5 border border-[#2B3042] block">
                        X:{Math.round(el.x)}% Y:{Math.round(el.y)}%
                      </span>
                      <span className="text-[9px] text-[#5C6479] block mt-0.5">
                        {Math.round(el.width)}×{Math.round(el.height)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Keylines List Section */}
            {analysis.keylines && analysis.keylines.length > 0 && (
              <div className="pt-3 border-t border-[#232733] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                    <span>KEYLINES (포스터 주요 정렬축)</span>
                  </span>
                  <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-1.5 py-0.5 rounded font-mono">
                    청록색 키라인
                  </span>
                </div>
                <p className="text-[11px] text-[#8C93A6] font-sans leading-snug">
                  일반 격자 외에 포스터 내 타이틀/비주얼 분할선 등 <strong>시각적 기준점</strong>이 되는 주요 정렬 축입니다.
                </p>

                <div className="space-y-1.5">
                  {analysis.keylines.map((kl) => (
                    <div
                      key={kl.id}
                      className="p-2.5 bg-[#101720] border border-[#00F0FF]/30 rounded text-xs flex items-center justify-between font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-4 bg-[#00F0FF] rounded-full shrink-0" />
                        <span className="text-white font-bold truncate">{kl.label || '주요 정렬 축'}</span>
                      </div>
                      <span className="text-[#00F0FF] text-[11px] bg-[#00F0FF]/10 px-2 py-0.5 rounded shrink-0">
                        {kl.type === 'vertical' ? '세로' : '가로'} {Math.round(kl.position)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Grid Visualization Options */}
        {activeTab === 'options' && (
          <div className="space-y-4">
            {/* Layer Checkboxes */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>DISPLAY_LAYERS</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
                  <input
                    type="checkbox"
                    checked={gridParams.showColumns}
                    onChange={(e) => updateParam('showColumns', e.target.checked)}
                    className="accent-[#FF3B30]"
                  />
                  <span className="text-[#C2C8D6]">COLUMNS (세로)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
                  <input
                    type="checkbox"
                    checked={gridParams.showRows}
                    onChange={(e) => updateParam('showRows', e.target.checked)}
                    className="accent-[#FF3B30]"
                  />
                  <span className="text-[#C2C8D6]">ROWS (가로)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
                  <input
                    type="checkbox"
                    checked={gridParams.showBoundingBoxes}
                    onChange={(e) => updateParam('showBoundingBoxes', e.target.checked)}
                    className="accent-[#FF3B30]"
                  />
                  <span className="text-[#C2C8D6]">BOUNDING_BOXES</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
                  <input
                    type="checkbox"
                    checked={gridParams.showMargins}
                    onChange={(e) => updateParam('showMargins', e.target.checked)}
                    className="accent-[#FF3B30]"
                  />
                  <span className="text-[#C2C8D6]">MARGINS (여백선)</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
                  <input
                    type="checkbox"
                    checked={gridParams.showKeylines}
                    onChange={(e) => updateParam('showKeylines', e.target.checked)}
                    className="accent-[#FF3B30]"
                  />
                  <span className="text-[#C2C8D6]">KEYLINES (가이드)</span>
                </label>
              </div>
            </div>

            {/* Color Presets */}
            <div className="space-y-2 pt-2 border-t border-[#232733]">
              <span className="block text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>GRID_COLOR_THEME</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_PRESETS.map((p) => {
                  const isSelected = gridParams.color === p.hex;
                  return (
                    <button
                      key={p.hex}
                      onClick={() => updateParam('color', p.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-bold uppercase transition-all ${
                        isSelected
                          ? 'border-[#FF3B30] bg-[#2A1416] text-white'
                          : 'border-[#232733] bg-[#12141C] text-[#8C93A6] hover:bg-[#1A1D27]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 border border-white/20 shrink-0"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Fine-Tuning Controls */}
            <div className="space-y-3 pt-3 border-t border-[#232733]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#FF3B30]" />
                  <span>MANUAL_FINE_TUNING (직접 수치 조정)</span>
                </span>

                {onResetGridParams && (
                  <button
                    onClick={onResetGridParams}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 bg-[#1A1D27] hover:bg-[#FF3B30] text-[#C2C8D6] hover:text-white border border-[#2B3042] hover:border-[#FF3B30] transition-all active:scale-95 shadow shrink-0"
                    title="AI가 스캔한 최초 그리드 설정 상태로 리셋합니다"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>초기화 (Reset)</span>
                  </button>
                )}
              </div>

              <div className="bg-[#12141C] p-3 border border-[#232733] space-y-3 text-[11px]">
                {/* Columns & Rows Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#8C93A6]">COLUMNS</span>
                      <span className="text-white font-bold">{gridParams.columns}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={gridParams.columns}
                      onChange={(e) => updateParam('columns', Number(e.target.value))}
                      className="w-full accent-[#FF3B30]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#8C93A6]">ROWS</span>
                      <span className="text-white font-bold">{gridParams.rows}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={gridParams.rows}
                      onChange={(e) => updateParam('rows', Number(e.target.value))}
                      className="w-full accent-[#FF3B30]"
                    />
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-2 pt-2 border-t border-[#232733]">
                  <span className="text-[10px] text-[#8C93A6] block uppercase">MARGINS (%)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>LEFT/RIGHT</span>
                        <span className="text-white font-bold">{gridParams.marginLeft}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={gridParams.marginLeft}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onChangeParams({
                            ...gridParams,
                            marginLeft: val,
                            marginRight: val,
                          });
                        }}
                        className="w-full accent-[#FF3B30]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px]">
                        <span>TOP/BOTTOM</span>
                        <span className="text-white font-bold">{gridParams.marginTop}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={gridParams.marginTop}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onChangeParams({
                            ...gridParams,
                            marginTop: val,
                            marginBottom: val,
                          });
                        }}
                        className="w-full accent-[#FF3B30]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Swiss Analysis Report */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            {/* Main Korean Summary Card */}
            <div className="bg-[#141622] p-4.5 border-2 border-[#FF3B30] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2B3040] pb-2.5">
                <h3 className="text-sm font-extrabold text-white uppercase flex items-center gap-2 font-mono">
                  <FileText className="w-4.5 h-4.5 text-[#FF3B30]" />
                  <span>스위스 디자인 종합 분석 요약</span>
                </h3>
                <span className="text-xs font-bold text-[#FF3B30] bg-[#FF3B30]/15 px-2.5 py-0.5 border border-[#FF3B30]/40 font-mono">
                  신뢰도 {analysis.confidence}%
                </span>
              </div>
              <p className="text-sm sm:text-base text-white font-sans leading-relaxed pt-1 font-medium">
                {analysis.summary}
              </p>
            </div>

            {/* Key Visual Statistics Grid */}
            <div className="grid grid-cols-2 gap-2.5 font-sans text-xs">
              <div className="bg-[#12141C] p-3 border border-[#232733] space-y-1">
                <span className="text-xs text-[#8C93A6] block font-mono">타이포 위계 평가</span>
                <span className="font-bold text-[#F59E0B] block text-sm truncate">
                  {formatTypeHierarchyRating(analysis.typeHierarchyRating)}
                </span>
              </div>
              <div className="bg-[#12141C] p-3 border border-[#232733] space-y-1">
                <span className="text-xs text-[#8C93A6] block font-mono">여백 활용 비율</span>
                <span className="font-bold text-[#10B981] block text-sm">
                  {analysis.whitespaceRatio || '35% (여백 균형 우수)'}
                </span>
              </div>
            </div>

            {/* Swiss Principles List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#A2A9B8] uppercase block font-mono">
                검증된 스위스 타이포그래피 핵심 원칙
              </span>
              {analysis.swissPrinciples.map((principle, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#12141C] border border-[#232733] text-xs sm:text-sm text-white flex items-start gap-2.5 font-sans leading-relaxed"
                >
                  <span className="w-2 h-2 bg-[#FF3B30] rounded-full shrink-0 mt-1.5" />
                  <span>{principle}</span>
                </div>
              ))}
            </div>

            {/* Color Palette Chips */}
            {analysis.colorPalette && (
              <div className="space-y-2 pt-2 border-t border-[#232733]">
                <span className="text-xs font-bold text-[#A2A9B8] uppercase block font-mono">
                  포스터 추출 대표 색상 팔레트
                </span>
                <div className="flex items-center gap-2">
                  {analysis.colorPalette.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 h-9 border border-white/20 flex items-center justify-center text-xs font-bold shadow font-mono"
                      style={{ backgroundColor: hex, color: hex === '#FFFFFF' || hex === '#F8FAFC' ? '#000' : '#FFF' }}
                    >
                      {hex}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Callout Card */}
            {onOpenHistoryModal && (
              <div className="mt-3 p-3.5 bg-[#141B18] border border-[#10B981]/30 rounded-lg flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-[#10B981] block text-xs">
                    ⚡ 분석 히스토리 불러오기
                  </span>
                  <span className="text-[11px] text-[#A0A7BA] block">
                    이전에 분석한 포스터 기록을 빠르게 다시 열어볼 수 있습니다.
                  </span>
                </div>
                <button
                  onClick={onOpenHistoryModal}
                  className="shrink-0 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40 font-mono font-bold px-3 py-1.5 text-xs transition-all active:scale-95"
                >
                  히스토리 열기
                </button>
              </div>
            )}

            {/* System Manual Guide Callout Card */}
            {onOpenManualModal && (
              <div className="mt-4 p-3.5 bg-[#161B26] border border-[#38BDF8]/30 rounded-lg flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-[#38BDF8] block text-xs">
                    💡 분석 기준 및 지표(FIT, 신뢰도 등) 매뉴얼
                  </span>
                  <span className="text-[11px] text-[#A0A7BA] block">
                    AI 분석 원리, 용어 정의 및 가설 활용법을 확인해보세요.
                  </span>
                </div>
                <button
                  onClick={onOpenManualModal}
                  className="shrink-0 bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/40 font-mono font-bold px-3 py-1.5 text-xs transition-all active:scale-95"
                >
                  매뉴얼 열기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const QuotaErrorView: React.FC<{
  analysisError: string;
  onOpenHistoryModal?: () => void;
  onReanalyzeAi?: () => void;
}> = ({ analysisError, onOpenHistoryModal, onReanalyzeAi }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleRetry = () => {
    if (onReanalyzeAi) {
      setSecondsLeft(60);
      onReanalyzeAi();
    }
  };

  return (
    <div className="bg-[#0F1015] border border-[#FF3B30]/40 p-6 text-[#C2C8D6] flex flex-col justify-between min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full rounded-lg shadow-2xl font-mono overflow-y-auto">
      <div className="space-y-5">
        {/* Header Badge */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#FF3B30]/30">
          <div className="w-10 h-10 rounded-full bg-[#FF3B30]/20 border border-[#FF3B30]/50 flex items-center justify-center text-[#FF3B30] shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2 py-0.5 rounded">
              GEMINI_API_QUOTA_EXCEEDED (429)
            </span>
            <h3 className="text-sm font-extrabold text-white mt-1">
              AI 비전 분석 요청 한도 초과 안내
            </h3>
          </div>
        </div>

        {/* Live Timer Card */}
        <div className="p-4 bg-[#181014] border border-[#FF3B30]/30 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#FF3B30] flex items-center gap-1.5">
              <Timer className="w-4 h-4 animate-pulse" />
              <span>한도 리셋 자동 타이머</span>
            </span>
            <span className="text-white font-bold text-sm bg-[#FF3B30]/20 px-2.5 py-0.5 rounded border border-[#FF3B30]/40">
              {secondsLeft > 0 ? `${secondsLeft}초 남음` : '✅ 1분 차단 해제'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#2A1820] h-2 rounded-full overflow-hidden border border-[#FF3B30]/20">
            <div
              className="bg-gradient-to-r from-[#FF3B30] to-[#F59E0B] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((60 - secondsLeft) / 60) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-[#A0A7BA] leading-relaxed">
            {secondsLeft > 0 ? (
              <span>
                Gemini API의 분당 요청 한도(RPM)에 도달하였습니다. 카운트다운 완료 후 아래 <strong className="text-white">[AI 비전 재분석]</strong> 버튼을 눌러 재시도해보세요.
              </span>
            ) : (
              <span className="text-[#10B981] font-bold">
                1분 대기 시간이 완료되었습니다! 아래 [AI 비전 재분석]을 눌러 재시도해보세요. (만약 여전히 429 에러가 뜨는 경우 '일일 전체 한도(RPD)' 소진 상태입니다)
              </span>
            )}
          </p>
        </div>

        {/* Reset Time Q&A Explanation */}
        <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>Gemini API 한도 및 리셋 타임 안내</span>
          </div>

          <div className="p-2.5 bg-[#0D0F16] rounded border border-[#FF3B30]/30 text-[11px] text-[#E2E8F0] leading-relaxed">
            <span className="text-[#FF3B30] font-bold block mb-1">⚠️ 왜 정확히 몇 초 남았는지 알려주지 않나요?</span>
            <p className="text-[#A0A7BA]">
              Google Gemini API는 429 오류 발생 시 <strong>서버에서 남은 초 단위 리셋 시각을 전달하지 않습니다</strong>. 앱 내 타이머는 <strong className="text-white">분당 한도(RPM) 해제 추정시간(60초)</strong>이며, 한도 종류에 따라 아래와 같이 리셋됩니다.
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-[#A0A7BA] leading-relaxed">
            <div className="p-2.5 bg-[#0D0F16] rounded border border-[#232733] space-y-1">
              <span className="text-[#38BDF8] font-bold block">1. 분당 요청 제한 (RPM: Requests Per Minute) — 약 1분 후 리셋</span>
              <p>
                단시간에 연속으로 요청할 때 발생하며 <strong>60~90초 대기 후</strong> 자동 해제됩니다.
              </p>
            </div>

            <div className="p-2.5 bg-[#0D0F16] rounded border border-[#232733] space-y-1">
              <span className="text-[#F59E0B] font-bold block">2. 일일 전체 한도 제한 (RPD: Requests Per Day) — 매일 오후 4시 리셋</span>
              <p>
                하루 무료 사용량(1,500회)이 모두 소진된 경우 60초가 지나도 안 되며, <strong>매일 한국시간 오후 4시 (미국 PST 자정)</strong>에 초기화됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Tip: History Reuse */}
        <div className="p-3.5 bg-[#101F1A] border border-[#10B981]/30 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#10B981] flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>대안: 이전 히스토리 바로 불러오기</span>
            </span>
          </div>
          <p className="text-[11px] text-[#A0A7BA] leading-relaxed">
            이전에 분석했던 포스터는 API 소모 없이 브라우저/서버 히스토리에서 즉시 열람하실 수 있습니다.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2 pt-4 border-t border-[#232733] mt-4">
        <button
          onClick={handleRetry}
          disabled={secondsLeft > 0}
          className={`w-full font-mono font-bold px-4 py-2.5 text-xs uppercase transition-all shadow flex items-center justify-center gap-2 ${
            secondsLeft > 0
              ? 'bg-[#232733] text-[#8C93A6] border border-[#3A3F52] cursor-not-allowed'
              : 'bg-[#FF3B30] hover:bg-[#E02E24] text-white active:scale-95 shadow-lg shadow-[#FF3B30]/20'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${secondsLeft === 0 ? 'animate-spin-slow text-white' : ''}`} />
          <span>
            {secondsLeft > 0 ? `AI 비전 재분석 (${secondsLeft}초 대기중)` : 'AI 비전 분석 재시도'}
          </span>
        </button>

        {onOpenHistoryModal && (
          <button
            onClick={onOpenHistoryModal}
            className="w-full bg-[#1C202B] hover:bg-[#282E3E] text-[#C2C8D6] border border-[#3A3F52] font-mono font-bold px-4 py-2.5 text-xs uppercase transition-all shadow flex items-center justify-center gap-2 active:scale-95"
          >
            <Zap className="w-4 h-4 text-[#10B981]" />
            <span>히스토리 목록에서 불러오기</span>
          </button>
        )}
      </div>
    </div>
  );
};
