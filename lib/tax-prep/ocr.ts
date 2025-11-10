import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Process an image file using Tesseract OCR
 * All processing happens client-side for privacy
 */
export async function processImage(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0
          });
        }
      }
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data } = await worker.recognize(file);

    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image. Please try again or enter information manually.');
  }
}

/**
 * Validate that uploaded file is an image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG, WebP, or PDF file'
    };
  }

  // Limit file size to 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for the uploaded image
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL when done
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
