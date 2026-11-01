import type {
  EngineId,
  EngineResult,
  Settings,
  SourceImage,
} from '../types';
import { renderResult } from '../renderers';

export async function exportPng(
  source: SourceImage,
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  scale: number,
): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = source.width * scale;
  canvas.height = source.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.scale(scale, scale);
  renderResult(
    engine,
    ctx,
    result,
    settings,
    palette,
    source.width,
    source.height,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) throw new Error('PNG export failed');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pixelcraft-${engine}-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
