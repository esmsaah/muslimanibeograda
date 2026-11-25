export const PAINTING_WIDTH = 2400;
export const PAINTING_HEIGHT = 1350;

const PALETTE = {
  white: '#FFFFFF',
  lightConcrete: '#EDEDEA',
  concreteGrey: '#8F8D88',
  emerald: '#0F8A5F',
  saffron: '#D9A02B',
  pomegranate: '#9E2B45',
  coffeeBrown: '#2B211C',
} as const;

type Point = [number, number];

function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generates an organic hand-jittered polyline between two endpoints.
 */
function buildWobblyPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rng: () => number,
  wobbleAmp: number,
  stepSize = 22,
): Point[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return [[x1, y1], [x2, y2]];
  const steps = Math.max(2, Math.round(dist / stepSize));
  const nx = -dy / dist;
  const ny = dx / dist;

  const driftPhase = rng() * Math.PI * 2;
  const driftSign = rng() < 0.5 ? -1 : 1;
  const pts: Point[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const envelope = Math.sin(t * Math.PI);
    const wave =
      Math.sin(t * Math.PI * 1.4 + driftPhase) * wobbleAmp * 0.6 * driftSign;
    const micro = (rng() - 0.5) * wobbleAmp * 0.55;
    const offset = (wave + micro) * (0.2 + 0.8 * envelope);
    pts.push([
      x1 + dx * t + nx * offset,
      y1 + dy * t + ny * offset,
    ]);
  }
  return pts;
}

/**
 * Draws a continuous, confident hand-drawn coffee-brown (or muted) line with subtle organic wobble.
 * Never dashed, never broken.
 */
function drawHandLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  baseWidth: number,
  alpha: number,
  rng: () => number,
  wobble = 1.6,
) {
  const pts = buildWobblyPoints(x1, y1, x2, y2, rng, wobble, 22);
  if (pts.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = baseWidth;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) * 0.5;
    const my = (pts[i][1] + pts[i + 1][1]) * 0.5;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last[0], last[1]);
  ctx.stroke();
  ctx.restore();
}

/**
 * Traces a slightly imperfect polygon path and fills it with soft hand-painted matte colour washes.
 */
function fillGouachePolygon(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  color: string,
  baseAlpha: number,
  rng: () => number,
  wobble = 1.7,
) {
  if (vertices.length < 3) return;
  const poly: Point[] = [];
  for (let i = 0; i < vertices.length; i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[(i + 1) % vertices.length];
    const seg = buildWobblyPoints(x1, y1, x2, y2, rng, wobble, 26);
    poly.push(...seg.slice(0, -1));
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [px, py] of poly) {
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i][0], poly[i][1]);
  }
  ctx.closePath();

  // Soft hand-painted base wash
  ctx.fillStyle = hexToRgba(color, baseAlpha * 0.8);
  ctx.fill();

  // Subtle uneven hand-brushed pigment variations inside the shape
  ctx.clip();
  const areaW = Math.max(10, maxX - minX);
  const areaH = Math.max(10, maxY - minY);
  const dabCount = Math.min(40, Math.max(8, Math.round((areaW * areaH) / 1700)));

  for (let i = 0; i < dabCount; i++) {
    const cx = minX + rng() * areaW;
    const cy = minY + rng() * areaH;
    const rx = 10 + rng() * Math.min(44, areaW * 0.45);
    const ry = 4 + rng() * Math.min(16, areaH * 0.35);
    const angle = (rng() - 0.5) * 0.45;
    const useHighlight = rng() < 0.32;
    const dabColor = useHighlight ? PALETTE.white : color;
    const dabAlpha = useHighlight
      ? 0.05 + rng() * 0.08
      : baseAlpha * (0.12 + rng() * 0.18);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = hexToRgba(dabColor, dabAlpha);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawHandPolygonOutline(
  ctx: CanvasRenderingContext2D,
  vertices: Point[],
  color: string,
  width: number,
  alpha: number,
  rng: () => number,
  wobble = 1.6,
) {
  for (let i = 0; i < vertices.length; i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[(i + 1) % vertices.length];
    drawHandLine(ctx, x1, y1, x2, y2, color, width, alpha, rng, wobble);
  }
}

function fillAndStrokeGouacheRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  fillAlpha: number,
  lineColor: string,
  lineWidth: number,
  lineAlpha: number,
  rng: () => number,
  wobble = 1.5,
) {
  const pts: Point[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  fillGouachePolygon(ctx, pts, fillColor, fillAlpha, rng, wobble);
  drawHandPolygonOutline(ctx, pts, lineColor, lineWidth, lineAlpha, rng, wobble);
}

function buildDomePoints(
  cx: number,
  baseY: number,
  rx: number,
  height: number,
  segments = 18,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI - (i / segments) * Math.PI;
    pts.push([cx + Math.cos(theta) * rx, baseY - Math.sin(theta) * height]);
  }
  return pts;
}

function drawHandDome(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  height: number,
  fillColor: string,
  fillAlpha: number,
  lineColor: string,
  lineWidth: number,
  lineAlpha: number,
  rng: () => number,
) {
  const pts = buildDomePoints(cx, baseY, rx, height, 18);
  fillGouachePolygon(ctx, pts, fillColor, fillAlpha, rng, 1.3);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = hexToRgba(lineColor, lineAlpha);
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const jx = (rng() - 0.5) * 1.4;
    const jy = (rng() - 0.5) * 1.4;
    ctx.lineTo(pts[i][0] + jx, pts[i][1] + jy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSmallCrescent(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rng: () => number,
) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(PALETTE.coffeeBrown, 0.94);
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.28, Math.PI * 1.72, false);
  ctx.stroke();

  ctx.strokeStyle = hexToRgba(PALETTE.saffron, 0.92);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx + r * 0.25, cy, r * 0.78, Math.PI * 0.35, Math.PI * 1.65, false);
  ctx.stroke();

  drawHandLine(ctx, cx, cy + r, cx, cy + r + 14, PALETTE.coffeeBrown, 2.2, 0.92, rng, 0.7);
  ctx.restore();
}

function drawIznikTulip(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  petalColor: string,
  rng: () => number,
) {
  drawHandLine(ctx, x, baseY, x - 3 * scale, baseY - 26 * scale, PALETTE.coffeeBrown, 1.9, 0.9, rng, 1.0);
  fillGouachePolygon(
    ctx,
    [
      [x - 1 * scale, baseY - 6 * scale],
      [x - 14 * scale, baseY - 18 * scale],
      [x - 4 * scale, baseY - 20 * scale],
    ],
    PALETTE.emerald,
    0.76,
    rng,
    0.8,
  );
  fillGouachePolygon(
    ctx,
    [
      [x - 1 * scale, baseY - 10 * scale],
      [x + 12 * scale, baseY - 20 * scale],
      [x + 3 * scale, baseY - 22 * scale],
    ],
    PALETTE.emerald,
    0.72,
    rng,
    0.8,
  );

  const py = baseY - 26 * scale;
  const px = x - 3 * scale;
  const tulipPts: Point[] = [
    [px, py],
    [px - 7 * scale, py - 8 * scale],
    [px - 4 * scale, py - 18 * scale],
    [px, py - 13 * scale],
    [px + 4 * scale, py - 18 * scale],
    [px + 7 * scale, py - 8 * scale],
  ];
  fillGouachePolygon(ctx, tulipPts, petalColor, 0.8, rng, 0.6);
  drawHandPolygonOutline(ctx, tulipPts, PALETTE.coffeeBrown, 1.8, 0.9, rng, 0.6);
}

function drawFaintStarPatternInRiver(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
) {
  const startX = 480;
  const endX = 1920;
  const spacing = 140;
  const yCenter = 1135;

  for (let cx = startX; cx <= endX; cx += spacing) {
    const r = 34;
    const ptsA: Point[] = [
      [cx - r * 0.68, yCenter - r * 0.34],
      [cx + r * 0.68, yCenter - r * 0.34],
      [cx + r * 0.68, yCenter + r * 0.34],
      [cx - r * 0.68, yCenter + r * 0.34],
    ];
    const ptsB: Point[] = [
      [cx, yCenter - r * 0.48],
      [cx + r * 0.92, yCenter],
      [cx, yCenter + r * 0.48],
      [cx - r * 0.92, yCenter],
    ];
    drawHandPolygonOutline(ctx, ptsA, PALETTE.concreteGrey, 1.1, 0.28, rng, 1.0);
    drawHandPolygonOutline(ctx, ptsB, PALETTE.concreteGrey, 1.1, 0.24, rng, 1.0);
  }
}

export function renderBelgradeGouachePainting(canvas: HTMLCanvasElement) {
  canvas.width = PAINTING_WIDTH;
  canvas.height = PAINTING_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rng = createRng(20261124);
  const baseY = 1042;

  // 1. Clean, plain, flat solid white background (#FFFFFF) — no texture, stains, clouds, grain, or shading
  ctx.fillStyle = PALETTE.white;
  ctx.fillRect(0, 0, PAINTING_WIDTH, PAINTING_HEIGHT);

  // 2. LONG LOW GIRDER BRIDGE (Branko's Bridge silhouette, partly behind buildings)
  drawHandLine(ctx, 75, baseY - 58, 910, baseY - 58, PALETTE.coffeeBrown, 2.2, 0.72, rng, 1.6);
  drawHandLine(ctx, 75, baseY - 48, 910, baseY - 48, PALETTE.coffeeBrown, 1.6, 0.62, rng, 1.5);
  for (const px of [140, 310, 480, 650, 820]) {
    fillAndStrokeGouacheRect(
      ctx,
      px - 10,
      baseY - 48,
      20,
      50,
      PALETTE.lightConcrete,
      0.78,
      PALETTE.coffeeBrown,
      1.8,
      0.72,
      rng,
      1.2,
    );
  }

  // 3. FAR LEFT: GENEX TOWER (Western City Gate) — muted concrete fills, confident continuous coffee-brown outlines
  fillAndStrokeGouacheRect(ctx, 136, 616, 62, 426, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.5, 0.88, rng, 1.6);
  fillAndStrokeGouacheRect(ctx, 198, 616, 22, 426, PALETTE.concreteGrey, 0.42, PALETTE.coffeeBrown, 2.1, 0.84, rng, 1.4);
  fillAndStrokeGouacheRect(ctx, 256, 672, 56, 370, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.5, 0.88, rng, 1.6);
  fillAndStrokeGouacheRect(ctx, 312, 672, 18, 370, PALETTE.concreteGrey, 0.4, PALETTE.coffeeBrown, 2.1, 0.84, rng, 1.4);
  // Skybridge
  fillAndStrokeGouacheRect(ctx, 198, 704, 58, 30, PALETTE.concreteGrey, 0.46, PALETTE.coffeeBrown, 2.3, 0.86, rng, 1.2);
  // Circular revolving crown
  const genexCrown: Point[] = [
    [130, 585],
    [212, 585],
    [204, 606],
    [138, 606],
  ];
  fillGouachePolygon(ctx, genexCrown, PALETTE.concreteGrey, 0.48, rng, 1.3);
  drawHandPolygonOutline(ctx, genexCrown, PALETTE.coffeeBrown, 2.2, 0.86, rng, 1.2);
  drawHandLine(ctx, 171, 542, 171, 585, PALETTE.coffeeBrown, 2.2, 0.85, rng, 1.0);
  for (let y = 650; y <= 980; y += 44) {
    drawHandLine(ctx, 146, y, 190, y, PALETTE.coffeeBrown, 1.5, 0.62, rng, 1.0);
  }
  for (let y = 708; y <= 980; y += 44) {
    drawHandLine(ctx, 265, y, 304, y, PALETTE.coffeeBrown, 1.5, 0.62, rng, 1.0);
  }

  // 4. CABLE-STAYED ADA BRIDGE (Single tall pylon + continuous fan of cables)
  const adaPylon: Point[] = [
    [594, baseY],
    [602, 535],
    [612, 535],
    [620, baseY],
  ];
  fillGouachePolygon(ctx, adaPylon, PALETTE.lightConcrete, 0.92, rng, 1.3);
  drawHandPolygonOutline(ctx, adaPylon, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.3);
  drawHandLine(ctx, 355, baseY - 122, 855, baseY - 122, PALETTE.coffeeBrown, 2.8, 0.88, rng, 1.5);
  for (let i = 0; i < 8; i++) {
    const anchorY = 552 + i * 16;
    const leftX = 380 + i * 26;
    const rightX = 830 - i * 26;
    drawHandLine(ctx, 604, anchorY, leftX, baseY - 122, PALETTE.coffeeBrown, 1.35, 0.68, rng, 1.1);
    drawHandLine(ctx, 610, anchorY, rightX, baseY - 122, PALETTE.coffeeBrown, 1.35, 0.68, rng, 1.1);
  }

  // 5. BELGRADE TRAM ON LEFT STREET AXIS (muted grey fill, confident coffee-brown outline)
  fillAndStrokeGouacheRect(ctx, 385, baseY - 50, 128, 46, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.4, 0.9, rng, 1.3);
  fillGouachePolygon(
    ctx,
    [
      [386, baseY - 22],
      [512, baseY - 22],
      [512, baseY - 6],
      [386, baseY - 6],
    ],
    PALETTE.concreteGrey,
    0.45,
    rng,
    1.1,
  );
  for (const wx of [398, 422, 446, 470, 492]) {
    fillAndStrokeGouacheRect(ctx, wx, baseY - 42, 16, 15, PALETTE.concreteGrey, 0.48, PALETTE.coffeeBrown, 1.5, 0.78, rng, 0.7);
  }
  drawHandLine(ctx, 434, baseY - 50, 448, baseY - 68, PALETTE.coffeeBrown, 1.8, 0.84, rng, 0.8);
  drawHandLine(ctx, 464, baseY - 50, 448, baseY - 68, PALETTE.coffeeBrown, 1.8, 0.84, rng, 0.8);
  drawHandLine(ctx, 180, baseY - 72, 740, baseY - 68, PALETTE.coffeeBrown, 1.3, 0.62, rng, 1.5);

  // 6. LEFT-CENTER: CATHOLIC GOTHIC CHURCH & OLD DORĆOL FACADE (Muted fills, crisp outlines)
  fillAndStrokeGouacheRect(ctx, 792, 690, 74, 175, PALETTE.lightConcrete, 0.92, PALETTE.coffeeBrown, 2.5, 0.9, rng, 1.5);
  fillGouachePolygon(
    ctx,
    [
      [786, 690],
      [829, 578],
      [872, 690],
    ],
    PALETTE.coffeeBrown,
    0.66,
    rng,
    1.4,
  );
  drawHandPolygonOutline(
    ctx,
    [
      [786, 690],
      [829, 578],
      [872, 690],
    ],
    PALETTE.coffeeBrown,
    2.6,
    0.94,
    rng,
    1.3,
  );
  drawHandLine(ctx, 829, 548, 829, 578, PALETTE.coffeeBrown, 2.3, 0.92, rng, 0.8);
  drawHandLine(ctx, 818, 560, 840, 560, PALETTE.coffeeBrown, 2.3, 0.92, rng, 0.8);

  // Church gable body
  const churchGable: Point[] = [
    [755, 865],
    [829, 788],
    [903, 865],
    [903, baseY],
    [755, baseY],
  ];
  fillGouachePolygon(ctx, churchGable, PALETTE.lightConcrete, 0.92, rng, 1.6);
  drawHandPolygonOutline(ctx, churchGable, PALETTE.coffeeBrown, 2.5, 0.9, rng, 1.5);
  fillAndStrokeGouacheRect(ctx, 808, 718, 16, 44, PALETTE.concreteGrey, 0.45, PALETTE.coffeeBrown, 1.8, 0.84, rng, 0.8);
  fillAndStrokeGouacheRect(ctx, 834, 718, 16, 44, PALETTE.concreteGrey, 0.45, PALETTE.coffeeBrown, 1.8, 0.84, rng, 0.8);
  drawHandDome(ctx, 829, 916, 26, 26, PALETTE.concreteGrey, 0.3, PALETTE.coffeeBrown, 1.8, 0.84, rng);

  // Old Dorćol townhouse facade
  fillAndStrokeGouacheRect(ctx, 938, 865, 118, 177, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.6);
  const dorcolRoof: Point[] = [
    [932, 865],
    [952, 826],
    [1042, 826],
    [1062, 865],
  ];
  fillGouachePolygon(ctx, dorcolRoof, PALETTE.coffeeBrown, 0.48, rng, 1.4);
  drawHandPolygonOutline(ctx, dorcolRoof, PALETTE.coffeeBrown, 2.4, 0.9, rng, 1.4);
  for (const wx of [958, 990, 1022]) {
    fillAndStrokeGouacheRect(ctx, wx, 892, 16, 28, PALETTE.concreteGrey, 0.36, PALETTE.coffeeBrown, 1.6, 0.8, rng, 0.7);
    fillAndStrokeGouacheRect(ctx, wx, 945, 16, 30, PALETTE.concreteGrey, 0.36, PALETTE.coffeeBrown, 1.6, 0.8, rng, 0.7);
  }

  // 7. CENTRE VISUAL FOCUS — MUSLIM BELGRADE HERITAGE (IN COLOUR + STRONG COFFEE-BROWN OUTLINES)
  const leftCypress: Point[] = [
    [1112, baseY],
    [1095, 922],
    [1104, 818],
    [1116, 756],
    [1128, 824],
    [1134, 928],
    [1120, baseY],
  ];
  fillGouachePolygon(ctx, leftCypress, PALETTE.emerald, 0.78, rng, 1.8);
  drawHandPolygonOutline(ctx, leftCypress, PALETTE.coffeeBrown, 2.8, 0.94, rng, 1.7);

  // REAL BAJRAKLI MOSQUE: modest square building + one small dome + one slender minaret
  fillAndStrokeGouacheRect(ctx, 1168, 870, 178, 172, PALETTE.lightConcrete, 0.72, PALETTE.coffeeBrown, 3.1, 0.96, rng, 1.6);
  const mosqueSide: Point[] = [
    [1346, 870],
    [1370, 878],
    [1370, baseY],
    [1346, baseY],
  ];
  fillGouachePolygon(ctx, mosqueSide, PALETTE.concreteGrey, 0.4, rng, 1.3);
  drawHandPolygonOutline(ctx, mosqueSide, PALETTE.coffeeBrown, 2.6, 0.92, rng, 1.4);

  // Continuous subtle stone course lines
  drawHandLine(ctx, 1172, 924, 1342, 924, PALETTE.coffeeBrown, 1.3, 0.45, rng, 1.4);
  drawHandLine(ctx, 1172, 976, 1342, 976, PALETTE.coffeeBrown, 1.3, 0.45, rng, 1.4);

  // Low octagonal drum & small emerald dome
  const drumPts: Point[] = [
    [1198, 870],
    [1212, 838],
    [1302, 838],
    [1316, 870],
  ];
  fillGouachePolygon(ctx, drumPts, PALETTE.lightConcrete, 0.88, rng, 1.4);
  drawHandPolygonOutline(ctx, drumPts, PALETTE.coffeeBrown, 2.7, 0.94, rng, 1.3);
  drawHandDome(ctx, 1257, 838, 46, 56, PALETTE.emerald, 0.84, PALETTE.coffeeBrown, 3.0, 0.96, rng);
  drawSmallCrescent(ctx, 1257, 761, 7.5, rng);

  // Saffron windows & sparing pomegranate doorway
  for (const wx of [1192, 1245, 1298]) {
    fillAndStrokeGouacheRect(ctx, wx, 892, 22, 34, PALETTE.saffron, 0.84, PALETTE.coffeeBrown, 2.1, 0.92, rng, 0.9);
  }
  const doorPts: Point[] = [
    [1238, baseY],
    [1238, 972],
    [1256, 954],
    [1274, 972],
    [1274, baseY],
  ];
  fillGouachePolygon(ctx, doorPts, PALETTE.pomegranate, 0.82, rng, 1.1);
  drawHandPolygonOutline(ctx, doorPts, PALETTE.coffeeBrown, 2.5, 0.94, rng, 1.0);
  fillAndStrokeGouacheRect(ctx, 1192, 974, 24, 42, PALETTE.saffron, 0.72, PALETTE.coffeeBrown, 2.0, 0.9, rng, 0.9);
  fillAndStrokeGouacheRect(ctx, 1296, 974, 24, 42, PALETTE.saffron, 0.72, PALETTE.coffeeBrown, 2.0, 0.9, rng, 0.9);

  // One slender Bajrakli minaret
  fillAndStrokeGouacheRect(ctx, 1346, 650, 26, 392, PALETTE.lightConcrete, 0.75, PALETTE.coffeeBrown, 2.9, 0.96, rng, 1.5);
  const serefePts: Point[] = [
    [1336, 650],
    [1382, 650],
    [1376, 665],
    [1342, 665],
  ];
  fillGouachePolygon(ctx, serefePts, PALETTE.saffron, 0.82, rng, 0.9);
  drawHandPolygonOutline(ctx, serefePts, PALETTE.coffeeBrown, 2.3, 0.94, rng, 0.9);
  fillAndStrokeGouacheRect(ctx, 1338, 638, 42, 12, PALETTE.lightConcrete, 0.88, PALETTE.coffeeBrown, 2.2, 0.94, rng, 0.8);
  fillAndStrokeGouacheRect(ctx, 1349, 588, 20, 50, PALETTE.lightConcrete, 0.75, PALETTE.coffeeBrown, 2.5, 0.94, rng, 1.0);
  const spirePts: Point[] = [
    [1345, 588],
    [1359, 520],
    [1373, 588],
  ];
  fillGouachePolygon(ctx, spirePts, PALETTE.emerald, 0.86, rng, 1.1);
  drawHandPolygonOutline(ctx, spirePts, PALETTE.coffeeBrown, 2.6, 0.96, rng, 1.0);
  drawSmallCrescent(ctx, 1359, 500, 6.5, rng);

  // ŠADRVAN FOUNTAIN
  const fx = 1455;
  fillAndStrokeGouacheRect(ctx, fx - 44, baseY - 26, 88, 26, PALETTE.lightConcrete, 0.92, PALETTE.coffeeBrown, 2.6, 0.94, rng, 1.1);
  fillAndStrokeGouacheRect(ctx, fx - 38, baseY - 34, 76, 8, PALETTE.saffron, 0.78, PALETTE.coffeeBrown, 2.1, 0.92, rng, 0.8);
  fillAndStrokeGouacheRect(ctx, fx - 9, baseY - 22, 18, 22, PALETTE.pomegranate, 0.82, PALETTE.coffeeBrown, 2.0, 0.92, rng, 0.7);
  drawHandLine(ctx, fx - 32, baseY - 34, fx - 32, baseY - 94, PALETTE.coffeeBrown, 2.5, 0.94, rng, 0.9);
  drawHandLine(ctx, fx + 32, baseY - 34, fx + 32, baseY - 94, PALETTE.coffeeBrown, 2.5, 0.94, rng, 0.9);
  drawHandLine(ctx, fx - 10, baseY - 34, fx - 10, baseY - 94, PALETTE.coffeeBrown, 1.9, 0.84, rng, 0.8);
  drawHandLine(ctx, fx + 10, baseY - 34, fx + 10, baseY - 94, PALETTE.coffeeBrown, 1.9, 0.84, rng, 0.8);
  const roofPts: Point[] = [
    [fx - 48, baseY - 94],
    [fx, baseY - 128],
    [fx + 48, baseY - 94],
  ];
  fillGouachePolygon(ctx, roofPts, PALETTE.emerald, 0.84, rng, 1.2);
  drawHandPolygonOutline(ctx, roofPts, PALETTE.coffeeBrown, 2.6, 0.94, rng, 1.1);
  drawSmallCrescent(ctx, fx, baseY - 146, 5.5, rng);

  // Tiny Iznik-style tulips near the šadrvan
  drawIznikTulip(ctx, fx - 56, baseY, 0.95, PALETTE.pomegranate, rng);
  drawIznikTulip(ctx, fx + 58, baseY, 0.82, PALETTE.saffron, rng);

  // Right slender cypress
  const rightCypress: Point[] = [
    [1548, baseY],
    [1536, 940],
    [1542, 855],
    [1552, 804],
    [1562, 858],
    [1567, 944],
    [1556, baseY],
  ];
  fillGouachePolygon(ctx, rightCypress, PALETTE.emerald, 0.76, rng, 1.7);
  drawHandPolygonOutline(ctx, rightCypress, PALETTE.coffeeBrown, 2.6, 0.92, rng, 1.5);

  // 8. RIGHT-CENTER: KALEMEGDAN FORTRESS WALL, SAHAT-KULA & CHURCH DOMES (muted fills, crisp outlines)
  const fortPts: Point[] = [
    [1618, 956],
    [1642, 956],
    [1642, 940],
    [1666, 940],
    [1666, 956],
    [1690, 956],
    [1690, 940],
    [1714, 940],
    [1714, 956],
    [1738, 956],
    [1738, 940],
    [1762, 940],
    [1762, 956],
    [1786, 956],
    [1786, baseY],
    [1618, baseY],
  ];
  fillGouachePolygon(ctx, fortPts, PALETTE.lightConcrete, 0.9, rng, 1.5);
  drawHandPolygonOutline(ctx, fortPts, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.5);
  fillAndStrokeGouacheRect(ctx, 1686, 986, 30, 56, PALETTE.concreteGrey, 0.45, PALETTE.coffeeBrown, 2.0, 0.86, rng, 0.9);

  // Sahat-kula clock tower
  fillAndStrokeGouacheRect(ctx, 1676, 756, 46, 184, PALETTE.lightConcrete, 0.92, PALETTE.coffeeBrown, 2.4, 0.9, rng, 1.4);
  const sahatRoof: Point[] = [
    [1671, 756],
    [1699, 682],
    [1727, 756],
  ];
  fillGouachePolygon(ctx, sahatRoof, PALETTE.coffeeBrown, 0.56, rng, 1.3);
  drawHandPolygonOutline(ctx, sahatRoof, PALETTE.coffeeBrown, 2.5, 0.92, rng, 1.2);
  drawHandDome(ctx, 1699, 796, 11, 11, PALETTE.concreteGrey, 0.4, PALETTE.coffeeBrown, 1.6, 0.82, rng);

  // Orthodox church / St. Mark's domes
  fillAndStrokeGouacheRect(ctx, 1815, 868, 134, 174, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.5);
  fillAndStrokeGouacheRect(ctx, 1858, 822, 48, 46, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.3, 0.88, rng, 1.3);
  drawHandDome(ctx, 1882, 822, 26, 30, PALETTE.concreteGrey, 0.42, PALETTE.coffeeBrown, 2.3, 0.88, rng);
  drawHandDome(ctx, 1834, 868, 14, 18, PALETTE.concreteGrey, 0.36, PALETTE.coffeeBrown, 2.0, 0.84, rng);
  drawHandDome(ctx, 1930, 868, 14, 18, PALETTE.concreteGrey, 0.36, PALETTE.coffeeBrown, 2.0, 0.84, rng);
  drawHandLine(ctx, 1882, 774, 1882, 792, PALETTE.coffeeBrown, 2.0, 0.86, rng, 0.6);
  drawHandLine(ctx, 1875, 781, 1889, 781, PALETTE.coffeeBrown, 2.0, 0.86, rng, 0.6);

  // 9. FAR RIGHT: MODERNIST BLOCKS & BEOGRAĐANKA TOWER
  fillAndStrokeGouacheRect(ctx, 1995, 728, 76, 314, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.5);
  fillAndStrokeGouacheRect(ctx, 2071, 728, 18, 314, PALETTE.concreteGrey, 0.38, PALETTE.coffeeBrown, 2.0, 0.84, rng, 1.3);
  drawHandLine(ctx, 2033, 676, 2033, 728, PALETTE.coffeeBrown, 2.1, 0.86, rng, 0.9);
  for (let y = 758; y <= 980; y += 34) {
    drawHandLine(ctx, 2005, y, 2062, y, PALETTE.coffeeBrown, 1.6, 0.6, rng, 1.0);
  }

  fillAndStrokeGouacheRect(ctx, 2116, 896, 134, 146, PALETTE.lightConcrete, 0.9, PALETTE.coffeeBrown, 2.4, 0.88, rng, 1.5);
  const aptRoof: Point[] = [
    [2112, 896],
    [2126, 876],
    [2240, 876],
    [2254, 896],
  ];
  fillGouachePolygon(ctx, aptRoof, PALETTE.coffeeBrown, 0.42, rng, 1.3);
  drawHandPolygonOutline(ctx, aptRoof, PALETTE.coffeeBrown, 2.2, 0.88, rng, 1.3);
  for (let y = 928; y <= 996; y += 34) {
    drawHandLine(ctx, 2132, y, 2232, y, PALETTE.coffeeBrown, 1.5, 0.6, rng, 1.0);
  }

  // 10. ONE CLEAN BASELINE + SAVA & DANUBE WATER LINES + FAINT STAR REFLECTION
  drawHandLine(ctx, 90, baseY, 2310, baseY, PALETTE.coffeeBrown, 2.8, 0.94, rng, 1.8);

  // Clean continuous Sava & Danube ripples
  drawHandLine(ctx, 180, baseY + 34, 780, baseY + 36, PALETTE.concreteGrey, 1.7, 0.6, rng, 1.6);
  drawHandLine(ctx, 910, baseY + 42, 1650, baseY + 40, PALETTE.concreteGrey, 1.7, 0.6, rng, 1.6);
  drawHandLine(ctx, 1740, baseY + 36, 2210, baseY + 38, PALETTE.concreteGrey, 1.6, 0.55, rng, 1.6);
  drawHandLine(ctx, 340, baseY + 72, 1140, baseY + 75, PALETTE.concreteGrey, 1.5, 0.45, rng, 1.6);
  drawHandLine(ctx, 1280, baseY + 78, 2040, baseY + 74, PALETTE.concreteGrey, 1.5, 0.45, rng, 1.6);

  // Very faint geometric star pattern in river reflection
  drawFaintStarPatternInRiver(ctx, rng);
}

export const SKYLINE_BASELINE_Y = 1042;

function drawWheel(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  radius: number,
  angle: number,
  rng: () => number,
) {
  // Subtle white fill inside rim so background lines don't tangle spokes
  ctx.save();
  ctx.fillStyle = hexToRgba(PALETTE.white, 0.55);
  ctx.beginPath();
  ctx.arc(wx, wy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Hand-drawn tire loop
  ctx.strokeStyle = hexToRgba(PALETTE.coffeeBrown, 0.94);
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const segs = 22;
  for (let i = 0; i <= segs; i++) {
    const t = (i / segs) * Math.PI * 2;
    const j = (rng() - 0.5) * 0.9;
    const px = wx + Math.cos(t) * (radius + j);
    const py = wy + Math.sin(t) * (radius + j);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Turning spokes (6 continuous spokes)
  for (let s = 0; s < 6; s++) {
    const a = angle + (s * Math.PI) / 3;
    drawHandLine(
      ctx,
      wx,
      wy,
      wx + Math.cos(a) * (radius - 2),
      wy + Math.sin(a) * (radius - 2),
      PALETTE.coffeeBrown,
      1.15,
      0.72,
      rng,
      0.4,
    );
  }

  // Hub dot
  ctx.fillStyle = PALETTE.coffeeBrown;
  ctx.beginPath();
  ctx.arc(wx, wy, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCyclingLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  footX: number,
  footY: number,
  trouserColor: string,
  rng: () => number,
) {
  const L1 = 26;
  const L2 = 26;
  const dx = footX - hipX;
  const dy = footY - hipY;
  const dist = Math.min(L1 + L2 - 0.8, Math.max(10, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx);
  const cosA = (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist);
  const bend = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const kneeX = hipX + Math.cos(a - bend) * L1;
  const kneeY = hipY + Math.sin(a - bend) * L1;

  // Soft trouser thickness
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = hexToRgba(trouserColor, 0.85);
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(footX, footY - 2);
  ctx.stroke();
  ctx.restore();

  // Confident coffee-brown outline over leg
  drawHandLine(ctx, hipX, hipY, kneeX, kneeY, PALETTE.coffeeBrown, 2.2, 0.94, rng, 0.6);
  drawHandLine(ctx, kneeX, kneeY, footX, footY - 2, PALETTE.coffeeBrown, 2.2, 0.94, rng, 0.6);

  // Small shoe on pedal
  fillAndStrokeGouacheRect(
    ctx,
    footX - 3,
    footY - 4,
    11,
    5,
    PALETTE.coffeeBrown,
    0.85,
    PALETTE.coffeeBrown,
    1.6,
    0.95,
    rng,
    0.3,
  );
}

/**
 * Draws the small delivery cyclist along the ground baseline (about the height of the šadrvan fountain).
 * progress: 0..1 across the full frame from left entry (-110) to right exit (2510).
 */
export function drawDeliveryCyclist(
  ctx: CanvasRenderingContext2D,
  progress: number,
) {
  const rng = createRng(77742);
  const baseY = SKYLINE_BASELINE_Y;
  const startX = -68;
  const endX = PAINTING_WIDTH + 68;
  const cx = startX + progress * (endX - startX);
  const distance = cx - startX;

  const wheelRadius = 22;
  const wheelAngle = distance / wheelRadius;
  const pedalAngle = wheelAngle / 1.85;
  const bobY = Math.sin(pedalAngle * 2) * 1.75;

  const rearX = cx - 32;
  const frontX = cx + 34;
  const wheelY = baseY - wheelRadius;
  const crankX = cx - 2;
  const crankY = baseY - 25 + bobY * 0.35;
  const seatX = cx - 15;
  const seatY = baseY - 62 + bobY;
  const steerTopX = cx + 24;
  const steerTopY = baseY - 68 + bobY * 0.3;

  const hipX = seatX + 3;
  const hipY = seatY - 3;
  const shoulderX = cx + 8;
  const shoulderY = baseY - 97 + bobY;

  // 1. Far leg behind bike frame
  const farFootX = crankX + Math.cos(pedalAngle + Math.PI) * 10;
  const farFootY = crankY + Math.sin(pedalAngle + Math.PI) * 10;
  drawCyclingLeg(ctx, hipX, hipY, farFootX, farFootY, PALETTE.concreteGrey, rng);

  // 2. Two turning wheels planted on the ground baseline
  drawWheel(ctx, rearX, wheelY, wheelRadius, wheelAngle, rng);
  drawWheel(ctx, frontX, wheelY, wheelRadius, wheelAngle, rng);

  // 3. Bicycle diamond frame & handlebars in continuous coffee brown
  drawHandLine(ctx, rearX, wheelY, crankX, crankY, PALETTE.coffeeBrown, 2.4, 0.94, rng, 0.5);
  drawHandLine(ctx, rearX, wheelY, seatX + 3, seatY + 8, PALETTE.coffeeBrown, 2.3, 0.94, rng, 0.5);
  drawHandLine(ctx, crankX, crankY, seatX, seatY + 2, PALETTE.coffeeBrown, 2.5, 0.94, rng, 0.5);
  drawHandLine(ctx, crankX, crankY, steerTopX - 2, steerTopY + 12, PALETTE.coffeeBrown, 2.4, 0.94, rng, 0.5);
  drawHandLine(ctx, seatX + 3, seatY + 8, steerTopX - 2, steerTopY + 10, PALETTE.coffeeBrown, 2.4, 0.94, rng, 0.5);
  drawHandLine(ctx, frontX, wheelY, steerTopX, steerTopY, PALETTE.coffeeBrown, 2.5, 0.95, rng, 0.5);
  // Handlebars & saddle
  drawHandLine(ctx, steerTopX, steerTopY, steerTopX + 8, steerTopY + 3, PALETTE.coffeeBrown, 2.5, 0.95, rng, 0.3);
  drawHandLine(ctx, seatX - 7, seatY, seatX + 7, seatY, PALETTE.coffeeBrown, 3.2, 0.96, rng, 0.3);

  // 4. Torso (soft muted concrete jacket)
  const torsoPts: Point[] = [
    [hipX - 9, hipY + 2],
    [shoulderX - 9, shoulderY - 3],
    [shoulderX + 8, shoulderY + 3],
    [hipX + 8, hipY + 3],
  ];
  fillGouachePolygon(ctx, torsoPts, PALETTE.lightConcrete, 0.94, rng, 0.7);
  drawHandPolygonOutline(ctx, torsoPts, PALETTE.coffeeBrown, 2.4, 0.95, rng, 0.6);

  // 5. Square food-delivery box in saffron #D9A02B on his back (no logo, no text, no brand)
  const boxPts: Point[] = [
    [shoulderX - 38, shoulderY - 19],
    [shoulderX - 8, shoulderY - 24],
    [shoulderX - 3, shoulderY + 7],
    [shoulderX - 33, shoulderY + 12],
  ];
  fillGouachePolygon(ctx, boxPts, PALETTE.saffron, 0.92, rng, 0.8);
  drawHandPolygonOutline(ctx, boxPts, PALETTE.coffeeBrown, 2.4, 0.96, rng, 0.7);
  // Subtle lid seam on saffron box
  drawHandLine(
    ctx,
    shoulderX - 37,
    shoulderY - 11,
    shoulderX - 7,
    shoulderY - 16,
    PALETTE.coffeeBrown,
    1.4,
    0.85,
    rng,
    0.4,
  );
  // Backpack strap
  drawHandLine(
    ctx,
    shoulderX - 5,
    shoulderY - 1,
    hipX + 1,
    hipY - 8,
    PALETTE.coffeeBrown,
    1.8,
    0.9,
    rng,
    0.4,
  );

  // 6. Near leg in front of crank
  const nearFootX = crankX + Math.cos(pedalAngle) * 10;
  const nearFootY = crankY + Math.sin(pedalAngle) * 10;
  drawCyclingLeg(ctx, hipX, hipY, nearFootX, nearFootY, PALETTE.concreteGrey, rng);

  // 7. Arm reaching to handlebar
  const elbowX = (shoulderX + steerTopX + 6) * 0.5 - 2;
  const elbowY = (shoulderY + steerTopY) * 0.5 + 4;
  drawHandLine(ctx, shoulderX + 2, shoulderY + 3, elbowX, elbowY, PALETTE.coffeeBrown, 2.5, 0.95, rng, 0.4);
  drawHandLine(ctx, elbowX, elbowY, steerTopX + 6, steerTopY + 3, PALETTE.coffeeBrown, 2.3, 0.95, rng, 0.4);

  // 8. Head, short beard & white kufi cap
  const headX = shoulderX + 5;
  const headY = shoulderY - 16;

  // Neck
  drawHandLine(ctx, shoulderX + 2, shoulderY - 2, headX - 1, headY + 8, PALETTE.coffeeBrown, 3.2, 0.9, rng, 0.3);

  // Head circle in light concrete tone
  ctx.save();
  ctx.fillStyle = PALETTE.lightConcrete;
  ctx.strokeStyle = hexToRgba(PALETTE.coffeeBrown, 0.96);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(headX, headY, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Short coffee-brown beard along jawline & chin (facing right)
  ctx.fillStyle = hexToRgba(PALETTE.coffeeBrown, 0.94);
  ctx.beginPath();
  ctx.arc(headX + 1.5, headY + 1, 9.2, -0.05, Math.PI * 0.62, false);
  ctx.lineTo(headX - 1, headY + 4);
  ctx.quadraticCurveTo(headX + 4, headY + 5, headX + 8.5, headY + 1);
  ctx.closePath();
  ctx.fill();

  // White kufi cap sitting cleanly on crown of head
  ctx.fillStyle = PALETTE.white;
  ctx.strokeStyle = hexToRgba(PALETTE.coffeeBrown, 0.96);
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.arc(headX - 0.5, headY - 3, 9.6, Math.PI * 1.04, Math.PI * 1.96, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

