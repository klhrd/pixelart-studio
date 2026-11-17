import { describe, it, expect } from 'vitest';
import { renderTemplate, folderPrefix } from './batch';

describe('renderTemplate', () => {
  const baseCtx = {
    engine: 'posterize',
    name: 'photo',
    date: '2026-11-17',
    index: 3,
    ext: 'jpg',
    scale: 2,
  };

  it('replaces all known tokens', () => {
    const out = renderTemplate('{engine}_{name}_{date}_{index}.{ext}', baseCtx);
    expect(out).toBe('posterize_photo_2026-11-17_03.jpg');
  });

  it('replaces scale token', () => {
    const out = renderTemplate('s{scale}', baseCtx);
    expect(out).toBe('s2');
  });

  it('leaves unknown tokens untouched', () => {
    const out = renderTemplate('{engine}_{missing}', baseCtx);
    expect(out).toBe('posterize_{missing}');
  });

  it('handles empty template', () => {
    expect(renderTemplate('', baseCtx)).toBe('');
  });

  it('replaces repeated tokens', () => {
    const out = renderTemplate('{name}-{name}', baseCtx);
    expect(out).toBe('photo-photo');
  });

  it('uses svg extension token', () => {
    const svgCtx = { ...baseCtx, ext: 'svg' };
    const out = renderTemplate('{name}_{index}.{ext}', svgCtx);
    expect(out).toBe('photo_03.svg');
  });
});

describe('folderPrefix', () => {
  const ctx = { engine: 'ascii', name: 'vacation', date: '2026-11-17' };

  it('flat returns empty', () => {
    expect(folderPrefix('flat', ctx)).toBe('');
  });

  it('per-image returns name folder', () => {
    expect(folderPrefix('per-image', ctx)).toBe('vacation/');
  });

  it('by-engine returns engine folder', () => {
    expect(folderPrefix('by-engine', ctx)).toBe('ascii/');
  });

  it('by-date returns date folder', () => {
    expect(folderPrefix('by-date', ctx)).toBe('2026-11-17/');
  });
});
