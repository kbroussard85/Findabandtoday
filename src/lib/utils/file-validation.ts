import { logger } from '@/lib/logger';
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validates a file's type, size, and magic bytes.
 */
export async function validateFile(
  file: File,
  type: 'image' | 'audio'
): Promise<ValidationResult> {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;

  // 1. Check File Execution / Basic rejection
  if (!file) return { valid: false, error: 'No file provided' };

  // 2. Check MIME Type (reported by browser/caller)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // 3. Check File Size
  if (file.size > maxSize) {
    const sizeInMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size allowed is ${sizeInMB}MB`,
    };
  }

  // 4. Magic Byte Verification
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (type === 'image') {
      if (!isValidImageMagicBytes(bytes)) {
        return { valid: false, error: 'Magic byte verification failed. File may be corrupted or disguised.' };
      }
    } else {
      if (!isValidAudioMagicBytes(bytes)) {
        return { valid: false, error: 'Magic byte verification failed. File may be corrupted or disguised.' };
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Error verifying magic bytes:');
    return { valid: false, error: 'Failed to read file content for verification.' };
  }

  return { valid: true };
}

function isValidImageMagicBytes(bytes: Uint8Array): boolean {
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return true;

  // WebP: RIFF .... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return true;

  return false;
}

function isValidAudioMagicBytes(bytes: Uint8Array): boolean {
  // MP3: ID3 (49 44 33) or MPEG Frame Sync (FF FB, FF F3, FF F2)
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  if (bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2)) return true;

  // WAV: RIFF .... WAVE
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x41 &&
    bytes[10] === 0x56 &&
    bytes[11] === 0x45
  )
    return true;

  return false;
}
