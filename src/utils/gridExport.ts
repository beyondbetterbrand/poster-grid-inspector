import { GridParams, DetectedElement, Keyline } from '../types';

export interface ExportOptions {
  includePosterBackground: boolean;
  includeColumns: boolean;
  includeRows: boolean;
  includeMargins: boolean;
  includeBaseline: boolean;
  includeDiagonal: boolean;
  includeGoldenRatio: boolean;
  includeRuleOfThirds: boolean;
  includeKeylines: boolean;
  includeBoundingBoxes: boolean;
  asFigmaLayers: boolean;
  customWidth?: number;
  customHeight?: number;
}

export function generateSvgContent(
  imageSrc: string | null,
  gridParams: GridParams,
  detectedElements: DetectedElement[],
  keylines: Keyline[],
  options: ExportOptions,
  imageDimensions: { width: number; height: number } = { width: 1200, height: 1600 }
): string {
  const w = options.customWidth || imageDimensions.width || 1200;
  const h = options.customHeight || imageDimensions.height || 1600;

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
    diagonalAngle = 0,
    color = '#3B82F6',
    opacity = 0.8,
    strokeWidth = 1.5,
  } = gridParams;

  // Calculate pixel bounds
  const topPx = (marginTop / 100) * h;
  const bottomPx = h - (marginBottom / 100) * h;
  const leftPx = (marginLeft / 100) * w;
  const rightPx = w - (marginRight / 100) * w;

  const contentWidth = rightPx - leftPx;
  const contentHeight = bottomPx - topPx;

  // Columns calculation
  const totalColumnGutters = Math.max(0, columns - 1) * ((columnGutter / 100) * w);
  const singleColWidth = Math.max(0, (contentWidth - totalColumnGutters) / columns);

  // Rows calculation
  const totalRowGutters = Math.max(0, rows - 1) * ((rowGutter / 100) * h);
  const singleRowHeight = Math.max(0, (contentHeight - totalRowGutters) / rows);

  let svgElements = '';

  // 1. Poster Background Image (if requested)
  if (options.includePosterBackground && imageSrc) {
    svgElements += `
  <g id="Poster-Image-Layer">
    <image href="${imageSrc}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>
  </g>`;
  } else {
    svgElements += `
  <g id="Background-Canvas">
    <rect width="${w}" height="${h}" fill="#FFFFFF"/>
  </g>`;
  }

  // Helper for stroke color
  const strokeAttr = `stroke="${color}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"`;
  const fillAttr = `fill="${color}" fill-opacity="${opacity * 0.15}"`;

  // 2. Margins Layer
  if (options.includeMargins) {
    svgElements += `
  <g id="Grid-Layer-Margins">
    <!-- Outer Margin Rect -->
    <rect x="${leftPx}" y="${topPx}" width="${contentWidth}" height="${contentHeight}" fill="none" ${strokeAttr} stroke-dasharray="4 4"/>
    <text x="${leftPx + 6}" y="${topPx - 6}" font-family="sans-serif" font-size="12" fill="${color}">Margin: Top ${marginTop}% | Left ${marginLeft}% | Right ${marginRight}% | Bottom ${marginBottom}%</text>
  </g>`;
  }

  // 3. Columns Layer
  if (options.includeColumns && columns > 0) {
    let colSvg = `\n  <g id="Grid-Layer-Columns">`;
    for (let i = 0; i < columns; i++) {
      const colLeft = leftPx + i * (singleColWidth + (columnGutter / 100) * w);
      colSvg += `
    <rect x="${colLeft}" y="${topPx}" width="${singleColWidth}" height="${contentHeight}" ${fillAttr} ${strokeAttr}/>
    <text x="${colLeft + singleColWidth / 2}" y="${topPx + 16}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="${color}">C${i + 1}</text>`;
    }
    colSvg += `\n  </g>`;
    svgElements += colSvg;
  }

  // 4. Rows Layer
  if (options.includeRows && rows > 0) {
    let rowSvg = `\n  <g id="Grid-Layer-Rows">`;
    for (let j = 0; j < rows; j++) {
      const rowTop = topPx + j * (singleRowHeight + (rowGutter / 100) * h);
      rowSvg += `
    <rect x="${leftPx}" y="${rowTop}" width="${contentWidth}" height="${singleRowHeight}" fill="none" ${strokeAttr} stroke-dasharray="2 2"/>
    <text x="${leftPx - 20}" y="${rowTop + singleRowHeight / 2 + 4}" font-family="sans-serif" font-size="10" fill="${color}">R${j + 1}</text>`;
    }
    rowSvg += `\n  </g>`;
    svgElements += rowSvg;
  }

  // 5. Baseline Grid Layer
  if (options.includeBaseline && baselineSpacing > 0) {
    let baselineSvg = `\n  <g id="Grid-Layer-Baseline">`;
    const stepPx = (baselineSpacing / 100) * h;
    for (let y = topPx; y <= bottomPx; y += stepPx) {
      baselineSvg += `
    <line x1="${leftPx}" y1="${y}" x2="${rightPx}" y2="${y}" stroke="${color}" stroke-opacity="${opacity * 0.4}" stroke-width="0.75"/>`;
    }
    baselineSvg += `\n  </g>`;
    svgElements += baselineSvg;
  }

  // 6. Diagonal / Angled Grid
  if (options.includeDiagonal && diagonalAngle !== 0) {
    const angleRad = (diagonalAngle * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    svgElements += `
  <g id="Grid-Layer-Diagonal" transform="rotate(${diagonalAngle}, ${cx}, ${cy})">
    <line x1="-${w}" y1="${cy}" x2="${w * 2}" y2="${cy}" ${strokeAttr} stroke-dasharray="6 3"/>
    <line x1="${cx}" y1="-${h}" x2="${cx}" y2="${h * 2}" ${strokeAttr} stroke-dasharray="6 3"/>
    <line x1="-${w}" y1="-${h}" x2="${w * 2}" y2="${h * 2}" stroke="${color}" stroke-opacity="${opacity * 0.5}" stroke-width="1"/>
  </g>`;
  }

  // 7. Golden Ratio / Rule of Thirds
  if (options.includeRuleOfThirds) {
    const thirdW = w / 3;
    const thirdH = h / 3;
    svgElements += `
  <g id="Grid-Layer-RuleOfThirds">
    <line x1="${thirdW}" y1="0" x2="${thirdW}" y2="${h}" stroke="#E11D48" stroke-opacity="${opacity}" stroke-width="1.5" stroke-dasharray="5 5"/>
    <line x1="${thirdW * 2}" y1="0" x2="${thirdW * 2}" y2="${h}" stroke="#E11D48" stroke-opacity="${opacity}" stroke-width="1.5" stroke-dasharray="5 5"/>
    <line x1="0" y1="${thirdH}" x2="${w}" y2="${thirdH}" stroke="#E11D48" stroke-opacity="${opacity}" stroke-width="1.5" stroke-dasharray="5 5"/>
    <line x1="0" y1="${thirdH * 2}" x2="${w}" y2="${thirdH * 2}" stroke="#E11D48" stroke-opacity="${opacity}" stroke-width="1.5" stroke-dasharray="5 5"/>
  </g>`;
  }

  if (options.includeGoldenRatio) {
    const phi = 0.61803398875;
    const gx1 = w * (1 - phi);
    const gx2 = w * phi;
    const gy1 = h * (1 - phi);
    const gy2 = h * phi;
    svgElements += `
  <g id="Grid-Layer-GoldenRatio">
    <line x1="${gx1}" y1="0" x2="${gx1}" y2="${h}" stroke="#D97706" stroke-opacity="${opacity}" stroke-width="1.5"/>
    <line x1="${gx2}" y1="0" x2="${gx2}" y2="${h}" stroke="#D97706" stroke-opacity="${opacity}" stroke-width="1.5"/>
    <line x1="0" y1="${gy1}" x2="${w}" y2="${gy1}" stroke="#D97706" stroke-opacity="${opacity}" stroke-width="1.5"/>
    <line x1="0" y1="${gy2}" x2="${w}" y2="${gy2}" stroke="#D97706" stroke-opacity="${opacity}" stroke-width="1.5"/>
  </g>`;
  }

  // 8. Keylines Layer
  if (options.includeKeylines && keylines.length > 0) {
    let keylineSvg = `\n  <g id="Grid-Layer-Keylines">`;
    keylines.forEach((kl) => {
      if (kl.type === 'vertical') {
        const xPos = (kl.position / 100) * w;
        keylineSvg += `
    <line x1="${xPos}" y1="0" x2="${xPos}" y2="${h}" stroke="#10B981" stroke-width="2"/>
    <text x="${xPos + 4}" y="${h - 12}" font-family="sans-serif" font-size="10" fill="#10B981">${kl.label || 'Keyline'}</text>`;
      } else {
        const yPos = (kl.position / 100) * h;
        keylineSvg += `
    <line x1="0" y1="${yPos}" x2="${w}" y2="${yPos}" stroke="#10B981" stroke-width="2"/>
    <text x="12" y="${yPos - 4}" font-family="sans-serif" font-size="10" fill="#10B981">${kl.label || 'Keyline'}</text>`;
      }
    });
    keylineSvg += `\n  </g>`;
    svgElements += keylineSvg;
  }

  // 9. Detected Elements Bounding Boxes
  if (options.includeBoundingBoxes && detectedElements.length > 0) {
    let bboxSvg = `\n  <g id="Detected-Poster-Elements">`;
    detectedElements.forEach((el) => {
      const bx = (el.x / 100) * w;
      const by = (el.y / 100) * h;
      const bw = (el.width / 100) * w;
      const bh = (el.height / 100) * h;
      bboxSvg += `
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#8B5CF6" fill-opacity="0.1" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="3 3"/>
    <rect x="${bx}" y="${by - 18}" width="${Math.min(bw, 180)}" height="18" fill="#8B5CF6"/>
    <text x="${bx + 4}" y="${by - 5}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">${el.label}</text>`;
    });
    bboxSvg += `\n  </g>`;
    svgElements += bboxSvg;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <!-- Generated by Poster Grid Inspector AI -->
${svgElements}
</svg>`;
}

export function downloadSvgFile(svgContent: string, fileName: string = 'poster-grid.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateCssGridCode(gridParams: GridParams): string {
  const {
    columns = 12,
    rows = 8,
    marginTop = 10,
    marginBottom = 10,
    marginLeft = 8,
    marginRight = 8,
    columnGutter = 2,
    rowGutter = 2,
  } = gridParams;

  return `/* Poster Grid CSS Layout System */
.poster-container {
  display: grid;
  width: 100%;
  height: 100%;
  padding-top: ${marginTop}%;
  padding-bottom: ${marginBottom}%;
  padding-left: ${marginLeft}%;
  padding-right: ${marginRight}%;
  grid-template-columns: repeat(${columns}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  column-gap: ${columnGutter}%;
  row-gap: ${rowGutter}%;
  box-sizing: border-box;
}

/* Example Element Spanning 4 Columns and 2 Rows */
.poster-headline {
  grid-column: 1 / span 4;
  grid-row: 1 / span 2;
}

.poster-visual {
  grid-column: 1 / span ${columns};
  grid-row: 3 / span 4;
}`;
}

export function generateTailwindGridCode(gridParams: GridParams): string {
  const { columns = 12, columnGutter = 2 } = gridParams;

  return `<!-- Tailwind CSS Grid Structure -->
<div class="grid grid-cols-${columns} gap-${Math.round(columnGutter * 2)} p-8 w-full h-full">
  <!-- Headline Block -->
  <div class="col-span-${Math.min(columns, 8)} row-span-2">
    <h1 class="text-4xl font-bold tracking-tight">POSTER TITLE</h1>
  </div>

  <!-- Content Block -->
  <div class="col-span-${columns} row-span-4 bg-gray-100 rounded">
    <!-- Visual Image Container -->
  </div>
</div>`;
}
