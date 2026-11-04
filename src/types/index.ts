export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  // Difference RGB values in range 0.0 - 1.0
  diffColor: [number, number, number];
  // Resulting perceived background color hex for UI badge display
  badgeBg: string;
  badgeText: string;
}

export interface PdfFileInfo {
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}

export interface ConversionResult {
  darkPdfBytes: Uint8Array;
  durationMs: number;
  pageCount: number;
}
