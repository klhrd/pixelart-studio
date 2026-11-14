import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../types';

export type GestureGroup = 'general' | 'engine';

export interface GestureChoice {
  value: string;
  label: string;
}

export interface GestureItem {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
  step: number;
  group: GestureGroup;
  format?: (value: number) => string;
  /** Present => discrete string setting; drag horizontally to switch option. */
  choices?: GestureChoice[];
  /** Present => boolean setting; drag right = on, left = off. */
  toggle?: boolean;
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
const CHOICE_PITCH = 44;
const TOGGLE_THRESHOLD = 20;

/** Current value of an item expressed as a number (index for choices, 0/1 for toggles). */
export function gestureItemValue(item: GestureItem, settings: Settings): number {
  if (item.choices && item.choices.length) {
    const idx = item.choices.findIndex((c) => c.value === settings[item.key]);
    return idx < 0 ? 0 : idx;
  }
  if (item.toggle) return settings[item.key] ? 1 : 0;
  return settings[item.key] as number;
}

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
      ? gestureItemValue(items[safeIndex], settings)
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

  const applyNumeric = useCallback((item: GestureItem, value: number) => {
    const stepped = Math.round(value / item.step) * item.step;
    const clamped = Math.min(item.max, Math.max(item.min, stepped));
    const precision = item.step < 1 ? 2 : 0;
    const final = Number(clamped.toFixed(precision));
    updateRef.current({ [item.key]: final } as Partial<Settings>);
    return final;
  }, []);

  const applyItem = useCallback(
    (item: GestureItem, base: number, dx: number) => {
      if (item.choices && item.choices.length) {
        const len = item.choices.length;
        const steps = Math.round(dx / CHOICE_PITCH);
        const idx = Math.max(0, Math.min(len - 1, base + steps));
        updateRef.current({ [item.key]: item.choices[idx].value } as Partial<Settings>);
        return idx;
      }
      if (item.toggle) {
        const on = Math.abs(dx) > TOGGLE_THRESHOLD ? dx > 0 : base >= 0.5;
        updateRef.current({ [item.key]: on } as Partial<Settings>);
        return on ? 1 : 0;
      }
      const sensitivity = (item.max - item.min) / FULL_RANGE_PX;
      return applyNumeric(item, base + dx * sensitivity);
    },
    [applyNumeric],
  );

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
            anchorRef.current.baseValue = gestureItemValue(current, settingsRef.current);
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
            currentValue: gestureItemValue(item, settingsRef.current),
          }));
          return;
        }

        const item = itemsRef.current[activeIndexRef.current];
        if (!item) return;
        const newValue = applyItem(item, anchorRef.current.baseValue, dx);
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
    [applyItem],
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
      const value = gestureItemValue(item, settings);
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

  const stepActive = useCallback((dir: number) => {
    const len = itemsRef.current.length;
    if (len === 0) return;
    const idx = Math.max(0, Math.min(len - 1, activeIndexRef.current + dir));
    const item = itemsRef.current[idx];
    if (!item) return;
    setState((prev) => ({
      ...prev,
      activeIndex: idx,
      activeItem: item,
      listOffset: idx,
      currentValue: gestureItemValue(item, settingsRef.current),
    }));
  }, []);

  const adjustActive = useCallback(
    (steps: number) => {
      const item = itemsRef.current[activeIndexRef.current];
      if (!item) return;
      const current = gestureItemValue(item, settingsRef.current);
      let next: number;
      if (item.choices && item.choices.length) {
        const len = item.choices.length;
        const idx = Math.max(0, Math.min(len - 1, current + steps));
        updateRef.current({ [item.key]: item.choices[idx].value } as Partial<Settings>);
        next = idx;
      } else if (item.toggle) {
        const on = steps > 0;
        updateRef.current({ [item.key]: on } as Partial<Settings>);
        next = on ? 1 : 0;
      } else {
        next = applyNumeric(item, current + steps * item.step);
      }
      setState((prev) => ({ ...prev, activeItem: item, currentValue: next }));
    },
    [applyNumeric],
  );

  return {
    ...state,
    startGesture,
    moveGesture,
    endGesture,
    stepActive,
    adjustActive,
  };
}
