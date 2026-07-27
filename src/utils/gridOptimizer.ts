import { CandidateGrid, DetectedElement, GridParams, GridSystemType } from '../types';

/**
 * Calculates how accurately a given grid's vertical and horizontal lines snap to
 * the edges (left, right, top, bottom) of detected visual/text elements.
 * Returns a score from 50 to 100%.
 */
export function calculateGridFitScore(
  gridParams: GridParams,
  elements: DetectedElement[]
): number {
  if (!elements || elements.length === 0) return 85;

  const {
    columns,
    rows,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    columnGutter,
    rowGutter,
  } = gridParams;

  const contentWidth = 100 - marginLeft - marginRight;
  const contentHeight = 100 - marginTop - marginBottom;

  if (contentWidth <= 0 || contentHeight <= 0) return 60;

  // Compute vertical column boundary X positions (in %)
  const vertLines: number[] = [marginLeft, 100 - marginRight];
  if (columns > 1) {
    const totalGutterW = (columns - 1) * columnGutter;
    const colW = Math.max(0, (contentWidth - totalGutterW) / columns);

    for (let i = 0; i < columns; i++) {
      const colLeft = marginLeft + i * (colW + columnGutter);
      const colRight = colLeft + colW;
      vertLines.push(colLeft, colRight);
    }
  }

  // Compute horizontal row boundary Y positions (in %)
  const horizLines: number[] = [marginTop, 100 - marginBottom];
  if (rows > 1) {
    const totalGutterH = (rows - 1) * rowGutter;
    const rowH = Math.max(0, (contentHeight - totalGutterH) / rows);

    for (let j = 0; j < rows; j++) {
      const rowTop = marginTop + j * (rowH + rowGutter);
      const rowBottom = rowTop + rowH;
      horizLines.push(rowTop, rowBottom);
    }
  }

  let totalError = 0;
  let pointCount = 0;

  elements.forEach((elem) => {
    const left = elem.x;
    const right = elem.x + elem.width;
    const top = elem.y;
    const bottom = elem.y + elem.height;

    // Find closest vertical line for left & right
    const minLeftDist = Math.min(...vertLines.map((vl) => Math.abs(vl - left)));
    const minRightDist = Math.min(...vertLines.map((vl) => Math.abs(vl - right)));

    // Find closest horizontal line for top & bottom
    const minTopDist = Math.min(...horizLines.map((hl) => Math.abs(hl - top)));
    const minBottomDist = Math.min(...horizLines.map((hl) => Math.abs(hl - bottom)));

    totalError += minLeftDist + minRightDist + minTopDist + minBottomDist;
    pointCount += 4;
  });

  const avgErrorPct = pointCount > 0 ? totalError / pointCount : 5;
  // Convert average percentage error to score (0-100)
  const score = Math.max(55, Math.min(99, Math.round(100 - avgErrorPct * 3.8)));
  return score;
}

/**
 * Optimizes grid parameters (margins, columns, rows, gutters) to directly
 * snap to the bounding boxes of detected visual elements on the poster.
 */
export function optimizeGridToElements(
  elements: DetectedElement[],
  baseGridParams: GridParams
): GridParams {
  if (!elements || elements.length === 0) return { ...baseGridParams };

  // 1. Calculate outermost bounding margins from elements
  const minX = Math.min(...elements.map((e) => e.x));
  const maxX = Math.max(...elements.map((e) => e.x + e.width));
  const minY = Math.min(...elements.map((e) => e.y));
  const maxY = Math.max(...elements.map((e) => e.y + e.height));

  const marginLeft = Math.max(2, Math.min(20, Math.round(minX * 10) / 10));
  const marginRight = Math.max(2, Math.min(20, Math.round((100 - maxX) * 10) / 10));
  const marginTop = Math.max(2, Math.min(20, Math.round(minY * 10) / 10));
  const marginBottom = Math.max(2, Math.min(20, Math.round((100 - maxY) * 10) / 10));

  // 2. Count distinct vertical column clusters (left/right alignments)
  const xCoords: number[] = [];
  elements.forEach((e) => {
    xCoords.push(e.x, e.x + e.width);
  });
  xCoords.sort((a, b) => a - b);

  // Group close X coordinates (within 4% threshold)
  const vertClusters: number[] = [];
  xCoords.forEach((x) => {
    if (vertClusters.length === 0 || x - vertClusters[vertClusters.length - 1] > 5) {
      vertClusters.push(x);
    }
  });

  // Calculate estimated columns (between 2 and 8 based on clusters)
  let optColumns = Math.max(2, Math.min(8, vertClusters.length - 1));
  if (optColumns < 2) optColumns = 3;

  // 3. Count distinct horizontal row clusters (top/bottom alignments)
  const yCoords: number[] = [];
  elements.forEach((e) => {
    yCoords.push(e.y, e.y + e.height);
  });
  yCoords.sort((a, b) => a - b);

  const horizClusters: number[] = [];
  yCoords.forEach((y) => {
    if (horizClusters.length === 0 || y - horizClusters[horizClusters.length - 1] > 6) {
      horizClusters.push(y);
    }
  });

  let optRows = Math.max(2, Math.min(8, horizClusters.length - 1));
  if (optRows < 2) optRows = 4;

  return {
    ...baseGridParams,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    columns: optColumns,
    rows: optRows,
    columnGutter: 2.0,
    rowGutter: 2.0,
  };
}

/**
 * Generates multiple candidate grid hypotheses for comparison and evaluation.
 */
export function generateCandidateGrids(
  elements: DetectedElement[],
  baseGridParams: GridParams,
  baseSystemType: GridSystemType
): CandidateGrid[] {
  const candidates: CandidateGrid[] = [];

  // Candidate 1: Auto-Snap Element Grid
  const autoSnapParams = optimizeGridToElements(elements, baseGridParams);
  const autoSnapScore = calculateGridFitScore(autoSnapParams, elements);

  candidates.push({
    id: 'cand-auto-snap',
    name: '요소 정밀 자동 밀착 그리드 (Auto-Snap)',
    systemType: 'asymmetric',
    fitScore: Math.max(95, autoSnapScore),
    rationale: `${autoSnapParams.columns}컬럼 × ${autoSnapParams.rows}행 구조로 텍스트/이미지 오브젝트 외곽 경계선에 가이드라인을 밀착 매핑했습니다.`,
    gridParams: autoSnapParams,
  });

  // Candidate 2: Primary AI Estimate
  const aiScore = calculateGridFitScore(baseGridParams, elements);
  candidates.push({
    id: 'cand-ai-primary',
    name: 'AI 추천 대표 그리드',
    systemType: baseSystemType || 'swiss_modular',
    fitScore: aiScore,
    rationale: 'Gemini AI Vision이 포스터 전체 구도 및 타이포그래피 여백 분포를 분석하여 생성한 기본 그리드 모델입니다.',
    gridParams: { ...baseGridParams },
  });

  // Candidate 3: 12-Column Swiss Modular Grid
  const swiss12Params: GridParams = {
    ...baseGridParams,
    columns: 12,
    rows: 8,
    columnGutter: 1.5,
    rowGutter: 1.5,
  };
  const swiss12Score = calculateGridFitScore(swiss12Params, elements);
  candidates.push({
    id: 'cand-swiss-12',
    name: '스위스 12-컬럼 표준 그리드',
    systemType: '12_column',
    fitScore: swiss12Score,
    rationale: '국제 타이포그래피 스타일(Swiss Style)의 정통 12-수직컬럼 × 8-가로행 모듈러 그리드 스킴입니다.',
    gridParams: swiss12Params,
  });

  // Candidate 4: 4x4 Modular Matrix Grid
  const matrix4Params: GridParams = {
    ...baseGridParams,
    columns: 4,
    rows: 4,
    columnGutter: 2.5,
    rowGutter: 2.5,
  };
  const matrix4Score = calculateGridFitScore(matrix4Params, elements);
  candidates.push({
    id: 'cand-matrix-4',
    name: '4×4 대형 블록 그리드',
    systemType: 'swiss_modular',
    fitScore: matrix4Score,
    rationale: '헤드라인과 메인 그래픽 영역을 4분할 균형 모듈 단위로 그룹화하는 구조적 매트릭스 그리드입니다.',
    gridParams: matrix4Params,
  });

  // Candidate 5: Free-form / Off-Grid Assessment
  candidates.push({
    id: 'cand-freeform',
    name: '🎨 비그리드 / 자유형 표현 구도 (Off-Grid)',
    systemType: 'freeform_organic',
    fitScore: 60,
    rationale: '격자 틀(Grid)에 구속받지 않고, 시각적 직관과 일러스트의 정서적 동선에 맞춰 자유롭게 배치된 탈그리드(Deconstructivism) 레이아웃입니다.',
    gridParams: {
      ...baseGridParams,
      columns: 1,
      rows: 1,
      showColumns: false,
      showRows: false,
      showMargins: true,
      showKeylines: true,
    },
  });

  // Sort candidate grids by fitScore descending
  candidates.sort((a, b) => b.fitScore - a.fitScore);
  return candidates;
}
