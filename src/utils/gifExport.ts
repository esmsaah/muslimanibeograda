function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function lzwEncode(indices: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const out: number[] = [];

  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let table = new Map<string, number>();

  const resetTable = () => {
    table = new Map();
    for (let i = 0; i < clearCode; i++) {
      table.set(String(i), i);
    }
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };

  let bitBuffer = 0;
  let bitCount = 0;

  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };

  resetTable();
  writeCode(clearCode);

  if (indices.length > 0) {
    let prefix = String(indices[0]);
    for (let i = 1; i < indices.length; i++) {
      const k = String(indices[i]);
      const combined = `${prefix},${k}`;
      if (table.has(combined)) {
        prefix = combined;
      } else {
        writeCode(table.get(prefix)!);
        if (nextCode < 4096) {
          table.set(combined, nextCode++);
          if (nextCode > 1 << codeSize && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeCode(clearCode);
          resetTable();
        }
        prefix = k;
      }
    }
    writeCode(table.get(prefix)!);
  }

  writeCode(endCode);
  if (bitCount > 0) {
    out.push(bitBuffer & 0xff);
  }

  return new Uint8Array(out);
}

/**
 * Builds an animated grayscale GIF89a looping through all portrait frames
 * with subtle previous-frame ghost overlap so one identity draws over the next.
 */
export async function exportHeroGif(
  sources: string[],
  delayMs: number,
  ghostOverlap: boolean,
  filename = 'belgrade-hero-loop.gif',
): Promise<void> {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const images = await Promise.all(sources.map(loadImage));
  const delayCs = Math.max(10, Math.round(delayMs / 10));

  const bytes: number[] = [];
  const pushStr = (s: string) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };
  const pushU16 = (n: number) => {
    bytes.push(n & 0xff, (n >> 8) & 0xff);
  };

  // Header + Logical Screen Descriptor (256-entry grayscale Global Color Table)
  pushStr('GIF89a');
  pushU16(size);
  pushU16(size);
  bytes.push(0xf7, 0x00, 0x00); // GCT flag=1, color res=7, size=7 (256 colors)

  for (let i = 0; i < 256; i++) {
    bytes.push(i, i, i);
  }

  // Netscape 2.0 infinite loop extension
  bytes.push(0x21, 0xff, 0x0b);
  pushStr('NETSCAPE2.0');
  bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (let frameIdx = 0; frameIdx < images.length; frameIdx++) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d3d5d3';
    ctx.fillRect(0, 0, size, size);

    if (ghostOverlap && images.length > 1) {
      const prevIdx = (frameIdx - 1 + images.length) % images.length;
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.25;
      ctx.drawImage(images[prevIdx], 0, 0, size, size);
    }

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 1;
    ctx.drawImage(images[frameIdx], 0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size).data;
    const indices = new Uint8Array(size * size);
    for (let i = 0; i < indices.length; i++) {
      const p = i * 4;
      indices[i] = Math.round(
        0.299 * imgData[p] + 0.587 * imgData[p + 1] + 0.114 * imgData[p + 2],
      );
    }

    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04, 0x04);
    pushU16(delayCs);
    bytes.push(0x00, 0x00);

    // Image Descriptor
    bytes.push(0x2c);
    pushU16(0);
    pushU16(0);
    pushU16(size);
    pushU16(size);
    bytes.push(0x00);

    // LZW Image Data
    const minCodeSize = 8;
    bytes.push(minCodeSize);
    const lzw = lzwEncode(indices, minCodeSize);
    for (let offset = 0; offset < lzw.length; offset += 255) {
      const len = Math.min(255, lzw.length - offset);
      bytes.push(len);
      for (let j = 0; j < len; j++) {
        bytes.push(lzw[offset + j]);
      }
    }
    bytes.push(0x00);
  }

  bytes.push(0x3b); // GIF Trailer

  const blob = new Blob([new Uint8Array(bytes).buffer], {type: 'image/gif'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Fast open-addressed hash-table LZW encoder for 8-bit palette indices (0..255).
 */
function lzwEncodeFast(indices: Uint8Array, minCodeSize = 8): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const TABLE_SIZE = 5003;
  const keys = new Int32Array(TABLE_SIZE);
  const vals = new Int16Array(TABLE_SIZE);

  const resetTable = () => {
    keys.fill(-1);
  };

  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let maxCode = 1 << codeSize;

  const out: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitCount -= 8;
    }
  };

  resetTable();
  writeCode(clearCode);

  if (indices.length > 0) {
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = (prefix << 8) | k;
      let slot = ((key ^ (key >>> 8)) * 2654435761) >>> 0;
      slot %= TABLE_SIZE;

      let found = -1;
      while (keys[slot] !== -1) {
        if (keys[slot] === key) {
          found = vals[slot];
          break;
        }
        slot = (slot + 1) % TABLE_SIZE;
      }

      if (found !== -1) {
        prefix = found;
      } else {
        writeCode(prefix);
        if (nextCode < 4096) {
          keys[slot] = key;
          vals[slot] = nextCode++;
          if (nextCode > maxCode && codeSize < 12) {
            codeSize++;
            maxCode = 1 << codeSize;
          }
        } else {
          writeCode(clearCode);
          resetTable();
          codeSize = minCodeSize + 1;
          nextCode = endCode + 1;
          maxCode = 1 << codeSize;
        }
        prefix = k;
      }
    }
    writeCode(prefix);
  }

  writeCode(endCode);
  if (bitCount > 0) {
    out.push(bitBuffer & 0xff);
  }
  return new Uint8Array(out);
}

/**
 * Exports a smooth 16:9 (1280x720) full-color animated GIF89a of the static Belgrade skyline
 * with the small delivery cyclist riding smoothly from left to right.
 */
export async function exportSkylineCyclistGif(
  staticCanvas: HTMLCanvasElement,
  drawCyclistOnMaster: (ctx: CanvasRenderingContext2D, progress: number) => void,
  options?: {
    frames?: number;
    durationMs?: number;
    filename?: string;
    onProgress?: (fraction: number) => void;
  },
): Promise<void> {
  const frames = Math.max(96, options?.frames ?? 100);
  const durationMs = options?.durationMs ?? 7000;
  const filename = options?.filename ?? 'belgrade-skyline-cyclist.gif';
  const delayCs = Math.max(2, Math.round(durationMs / frames / 10));

  const outW = 1280;
  const outH = 720;

  // Master-res working canvas (2400x1350) + scaled output canvas (1280x720)
  const workCanvas = document.createElement('canvas');
  workCanvas.width = staticCanvas.width;
  workCanvas.height = staticCanvas.height;
  const workCtx = workCanvas.getContext('2d');
  if (!workCtx) throw new Error('Canvas 2D unavailable');

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d', {willReadFrequently: true});
  if (!outCtx) throw new Error('Canvas 2D unavailable');

  // Render a mid-frame with cyclist visible to sample exact adaptive 256-color palette
  workCtx.drawImage(staticCanvas, 0, 0);
  drawCyclistOnMaster(workCtx, 0.52);
  outCtx.drawImage(workCanvas, 0, 0, outW, outH);
  const samplePixels = outCtx.getImageData(0, 0, outW, outH).data;

  // Seed palette with exact core illustration hex colors
  const palette: [number, number, number][] = [
    [255, 255, 255], // #FFFFFF
    [237, 237, 234], // #EDEDEA
    [143, 141, 136], // #8F8D88
    [15, 138, 95],   // #0F8A5F
    [217, 160, 43],  // #D9A02B
    [158, 43, 69],   // #9E2B45
    [43, 33, 28],    // #2B211C
  ];

  // Collect quantized RGB bucket histogram (6 bits per channel -> 64 levels) for remaining slots
  const bucketCounts = new Map<number, {count: number; rSum: number; gSum: number; bSum: number}>();
  for (let i = 0; i < samplePixels.length; i += 4) {
    const r = samplePixels[i];
    const g = samplePixels[i + 1];
    const b = samplePixels[i + 2];
    const key = ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);
    const entry = bucketCounts.get(key);
    if (entry) {
      entry.count++;
      entry.rSum += r;
      entry.gSum += g;
      entry.bSum += b;
    } else {
      bucketCounts.set(key, {count: 1, rSum: r, gSum: g, bSum: b});
    }
  }

  const sortedBuckets = Array.from(bucketCounts.values()).sort(
    (a, b) => b.count - a.count,
  );
  for (const bucket of sortedBuckets) {
    if (palette.length >= 256) break;
    const avgR = Math.round(bucket.rSum / bucket.count);
    const avgG = Math.round(bucket.gSum / bucket.count);
    const avgB = Math.round(bucket.bSum / bucket.count);
    const exists = palette.some(
      ([pr, pg, pb]) =>
        Math.abs(pr - avgR) + Math.abs(pg - avgG) + Math.abs(pb - avgB) <= 5,
    );
    if (!exists) {
      palette.push([avgR, avgG, avgB]);
    }
  }
  while (palette.length < 256) {
    palette.push([255, 255, 255]);
  }

  // Build 15-bit RGB -> palette index lookup table for O(1) pixel mapping
  const lut = new Uint8Array(32768);
  for (let r5 = 0; r5 < 32; r5++) {
    const r = (r5 << 3) | 4;
    for (let g5 = 0; g5 < 32; g5++) {
      const g = (g5 << 3) | 4;
      for (let b5 = 0; b5 < 32; b5++) {
        const b = (b5 << 3) | 4;
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let p = 0; p < palette.length; p++) {
          const dr = r - palette[p][0];
          const dg = g - palette[p][1];
          const db = b - palette[p][2];
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = p;
          }
        }
        lut[(r5 << 10) | (g5 << 5) | b5] = bestIdx;
      }
    }
  }

  const bytes: number[] = [];
  const pushStr = (s: string) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };
  const pushU16 = (n: number) => {
    bytes.push(n & 0xff, (n >> 8) & 0xff);
  };

  // GIF89a Header + Logical Screen Descriptor (256-entry RGB Global Color Table)
  pushStr('GIF89a');
  pushU16(outW);
  pushU16(outH);
  bytes.push(0xf7, 0x00, 0x00);

  for (let i = 0; i < 256; i++) {
    bytes.push(palette[i][0], palette[i][1], palette[i][2]);
  }

  // Netscape 2.0 Infinite Loop
  bytes.push(0x21, 0xff, 0x0b);
  pushStr('NETSCAPE2.0');
  bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

  // Sub-strip bounds covering cyclist height cleanly (y: 468..568 at 1280x720)
  const stripY = 468;
  const stripH = 100;
  const scaleX = outW / staticCanvas.width;
  const startX = -68;
  const endX = staticCanvas.width + 68;
  let prevLeft = 0;
  let prevRight = 0;

  for (let frameIdx = 0; frameIdx < frames; frameIdx++) {
    const progress = frameIdx / frames;
    const cx = startX + progress * (endX - startX);
    const currLeft = Math.floor((cx - 72) * scaleX);
    const currRight = Math.ceil((cx + 72) * scaleX);

    workCtx.drawImage(staticCanvas, 0, 0);
    drawCyclistOnMaster(workCtx, progress);
    outCtx.drawImage(workCanvas, 0, 0, outW, outH);

    let rectX = 0;
    let rectY = 0;
    let rectW = outW;
    let rectH = outH;

    if (frameIdx > 0) {
      const unionLeft = Math.max(0, Math.min(prevLeft, currLeft));
      const unionRight = Math.min(outW, Math.max(prevRight, currRight));
      if (unionRight > unionLeft) {
        rectX = unionLeft;
        rectY = stripY;
        rectW = unionRight - unionLeft;
        rectH = stripH;
      } else {
        // Cyclist is off-canvas at edge; emit minimal 2x2 static patch
        rectX = 0;
        rectY = stripY;
        rectW = 2;
        rectH = 2;
      }
    }

    prevLeft = currLeft;
    prevRight = currRight;

    const imgData = outCtx.getImageData(rectX, rectY, rectW, rectH).data;
    const indices = new Uint8Array(rectW * rectH);

    for (let i = 0; i < indices.length; i++) {
      const p = i * 4;
      const key =
        ((imgData[p] >> 3) << 10) |
        ((imgData[p + 1] >> 3) << 5) |
        (imgData[p + 2] >> 3);
      indices[i] = lut[key];
    }

    // GCE: disposal = 1 (keep previous canvas state), no transparency
    bytes.push(0x21, 0xf9, 0x04, 0x04);
    pushU16(delayCs);
    bytes.push(0x00, 0x00);

    // Image Descriptor
    bytes.push(0x2c);
    pushU16(rectX);
    pushU16(rectY);
    pushU16(rectW);
    pushU16(rectH);
    bytes.push(0x00);

    const minCodeSize = 8;
    bytes.push(minCodeSize);
    const lzw = lzwEncodeFast(indices, minCodeSize);
    for (let offset = 0; offset < lzw.length; offset += 255) {
      const len = Math.min(255, lzw.length - offset);
      bytes.push(len);
      for (let j = 0; j < len; j++) {
        bytes.push(lzw[offset + j]);
      }
    }
    bytes.push(0x00);

    options?.onProgress?.((frameIdx + 1) / frames);
    if (frameIdx % 10 === 9) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  bytes.push(0x3b);

  const blob = new Blob([new Uint8Array(bytes).buffer], {type: 'image/gif'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

