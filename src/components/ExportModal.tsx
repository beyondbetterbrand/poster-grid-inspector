import React, { useState, useMemo } from 'react';
import {
  GridParams,
  DetectedElement,
  Keyline,
} from '../types';
import {
  generateSvgContent,
  downloadSvgFile,
  generateCssGridCode,
  generateTailwindGridCode,
  ExportOptions,
} from '../utils/gridExport';
import {
  X,
  FileDown,
  Copy,
  Check,
  Code2,
  Layers,
  Image as ImageIcon,
  FileType,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  gridParams: GridParams;
  detectedElements: DetectedElement[];
  keylines: Keyline[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  gridParams,
  detectedElements,
  keylines,
}) => {
  const [exportTab, setExportTab] = useState<'svg' | 'css'>('svg');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // SVG Export Options State
  const [options, setOptions] = useState<ExportOptions>({
    includePosterBackground: false,
    includeColumns: true,
    includeRows: true,
    includeMargins: true,
    includeBaseline: true,
    includeDiagonal: true,
    includeGoldenRatio: gridParams.showGoldenRatio,
    includeRuleOfThirds: gridParams.showRuleOfThirds,
    includeKeylines: true,
    includeBoundingBoxes: false,
    asFigmaLayers: true,
  });

  const generatedSvg = useMemo(() => {
    return generateSvgContent(imageSrc, gridParams, detectedElements, keylines, options);
  }, [imageSrc, gridParams, detectedElements, keylines, options]);

  const cssCode = useMemo(() => generateCssGridCode(gridParams), [gridParams]);
  const tailwindCode = useMemo(() => generateTailwindGridCode(gridParams), [gridParams]);

  if (!isOpen) return null;

  const handleCopy = (text: string, typeLabel: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeLabel);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadSvg = () => {
    const filename = options.includePosterBackground
      ? 'poster-with-grid.svg'
      : 'poster-grid-guides.svg';
    downloadSvgFile(generatedSvg, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">그리드 SVG 및 코드 내보내기</h2>
            <p className="text-xs text-slate-400">
              Figma / Illustrator 가이드 레이어 또는 CSS 웹 코드 생성
            </p>
          </div>
        </div>

        {/* Export Type Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold mb-6">
          <button
            onClick={() => setExportTab('svg')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              exportTab === 'svg'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileType className="w-4 h-4" />
            <span>SVG 가이드 벡터 파일</span>
          </button>
          <button
            onClick={() => setExportTab('css')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              exportTab === 'css'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>CSS Grid / Tailwind 코드</span>
          </button>
        </div>

        {/* TAB 1: SVG Export Options */}
        {exportTab === 'svg' && (
          <div className="space-y-6">
            {/* Options Checkboxes */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                SVG 레이어 구성 옵션
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includePosterBackground}
                    onChange={(e) =>
                      setOptions({ ...options, includePosterBackground: e.target.checked })
                    }
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>원본 포스터 이미지 배경 포함</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includeColumns}
                    onChange={(e) => setOptions({ ...options, includeColumns: e.target.checked })}
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>수직 컬럼 (&lt;g id="Grid-Layer-Columns"&gt;)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includeRows}
                    onChange={(e) => setOptions({ ...options, includeRows: e.target.checked })}
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>수평 행 (&lt;g id="Grid-Layer-Rows"&gt;)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includeMargins}
                    onChange={(e) => setOptions({ ...options, includeMargins: e.target.checked })}
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>마진 외곽선 (&lt;g id="Grid-Layer-Margins"&gt;)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includeBaseline}
                    onChange={(e) => setOptions({ ...options, includeBaseline: e.target.checked })}
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>베이스라인 타이포 그리드</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={options.includeBoundingBoxes}
                    onChange={(e) =>
                      setOptions({ ...options, includeBoundingBoxes: e.target.checked })
                    }
                    className="rounded accent-blue-500 w-4 h-4"
                  />
                  <span>추정 요소 바운딩 박스</span>
                </label>
              </div>
            </div>

            {/* SVG Preview Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SVG 코드 미리보기
                </span>
                <button
                  onClick={() => handleCopy(generatedSvg, 'SVG')}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-slate-800 px-2.5 py-1 rounded-lg"
                >
                  {copiedType === 'SVG' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedType === 'SVG' ? '복사됨!' : 'SVG 코드 복사'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto overflow-x-auto whitespace-pre">
                {generatedSvg}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                닫기
              </button>
              <button
                onClick={handleDownloadSvg}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                <span>SVG 파일 다운로드 (.svg)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CSS / Tailwind Code */}
        {exportTab === 'css' && (
          <div className="space-y-5">
            {/* Standard CSS Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">표준 CSS Grid 코드</span>
                <button
                  onClick={() => handleCopy(cssCode, 'CSS')}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-slate-800 px-2.5 py-1 rounded-lg"
                >
                  {copiedType === 'CSS' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedType === 'CSS' ? '복사됨!' : 'CSS 복사'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-blue-300 whitespace-pre overflow-x-auto">
                {cssCode}
              </pre>
            </div>

            {/* Tailwind CSS Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Tailwind CSS HTML 코드</span>
                <button
                  onClick={() => handleCopy(tailwindCode, 'Tailwind')}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-slate-800 px-2.5 py-1 rounded-lg"
                >
                  {copiedType === 'Tailwind' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedType === 'Tailwind' ? '복사됨!' : 'Tailwind 복사'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 whitespace-pre overflow-x-auto">
                {tailwindCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
