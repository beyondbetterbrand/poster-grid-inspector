import React from 'react';
import { AnalysisResult } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  FileText,
  Palette,
  Award,
  Maximize,
  Grid,
} from 'lucide-react';

interface AnalysisReportProps {
  analysis: AnalysisResult | null;
  hoveredElementId: string | null;
  onHoverElement: (id: string | null) => void;
  isAnalyzing: boolean;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  analysis,
  hoveredElementId,
  onHoverElement,
  isAnalyzing,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 animate-pulse flex flex-col items-center justify-center gap-3 min-h-[280px]">
        <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-200">
          포스터 디자인 비주얼 분석 및 그리드 추정 중...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 flex flex-col items-center justify-center gap-2 min-h-[280px]">
        <Grid className="w-8 h-8 text-slate-600 mb-1" />
        <p className="text-sm font-medium text-slate-300">분석된 그리드 정보가 없습니다.</p>
        <p className="text-xs text-slate-500">
          샘플 포스터를 선택하거나 새로운 포스터 이미지를 올려주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 p-5 shadow-xl space-y-5">
      {/* Top Title & Confidence badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {analysis.systemNameKo}
            </span>
            <span className="text-xs text-slate-400">추정 신뢰도 {analysis.confidence}%</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">{analysis.title}</h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">타이포 위계 평가</span>
            <span className="text-xs font-extrabold text-amber-300">
              {analysis.typeHierarchyRating}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Second Quick Summary Card */}
      <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-4.5 rounded-xl border-2 border-blue-500/40 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>💡 스위스 포스터 레이아웃 분석 요약</span>
        </div>
        <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
          {analysis.summary}
        </p>
      </div>

      {/* Josef Müller-Brockmann Theory Alignment Card */}
      <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wide">
              📖 요제프 뮐러 브로크만 그리드 검증
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            «Grid Systems in Graphic Design»
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          이 포스터는 뮐러 브로크만의 <strong>12-모듈러 격자 체계</strong>를 기반으로 기하학적 정렬 축을 형상화했습니다.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">격자 분할 모듈</span>
            <span className="font-bold text-white">{analysis.gridParams?.columns || 12} 컬럼 × {analysis.gridParams?.rows || 8} 모듈</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">베이스라인 정렬</span>
            <span className="font-bold text-emerald-400">일정한 수평 행간 준수</span>
          </div>
        </div>
      </div>

      {/* Swiss Principles List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>관찰된 스위스/현대 그리드 디자인 원칙</span>
        </h3>
        <ul className="space-y-1.5">
          {analysis.swissPrinciples.map((p, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-300 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/60 flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detected Elements list with Hover Focus */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-violet-400" />
          <span>포스터 내부 요소 정렬 위치</span>
        </h3>
        <div className="space-y-2">
          {analysis.detectedElements.map((el) => {
            const isHovered = hoveredElementId === el.id;
            return (
              <div
                key={el.id}
                onMouseEnter={() => onHoverElement(el.id)}
                onMouseLeave={() => onHoverElement(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered
                    ? 'bg-violet-950/40 border-violet-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded uppercase">
                      {el.type}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate">{el.label}</span>
                  </div>
                  {el.alignmentNote && (
                    <p className="text-[11px] text-slate-400 truncate">{el.alignmentNote}</p>
                  )}
                </div>

                <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded shrink-0">
                  {Math.round(el.x)}%, {Math.round(el.y)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extracted Color Palette */}
      {analysis.colorPalette && analysis.colorPalette.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>추출된 팔레트</span>
          </h3>
          <div className="flex items-center gap-2">
            {analysis.colorPalette.map((hex, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-[10px] font-mono text-slate-400 uppercase">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
