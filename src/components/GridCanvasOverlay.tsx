import React, { useState, useRef } from 'react';
import { GridParams, DetectedElement, Keyline } from '../types';
import { ZoomIn, ZoomOut, Sparkles, Maximize2, Compass } from 'lucide-react';

interface GridCanvasOverlayProps {
  imageSrc: string | null;
  gridParams: GridParams;
  detectedElements: DetectedElement[];
  keylines: Keyline[];
  hoveredElementId: string | null;
  onHoverElement: (id: string | null) => void;
  isAnalyzing: boolean;
}

export const GridCanvasOverlay: React.FC<GridCanvasOverlayProps> = ({
  imageSrc,
  gridParams,
  detectedElements,
  keylines,
  hoveredElementId,
  onHoverElement,
  isAnalyzing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isSpotlightMode, setIsSpotlightMode] = useState<boolean>(true); // Grid Emphasis
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  // Mouse coordinate tracker for precision ruler HUD
  const [mousePosPercent, setMousePosPercent] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Handle image load to capture actual aspect ratio
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(4, Math.round((prev + 0.2) * 10) / 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, Math.round((prev - 0.2) * 10) / 10));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom support
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(4, Math.round((prev + 0.15) * 100) / 100));
    } else {
      setZoom((prev) => Math.max(0.5, Math.round((prev - 0.15) * 100) / 100));
    }
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const relativeY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMousePosPercent({
        x: Math.round(relativeX * 10) / 10,
        y: Math.round(relativeY * 10) / 10,
      });
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Deconstruct Grid Parameters for SVG rendering
  const {
    columns = 12,
    rows = 8,
    marginTop = 10,
    marginBottom = 10,
    marginLeft = 8,
    marginRight = 8,
    columnGutter = 2,
    rowGutter = 2,
    baselineSpacing = 2.5,
    showBaseline = true,
    diagonalAngle = 0,
    showDiagonal = false,
    color = '#FF3B30',
    opacity = 0.8,
    strokeWidth = 1.5,
    showMargins = true,
    showColumns = true,
    showRows = true,
    showKeylines = true,
    showBoundingBoxes = true,
    showGoldenRatio = false,
    showRuleOfThirds = false,
  } = gridParams;

  const w = 1000;
  const h = (imgDimensions.height / imgDimensions.width) * 1000 || 1333;

  const topPx = (marginTop / 100) * h;
  const bottomPx = h - (marginBottom / 100) * h;
  const leftPx = (marginLeft / 100) * w;
  const rightPx = w - (marginRight / 100) * w;

  const contentW = Math.max(0, rightPx - leftPx);
  const contentH = Math.max(0, bottomPx - topPx);

  const totalColGutters = Math.max(0, columns - 1) * ((columnGutter / 100) * w);
  const singleColWidth = Math.max(0, (contentW - totalColGutters) / columns);

  const totalRowGutters = Math.max(0, rows - 1) * ((rowGutter / 100) * h);
  const singleRowHeight = Math.max(0, (contentH - totalRowGutters) / rows);

  // Dynamic opacity & stroke calculation based on Grid Emphasis
  const effectiveStrokeWidth = isSpotlightMode ? Math.max(strokeWidth * 1.8, 2.5) : strokeWidth;
  const effectiveOpacity = isSpotlightMode ? 1.0 : opacity;
  const effectiveColFillOpacity = isSpotlightMode ? 0.28 : opacity * 0.15;

  return (
    <div className="relative bg-[#0A0B0E] border border-[#232733] overflow-hidden shadow-2xl flex flex-col min-h-[560px] lg:min-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-160px)] h-full select-none">
      {/* Top Overlay Toolbar - Indie Swiss Studio Inspector Header */}
      <div className="bg-[#12141C] border-b border-[#232733] px-3 sm:px-4 py-2 flex items-center justify-between gap-3 text-xs z-20">
        {/* Left: Precision Ruler Coordinates Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#1A1D27] text-[#A6ADB8] font-mono text-[10px] px-2.5 py-1 border border-[#2A2E3D]">
            <Compass className="w-3 h-3 text-[#FF3B30]" />
            <span>X:{mousePosPercent.x}% Y:{mousePosPercent.y}%</span>
          </div>
          <span className="hidden md:inline-block text-[10px] font-mono text-[#5C6479] uppercase">
            SWISS_GRID_SYSTEM//12_COL
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-[#1A1D27] hover:bg-[#282C3B] text-[#C2C8D6] border border-[#2B3042] transition-colors"
            title="축소 (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 bg-[#1A1D27] hover:bg-[#282C3B] text-[#C2C8D6] font-mono text-[11px] font-bold border border-[#2B3042] transition-colors"
            title="원래 크기 및 위치"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-[#1A1D27] hover:bg-[#282C3B] text-[#C2C8D6] border border-[#2B3042] transition-colors"
            title="확대 (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 bg-[#1A1D27] hover:bg-[#282C3B] text-[#C2C8D6] border border-[#2B3042] transition-colors hidden sm:block"
            title="화면 맞춤"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Grid Emphasis Toggle */}
        <button
          onClick={() => setIsSpotlightMode(!isSpotlightMode)}
          className={`px-3 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all border ${
            isSpotlightMode
              ? 'bg-[#FF3B30] text-white border-[#FF3B30] shadow-md shadow-[#FF3B30]/20'
              : 'bg-[#1A1D27] text-[#8C93A6] border-[#2B3042] hover:text-white'
          }`}
          title="그리드를 한눈에 선명하게 강조합니다"
        >
          <Sparkles className="w-3 h-3 text-white" />
          <span>그리드 강조 {isSpotlightMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Technical Top & Left Ruler Bars */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Top Ruler Bar */}
        <div className="h-5 bg-[#12141C] border-b border-[#232733] flex justify-between px-8 text-[9px] font-mono text-[#5C6479] items-center shrink-0">
          <span>0%</span>
          <span>12.5%</span>
          <span>25.0%</span>
          <span>37.5%</span>
          <span>50.0%</span>
          <span>62.5%</span>
          <span>75.0%</span>
          <span>87.5%</span>
          <span>100%</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Ruler Bar */}
          <div className="w-6 bg-[#12141C] border-r border-[#232733] flex flex-col justify-between py-6 text-[8px] font-mono text-[#5C6479] items-center shrink-0">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>

          {/* Main Canvas Workspace */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 relative cursor-grab active:cursor-grabbing flex items-center justify-center p-4 bg-swiss-grid bg-grid-dots overflow-hidden"
          >
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0A0B0E]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-[#FF3B30]/20 border border-[#FF3B30] flex items-center justify-center text-[#FF3B30] animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div className="text-center font-mono">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">SWISS_VISION_SCANNER_PROCESSING...</p>
                  <p className="text-[11px] text-[#8C93A6] mt-1">포스터 레이아웃 타이포그래피 구도 및 스냅축 정밀 분석 중</p>
                </div>
              </div>
            )}

            {/* Scalable High-Precision Canvas Container */}
            {(() => {
              const baseCanvasHeight = 540;
              const canvasDisplayHeight = Math.round(baseCanvasHeight * zoom);
              const canvasDisplayWidth = imgDimensions.height > 0
                ? Math.round(baseCanvasHeight * (imgDimensions.width / imgDimensions.height) * zoom)
                : Math.round(baseCanvasHeight * 0.75 * zoom);

              return (
                <div
                  style={{
                    width: `${canvasDisplayWidth}px`,
                    height: `${canvasDisplayHeight}px`,
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
                    transition: isPanning ? 'none' : 'transform 0.08s ease-out, width 0.08s ease-out, height 0.08s ease-out',
                  }}
                  className="relative shrink-0 flex items-center justify-center border border-[#3A3F52]/60 shadow-2xl overflow-hidden"
                >
                  {/* Poster Image Layer */}
                  {imageSrc && (
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Poster Analysis Canvas"
                      onLoad={handleImageLoad}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'high-quality',
                      }}
                      className={`block transition-all duration-300 ${
                        isSpotlightMode
                          ? 'opacity-20 filter grayscale contrast-150 brightness-90'
                          : 'opacity-100'
                      }`}
                    />
                  )}

              {/* SVG Grid Overlay */}
              <svg
                viewBox={`0 0 ${w} ${h}`}
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                colorInterpolationFilters="sRGB"
                className={`absolute inset-0 w-full h-full pointer-events-auto transition-all duration-300 ${
                  isSpotlightMode ? 'drop-shadow-[0_0_12px_rgba(255,59,48,0.45)]' : ''
                }`}
              >
                {/* 1. Margins */}
                {showMargins && (
                  <g id="layer-margins">
                    <rect
                      x={leftPx}
                      y={topPx}
                      width={contentW}
                      height={contentH}
                      fill="none"
                      stroke={color}
                      strokeOpacity={effectiveOpacity}
                      strokeWidth={effectiveStrokeWidth * 1.3}
                      strokeDasharray="6 4"
                    />
                  </g>
                )}

                {/* 2. Columns */}
                {showColumns && columns > 0 && (
                  <g id="layer-columns">
                    {Array.from({ length: columns }).map((_, i) => {
                      const colLeft = leftPx + i * (singleColWidth + (columnGutter / 100) * w);
                      return (
                        <rect
                          key={`col-${i}`}
                          x={colLeft}
                          y={topPx}
                          width={singleColWidth}
                          height={contentH}
                          fill={color}
                          fillOpacity={effectiveColFillOpacity}
                          stroke={color}
                          strokeOpacity={effectiveOpacity}
                          strokeWidth={effectiveStrokeWidth}
                        />
                      );
                    })}
                  </g>
                )}

                {/* 3. Rows (가로 그리드 / 행) */}
                {showRows && rows > 0 && (
                  <g id="layer-rows">
                    {Array.from({ length: rows }).map((_, j) => {
                      const rowTop = topPx + j * (singleRowHeight + (rowGutter / 100) * h);
                      return (
                        <g key={`row-group-${j}`}>
                          {/* Horizontal Row Fill Tint */}
                          <rect
                            x={leftPx}
                            y={rowTop}
                            width={contentW}
                            height={singleRowHeight}
                            fill={color}
                            fillOpacity={effectiveColFillOpacity * 0.4}
                            stroke={color}
                            strokeOpacity={effectiveOpacity * 0.9}
                            strokeWidth={effectiveStrokeWidth}
                          />
                          <line
                            x1={leftPx}
                            y1={rowTop}
                            x2={rightPx}
                            y2={rowTop}
                            stroke={color}
                            strokeOpacity={effectiveOpacity}
                            strokeWidth={effectiveStrokeWidth * 1.2}
                          />
                          <line
                            x1={leftPx}
                            y1={rowTop + singleRowHeight}
                            x2={rightPx}
                            y2={rowTop + singleRowHeight}
                            stroke={color}
                            strokeOpacity={effectiveOpacity}
                            strokeWidth={effectiveStrokeWidth * 1.2}
                          />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* 4. Baseline Grid */}
                {showBaseline && baselineSpacing > 0 && (
                  <g id="layer-baseline">
                    {(() => {
                      const lines = [];
                      const step = (baselineSpacing / 100) * h;
                      for (let currY = topPx; currY <= bottomPx; currY += step) {
                        lines.push(
                          <line
                            key={`bl-${currY}`}
                            x1={leftPx}
                            y1={currY}
                            x2={rightPx}
                            y2={currY}
                            stroke={color}
                            strokeOpacity={opacity * 0.35}
                            strokeWidth={0.75}
                          />
                        );
                      }
                      return lines;
                    })()}
                  </g>
                )}

                {/* 5. Diagonal / Angled Guide */}
                {showDiagonal && diagonalAngle !== 0 && (
                  <g
                    id="layer-diagonal"
                    transform={`rotate(${diagonalAngle}, ${w / 2}, ${h / 2})`}
                  >
                    <line
                      x1={-w}
                      y1={h / 2}
                      x2={w * 2}
                      y2={h / 2}
                      stroke={color}
                      strokeWidth={strokeWidth * 1.5}
                      strokeDasharray="8 4"
                    />
                    <line
                      x1={w / 2}
                      y1={-h}
                      x2={w / 2}
                      y2={h * 2}
                      stroke={color}
                      strokeWidth={strokeWidth * 1.5}
                      strokeDasharray="8 4"
                    />
                  </g>
                )}

                {/* 6. Rule of Thirds */}
                {showRuleOfThirds && (
                  <g id="layer-rule-of-thirds">
                    <line x1={w / 3} y1={0} x2={w / 3} y2={h} stroke="#FF3B30" strokeWidth={2} strokeDasharray="6 6" />
                    <line x1={(w * 2) / 3} y1={0} x2={(w * 2) / 3} y2={h} stroke="#FF3B30" strokeWidth={2} strokeDasharray="6 6" />
                    <line x1={0} y1={h / 3} x2={w} y2={h / 3} stroke="#FF3B30" strokeWidth={2} strokeDasharray="6 6" />
                    <line x1={0} y1={(h * 2) / 3} x2={w} y2={(h * 2) / 3} stroke="#FF3B30" strokeWidth={2} strokeDasharray="6 6" />
                  </g>
                )}

                {/* 7. Golden Ratio */}
                {showGoldenRatio && (
                  <g id="layer-golden-ratio">
                    {(() => {
                      const phi = 0.61803398875;
                      const gx1 = w * (1 - phi);
                      const gx2 = w * phi;
                      const gy1 = h * (1 - phi);
                      const gy2 = h * phi;
                      return (
                        <>
                          <line x1={gx1} y1={0} x2={gx1} y2={h} stroke="#F59E0B" strokeWidth={2} />
                          <line x1={gx2} y1={0} x2={gx2} y2={h} stroke="#F59E0B" strokeWidth={2} />
                          <line x1={0} y1={gy1} x2={w} y2={gy1} stroke="#F59E0B" strokeWidth={2} />
                          <line x1={0} y1={gy2} x2={w} y2={gy2} stroke="#F59E0B" strokeWidth={2} />
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* 8. Keylines (주요 정렬 축 기준선) */}
                {showKeylines &&
                  keylines.map((kl, idx) => {
                    const labelText = kl.label || `주요 정렬 축 ${idx + 1}`;
                    if (kl.type === 'vertical') {
                      const posX = (kl.position / 100) * w;
                      return (
                        <g key={kl.id}>
                          <line
                            x1={posX}
                            y1={0}
                            x2={posX}
                            y2={h}
                            stroke="#00F0FF"
                            strokeWidth={2.5}
                            strokeDasharray="6 3"
                          />
                          {/* Keyline Vertical Label Tag */}
                          <rect
                            x={Math.min(w - 180, posX + 4)}
                            y={12 + idx * 22}
                            width={160}
                            height={20}
                            fill="#0A0B0E"
                            stroke="#00F0FF"
                            strokeWidth={1.5}
                          />
                          <text
                            x={Math.min(w - 174, posX + 10)}
                            y={26 + idx * 22}
                            fontFamily="JetBrains Mono, monospace"
                            fontSize={11}
                            fontWeight="700"
                            fill="#00F0FF"
                          >
                            [KEYLINE] {labelText.length > 14 ? labelText.slice(0, 13) + '…' : labelText}
                          </text>
                        </g>
                      );
                    } else {
                      const posY = (kl.position / 100) * h;
                      return (
                        <g key={kl.id}>
                          <line
                            x1={0}
                            y1={posY}
                            x2={w}
                            y2={posY}
                            stroke="#00F0FF"
                            strokeWidth={2.5}
                            strokeDasharray="6 3"
                          />
                          {/* Keyline Horizontal Label Tag */}
                          <rect
                            x={12}
                            y={Math.max(4, posY - 22)}
                            width={180}
                            height={20}
                            fill="#0A0B0E"
                            stroke="#00F0FF"
                            strokeWidth={1.5}
                          />
                          <text
                            x={18}
                            y={Math.max(18, posY - 8)}
                            fontFamily="JetBrains Mono, monospace"
                            fontSize={11}
                            fontWeight="700"
                            fill="#00F0FF"
                          >
                            [KEYLINE] {labelText.length > 16 ? labelText.slice(0, 15) + '…' : labelText}
                          </text>
                        </g>
                      );
                    }
                  })}

                {/* 9. Detected Visual Elements Bounding Boxes */}
                {showBoundingBoxes &&
                  detectedElements.map((el) => {
                    const bx = (el.x / 100) * w;
                    const by = (el.y / 100) * h;
                    const bw = (el.width / 100) * w;
                    const bh = (el.height / 100) * h;
                    const isHovered = hoveredElementId === el.id;

                    const labelText = `[AI OCR] ${el.label}`;
                    const badgeWidth = Math.min(Math.max(bw, 140), 280);

                    return (
                      <g
                        key={el.id}
                        onMouseEnter={() => onHoverElement(el.id)}
                        onMouseLeave={() => onHoverElement(null)}
                        className="cursor-pointer transition-opacity"
                      >
                        {/* Fill & Bounding Box Border */}
                        <rect
                          x={bx}
                          y={by}
                          width={bw}
                          height={bh}
                          fill={isHovered ? '#FF3B30' : '#FF3B30'}
                          fillOpacity={isHovered ? 0.35 : 0.12}
                          stroke="#FF3B30"
                          strokeWidth={isHovered ? 3.5 : 1.5}
                          strokeDasharray={isHovered ? 'none' : '4 2'}
                        />

                        {/* Top Label Tag Badge */}
                        <rect
                          x={bx}
                          y={Math.max(0, by - 28)}
                          width={badgeWidth}
                          height={28}
                          fill={isHovered ? '#000000' : '#FF3B30'}
                          stroke="#FF3B30"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={bx + 8}
                          y={Math.max(19, by - 9)}
                          fontFamily="JetBrains Mono, monospace"
                          fontSize={13}
                          fontWeight="700"
                          fill={isHovered ? '#FF3B30' : '#FFFFFF'}
                          letterSpacing="0.02em"
                        >
                          {labelText.length > 28 ? labelText.slice(0, 26) + '…' : labelText}
                        </text>

                        {/* Hover Details Floating Tag */}
                        {isHovered && (
                          <g>
                            <rect
                              x={bx}
                              y={by + bh + 4}
                              width={Math.max(bw, 220)}
                              height={30}
                              fill="#0F1015"
                              stroke="#FF3B30"
                              strokeWidth={1.5}
                              vectorEffect="non-scaling-stroke"
                            />
                            <text
                              x={bx + 8}
                              y={by + bh + 24}
                              fontFamily="JetBrains Mono, monospace"
                              fontSize={12}
                              fontWeight="600"
                              fill="#FFFFFF"
                            >
                              POS: {Math.round(el.x)}%, {Math.round(el.y)}% | SIZE: {Math.round(el.width)}×{Math.round(el.height)}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
              </svg>

              {/* Bottom Canvas Overlay AI Vision Status Badge */}
              {detectedElements.length > 0 && !isAnalyzing && (
                <div className="absolute bottom-3 left-3 bg-[#0F1015]/95 border border-[#232733] px-3.5 py-2 text-xs font-mono text-[#C2C8D6] flex items-center gap-2.5 backdrop-blur-sm shadow-xl pointer-events-none z-20">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-pulse shrink-0" />
                  <span>AI 스마트 비전: <strong className="text-white font-bold">{detectedElements.length}개 요소</strong> 감지 및 그리드축 정렬 완료</span>
                </div>
              )}

              {/* AI Vision Analysis Scanning Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#0A0B0E]/65 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 pointer-events-none">
                  {/* Moving Scan Laser */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent shadow-[0_0_20px_#FF3B30] animate-pulse top-1/2 -translate-y-1/2" />
                  
                  <div className="bg-[#0F1015]/95 border border-[#FF3B30] p-5 text-center max-w-md shadow-2xl space-y-2.5 font-mono">
                    <div className="flex items-center justify-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-[#FF3B30] animate-spin" />
                      <span>포스터 레이아웃 AI 정밀 분석중...</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#C2C8D6] font-sans leading-relaxed">
                      Gemini Vision AI가 이미지 속 텍스트 수평축과 스위스 그리드 구조를 다각도로 정밀 측정하고 있습니다.
                    </p>
                    <div className="inline-block bg-[#FF3B30]/10 border border-[#FF3B30]/40 px-3 py-1 text-xs text-[#FF3B30] font-bold font-sans">
                      ⏱️ 예상 소요 시간: 약 3초 ~ 7초
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
          </div>
        </div>
      </div>
    </div>
  );
};

