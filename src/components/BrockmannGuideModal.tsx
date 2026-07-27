import React from 'react';
import { X, BookOpen, Layers, Grid, AlignLeft, Sparkles, Check, ArrowRight } from 'lucide-react';

interface BrockmannGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrockmannGuideModal: React.FC<BrockmannGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                Swiss Grid Master Theory
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              요제프 뮐러 브로크만 (Josef Müller-Brockmann)의 그리드 시스템
            </h2>
            <p className="text-xs text-slate-400">
              «Grid Systems in Graphic Design» (그래픽 디자이너를 위한 그리드 시스템, 1981) 바이블 핵심 요약
            </p>
          </div>
        </div>

        {/* Quote Banner */}
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-4.5 rounded-xl border border-blue-500/30 text-xs text-blue-100 italic font-serif leading-relaxed mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0" />
          <p className="relative z-10">
            “그리드 시스템은 그래픽 디자이너, 요포그래퍼, 전시 기획자에게 시각적 질서와 가독성을 부여하는 최고의 통제 도구입니다. 그리드를 정밀하게 적용하면 정보는 명확해지고, 경제적이 되며, 객관성과 아름다움을 동시에 얻습니다.”
          </p>
          <span className="block mt-2 font-sans font-bold text-[11px] text-blue-400 non-italic">
            — Josef Müller-Brockmann (1914–1996), 스위스 인터내셔널 스타일의 거장
          </span>
        </div>

        {/* 5 Core Principles from the Book */}
        <div className="space-y-5 text-xs text-slate-300">
          {/* Principle 1: Modular Grid */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs">1</span>
              <span>모듈러 그리드 (Modular Grid) &amp; 컬럼 분할</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              지면을 수직(컬럼)과 수평(행)으로 균등하게 잘라 만들어낸 <strong>격자 모듈(Grid Module)</strong>이 모든 타이포그래피와 포스터 비주얼의 위치 기준이 됩니다. 대표적으로 <strong>8-모듈, 12-모듈, 20-모듈, 32-모듈 시스템</strong>이 쓰이며, 특히 12-모듈은 2, 3, 4, 6등분이 모두 가능하여 포스터 제작 시 가장 유연합니다.
            </p>
          </div>

          {/* Principle 2: Baseline Grid */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs">2</span>
              <span>베이스라인 그리드 (Baseline Grid) &amp; 타이포 행간</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              글자의 밑선(Baseline)이 지면 전체에 일정한 간격으로 그어져 있어야 합니다. 제목, 본문, 각주, 도표의 모든 텍스트 라인은 동일한 베이스라인 높이(Leading)에 오차 없이 흡착(Snap)되어야 눈이 편안한 수학적 수평 정렬이 완성됩니다.
            </p>
          </div>

          {/* Principle 3: Flowlines */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center text-xs">3</span>
              <span>플로우라인 (Flowlines / Keylines)과 시선 동선</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              컬럼을 가로지르는 수평 가이드선인 <strong>플로우라인</strong>은 관람자의 시선이 머무는 층(Tier)을 지정합니다. 헤드라인이 끝나는 지점, 메인 사진이 시작되는 지점, 하단 정보 레이아웃이 분리되는 수평 기준선 역할을 담당합니다.
            </p>
          </div>

          {/* Principle 4: Functional Margins */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center text-xs">4</span>
              <span>여백(Margins)과 백색 공간(Whitespace)의 보호</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              포스터 외곽의 여백은 단순한 남는 공간이 아닙니다. 프레임 외곽의 시각적 소음을 차단하고 관람자의 시선을 지면 중앙으로 수집하는 '보호벽'입니다. 상하좌우 마진 비율(예: Top-Left-Right 1:1:1 또는 황금비율)을 철저히 지킵니다.
            </p>
          </div>

          {/* Principle 5: Asymmetric Alignment & Hierarchy */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-400 flex items-center justify-center text-xs">5</span>
              <span>비대칭 정렬 (Asymmetric Alignment)과 산세리프</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              중앙 정렬(Centered Layout)은 조형적 긴장감이 떨어집니다. 브로크만은 <strong>좌측 정렬(Flush Left / Ragged Right)</strong>과 산세리프 서체(Akzidenz-Grotesk, Helvetica)를 적용하여 읽기 속도를 극대화하고 현대적인 명확성을 확보했습니다.
            </p>
          </div>
        </div>

        {/* Footer close */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            Poster Grid Inspector는 브로크만의 수치 및 격자 모델을 충실히 시각화합니다.
          </span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>이해했습니다</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
