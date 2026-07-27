export type GridSystemType =
  | 'swiss_modular'
  | '12_column'
  | '6_column'
  | '3_column'
  | 'asymmetric'
  | 'baseline_grid'
  | 'golden_ratio'
  | 'rule_of_thirds'
  | 'diagonal_isometric'
  | 'radial'
  | 'freeform_organic';

export interface GridParams {
  columns: number;
  rows: number;
  marginTop: number; // percentage 0-50
  marginBottom: number; // percentage 0-50
  marginLeft: number; // percentage 0-50
  marginRight: number; // percentage 0-50
  columnGutter: number; // percentage 0-20
  rowGutter: number; // percentage 0-20
  baselineSpacing: number; // percentage 0.5-10
  showBaseline: boolean;
  diagonalAngle: number; // degrees -45 to 45
  showDiagonal: boolean;
  color: string; // hex or rgba
  opacity: number; // 0 to 1
  strokeWidth: number; // 1 to 5
  showMargins: boolean;
  showColumns: boolean;
  showRows: boolean;
  showKeylines: boolean;
  showBoundingBoxes: boolean;
  showGoldenRatio: boolean;
  showRuleOfThirds: boolean;
}

export interface Keyline {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number; // percentage 0-100
  label: string;
  isAutoDetected?: boolean;
}

export interface DetectedElement {
  id: string;
  label: string;
  type: 'headline' | 'body' | 'image' | 'logo' | 'accent' | 'header' | 'footer';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  alignmentNote?: string;
}

export interface CandidateGrid {
  id: string;
  name: string;
  systemType: GridSystemType;
  fitScore: number; // percentage 0-100
  rationale: string;
  gridParams: GridParams;
}

export interface AnalysisResult {
  systemType: GridSystemType;
  systemNameKo: string;
  confidence: number; // 0-100
  title: string;
  summary: string;
  gridParams: GridParams;
  candidateGrids?: CandidateGrid[];
  detectedElements: DetectedElement[];
  keylines: Keyline[];
  swissPrinciples: string[];
  typeHierarchyRating: string;
  whitespaceRatio: string;
  colorPalette: string[];
}

export interface SamplePoster {
  id: string;
  title: string;
  category: string;
  description: string;
  svgDataUri: string;
  defaultAnalysis: AnalysisResult;
}
