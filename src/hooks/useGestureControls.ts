import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../types';

export interface GestureItem {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
  step: number;
  format?: (value: number) => string;
}

export interface GestureState {
  activeIndex: number;
  activeItem: GestureItem;
  currentValue: number;
  isActive: boolean;
  direction: 'vertical' | 'horizontal' | null;
}

export function useGestureControls(
  items: GestureItem[],
  settings: Settings,
  updateSettings: (patch: Partial<Settings>) => void,
  initialIndex: number = 0
) {
  const [state, setState] = useState<GestureState>({
    activeIndex: Math.min(initialIndex, items.length - 1),
    activeItem: items[Math.min(initialIndex, items.length - 1)] || items[0],
    currentValue: 0,
    isActive: false,
    direction: null,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();
  const isActiveRef = useRef(false);

  const getCurrentValue = useCallback((item: GestureItem): number => {
    return settings[item.key] as number;
  }, [settings]);

  // 初始化当前值
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      currentValue: getCurrentValue(prev.activeItem),
    }));
  }, [settings, getCurrentValue]);

  const startGesture = useCallback((clientX: number, clientY: number) => {
    startPos.current = { x: clientX, y: clientY };
    currentPos.current = { x: clientX, y: clientY };
    isActiveRef.current = true;
    setState((prev) => ({ ...prev, isActive: true, direction: null }));
  }, []);

  const moveGesture = useCallback((clientX: number, clientY: number) => {
    if (!isActiveRef.current) return;

    currentPos.current = { x: clientX, y: clientY };
    const dx = currentPos.current.x - startPos.current.x;
    const dy = currentPos.current.y - startPos.current.y;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      // 垂直滑动：切换参数项
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 15) {
        const direction = dy > 0 ? 1 : -1;
        setState((prev) => {
          const newIndex = ((prev.activeIndex + direction) % items.length + items.length) % items.length;
          const newItem = items[newIndex];
          return {
            ...prev,
            activeIndex: newIndex,
            activeItem: newItem,
            currentValue: settings[newItem.key] as number,
            direction: 'vertical',
          };
        });
      }
      // 水平滑动：调整数值
      else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
        const item = state.activeItem;
        const step = item.step * (Math.abs(dx) / 15);
        const direction = dx > 0 ? 1 : -1;
        const newValue = Math.min(
          item.max,
          Math.max(item.min, state.currentValue + step * direction)
        );
        setState((prev) => ({
          ...prev,
          currentValue: newValue,
          direction: 'horizontal',
        }));
        updateSettings({ [item.key]: newValue } as Partial<Settings>);
      }
    });
  }, [settings, updateSettings, items, state]);

  const endGesture = useCallback(() => {
    isActiveRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState((prev) => ({ ...prev, isActive: false, direction: null }));
    startPos.current = { x: 0, y: 0 };
    currentPos.current = { x: 0, y: 0 };
  }, []);

  return {
    ...state,
    startGesture,
    moveGesture,
    endGesture,
  };
}
