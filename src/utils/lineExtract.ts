const extractedCache = new Map<string, string>();

/**
 * Extracts loose charcoal/graphite contour lines from a colored chalk sketch
 * onto a uniform light concrete grey plaster paper ground so all 10 frames
 * share a monochrome line-drawing look for hero rotoscope layering.
 */
export async function extractCharcoalLines(imageUrl: string): Promise<string> {
  const cached = extractedCache.get(imageUrl);
  if (cached) return cached;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Failed to load ${imageUrl}`));
    el.src = imageUrl;
  });

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageUrl;

  ctx.drawImage(img, 0, 0, size, size);
  const srcData = ctx.getImageData(0, 0, size, size);
  const {data} = srcData;
  const total = size * size;

  const lum = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  // Fast 2-pass box blur (radius 4) for local high-pass line detection
  const blurH = new Float32Array(total);
  const blur = new Float32Array(total);
  const r = 4;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * size;
    for (let x = 0; x < size; x++) {
      let sum = 0;
      let count = 0;
      const minX = Math.max(0, x - r);
      const maxX = Math.min(size - 1, x + r);
      for (let kx = minX; kx <= maxX; kx++) {
        sum += lum[rowOffset + kx];
        count++;
      }
      blurH[rowOffset + x] = sum / count;
    }
  }

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let sum = 0;
      let count = 0;
      const minY = Math.max(0, y - r);
      const maxY = Math.min(size - 1, y + r);
      for (let ky = minY; ky <= maxY; ky++) {
        sum += blurH[ky * size + x];
        count++;
      }
      blur[y * size + x] = sum / count;
    }
  }

  // Sample outer concrete grey plaster tone from top border
  let bgSum = 0;
  let bgCount = 0;
  for (let y = 8; y < 48; y++) {
    for (let x = 8; x < size - 8; x += 4) {
      bgSum += lum[y * size + x];
      bgCount++;
    }
  }
  const paperBase = Math.min(220, Math.max(204, bgSum / Math.max(1, bgCount)));

  const outData = ctx.createImageData(size, size);
  const out = outData.data;

  for (let i = 0; i < total; i++) {
    const l = lum[i];
    const localDiff = blur[i] - l;

    // Detect dark graphite/charcoal lines while ignoring midtone chalk color fills
    const lineScore = Math.max(0, localDiff - 10) * 3.1 + Math.max(0, 82 - l) * 1.6;
    const inkAlpha = Math.min(1, lineScore / 95);

    // Subtle organic plaster paper grain
    const x = i % size;
    const y = (i / size) | 0;
    const grain = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 6 - 3;
    const paperR = paperBase - 1 + grain;
    const paperG = paperBase + grain;
    const paperB = paperBase - 3 + grain;

    const inkR = 36;
    const inkG = 38;
    const inkB = 40;

    const p = i * 4;
    out[p] = Math.max(0, Math.min(255, paperR * (1 - inkAlpha) + inkR * inkAlpha));
    out[p + 1] = Math.max(0, Math.min(255, paperG * (1 - inkAlpha) + inkG * inkAlpha));
    out[p + 2] = Math.max(0, Math.min(255, paperB * (1 - inkAlpha) + inkB * inkAlpha));
    out[p + 3] = 255;
  }

  ctx.putImageData(outData, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  extractedCache.set(imageUrl, dataUrl);
  return dataUrl;
}
