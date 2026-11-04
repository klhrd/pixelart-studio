import type {
  BendayResult,
  BrailleResult,
  ContourResult,
  DitherResult,
  EngineId,
  EngineResult,
  FlowResult,
  HanziResult,
  HexDumpResult,
  MoonResult,
  Settings,
  StippleResult,
  TruchetResult,
  VoronoiResult,
  WaveResult,
  StringArtResult,
  TuringResult,
  PixelSortResult,
} from '../types';
import { renderMoon } from './moonRenderer';
import { renderMoonSVG } from './moonRenderer';
import { renderTruchet } from './truchetRenderer';
import { renderTruchetSVG } from './truchetRenderer';
import { renderVoronoi } from './voronoiRenderer';
import { renderVoronoiSVG } from './voronoiRenderer';
import { renderBraille } from './brailleRenderer';
import { renderBrailleSVG } from './brailleRenderer';
import { renderPixels } from './pixelRenderer';
import { renderImageSVG } from './pixelRenderer';
import { renderStipple } from './stippleRenderer';
import { renderStippleSVG } from './stippleRenderer';
import { renderFlow } from './flowRenderer';
import { renderFlowSVG } from './flowRenderer';
import { renderHanzi } from './hanziRenderer';
import { renderHanziSVG } from './hanziRenderer';
import { renderHexDump } from './hexdumpRenderer';
import { renderHexDumpSVG } from './hexdumpRenderer';
import { renderBenday } from './bendayRenderer';
import { renderBendaySVG } from './bendayRenderer';
import { renderWave } from './waveRenderer';
import { renderWaveSVG } from './waveRenderer';
import { renderContour } from './contourRenderer';
import { renderContourSVG } from './contourRenderer';
import { renderStringArt } from './stringartRenderer';
import { renderStringArtSVG } from './stringartRenderer';
import { renderTuring } from './turingRenderer';
import { renderTuringSVG } from './turingRenderer';
import { renderPixelSort } from './pixelsortRenderer';
import { renderPixelSortSVG } from './pixelsortRenderer';
import { GLRenderer } from './webgl/GLRenderer';
import { WebGLRenderer } from './webgl/WebGLRenderer';

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
    case 'hexdump':
      renderHexDump(
        ctx,
        result as HexDumpResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'benday':
      renderBenday(
        ctx,
        result as BendayResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'wave':
      renderWave(
        ctx,
        result as WaveResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'contour':
      renderContour(
        ctx,
        result as ContourResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'stringart':
      renderStringArt(
        ctx,
        result as StringArtResult,
        settings,
        palette,
        width,
        height,
      );
      break;
    case 'turing':
      renderTuring(ctx, result as TuringResult, settings, palette, width, height);
      break;
    case 'pixelsort':
      renderPixelSort(
        ctx,
        result as PixelSortResult,
        settings,
        palette,
        width,
        height,
      );
      break;
  }
}

export function renderSVG(
  engine: EngineId,
  result: EngineResult,
  settings: Settings,
  palette: string[],
  width: number,
  height: number,
): string {
  switch (engine) {
    case 'moon':
      return renderMoonSVG(
        result as MoonResult,
        settings,
        palette,
        width,
        height,
      );
    case 'truchet':
      return renderTruchetSVG(
        result as TruchetResult,
        settings,
        palette,
        width,
        height,
      );
    case 'voronoi':
      return renderVoronoiSVG(
        result as VoronoiResult,
        settings,
        palette,
        width,
        height,
      );
    case 'braille':
      return renderBrailleSVG(
        result as BrailleResult,
        settings,
        palette,
        width,
        height,
      );
    case 'stipple':
      return renderStippleSVG(
        result as StippleResult,
        settings,
        palette,
        width,
        height,
      );
    case 'flow':
      return renderFlowSVG(
        result as FlowResult,
        settings,
        palette,
        width,
        height,
      );
    case 'contour':
      return renderContourSVG(
        result as ContourResult,
        settings,
        palette,
        width,
        height,
      );
    case 'stringart':
      return renderStringArtSVG(
        result as StringArtResult,
        settings,
        palette,
        width,
        height,
      );
    case 'turing':
      return renderTuringSVG(
        result as TuringResult,
        settings,
        palette,
        width,
        height,
      );
    case 'pixelsort':
      return renderPixelSortSVG(
        result as PixelSortResult,
        settings,
        palette,
        width,
        height,
      );
    case 'dither':
    case 'scanline':
      return renderImageSVG(
        result as DitherResult,
        settings,
        palette,
        width,
        height,
      );
    case 'hanzi':
      return renderHanziSVG(
        result as HanziResult,
        settings,
        palette,
        width,
        height,
      );
    case 'hexdump':
      return renderHexDumpSVG(
        result as HexDumpResult,
        settings,
        palette,
        width,
        height,
      );
    case 'benday':
      return renderBendaySVG(
        result as BendayResult,
        settings,
        palette,
        width,
        height,
      );
    case 'wave':
      return renderWaveSVG(
        result as WaveResult,
        settings,
        palette,
        width,
        height,
      );
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
  renderHexDump,
  renderBenday,
  renderWave,
  renderContour,
  renderStringArt,
  renderTuring,
  renderPixelSort,
  renderMoonSVG,
  renderTruchetSVG,
  renderVoronoiSVG,
  renderBrailleSVG,
  renderStippleSVG,
  renderFlowSVG,
  renderContourSVG,
  renderStringArtSVG,
  renderTuringSVG,
  renderPixelSortSVG,
  renderImageSVG,
  renderHanziSVG,
  renderHexDumpSVG,
  renderBendaySVG,
  renderWaveSVG,
  GLRenderer,
  WebGLRenderer,
};

export function createWebGLRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer(canvas);
    if (!renderer.isSupported) return null;
    return renderer;
  } catch {
    return null;
  }
}
