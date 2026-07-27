import { SamplePoster } from '../types';

// Helper to generate SVG data URI
function makeSvgDataUri(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

const swissSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#F4F1EA"/>
  <!-- Top Header Block -->
  <text x="40" y="90" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="52" fill="#111111" letter-spacing="-1.5">ZÜRICH</text>
  <text x="40" y="145" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="52" fill="#E63946" letter-spacing="-1.5">KUNSTHALLE</text>
  <text x="40" y="180" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="500" font-size="14" fill="#555555" letter-spacing="2">MODERN GRAPHIC DESIGN &amp; SWISS TYPOGRAPHY 1950–1980</text>

  <!-- Accent Geometry Block -->
  <rect x="40" y="210" width="250" height="250" fill="#111111"/>
  <circle cx="435" cy="335" r="125" fill="#E63946"/>
  <rect x="40" y="480" width="520" height="8" fill="#111111"/>

  <!-- Column 1 Text -->
  <text x="40" y="525" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="16" fill="#111111">EXHIBITION</text>
  <text x="40" y="550" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#333333" width="150">
    <tspan x="40" dy="0">Opening October 12</tspan>
    <tspan x="40" dy="18">Through January 24</tspan>
    <tspan x="40" dy="18">Gallery Hall A &amp; B</tspan>
  </text>

  <!-- Column 2 Text -->
  <text x="220" y="525" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="16" fill="#111111">LOCATION</text>
  <text x="220" y="550" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#333333">
    <tspan x="220" dy="0">Limmatstrasse 270</tspan>
    <tspan x="220" dy="18">8005 Zürich, CH</tspan>
    <tspan x="220" dy="18">www.kunsthalle.ch</tspan>
  </text>

  <!-- Column 3 Text -->
  <text x="400" y="525" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="16" fill="#111111">CURATORS</text>
  <text x="400" y="550" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" fill="#333333">
    <tspan x="400" dy="0">Josef Müller-Brockmann</tspan>
    <tspan x="400" dy="18">Armin Hofmann</tspan>
    <tspan x="400" dy="18">Emil Ruder</tspan>
  </text>

  <!-- Bottom Footer Grid bar -->
  <rect x="40" y="730" width="520" height="2" fill="#111111"/>
  <text x="40" y="755" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="11" fill="#777777">SWISS STYLE GRID SYSTEM STUDY / 12-COLUMN MODULAR STRUCTURE</text>
</svg>`;

const bauhausSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#0D0D0D"/>
  
  <g transform="rotate(-15 300 400)">
    <!-- Angled Red Band -->
    <rect x="-100" y="250" width="800" height="120" fill="#D90429"/>
    <rect x="-100" y="390" width="800" height="20" fill="#FFB703"/>
    
    <text x="-20" y="330" font-family="'Futura', Arial, sans-serif" font-weight="900" font-size="72" fill="#F1FAEE" letter-spacing="4">BAUHAUS</text>
    <text x="380" y="330" font-family="'Futura', Arial, sans-serif" font-weight="700" font-size="32" fill="#FFB703">1923</text>
  </g>

  <!-- Non-angled structured overlay elements -->
  <circle cx="150" cy="180" r="70" fill="none" stroke="#FFB703" stroke-width="8"/>
  <rect x="380" y="110" width="140" height="140" fill="#8ECAE6" opacity="0.8"/>

  <text x="50" y="620" font-family="'Futura', Arial, sans-serif" font-weight="800" font-size="28" fill="#F1FAEE">WEIMAR AUSSTELLUNG</text>
  <text x="50" y="660" font-family="'Arial', sans-serif" font-size="13" fill="#A0A0A0">
    <tspan x="50" dy="0">STAATLICHES BAUHAUS IN WEIMAR</tspan>
    <tspan x="50" dy="20">KUNST UND TECHNIK - EINE NEUE EINHEIT</tspan>
  </text>

  <!-- Geometric Grid Accent Points -->
  <line x1="50" y1="50" x2="550" y2="50" stroke="#333333" stroke-width="1"/>
  <line x1="50" y1="750" x2="550" y2="750" stroke="#333333" stroke-width="1"/>
  <line x1="50" y1="50" x2="50" y2="750" stroke="#333333" stroke-width="1"/>
  <line x1="550" y1="50" x2="550" y2="750" stroke="#333333" stroke-width="1"/>
</svg>`;

const tokyoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <rect width="600" height="800" fill="#FAFAFA"/>
  
  <!-- Subtle Column Grid background hint in original poster -->
  <g stroke="#E5E5E5" stroke-width="1" stroke-dasharray="4 4">
    <line x1="50" y1="0" x2="50" y2="800"/>
    <line x1="133" y1="0" x2="133" y2="800"/>
    <line x1="216" y1="0" x2="216" y2="800"/>
    <line x1="300" y1="0" x2="300" y2="800"/>
    <line x1="383" y1="0" x2="383" y2="800"/>
    <line x1="466" y1="0" x2="466" y2="800"/>
    <line x1="550" y1="0" x2="550" y2="800"/>
  </g>

  <text x="50" y="80" font-family="'Hiragino Sans', sans-serif" font-weight="900" font-size="14" fill="#023E8A" letter-spacing="4">TOKYO DESIGN FORUM 2026</text>

  <text x="50" y="160" font-family="'Helvetica Neue', sans-serif" font-weight="800" font-size="44" fill="#111111">ARCHITECTURAL</text>
  <text x="50" y="210" font-family="'Helvetica Neue', sans-serif" font-weight="800" font-size="44" fill="#023E8A">GRID &amp; SPACE</text>

  <rect x="50" y="240" width="333" height="300" fill="#0077B6"/>
  <rect x="383" y="240" width="167" height="145" fill="#90E0EF"/>
  <rect x="383" y="395" width="167" height="145" fill="#111111"/>

  <text x="50" y="580" font-family="'Hiragino Sans', sans-serif" font-weight="700" font-size="18" fill="#111111">都市空間とグリッド '26</text>
  <text x="50" y="615" font-family="sans-serif" font-size="12" fill="#555555">
    <tspan x="50" dy="0">Date: 2026.09.15 – 09.20</tspan>
    <tspan x="50" dy="18">Venue: Roppongi International Art Center</tspan>
    <tspan x="50" dy="18">Organized by Japan Graphic Designers Association</tspan>
  </text>

  <text x="383" y="580" font-family="sans-serif" font-weight="700" font-size="14" fill="#023E8A">KEYNOTE SPEAKERS</text>
  <text x="383" y="605" font-family="sans-serif" font-size="11" fill="#444444">
    <tspan x="383" dy="0">Kenzo Tange Studio</tspan>
    <tspan x="383" dy="16">Hara Design Institute</tspan>
    <tspan x="383" dy="16">Kengo Kuma Associates</tspan>
  </text>
</svg>`;

export const SAMPLE_POSTERS: SamplePoster[] = [
  {
    id: 'swiss-zurich',
    title: '스위스 모듈러 그리드 포스터 (Zürich Kunsthalle)',
    category: '스위스 국제 타이포그래피 (Swiss Style)',
    description: '12-컬럼 모듈러 그리드 기반의 명확한 정렬, 비대칭 여백, 엄격한 계층 구조를 갖춘 클래식 스위스 포스터입니다.',
    svgDataUri: makeSvgDataUri(swissSvg),
    defaultAnalysis: {
      systemType: 'swiss_modular',
      systemNameKo: '스위스 12-모듈러 그리드 System',
      confidence: 96,
      title: '스위스 국제 스타일 (12-Column Modular Grid)',
      summary: '요제프 뮐러-브로크만의 12컬럼 모듈러 그리드 원칙을 완벽히 따르고 있습니다. 상단 텍스트 블록과 중앙 기하학 형상이 정확한 컬럼/행 비율로 배치되었습니다.',
      gridParams: {
        columns: 12,
        rows: 8,
        marginTop: 11.25,
        marginBottom: 8.75,
        marginLeft: 6.67,
        marginRight: 6.67,
        columnGutter: 2,
        rowGutter: 2,
        baselineSpacing: 2.25,
        showBaseline: true,
        diagonalAngle: 0,
        showDiagonal: false,
        color: '#E63946',
        opacity: 0.75,
        strokeWidth: 1.5,
        showMargins: true,
        showColumns: true,
        showRows: true,
        showKeylines: true,
        showBoundingBoxes: true,
        showGoldenRatio: false,
        showRuleOfThirds: false,
      },
      detectedElements: [
        {
          id: 'el-1',
          label: '메인 헤드라인 (ZÜRICH KUNSTHALLE)',
          type: 'headline',
          x: 6.67,
          y: 7.5,
          width: 86.66,
          height: 12.5,
          alignmentNote: '12컬럼 좌측 1컬럼 마진라인에 정렬',
        },
        {
          id: 'el-2',
          label: '메인 비주얼 그래픽 (검은 정사각형 & 빨간 원)',
          type: 'image',
          x: 6.67,
          y: 26.25,
          width: 86.66,
          height: 31.25,
          alignmentNote: '중앙 6컬럼 모듈러 그리드 상자에 완벽 수합',
        },
        {
          id: 'el-3',
          label: '3단 정보 텍스트 (EXHIBITION / LOCATION / CURATORS)',
          type: 'body',
          x: 6.67,
          y: 65,
          width: 86.66,
          height: 22,
          alignmentNote: '4컬럼씩 3개 섹션으로 정밀 분할',
        },
      ],
      keylines: [
        { id: 'kl-1', type: 'vertical', position: 6.67, label: '좌측 메인 마진 기준선' },
        { id: 'kl-2', type: 'vertical', position: 36.67, label: '컬럼 1-2 구획선' },
        { id: 'kl-3', type: 'vertical', position: 66.67, label: '컬럼 3 구획선' },
        { id: 'kl-4', type: 'horizontal', position: 26.25, label: '비주얼 요소 시작 baseline' },
        { id: 'kl-5', type: 'horizontal', position: 60, label: '하단 디바이더 separator line' },
      ],
      swissPrinciples: [
        '수학적으로 산출된 12컬럼 모듈러 비율 구조',
        '비대칭 레이아웃으로 동적 인상 형성',
        '헬베티카 산세리프 서체의 엄격한 베이스라인 정렬',
        '여백(Whitespace)을 구조적 디자인 요소로 적극 활용',
      ],
      typeHierarchyRating: 'A+ (완벽한 스케일 비중)',
      whitespaceRatio: '42.5% (여백 균형 우수)',
      colorPalette: ['#F4F1EA', '#111111', '#E63946'],
    },
  },
  {
    id: 'bauhaus-diagonal',
    title: '바우하우스 바이마르 바이어스 그리드 포스터',
    category: '바우하우스 & 사선(Diagonal) 그리드',
    description: '15도 사선 각도축과 삼등분선(Rule of Thirds)을 혼합하여 강렬한 역동성을 표현한 아방가르드 레이아웃 포스터입니다.',
    svgDataUri: makeSvgDataUri(bauhausSvg),
    defaultAnalysis: {
      systemType: 'diagonal_isometric',
      systemNameKo: '15도 대각선 & 삼등분 그리드 System',
      confidence: 94,
      title: '바우하우스 대각선 구도 (Diagonal & Rule of Thirds)',
      summary: '중앙을 지나는 -15도 대각선 주축을 기반으로 텍스트 및 스트라이프 밴드가 정렬되어 있습니다. 동적인 대각선과 구석의 정적인 기하 형상이 결합되었습니다.',
      gridParams: {
        columns: 6,
        rows: 6,
        marginTop: 6.25,
        marginBottom: 6.25,
        marginLeft: 8.33,
        marginRight: 8.33,
        columnGutter: 3,
        rowGutter: 3,
        baselineSpacing: 3,
        showBaseline: false,
        diagonalAngle: -15,
        showDiagonal: true,
        color: '#FFB703',
        opacity: 0.8,
        strokeWidth: 2,
        showMargins: true,
        showColumns: true,
        showRows: true,
        showKeylines: true,
        showBoundingBoxes: true,
        showGoldenRatio: false,
        showRuleOfThirds: true,
      },
      detectedElements: [
        {
          id: 'b-1',
          label: '대각선 밴드 (BAUHAUS 1923)',
          type: 'headline',
          x: 10,
          y: 30,
          width: 80,
          height: 20,
          alignmentNote: '-15도 대각선 회전 축선에 정확히 수평 배치',
        },
        {
          id: 'b-2',
          label: '상단 원형 & 사각형 기하 도형',
          type: 'image',
          x: 15,
          y: 12,
          width: 70,
          height: 22,
          alignmentNote: 'Rule of Thirds 상단 교차점에 구도 배치',
        },
        {
          id: 'b-3',
          label: '하단 메인 타이틀 (WEIMAR AUSSTELLUNG)',
          type: 'footer',
          x: 8.33,
          y: 77.5,
          width: 83.34,
          height: 15,
          alignmentNote: '수평 하단 6컬럼 레이아웃 베이스에 맞춤',
        },
      ],
      keylines: [
        { id: 'bkl-1', type: 'vertical', position: 8.33, label: '좌측 외곽선' },
        { id: 'bkl-2', type: 'horizontal', position: 33.33, label: '삼등분 상단 가로선' },
        { id: 'bkl-3', type: 'horizontal', position: 66.66, label: '삼등분 하단 가로선' },
      ],
      swissPrinciples: [
        '대각선(Diagonal Axis)을 활용한 시선 유도',
        '원, 사각형, 직선 등 기하학 기본 요소의 대칭/비대칭 대비',
        '명확한 원색 대비 (Black, Red, Yellow, Cyan-blue)',
      ],
      typeHierarchyRating: 'A (강렬한 시각적 대비)',
      whitespaceRatio: '38.0% (흑백 공간 대조)',
      colorPalette: ['#0D0D0D', '#D90429', '#FFB703', '#F1FAEE'],
    },
  },
  {
    id: 'tokyo-architectural',
    title: '도쿄 디자이너스 포럼 6-컬럼 비대칭 포스터',
    category: '현대 비대칭 타이포그래피 (Modern Asymmetric)',
    description: '6컬럼 비대칭 비율과 블록 그래픽, 베이스라인 타이포그래피 그리드가 정교하게 교차하는 현대적 아키텍처 포스터입니다.',
    svgDataUri: makeSvgDataUri(tokyoSvg),
    defaultAnalysis: {
      systemType: '6_column',
      systemNameKo: '6-컬럼 비대칭 & 베이스라인 Grid',
      confidence: 98,
      title: '현대 도쿄 비대칭 건축 그리드',
      summary: '6컬럼 그리드를 4:2 비율로 비대칭 분할하였습니다. 파란색 모듈 박스와 우측 포인트 박스가 정확히 그리드 교차점에 부합합니다.',
      gridParams: {
        columns: 6,
        rows: 8,
        marginTop: 6.25,
        marginBottom: 6.25,
        marginLeft: 8.33,
        marginRight: 8.33,
        columnGutter: 2.5,
        rowGutter: 2,
        baselineSpacing: 2,
        showBaseline: true,
        diagonalAngle: 0,
        showDiagonal: false,
        color: '#0077B6',
        opacity: 0.8,
        strokeWidth: 1.5,
        showMargins: true,
        showColumns: true,
        showRows: true,
        showKeylines: true,
        showBoundingBoxes: true,
        showGoldenRatio: false,
        showRuleOfThirds: false,
      },
      detectedElements: [
        {
          id: 't-1',
          label: '헤더 타이틀 (ARCHITECTURAL GRID & SPACE)',
          type: 'headline',
          x: 8.33,
          y: 18,
          width: 83.34,
          height: 10,
          alignmentNote: '2컬럼~6컬럼 스팬을 채우는 좌측 정렬',
        },
        {
          id: 't-2',
          label: '메인 블루 그래픽 모듈',
          type: 'image',
          x: 8.33,
          y: 30,
          width: 55.5,
          height: 37.5,
          alignmentNote: '6컬럼 중 좌측 4컬럼 완전 점유',
        },
        {
          id: 't-3',
          label: '우측 분할 모듈 (하늘색/검은색 박스)',
          type: 'image',
          x: 63.83,
          y: 30,
          width: 27.83,
          height: 37.5,
          alignmentNote: '우측 2컬럼 모듈 수직 분할',
        },
      ],
      keylines: [
        { id: 'tkl-1', type: 'vertical', position: 8.33, label: 'Col 1 시작' },
        { id: 'tkl-2', type: 'vertical', position: 63.83, label: 'Col 4-5 분할경계선' },
        { id: 'tkl-3', type: 'horizontal', position: 30, label: '비주얼 모듈 Top Line' },
        { id: 'tkl-4', type: 'horizontal', position: 67.5, label: '비주얼 모듈 Bottom Line' },
      ],
      swissPrinciples: [
        '4:2 (2:1) 비대칭 모듈 분할 구도',
        '베이스라인 그리드에 완전 일치하는 텍스트 줄간격',
        '그리드 수직선을 숨기지 않고 디자인 요소로 드러낸 연출',
      ],
      typeHierarchyRating: 'A+ (명확한 정보 위계)',
      whitespaceRatio: '46.0%',
      colorPalette: ['#FAFAFA', '#111111', '#023E8A', '#0077B6', '#90E0EF'],
    },
  },
];
