import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../types';

export type GestureGroup = 'general' | 'engine';

export interface GestureItem {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
  step: number;
  group: GestureGroup;
  format?: (value: number) => string;
}

export const GESTURE_GROUP_LABELS: Record<GestureGroup, string> = {
  general: 'Image Adjustments',
  engine: 'Engine Settings',
};

export interface GestureState {
  activeIndex: number;
  activeItem: GestureItem;
  currentValue: number;
  isActive: boolean;
  direction: 'vertical' | 'horizontal' | null;
  listOffset: number;
}

export const GESTURE_ITEM_PITCH = 44;

const LOCK_THRESHOLD = 12;
const FULL_RANGE_PX = 200;

export function useGestureControls(
  items: GestureItem[],
  settings: Settings,
  updateSettings: (patch: Partial<Settings>) => void,
  initialIndex = 0,
) {
  const safeIndex = Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0));

  const [state, setState] = useState<GestureState>(() => ({
    activeIndex: safeIndex,
    activeItem: items[safeIndex] ?? items[0],
    currentValue: items[safeIndex]
      ? (settings[items[safeIndex].key] as number)
      : 0,
    isActive: false,
    direction: null,
    listOffset: safeIndex,
  }));

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const updateRef = useRef(updateSettings);
  updateRef.current = updateSettings;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const activeIndexRef = useRef(state.activeIndex);
  activeIndexRef.current = state.activeIndex;

  const draggingRef = useRef(false);
  const dirRef = useRef<'vertical' | 'horizontal' | null>(null);
  const anchorRef = useRef({ x: 0, y: 0, baseValue: 0, baseOffset: 0 });
  const rafRef = useRef<number>();

  const startGesture = useCallback((x: number, y: number) => {
    draggingRef.current = true;
    dirRef.current = null;
    anchorRef.current = {
      x,
      y,
      baseValue: 0,
      baseOffset: activeIndexRef.current,
    };
  }, []);

  const applyValue = useCallback((item: GestureItem, value: number) => {
    const stepped = Math.round(value / item.step) * item.step;
    const clamped = Math.min(item.max, Math.max(item.min, stepped));
    const precision = item.step < 1 ? 2 : 0;
    const final = Number(clamped.toFixed(precision));
    updateRef.current({ [item.key]: final } as Partial<Settings>);
    return final;
  }, []);

  const moveGesture = useCallback(
    (x: number, y: number) => {
      if (!draggingRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const dx = x - anchorRef.current.x;
        const dy = y - anchorRef.current.y;

        if (!dirRef.current) {
          if (Math.abs(dx) < LOCK_THRESHOLD && Math.abs(dy) < LOCK_THRESHOLD) {
            return;
          }
          dirRef.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
          const current = itemsRef.current[activeIndexRef.current];
          if (current) {
            anchorRef.current.baseValue = settingsRef.current[current.key] as number;
          }
          anchorRef.current.x = x;
          anchorRef.current.y = y;
          anchorRef.current.baseOffset = activeIndexRef.current;
          return;
        }

        if (dirRef.current === 'vertical') {
          const len = itemsRef.current.length;
          if (len === 0) return;
          const raw =
            anchorRef.current.baseOffset -
            (y - anchorRef.current.y) / GESTURE_ITEM_PITCH;
          const offset = Math.max(0, Math.min(len - 1, raw));
          const idx = Math.round(offset);
          const item = itemsRef.current[idx];
          if (!item) return;
          setState((prev) => ({
            ...prev,
            isActive: true,
            direction: 'vertical',
            activeIndex: idx,
            activeItem: item,
            listOffset: offset,
            currentValue: settingsRef.current[item.key] as number,
          }));
          return;
        }

        const item = itemsRef.current[activeIndexRef.current];
        if (!item) return;
        const sensitivity = (item.max - item.min) / FULL_RANGE_PX;
        const newValue = applyValue(
          item,
          anchorRef.current.baseValue + dx * sensitivity,
        );
        setState((prev) => ({
          ...prev,
          isActive: true,
          direction: 'horizontal',
          activeIndex: activeIndexRef.current,
          activeItem: item,
          currentValue: newValue,
        }));
      });
    },
    [applyValue],
  );

  const endGesture = useCallback(() => {
    draggingRef.current = false;
    dirRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState((prev) => ({
      ...prev,
      isActive: false,
      direction: null,
      listOffset: prev.activeIndex,
    }));
  }, []);

  useEffect(() => {
    setState((prev) => {
      const idx = Math.min(prev.activeIndex, Math.max(items.length - 1, 0));
      const item = items[idx];
      if (!item) return prev;
      const value = settings[item.key] as number;
      if (
        item === prev.activeItem &&
        value === prev.currentValue &&
        prev.listOffset === idx
      ) {
        return prev;
      }
      return {
        ...prev,
        activeIndex: idx,
        activeItem: item,
        currentValue: value,
        listOffset: idx,
      };
    });
  }, [settings, items]);

  return { ...state, startGesture, moveGesture, endGesture };
}
