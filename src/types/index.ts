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
  /** 文件原始字节，以 Uint8Array 存储，避免 ArrayBuffer 被 pdf-lib 内部转移后 detached */
  pdfBytes: Uint8Array;
  pageCount: number;
}

export interface ConversionResult {
  darkPdfBytes: Uint8Array;
  durationMs: number;
  pageCount: number;
}
