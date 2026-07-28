import React, { useRef, useState } from 'react';
import { Upload, Sparkles, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string, file: File) => void;
  isAnalyzing: boolean;
  cooldownSeconds?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isAnalyzing,
  cooldownSeconds = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCooldown = cooldownSeconds > 0;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일(PNG, JPG, WEBP, SVG 등)만 업로드할 수 있습니다.');
      return;
    }
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full font-mono">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
          isDragging
            ? 'border-[#FF3B30] bg-[#FF3B30]/10 scale-[1.01]'
            : 'border-[#232733] hover:border-[#3A3F52] bg-[#0F1015] hover:bg-[#12141C]'
        } ${isAnalyzing ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-[#161821] border border-[#232733] text-[#FF3B30] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
            {isAnalyzing ? (
              <Sparkles className="w-8 h-8 animate-pulse text-[#FF3B30]" />
            ) : (
              <Upload className="w-8 h-8 text-[#FF3B30]" />
            )}
          </div>

          <span className="text-[10px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2 py-0.5 uppercase mb-2">
            IMPORT_POSTER_FILE
          </span>

          {isAnalyzing ? (
            <div className="w-full max-w-sm space-y-3 font-mono text-left">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FF3B30] font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF3B30] animate-spin" />
                  POSTER_GRID_ANALYZING...
                </span>
                <span className="text-white font-bold">약 5초 ~ 10초 소요</span>
              </div>
              <div className="w-full bg-[#161821] h-2.5 border border-[#FF3B30]/50 overflow-hidden relative">
                <div className="bg-gradient-to-r from-[#FF3B30] to-[#FF6B00] h-full w-full animate-[pulse_1s_infinite] relative" />
              </div>
              <p className="text-[11px] text-[#A2A9B8] font-sans text-center">
                이미지 구조 및 스위스 타이포그래피 그리드를 정밀 분석 중입니다.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-extrabold text-white mb-1 uppercase tracking-wide">
                분석할 포스터 이미지 파일을 선택하세요
              </h3>
              <p className="text-[11px] text-[#8C93A6] mb-5 max-w-xs leading-relaxed font-sans">
                드래그 앤 드롭하거나 클릭하여 파일을 로드합니다. (PNG, JPG, WEBP, SVG)
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-white bg-[#FF3B30] px-4 py-2 uppercase transition-all shadow group-hover:bg-[#E03126]">
                  파일 탐색기 열기
                </span>
              </div>

              <div className="mt-2 text-[10px] text-[#A2A9B8] bg-[#161922] border border-[#2B3040] px-3 py-2 text-left flex items-start gap-2 max-w-sm font-sans">
                <span className="text-[#FF3B30] font-bold font-mono shrink-0">[API 쿨다운 안내]</span>
                <p className="leading-normal">
                  {isCooldown ? (
                    <span className="text-[#FF3B30] font-bold">
                      연속 분석 한도 과부하 방지를 위해 {cooldownSeconds}초 대기 중입니다.
                    </span>
                  ) : (
                    <span>
                      무료 Gemini API로 분석 중입니다. 버스트 초과 방지를 위해 <strong className="text-white">25초 간격 쿨다운</strong>이 자동 적용됩니다.
                    </span>
                  )}
                </p>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#FF3B30] bg-[#FF3B30]/10 p-2 border border-[#FF3B30]/30 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
