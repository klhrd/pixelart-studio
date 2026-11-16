import { useEffect, useRef } from 'react';
import { blendOp } from '../../renderers/composite';

interface BlendPreviewProps {
  mode: string;
  className?: string;
}

/**
 * A tiny swatch: a black→white base ramp with a mid-grey layer on top, blended
 * with the given mode, so the tone mapping of each blend mode is visible.
 */
export function BlendPreview({ mode, className }: BlendPreviewProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#000000');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = blendOp(mode);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }, [mode]);
  return (
    <canvas
      ref={ref}
      width={96}
      height={20}
      className={className ?? 'h-5 w-24 rounded-sm border border-zinc-800'}
      aria-hidden="true"
    />
  );
}
