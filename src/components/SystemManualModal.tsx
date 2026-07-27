import React, { useState } from 'react';
import {
  X,
  BookOpen,
  HelpCircle,
  Target,
  Sparkles,
  Layers,
  Award,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Info,
  Activity,
  FileText
} from 'lucide-react';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'process' | 'glossary' | 'guide'>('process');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0F1015] border border-[#232733] text-white rounded-xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-6 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C93A6] hover:text-white p-1.5 rounded-lg hover:bg-[#1C202B] transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#232733] shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2 py-0.5 rounded">
              SYSTEM USER MANUAL &amp; GUIDE
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF3B30]" />
            <span>포스터 그리드 인스펙터 시스템 분석 매뉴얼</span>
          </h2>
          <p className="text-xs text-[#8C93A6] mt-1">
            분석 프로세스, 핵심 지표(FIT, 신뢰도 등) 및 용어 정의, 평가 결과 이해를 위한 종합 가이드
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#232733] bg-[#141721] p-1 gap-1 my-4 shrink-0 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('process')}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 transition-all ${
              activeTab === 'process'
                ? 'bg-[#FF3B30] text-white shadow-md'
                : 'text-[#8C93A6] hover:text-white hover:bg-[#1C202B]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. 분석 기준 &amp; 원리</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 transition-all ${
              activeTab === 'glossary'
                ? 'bg-[#FF3B30] text-white shadow-md'
                : 'text-[#8C93A6] hover:text-white hover:bg-[#1C202B]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. 용어 &amp; 지표 사전</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 transition-all ${
              activeTab === 'guide'
                ? 'bg-[#FF3B30] text-white shadow-md'
                : 'text-[#8C93A6] hover:text-white hover:bg-[#1C202B]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. 결과 해석 &amp; 활용법</span>
          </button>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-[#C2C8D6] custom-scrollbar">
          {/* TAB 1: 분석 기준 & 원리 */}
          {activeTab === 'process' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-[#161821] border border-[#232733] rounded-lg">
                <h3 className="text-sm font-bold text-white font-mono mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                  <span>시스템 분석의 기본 원리</span>
                </h3>
                <p className="leading-relaxed text-[#A0A7BA]">
                  본 시스템은 스위스 국제 타이포그래피 스타일(Swiss International Style)과 요제프 뮐러 브로크만(Josef Müller-Brockmann)의 수치 정렬 모델을 기반으로 동작합니다. 업로드된 포스터를 3단계 자동화 프로세스로 수학적으로 분석합니다.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#FF3B30] text-white font-mono font-extrabold flex items-center justify-center text-xs">
                    01
                  </span>
                  <h4 className="font-bold text-white text-sm">Gemini AI Vision OCR &amp; 경계 검출 (Bounding Box)</h4>
                </div>
                <p className="pl-8 text-[#A0A7BA] leading-relaxed">
                  포스터 내의 주요 헤드라인, 서브 텍스트, 본문 단락, 이미지 박스, 로고 등의 위치를 픽셀 단위로 정밀 추출합니다. 외곽 여백(마진)을 자동으로 산출합니다.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#3B82F6] text-white font-mono font-extrabold flex items-center justify-center text-xs">
                    02
                  </span>
                  <h4 className="font-bold text-white text-sm">4가지 수학적 그리드 가설(Grid Hypotheses) 자동 생성</h4>
                </div>
                <p className="pl-8 text-[#A0A7BA] leading-relaxed">
                  검출된 요소 위치 정보를 기반으로 <strong>① 요소 정밀 밀착 그리드 (Auto-Snap)</strong>, <strong>② 스위스 12-컬럼 모듈러 그리드</strong>, <strong>③ 4x4 대형 블록 그리드</strong>, <strong>④ AI 추천 대표 그리드</strong> 등 4가지 후보 격자 체계를 자동 연산합니다.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#10B981] text-white font-mono font-extrabold flex items-center justify-center text-xs">
                    03
                  </span>
                  <h4 className="font-bold text-white text-sm">FIT(일치율) 연산 &amp; 스위스 스타일 종합 평가</h4>
                </div>
                <p className="pl-8 text-[#A0A7BA] leading-relaxed">
                  각 요소의 좌우/상하 경계선이 그리드 가이드라인에 얼마나 접촉하는지 계산하여 **FIT(%)**를 도출하고, 여백 비율, 비대칭 균형, 타이포 위계를 평가해 **10점 만점 평점**과 **AI 확신도(Confidence %)**를 산출합니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 용어 & 지표 사전 */}
          {activeTab === 'glossary' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Item 1: 그리드 가설 */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <Layers className="w-4 h-4 text-[#FF3B30]" />
                    그리드 가설 (Grid Hypothesis)
                  </span>
                  <span className="text-[10px] bg-[#FF3B30]/10 text-[#FF6B60] border border-[#FF3B30]/30 px-2 py-0.5 rounded font-mono">
                    후보 모델
                  </span>
                </div>
                <p className="text-[#A0A7BA] leading-relaxed">
                  디자이너가 포스터 제작 시 사용했을 것으로 추정되는 <strong>숨겨진 레이아웃 격자 구조</strong>입니다. 시스템은 4가지 주요 가설을 제시하며, 사용자는 마우스 클릭 하나로 실시간 그리드 가이드 오버레이를 변경할 수 있습니다.
                </p>
              </div>

              {/* Item 2: FIT */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <Target className="w-4 h-4 text-[#10B981]" />
                    FIT (그리드 밀착도 / 일치율 %)
                  </span>
                  <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-mono">
                    수학적 정렬지수
                  </span>
                </div>
                <p className="text-[#A0A7BA] leading-relaxed">
                  추출된 포스터 요소(글자, 이미지 박스)의 외곽 경계선이 <strong>해당 그리드 가이드라인에 기하학적으로 얼마나 정확하게 맞물려 있는가</strong>를 나타내는 0~100% 수치입니다. FIT이 90% 이상이면 요소들이 해당 그리드 축에 칼같이 정렬되어 있음을 의미합니다.
                </p>
              </div>

              {/* Item 3: Keylines */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <span className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                    키라인 (Keylines / 주요 구조 정렬축)
                  </span>
                  <span className="text-[10px] bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 rounded font-mono">
                    청록색 가이드선
                  </span>
                </div>
                <p className="text-[#A0A7BA] leading-relaxed">
                  포스터 전반을 가르는 일반 모듈 격자(컬럼/행) 외에, <strong>타이틀 헤드라인 베이스라인, 메인 비주얼 분할선, 하단 크레딧 시작선 등 '시선과 구도의 중심이 되는 핵심 수평/수직 기준선'</strong>입니다. AI가 화면 속 주요 텍스트 및 이미지 경계선 중 가장 지배적인 축을 인지하여 청록색(#00F0FF)선으로 표시합니다.
                </p>
              </div>

              {/* Item 4: 신뢰도 */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <Info className="w-4 h-4 text-[#3B82F6]" />
                    신뢰도 (Confidence %)
                  </span>
                  <span className="text-[10px] bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30 px-2 py-0.5 rounded font-mono">
                    AI 종합 확신지수
                  </span>
                </div>
                <p className="text-[#A0A7BA] leading-relaxed">
                  Gemini AI Vision 모델이 이미지의 선명도, OCR 해상도, 레이아웃의 규칙성, 전반적인 구도를 종합적으로 판독하여 <strong>'이 분석 결과 및 포스터 구조 인지가 얼마나 정확한가'</strong>를 확신하는 종합 판독 확률(0~100%)입니다.
                </p>
              </div>

              {/* Item 4: 스위스 디자인 평점 */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <Award className="w-4 h-4 text-[#F59E0B]" />
                    스위스 디자인 평점 (Swiss Rating / 10점 만점)
                  </span>
                  <span className="text-[10px] bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/30 px-2 py-0.5 rounded font-mono">
                    스타일 준수도
                  </span>
                </div>
                <p className="text-[#A0A7BA] leading-relaxed">
                  포스터가 스위스 국제 타이포그래피 스타일 지침(명확한 타이포 그래피 위계, 여백의 조화, 모듈 축 정렬, 산세리프 및 좌측 정렬 등)을 얼마나 충실히 따르고 있는지 나타내는 디자인 품질 평점입니다.
                </p>
              </div>

              {/* Item 5: 마진 & 컬럼 & 행 */}
              <div className="p-3.5 bg-[#141721] border border-[#232733] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5 font-mono">
                    <Sliders className="w-4 h-4 text-[#A855F7]" />
                    마진(Margin) &amp; 컬럼(Column) &amp; 행(Row) &amp; 거터(Gutter)
                  </span>
                </div>
                <ul className="list-disc pl-5 text-[#A0A7BA] space-y-1 leading-relaxed">
                  <li><strong>Margin(여백)</strong>: 지면 외곽 테두리(상, 하, 좌, 우) 보호용 빈 공간 비율(%).</li>
                  <li><strong>Column(세로 컬럼)</strong>: 지면을 세로로 분할하는 분할 축 개수 (예: 12-컬럼).</li>
                  <li><strong>Row(가로 행)</strong>: 지면을 가로로 분할하는 가로축 개수 (예: 8-행 모듈).</li>
                  <li><strong>Gutter(간격)</strong>: 컬럼과 컬럼 사이, 행과 행 사이의 빈 사이 간격 비율(%).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: 결과 해석 & 활용법 */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Q1: FIT vs 신뢰도 차이 */}
              <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Q. FIT(95%)과 신뢰도(88%)의 숫자가 왜 다른가요?</span>
                </h4>
                <div className="p-3 bg-[#0F1015] border border-[#232733] rounded text-[#A0A7BA] leading-relaxed space-y-1.5">
                  <p>
                    • <strong>FIT (95%)</strong>은 개별 가설 그리드 선에 포스터 오브젝트들이 얼마나 딱 붙어있는지를 나타내는 <strong>수학적 밀착률</strong>입니다.
                  </p>
                  <p>
                    • <strong>신뢰도 (88%)</strong>는 AI가 이미지 OCR 정확도, 노이즈, 전체 구도 등을 종합적으로 판단하여 이 포스터를 분석해낸 <strong>AI 모델 자체의 확신 수준</strong>입니다.
                  </p>
                  <p className="text-[#FF6B60] font-semibold pt-1">
                    👉 즉, "AI는 전체 포스터 분석을 88% 확신하며, 선택된 1번 가설 그리드는 요소들과 95% 정밀하게 맞물려 있다"라고 이해하시면 됩니다.
                  </p>
                </div>
              </div>

              {/* Q2: 어떻게 가설을 선택하고 조정해야 하나요? */}
              <div className="p-4 bg-[#141721] border border-[#232733] rounded-lg space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF3B30]" />
                  <span>Q. 분석 결과를 어떻게 활용하고 최적화하나요?</span>
                </h4>
                <ol className="list-decimal pl-5 text-[#A0A7BA] space-y-2 leading-relaxed">
                  <li>
                    <strong>[그리드 가설] 탭</strong>에서 4가지 후보 중 FIT이 가장 높거나 실물과 가장 어울리는 가설 카드의 <code className="text-white bg-[#232733] px-1 py-0.5 rounded">Active</code> 버튼을 클릭합니다.
                  </li>
                  <li>
                    <strong>[요소 위치] 탭</strong>에서 마우스를 올려 AI가 인지한 텍스트 및 이미지 영역 박스들과 그리드 가이드라인의 맞물림을 확인합니다.
                  </li>
                  <li>
                    더 미세한 맞춤 조정을 원하신다면 <strong>[직접 조정] 탭</strong>에서 마진, 컬럼 수, 행 수, 베이스라인 간격을 조절합니다.
                  </li>
                  <li>
                    상단의 <strong>[SVG 내보내기]</strong> 버튼을 통해 Figma, Illustrator에서 바로 편집 가능한 완벽한 가이드 레이어 파일로 다운로드합니다.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t border-[#232733] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#5C6479] font-mono">
            Swiss Grid Inspector v2.5 // Automated Vision Analysis
          </span>
          <button
            onClick={onClose}
            className="bg-[#FF3B30] hover:bg-[#E03126] text-white font-mono font-bold text-xs px-5 py-2.5 rounded transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>확인 및 매뉴얼 닫기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
