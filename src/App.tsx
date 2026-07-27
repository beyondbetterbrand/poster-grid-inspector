import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GridCanvasOverlay } from './components/GridCanvasOverlay';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { BrockmannGuideModal } from './components/BrockmannGuideModal';
import { prepareImageForVisionApi, analyzePosterImageLocally } from './utils/imageUtils';
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

  const [isAiAnalyzed, setIsAiAnalyzed] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
          typeHierarchyRating: d.typeHierarchyRating || 'A (균형적인 정보 위계)',
          whitespaceRatio: d.whitespaceRatio || '35%',
          colorPalette: d.colorPalette || ['#0F1015', '#FF3B30', '#FFFFFF'],
        };

        setAnalysis(newAnalysis);
        setGridParams(activeGridParams);
        setKeylines(d.keylines || []);
        setDetectedElements(rawElements);
        setIsAiAnalyzed(true);
      } else {
        setAnalysisError(json.error || 'AI 비전 분석 응답에 실패했습니다.');
        await applyFallbackGrid(src);
      }
    } catch (err: any) {
      console.warn('API error during AI Vision analysis:', err);
      setAnalysisError(err?.message || '네트워크 연결 오류');
      await applyFallbackGrid(src);
    } finally {
      setIsAnalyzing(false);
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

  return (
    <div className="min-h-screen bg-[#0A0B0E] bg-swiss-grid text-white font-mono antialiased flex flex-col selection:bg-[#FF3B30] selection:text-white">
      {/* Header Bar */}
      <Header
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onReanalyzeAi={() => runAiVisionAnalysis()}
        onUploadClick={handleUploadNewImageTrigger}
        hasImage={!!imageSrc}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Upload Zone Drop Area (shown when no image is loaded) */}
        {!imageSrc && (
          <ImageUploader
            onImageSelected={handleCustomImageSelected}
            isAnalyzing={isAnalyzing}
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

      {/* Footer */}
      <footer className="bg-[#0F1015] border-t border-[#232733] text-[#5C6479] text-[10px] py-4 px-6 font-mono">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF3B30]" />
            <span className="text-white font-bold">SWISS_GRID_LAB // INDIE_STUDIO_EDITION</span>
          </div>
          <span className="text-[#8C93A6]">SYSTEM_STATUS: ONLINE / VECTOR_EXPORT_ENGINE_READY</span>
        </div>
      </footer>
    </div>
  );
}
