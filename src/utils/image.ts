import type { SourceImage } from '../types';

export const MAX_WORKING_SIDE = 1024;

export function bitmapToSource(bitmap: ImageBitmap): SourceImage {
  const maxSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_WORKING_SIDE / maxSide);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  return { width: w, height: h, bytes: data.data };
}

export async function fileToSource(file: File): Promise<SourceImage> {
  const bitmap = await createImageBitmap(file);
  try {
    return bitmapToSource(bitmap);
  } finally {
    bitmap.close();
  }
}
