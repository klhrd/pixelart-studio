import type {
  BrailleResult,
  DitherResult,
  EngineId,
  EngineResult,
  FlowResult,
  HanziResult,
  MoonResult,
  Settings,
  StippleResult,
  TruchetResult,
  VoronoiResult,
} from '../types';
import { renderMoon } from './moonRenderer';
import { renderTruchet } from './truchetRenderer';
import { renderVoronoi } from './voronoiRenderer';
import { renderBraille } from './brailleRenderer';
import { renderPixels } from './pixelRenderer';
import { renderStipple } from './stippleRenderer';
import { renderFlow } from './flowRenderer';
import { renderHanzi } from './hanziRenderer';

export function renderResult(
  engine: EngineId,
  ctx: CanvasRenderingContext2D,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): void {
  switch (engine) {
    case 'moon':
      renderMoon(ctx, result as MoonResult, settings, palette, width, height);
      break;
    case 'truchet':
      renderTruchet(
        ctx,
        result as TruchetResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'voronoi':
      renderVoronoi(
        ctx,
        result as VoronoiResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'braille':
      renderBraille(
        ctx,
        result as BrailleResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'dither':
    case 'scanline':
      renderPixels(
        ctx,
        result as DitherResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'stipple':
      renderStipple(
        ctx,
        result as StippleResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'flow':
      renderFlow(ctx, result as FlowResult, settings, palette, width, height);
      break;
    case 'hanzi':
      renderHanzi(
        ctx,
        result as HanziResult,
        settings,
        palette,
        width,
        height,
      );
      break;
  }
}

export {
  renderMoon,
  renderTruchet,
  renderVoronoi,
  renderBraille,
  renderPixels,
  renderStipple,
  renderFlow,
  renderHanzi,
};
