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
  filename: string,
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

  const base =
    filename
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .slice(0, 60) || 'pixelcraft';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
