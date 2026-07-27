import React, { useState, useEffect } from 'react';
import { AnalysisResult, GridParams } from '../types';
import { optimizeGridToElements } from '../utils/gridOptimizer';
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
} from 'lucide-react';

interface RightInspectorPanelProps {
  analysis: AnalysisResult | null;
  hoveredElementId: string | null;
  onHoverElement: (id: string | null) => void;
  isAnalyzing: boolean;
  isAiAnalyzed?: boolean;
  analysisError?: string | null;
  onReanalyzeAi?: () => void;
  gridParams: GridParams;
  onChangeParams: (newParams: GridParams) => void;
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
  gridParams,
  onChangeParams,
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
    <div className="bg-[#0F1015] border border-[#232733] text-white p-4 sm:p-5 shadow-2xl flex flex-col min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full sticky top-4">
      {/* Panel Top Title Header */}
      <div className="pb-3 border-b border-[#232733] shrink-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2 py-0.5 uppercase whitespace-nowrap shrink-0">
              {analysis.systemNameKo}
            </span>
            <span className="text-[10px] font-mono text-[#8C93A6] whitespace-nowrap shrink-0">
              CONF: {analysis.confidence}%
            </span>
          </div>

          {analysis.typeHierarchyRating && (
            <div
              className="flex items-center gap-1 bg-[#161821] px-2 py-0.5 border border-[#232733] shrink-0"
              title={analysis.typeHierarchyRating}
            >
              <Award className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span className="text-[10px] font-mono font-bold text-[#F59E0B] truncate">
                RATING: {analysis.typeHierarchyRating}
              </span>
            </div>
          )}
        </div>

        <h2 className="text-xs sm:text-sm font-extrabold text-white truncate leading-snug font-mono uppercase tracking-wide" title={analysis.title}>
          {analysis.title}
        </h2>
      </div>

      {/* AI Vision Status Banner */}
      {onReanalyzeAi && (
        <div className="mt-2 shrink-0">
          {!isAiAnalyzed || analysisError ? (
            <div className="bg-[#2A1D15] border border-[#F59E0B]/40 p-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-mono font-bold text-[#F59E0B] block text-[10px] uppercase">
                  [CANVAS_SMART_VISION_ACTIVE]
                </span>
                <span className="text-[10px] text-[#D1D5DB] block truncate">
                  {analysisError || '실물 포스터 이미지 기반 캔버스 스마트 비전 밀착 적용'}
                </span>
              </div>
              <button
                onClick={onReanalyzeAi}
                className="shrink-0 bg-[#FF3B30] hover:bg-[#E03126] text-white font-mono font-bold px-2.5 py-1 text-[10px] uppercase transition-all active:scale-95 flex items-center gap-1 shadow"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI 스캔</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#12221A] border border-[#10B981]/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#10B981] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>AI VISION_OCR_MAPPED</span>
              </span>
              <button
                onClick={onReanalyzeAi}
                className="text-[#8C93A6] hover:text-white underline text-[10px] ml-2 shrink-0"
              >
                재스캔
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 my-3 bg-[#14161F] p-1 border border-[#232733] shrink-0 text-[10px] font-mono">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`py-2 px-1 font-bold transition-all flex items-center justify-center gap-1 uppercase ${
            activeTab === 'candidates'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>그리드 가설</span>
        </button>

        <button
          onClick={() => setActiveTab('elements')}
          className={`py-2 px-1 font-bold transition-all flex items-center justify-center gap-1 uppercase ${
            activeTab === 'elements'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>요소 위치</span>
        </button>

        <button
          onClick={() => setActiveTab('options')}
          className={`py-2 px-1 font-bold transition-all flex items-center justify-center gap-1 uppercase ${
            activeTab === 'options'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>직접 조정</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`py-2 px-1 font-bold transition-all flex items-center justify-center gap-1 uppercase ${
            activeTab === 'report'
              ? 'bg-[#FF3B30] text-white shadow'
              : 'text-[#8C93A6] hover:text-white hover:bg-[#1C1F2B]'
          }`}
        >
          <FileText className="w-3 h-3" />
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
                  <span>MANUAL_FINE_TUNING</span>
                </span>
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
          <div className="space-y-3">
            <div className="bg-[#12141C] p-3.5 border border-[#232733] space-y-2">
              <div className="flex items-center justify-between border-b border-[#232733] pb-2">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#FF3B30]" />
                  <span>스위스 디자인 종합 분석 요약</span>
                </h3>
                <span className="text-[10px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 border border-[#FF3B30]/30 font-mono">
                  신뢰도 {analysis.confidence}%
                </span>
              </div>
              <p className="text-[11px] text-[#A6ADB8] font-sans leading-relaxed pt-1">
                {analysis.summary}
              </p>
            </div>

            {/* Key Visual Statistics Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-[#12141C] p-2.5 border border-[#232733] space-y-1">
                <span className="text-[9px] text-[#8C93A6] block">타이포 위계 평가</span>
                <span className="font-bold text-[#F59E0B] block text-xs truncate">
                  {analysis.typeHierarchyRating || 'A등급 (우수)'}
                </span>
              </div>
              <div className="bg-[#12141C] p-2.5 border border-[#232733] space-y-1">
                <span className="text-[9px] text-[#8C93A6] block">여백 비율 (Margin/Gutter)</span>
                <span className="font-bold text-[#10B981] block text-xs">
                  {analysis.whitespaceRatio || '35%'}
                </span>
              </div>
            </div>

            {/* Swiss Principles List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8C93A6] uppercase block font-mono">
                검증된 스위스 타이포그래피 원칙
              </span>
              {analysis.swissPrinciples.map((principle, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#12141C] border border-[#232733] text-[11px] text-white flex items-center gap-2 font-sans leading-snug"
                >
                  <span className="w-1.5 h-1.5 bg-[#FF3B30] shrink-0" />
                  <span>{principle}</span>
                </div>
              ))}
            </div>

            {/* Color Palette Chips */}
            {analysis.colorPalette && (
              <div className="space-y-1.5 pt-2 border-t border-[#232733]">
                <span className="text-[10px] font-bold text-[#8C93A6] uppercase block font-mono">
                  포스터 추출 색상 팔레트
                </span>
                <div className="flex items-center gap-2">
                  {analysis.colorPalette.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 border border-white/20 flex items-center justify-center text-[9px] font-bold shadow font-mono"
                      style={{ backgroundColor: hex, color: hex === '#FFFFFF' || hex === '#F8FAFC' ? '#000' : '#FFF' }}
                    >
                      {hex}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
