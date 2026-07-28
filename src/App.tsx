import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, RefreshCw, Clock, ShoppingBag, Mail, ExternalLink } from 'lucide-react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GridCanvasOverlay } from './components/GridCanvasOverlay';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { BrockmannGuideModal } from './components/BrockmannGuideModal';
import { SystemManualModal } from './components/SystemManualModal';
import { HistoryModal } from './components/HistoryModal';
import { saveLocalHistoryRecord } from './utils/historyManager';
import { prepareImageForVisionApi, analyzePosterImageLocally, formatTypeHierarchyRating } from './utils/imageUtils';
import { generateCandidateGrids, optimizeGridToElements } from './utils/gridOptimizer';
import {
  GridParams,
  Keyline,
  AnalysisResult,
  GridSystemType,
  DetectedElement,
} from './types';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [gridParams, setGridParams] = useState<GridParams>({
    columns: 12,
    rows: 8,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    columnGutter: 2,
    rowGutter: 2,
    baselineSpacing: 2.5,
    showBaseline: true,
    diagonalAngle: 0,
    showDiagonal: false,
    color: '#FF3B30',
    opacity: 0.85,
    strokeWidth: 1.5,
    showMargins: true,
    showColumns: true,
    showRows: true,
    showKeylines: true,
    showBoundingBoxes: true,
    showGoldenRatio: false,
    showRuleOfThirds: false,
  });
  const [keylines, setKeylines] = useState<Keyline[]>([]);
  const [detectedElements, setDetectedElements] = useState<DetectedElement[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isBrockmannModalOpen, setIsBrockmannModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const [isAiAnalyzed, setIsAiAnalyzed] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSelectHistoryItem = (imageBase64: string, analysisData: AnalysisResult) => {
    setImageSrc(imageBase64);
    setAnalysis(analysisData);
    setAnalysisError(null);
    if (analysisData && analysisData.gridParams) {
      setGridParams(analysisData.gridParams);
    }
    setDetectedElements(analysisData?.detectedElements || []);
    setKeylines(analysisData?.keylines || []);
    setIsAiAnalyzed(true);
  };

  const handleUploadNewImageTrigger = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = ev.target?.result as string;
          if (url) handleCustomImageSelected(url, file);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Re-analyze currently loaded poster with Gemini AI Vision
  const runAiVisionAnalysis = async (targetDataUrl?: string) => {
    if (cooldownSeconds > 0) {
      setAnalysisError(
        `⚠️ Gemini API 버스트 요청 방지 쿨다운 중입니다. ${cooldownSeconds}초 대기 후 다시 시도하실 수 있습니다.`
      );
      return;
    }

    const src = targetDataUrl || imageSrc;
    if (!src) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Convert SVG or uploaded image to clean PNG base64 for Gemini Vision OCR
      const { base64Png, mimeType } = await prepareImageForVisionApi(src);

      const response = await fetch('/api/analyze-grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Png,
          mimeType: mimeType || 'image/png',
        }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const d = json.data;
        const newGridParams: GridParams = {
          columns: d.gridParams?.columns || 12,
          rows: d.gridParams?.rows || 8,
          marginTop: d.gridParams?.marginTop || 10,
          marginBottom: d.gridParams?.marginBottom || 10,
          marginLeft: d.gridParams?.marginLeft || 8,
          marginRight: d.gridParams?.marginRight || 8,
          columnGutter: d.gridParams?.columnGutter || 2,
          rowGutter: d.gridParams?.rowGutter || 2,
          baselineSpacing: d.gridParams?.baselineSpacing || 2.5,
          showBaseline: true,
          diagonalAngle: d.gridParams?.diagonalAngle || 0,
          showDiagonal: d.gridParams?.diagonalAngle !== 0,
          color: '#FF3B30',
          opacity: 0.85,
          strokeWidth: 1.5,
          showMargins: true,
          showColumns: true,
          showRows: true,
          showKeylines: true,
          showBoundingBoxes: true,
          showGoldenRatio: false,
          showRuleOfThirds: false,
        };

        const rawElements = d.detectedElements || [];

        // Generate candidate grid hypotheses
        const candidateList = generateCandidateGrids(
          rawElements,
          newGridParams,
          d.systemType || 'swiss_modular'
        );

        // Best candidate grid with highest alignment score
        const bestCandidate = candidateList[0] || { gridParams: newGridParams };
        const activeGridParams = bestCandidate.gridParams;

        const newAnalysis: AnalysisResult = {
          systemType: d.systemType || 'swiss_modular',
          systemNameKo: d.systemNameKo || '추정 그리드 레이아웃',
          confidence: d.confidence || 92,
          title: d.title || 'SWISS_VISION_GRID_MAPPED',
          summary:
            d.summary ||
            '포스터 상의 실제 타이포그래피 요소와 비주얼 구도를 정밀하게 인지하여 가이드라인을 매핑했습니다.',
          gridParams: activeGridParams,
          candidateGrids: candidateList,
          detectedElements: rawElements,
          keylines: d.keylines || [],
          swissPrinciples: d.swissPrinciples || [
            '주요 타이포그래피와 이미지 박스의 좌우 정렬축 수합',
            '일관된 여백 비율 및 모듈 구조',
          ],
          typeHierarchyRating: formatTypeHierarchyRating(d.typeHierarchyRating || 'A등급 (균형적인 정보 위계)'),
          whitespaceRatio: d.whitespaceRatio || '35%',
          colorPalette: d.colorPalette || ['#0F1015', '#FF3B30', '#FFFFFF'],
        };

        setAnalysis(newAnalysis);
        setGridParams(activeGridParams);
        setKeylines(d.keylines || []);
        setDetectedElements(rawElements);
        setIsAiAnalyzed(true);

        // Save to browser localStorage persistently
        saveLocalHistoryRecord({
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: newAnalysis.title,
          systemNameKo: newAnalysis.systemNameKo,
          confidence: newAnalysis.confidence,
          createdAt: new Date().toISOString(),
          imageBase64: src,
          analysisData: newAnalysis,
        });
      } else {
        const errMsg = json.error || '';
        const isQuotaOrLimit =
          response.status === 429 ||
          json.isRateLimit ||
          errMsg.includes('429') ||
          errMsg.includes('quota') ||
          errMsg.includes('한도') ||
          errMsg.includes('초과') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isQuotaOrLimit) {
          setAnalysisError(
            '⚠️ Gemini API 무료 사용 한도(429 Quota Exceeded/RPD 소진)에 도달하였습니다.\n\n[해결 방법]\n1. aistudio.google.com/app/apikey 에서 무료 개인 API 키를 발급받아 Settings -> Environment Variables에 GEMINI_API_KEY로 등록하시면 제한 없이 계속 사용하실 수 있습니다.\n2. 또는 약 1분 후 [AI 재분석]을 눌러 다시 시도하거나 [분석 히스토리]에서 이전 기록을 불러와주세요.'
          );
          setAnalysis(null);
          setDetectedElements([]);
          setKeylines([]);
          setIsAiAnalyzed(false);
          setGridParams((prev) => ({
            ...prev,
            showColumns: false,
            showRows: false,
            showMargins: false,
            showBaseline: false,
            showKeylines: false,
            showBoundingBoxes: false,
            showDiagonal: false,
            showGoldenRatio: false,
            showRuleOfThirds: false,
          }));
        } else {
          setAnalysisError(json.error || 'AI 비전 분석 응답에 실패했습니다.');
          await applyFallbackGrid(src);
        }
      }
    } catch (err: any) {
      console.warn('API error during AI Vision analysis:', err);
      const errStr = err?.message || '';
      const isQuotaOrLimit =
        errStr.includes('429') ||
        errStr.includes('quota') ||
        errStr.includes('한도') ||
        errStr.includes('초과') ||
        errStr.includes('RESOURCE_EXHAUSTED');

      if (isQuotaOrLimit) {
        setAnalysisError(
          '⚠️ Gemini API 무료 사용 한도(429 Quota Exceeded/RPD 소진)에 도달하였습니다.\n\n[해결 방법]\n1. aistudio.google.com/app/apikey 에서 무료 개인 API 키를 발급받아 Settings -> Environment Variables에 GEMINI_API_KEY로 등록하시면 제한 없이 계속 사용하실 수 있습니다.\n2. 또는 약 1분 후 [AI 재분석]을 눌러 다시 시도하거나 [분석 히스토리]에서 이전 기록을 불러와주세요.'
        );
        setAnalysis(null);
        setDetectedElements([]);
        setKeylines([]);
        setIsAiAnalyzed(false);
        setGridParams((prev) => ({
          ...prev,
          showColumns: false,
          showRows: false,
          showMargins: false,
          showBaseline: false,
          showKeylines: false,
          showBoundingBoxes: false,
          showDiagonal: false,
          showGoldenRatio: false,
          showRuleOfThirds: false,
        }));
      } else {
        setAnalysisError(err?.message || '네트워크 연결 오류');
        await applyFallbackGrid(src);
      }
    } finally {
      setIsAnalyzing(false);
      setCooldownSeconds(25);
    }
  };

  // Handle Custom Image Upload & Call Gemini AI Backend Analysis
  const handleCustomImageSelected = async (dataUrl: string, file: File) => {
    setImageSrc(dataUrl);
    await runAiVisionAnalysis(dataUrl);
  };

  const applyFallbackGrid = async (targetDataUrl?: string) => {
    const src = targetDataUrl || imageSrc;
    let localRes: {
      marginTop: number;
      marginBottom: number;
      marginLeft: number;
      marginRight: number;
      detectedElements: DetectedElement[];
    } = {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 6.7,
      marginRight: 6.7,
      detectedElements: [
        { id: 'fb-1', label: '상단 메인 헤더 영역', type: 'headline', x: 6.7, y: 8, width: 86.6, height: 15 },
        { id: 'fb-2', label: '중앙 주요 비주얼 콘텐트', type: 'image', x: 6.7, y: 26, width: 86.6, height: 48 },
        { id: 'fb-3', label: '하단 정보 컬럼', type: 'footer', x: 6.7, y: 78, width: 86.6, height: 14 },
      ],
    };

    if (src) {
      try {
        localRes = await analyzePosterImageLocally(src);
      } catch (e) {
        console.warn('Local canvas analysis error:', e);
      }
    }

    const baseParams: GridParams = {
      columns: 12,
      rows: 8,
      marginTop: localRes.marginTop,
      marginBottom: localRes.marginBottom,
      marginLeft: localRes.marginLeft,
      marginRight: localRes.marginRight,
      columnGutter: 2,
      rowGutter: 2,
      baselineSpacing: 2.5,
      showBaseline: true,
      diagonalAngle: 0,
      showDiagonal: false,
      color: '#FF3B30',
      opacity: 0.85,
      strokeWidth: 1.5,
      showMargins: true,
      showColumns: true,
      showRows: true,
      showKeylines: true,
      showBoundingBoxes: true,
      showGoldenRatio: false,
      showRuleOfThirds: false,
    };

    const optParams = optimizeGridToElements(localRes.detectedElements, baseParams);

    const candidateList = generateCandidateGrids(
      localRes.detectedElements,
      optParams,
      'swiss_modular'
    );

    const fallbackAnalysis: AnalysisResult = {
      systemType: 'swiss_modular',
      systemNameKo: '캔버스 스마트 비전 (외곽선 자동 밀착)',
      confidence: 88,
      title: '포스터 실물 이미지 기반 스마트 그리드 밀착',
      summary:
        '업로드된 포스터 이미지의 실제 텍스트 및 이미지 콘텐트 외곽선(상하좌우 여백)을 캔버스 스마트 비전 알고리즘으로 측정하여 그리드를 스냅했습니다.',
      gridParams: optParams,
      candidateGrids: candidateList,
      detectedElements: localRes.detectedElements,
      keylines: [
        { id: 'fkl-1', type: 'vertical', position: optParams.marginLeft, label: '좌측 마진라인' },
        { id: 'fkl-2', type: 'vertical', position: 100 - optParams.marginRight, label: '우측 마진라인' },
        { id: 'fkl-3', type: 'horizontal', position: optParams.marginTop, label: '상단 헤더 시작선' },
      ],
      swissPrinciples: [
        '실물 포스터 외곽 여백 자동 밀착 스냅',
        '스위스 12컬럼 모듈 비율 분할',
      ],
      typeHierarchyRating: 'A',
      whitespaceRatio: `${Math.round(optParams.marginLeft + optParams.marginRight + optParams.marginTop + optParams.marginBottom)}%`,
      colorPalette: ['#0A0B0E', '#FF3B30', '#FFFFFF'],
    };

    setAnalysis(fallbackAnalysis);
    setGridParams(optParams);
    setKeylines(fallbackAnalysis.keylines);
    setDetectedElements(localRes.detectedElements);
    setIsAiAnalyzed(false);

    // Save fallback grid result to browser localStorage persistently
    saveLocalHistoryRecord({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: fallbackAnalysis.title,
      systemNameKo: fallbackAnalysis.systemNameKo,
      confidence: fallbackAnalysis.confidence,
      createdAt: new Date().toISOString(),
      imageBase64: src,
      analysisData: fallbackAnalysis,
    });
  };

  const handleResetGridParams = () => {
    if (analysis && analysis.gridParams) {
      setGridParams({ ...analysis.gridParams });
    } else {
      setGridParams({
        columns: 12,
        rows: 8,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        columnGutter: 2,
        rowGutter: 2,
        baselineSpacing: 2.5,
        showBaseline: true,
        diagonalAngle: 0,
        showDiagonal: false,
        color: '#FF3B30',
        opacity: 0.85,
        strokeWidth: 1.5,
        showMargins: true,
        showColumns: true,
        showRows: true,
        showKeylines: true,
        showBoundingBoxes: true,
        showGoldenRatio: false,
        showRuleOfThirds: false,
      });
    }
  };

  const handleRunLocalAnalysis = async () => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    await applyFallbackGrid(imageSrc);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] bg-swiss-grid text-white font-mono antialiased flex flex-col selection:bg-[#FF3B30] selection:text-white">
      {/* Header Bar */}
      <Header
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onReanalyzeAi={() => runAiVisionAnalysis()}
        onUploadClick={handleUploadNewImageTrigger}
        hasImage={!!imageSrc}
        isAnalyzing={isAnalyzing}
        cooldownSeconds={cooldownSeconds}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Prominent Quota Alert Banner */}
        {analysisError && (
          <div className="p-4 bg-[#181014] border border-[#FF3B30]/50 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono shadow-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF3B30]/20 border border-[#FF3B30]/40 flex items-center justify-center text-[#FF3B30] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#FF3B30] uppercase tracking-wider text-xs">
                    ⚠️ Gemini API 안내
                  </span>
                  <span className="text-[10px] bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 px-1.5 py-0.5 rounded font-bold">
                    안내 및 해결방법
                  </span>
                </div>
                <p className="text-[#C2C8D6] leading-relaxed whitespace-pre-line">
                  {analysisError}
                </p>
                <div className="text-[11px] text-[#A0A7BA] pt-0.5">
                  💡 <strong className="text-white">분당 한도(RPM)</strong>는 약 1분 후 리셋되며, <strong className="text-white">일일 한도(RPD: 1,500회)</strong> 소진 시 <strong>매일 한국시간 오후 4시 (PST 자정)</strong>에 완충 초기화됩니다.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="flex-1 md:flex-none bg-[#1C202B] hover:bg-[#282E3E] text-[#C2C8D6] border border-[#3A3F52] font-bold px-3.5 py-2 text-xs uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>히스토리 열기</span>
              </button>
              <button
                onClick={() => runAiVisionAnalysis()}
                disabled={cooldownSeconds > 0}
                className={`flex-1 md:flex-none font-bold px-3.5 py-2 text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow active:scale-95 ${
                  cooldownSeconds > 0
                    ? 'bg-[#232733] text-[#8C93A6] cursor-not-allowed'
                    : 'bg-[#FF3B30] hover:bg-[#E02E24] text-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{cooldownSeconds > 0 ? `재시도 (${cooldownSeconds}s)` : 'AI 스캔 재시도'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Upload Zone Drop Area (shown when no image is loaded) */}
        {!imageSrc && (
          <ImageUploader
            onImageSelected={handleCustomImageSelected}
            isAnalyzing={isAnalyzing}
            cooldownSeconds={cooldownSeconds}
          />
        )}

        {/* Workspace Grid Layout (2-Column Desktop layout: Canvas on Left, Controls & Analysis on Right) */}
        {imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Canvas Visual Overlay */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <GridCanvasOverlay
                imageSrc={imageSrc}
                gridParams={gridParams}
                detectedElements={detectedElements}
                keylines={keylines}
                hoveredElementId={hoveredElementId}
                onHoverElement={setHoveredElementId}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Right Column: Unified Side-by-Side Inspector Panel */}
            <div className="lg:col-span-5">
              <RightInspectorPanel
                analysis={analysis}
                hoveredElementId={hoveredElementId}
                onHoverElement={setHoveredElementId}
                isAnalyzing={isAnalyzing}
                isAiAnalyzed={isAiAnalyzed}
                analysisError={analysisError}
                onReanalyzeAi={() => runAiVisionAnalysis()}
                gridParams={gridParams}
                onChangeParams={setGridParams}
                onResetGridParams={handleResetGridParams}
                onOpenManualModal={() => setIsManualModalOpen(true)}
                onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
                cooldownSeconds={cooldownSeconds}
              />
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        imageSrc={imageSrc}
        gridParams={gridParams}
        detectedElements={detectedElements}
        keylines={keylines}
      />

      {/* Help & FAQ Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      {/* Josef Müller-Brockmann Theory Modal */}
      <BrockmannGuideModal
        isOpen={isBrockmannModalOpen}
        onClose={() => setIsBrockmannModalOpen(false)}
      />

      {/* System Analysis Manual & Glossary Guide Modal */}
      <SystemManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Poster Analysis History & Cache Reuse Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      {/* Footer */}
      <footer className="bg-[#0F1015] border-t border-[#232733] text-[#8C93A6] text-xs py-5 px-6 font-mono">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Brand info */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse" />
              <span className="text-white font-bold tracking-wider">SWISS_GRID_LAB</span>
            </div>
            <span className="hidden sm:inline text-[#3B4254]">|</span>
            <span className="text-[11px] text-[#6C748B]">© beyondbetterbrand.com. All rights reserved.</span>
          </div>

          {/* Right Links: Font Store Promotion & Contact Email */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Font Store Link */}
            <a
              href="https://beyondbetterbrand.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#FF3B30] hover:text-white text-[#D1D5DB] border border-[#2B3245] hover:border-[#FF3B30] transition-all text-[11px] font-medium group"
              title="Visit Font Store"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FF3B30] group-hover:text-white transition-colors" />
              <span>FONT STORE</span>
              <span className="text-[#8C93A6] group-hover:text-white/80 text-[10px] hidden sm:inline">(beyondbetterbrand.com/store)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Email Contact Link */}
            <a
              href="mailto:beyondbetterbrand@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161B26] hover:bg-[#2B3245] text-[#D1D5DB] border border-[#2B3245] transition-all text-[11px] font-medium"
              title="Send Inquiry Email"
            >
              <Mail className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Contact: beyondbetterbrand@gmail.com</span>
            </a>

            {/* Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-[#5C6479] pl-2 border-l border-[#232733]">
              <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full" />
              <span>ONLINE</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
