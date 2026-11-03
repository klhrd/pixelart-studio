export async function exportSvg(
  svgString: string,
  filename: string,
): Promise<void> {
  const base =
    filename
      .trim()
      .replace(/[\\/:*?"<>|]/g, '')
      .slice(0, 60) || 'pixelcraft';
  const name = base.endsWith('.svg') ? base : `${base}.svg`;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
