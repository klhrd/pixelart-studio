import { useEffect, useRef } from 'react';

interface HUDProps {
  activeItem: { label: string };
  currentValue: number;
  isActive: boolean;
  format?: (value: number) => string;
}

export function HUD({ activeItem, currentValue, isActive, format }: HUDProps) {
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 当手势结束后，延迟隐藏 HUD
  useEffect(() => {
    if (!isActive) {
      fadeRef.current = setTimeout(() => {
        // 隐藏后不需要做什么，组件会根据 isActive 不渲染
      }, 1000);
    } else {
      if (fadeRef.current) {
        clearTimeout(fadeRef.current);
        fadeRef.current = null;
      }
    }
    return () => {
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  const valueText = format ? format(currentValue) : currentValue.toString();

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/80 backdrop-blur text-zinc-200 text-xs font-mono"
      >
        <span className="text-zinc-400">{activeItem.label}</span>
        <span className="text-emerald-400 font-bold">{valueText}</span>
      </div>
      <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${Math.max(0, Math.min(100, ((currentValue as number) / 100) * 100))}%` }}
        ></div>
      </div>
    </div>
  );
}
