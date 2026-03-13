import { describe, it, expect } from 'vitest';
import { validateFile, MAX_IMAGE_SIZE, MAX_AUDIO_SIZE } from '../file-validation';

describe('file-validation utility', () => {
  const createMockFile = (name: string, type: string, size: number, content: number[]) => {
    const buffer = new Uint8Array(size);
    buffer.set(content);
    return new File([buffer], name, { type });
  };

  describe('Image Validation', () => {
    it('should validate a correct JPEG', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1024, [0xff, 0xd8, 0xff]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(true);
    });

    it('should validate a correct PNG', async () => {
      const file = createMockFile('test.png', 'image/png', 1024, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(true);
    });

    it('should validate a correct WebP', async () => {
      const file = createMockFile('test.webp', 'image/webp', 1024, [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME type', async () => {
      const file = createMockFile('test.txt', 'text/plain', 1024, [0xde, 0xad, 0xbe, 0xef]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject file exceeding size limit', async () => {
      const file = createMockFile('large.jpg', 'image/jpeg', MAX_IMAGE_SIZE + 1024, [0xff, 0xd8, 0xff]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });

    it('should reject file with incorrect magic bytes', async () => {
      const file = createMockFile('fake.jpg', 'image/jpeg', 1024, [0xde, 0xad, 0xbe, 0xef]);
      const result = await validateFile(file, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Magic byte verification failed');
    });
  });

  describe('Audio Validation', () => {
    it('should validate a correct MP3 (ID3)', async () => {
      const file = createMockFile('test.mp3', 'audio/mpeg', 1024, [0x49, 0x44, 0x33]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(true);
    });

    it('should validate a correct MP3 (Frame Sync)', async () => {
      const file = createMockFile('test.mp3', 'audio/mpeg', 1024, [0xff, 0xfb]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(true);
    });

    it('should validate a correct WAV', async () => {
      const file = createMockFile('test.wav', 'audio/wav', 1024, [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME type', async () => {
      const file = createMockFile('test.exe', 'application/octet-stream', 1024, [0x4d, 0x5a]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject file exceeding size limit', async () => {
      const file = createMockFile('podcast.mp3', 'audio/mpeg', MAX_AUDIO_SIZE + 1024, [0x49, 0x44, 0x33]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });

    it('should reject file with incorrect magic bytes', async () => {
      const file = createMockFile('fake.mp3', 'audio/mpeg', 1024, [0xde, 0xad, 0xbe, 0xef]);
      const result = await validateFile(file, 'audio');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Magic byte verification failed');
    });
  });
});
