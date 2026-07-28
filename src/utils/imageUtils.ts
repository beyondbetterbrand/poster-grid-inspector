import { DetectedElement } from '../types';

/**
 * Converts any image source into an optimized JPEG base64 data URL
 * (~800px width) for fast, lightweight Gemini Vision API processing.
 */
export async function prepareImageForVisionApi(
  imageSrc: string
): Promise<{ base64Png: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Max dimension 600px for single-tile Gemini Vision token efficiency (~258 tokens) and ultra-light payload (~40KB)
        const maxDim = 600;
        const origW = img.naturalWidth || img.width || 600;
        const origH = img.naturalHeight || img.height || 800;

        let w = origW;
        let h = origH;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64Png: imageSrc, mimeType: 'image/jpeg' });
          return;
        }

        // Fill white background for transparent SVGs/PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress as JPEG 0.75 for ultra-fast transfer (~35-50KB)
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve({ base64Png: jpegDataUrl, mimeType: 'image/jpeg' });
      } catch (err) {
        console.warn('Canvas rasterization failed:', err);
        resolve({ base64Png: imageSrc, mimeType: 'image/jpeg' });
      }
    };

    img.onerror = (err) => {
      console.warn('Failed to load image for canvas rendering:', err);
      resolve({ base64Png: imageSrc, mimeType: 'image/jpeg' });
    };

    img.src = imageSrc;
  });
}

export interface LocalAnalysisResult {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  detectedElements: DetectedElement[];
}

/**
 * Performs local HTML5 Canvas image edge & contrast analysis
 * to extract real pixel content margins (top, bottom, left, right)
 * and distinct visual/text blocks from the actual uploaded poster image.
 */
export async function analyzePosterImageLocally(
  imageSrc: string
): Promise<LocalAnalysisResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const W = 300;
        const H = Math.round((300 * (img.naturalHeight || img.height || 400)) / (img.naturalWidth || img.width || 300));
        canvas.width = W;
        canvas.height = H;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getDefaultLocalResult());
          return;
        }

        ctx.drawImage(img, 0, 0, W, H);
        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;

        // Sample background color from corners
        const cornerIndices = [0, (W - 1) * 4, (H - 1) * W * 4, ((H - 1) * W + (W - 1)) * 4];
        let bgR = 0, bgG = 0, bgB = 0;
        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= 4; bgG /= 4; bgB /= 4;

        // Content mask array: 1 if pixel differs significantly from background, 0 otherwise
        let minX = W, maxX = 0, minY = H, maxY = 0;
        let contentCount = 0;

        const rowDensity = new Array(H).fill(0);
        const colDensity = new Array(W).fill(0);

        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
            if (diff > 45) { // Significant contrast threshold
              contentCount++;
              rowDensity[y]++;
              colDensity[x]++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (contentCount < 50 || minX >= maxX || minY >= maxY) {
          resolve(getDefaultLocalResult());
          return;
        }

        // Convert pixel bounds to percentage margins (0 - 100%)
        const marginLeft = Math.max(2, Math.min(25, Math.round((minX / W) * 1000) / 10));
        const marginRight = Math.max(2, Math.min(25, Math.round(((W - maxX) / W) * 1000) / 10));
        const marginTop = Math.max(2, Math.min(25, Math.round((minY / H) * 1000) / 10));
        const marginBottom = Math.max(2, Math.min(25, Math.round(((H - maxY) / H) * 1000) / 10));

        // Group rows into 3-5 vertical content bands (elements)
        const detectedElements: DetectedElement[] = [];
        let inBand = false;
        let bandStart = 0;
        const minBandHeight = Math.max(3, Math.round(H * 0.04));

        for (let y = minY; y <= maxY; y++) {
          const isRowContent = rowDensity[y] > W * 0.03;
          if (isRowContent && !inBand) {
            inBand = true;
            bandStart = y;
          } else if (!isRowContent && inBand) {
            inBand = false;
            const bandH = y - bandStart;
            if (bandH >= minBandHeight) {
              const elemY = Math.round((bandStart / H) * 1000) / 10;
              const elemH = Math.round((bandH / H) * 1000) / 10;
              const elemX = marginLeft;
              const elemW = Math.round((100 - marginLeft - marginRight) * 10) / 10;

              const elemId = `loc-${detectedElements.length + 1}`;
              const labelText =
                detectedElements.length === 0
                  ? '상단 헤드라인/타이틀 영역'
                  : detectedElements.length === 1
                  ? '중앙 비주얼/본문 블록'
                  : '하단 정보/크레딧 컬럼';

              detectedElements.push({
                id: elemId,
                label: labelText,
                type: detectedElements.length === 0 ? 'headline' : 'body',
                x: elemX,
                y: elemY,
                width: elemW,
                height: elemH,
                alignmentNote: `스마트 비전 매핑 (${elemX}% ~ ${elemX + elemW}%)`,
              });
            }
          }
        }

        if (detectedElements.length === 0) {
          detectedElements.push({
            id: 'loc-1',
            label: '감지된 주요 콘텐트 영역',
            type: 'headline',
            x: marginLeft,
            y: marginTop,
            width: Math.round((100 - marginLeft - marginRight) * 10) / 10,
            height: Math.round((100 - marginTop - marginBottom) * 10) / 10,
          });
        }

        resolve({
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          detectedElements,
        });
      } catch (err) {
        console.warn('Local canvas analysis error:', err);
        resolve(getDefaultLocalResult());
      }
    };

    img.onerror = () => resolve(getDefaultLocalResult());
    img.src = imageSrc;
  });
}

function getDefaultLocalResult(): LocalAnalysisResult {
  return {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 6.7,
    marginRight: 6.7,
    detectedElements: [
      {
        id: 'def-1',
        label: '상단 타이틀 영역',
        type: 'headline',
        x: 6.7,
        y: 8,
        width: 86.6,
        height: 18,
      },
      {
        id: 'def-2',
        label: '중앙 비주얼 콘텐츠 블록',
        type: 'image',
        x: 6.7,
        y: 28,
        width: 86.6,
        height: 48,
      },
      {
        id: 'def-3',
        label: '하단 정보 및 푸터 영역',
        type: 'footer',
        x: 6.7,
        y: 78,
        width: 86.6,
        height: 14,
      },
    ],
  };
}

export function formatTypeHierarchyRating(rating?: string): string {
  if (!rating) return 'A등급 (우수한 정보 위계)';
  
  const str = rating.trim();
  
  // Matches "7 / 10", "7/10", "8/10", "9.5/10", etc.
  const fractionMatch = str.match(/^(\d+(?:\.\d+)?)\s*\/\s*10$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    if (num >= 9) return 'S등급 (완벽한 정보 위계)';
    if (num >= 7) return 'A등급 (우수한 정보 위계)';
    if (num >= 5) return 'B등급 (양호한 정보 위계)';
    return 'C등급 (위계 보완 필요)';
  }
  
  // Matches pure numbers like "7", "8", "9"
  if (/^\d+(?:\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num >= 9) return 'S등급 (완벽한 정보 위계)';
    if (num >= 7) return 'A등급 (우수한 정보 위계)';
    if (num >= 5) return 'B등급 (양호한 정보 위계)';
    return 'C등급 (위계 보완 필요)';
  }

  return str;
}

