import React from 'react';
import { X, CheckCircle2, ShieldCheck, DollarSign, Layers, Cpu, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">서비스 및 서버 비용 안내</h2>
            <p className="text-xs text-slate-400">포스터 그리드 예측 및 SVG 내보내기 FAQ</p>
          </div>
        </div>

        <div className="space-y-5 text-sm text-slate-300">
          {/* Question 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-base mb-1">
                  Q. 포스터 이미지를 분석하여 그리드를 예측할 수 있나요?
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>네, 당연히 가능합니다!</strong> 업로드한 포스터 이미지의 타이포그래피 정렬, 메인 비주얼 박스 위치, 여백(Margin), 헤드라인 및 본문 컬럼 폭을 AI 분석 엔진이 정밀 측정합니다. 스위스 12-모듈러 그리드, 6-컬럼 비대칭, 사선 구도, 황금비율, 베이스라인 그리드 등을 자동으로 예측하고 오버레이를 생성합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-base mb-1">
                  Q. 서버 비용이 진짜 안 들어가나요?
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>네, 서버 운영비가 0원입니다!</strong> 이미지 렌더링, 실시간 그리드 연산, 사용자 오버레이 맞춤 조절, SVG 파일 생성 및 내보내기 등 모든 핵심 작업이 사용자의 웹 브라우저(클라이언트) 단에서 직접 실행됩니다. 별도의 대용량 서버나 DB 유지 비용 없이 즉시 파일로 내보낼 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-start gap-3">
              <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white text-base mb-1">
                  Q. 내보낸 SVG는 Figma나 Illustrator에서 쓸 수 있나요?
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  내보내기된 SVG는 <code className="bg-slate-900 text-blue-300 px-1.5 py-0.5 rounded">&lt;g id="Grid-Layer-Columns"&gt;</code> 형태로 구조화된 표준 SVG 벡터입니다. Figma, Adobe Illustrator, InDesign 등에 그대로 불러와서 각 컬럼/마진/스냅 가이드 레이어를 켜고 끄며 작업할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
          >
            확인 및 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
