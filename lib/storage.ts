import { del, put } from '@vercel/blob';
import { requireEnv } from '@/lib/env';

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/heic', 'heic'],
]);

export class InvalidPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPhotoError';
  }
}

/**
 * Checks a photo is one we accept and returns its file extension. Throws
 * InvalidPhotoError with a message safe to show the user.
 */
export function assertValidPhoto(file: File): string {
  const extension = ALLOWED_PHOTO_TYPES.get(file.type);
  if (!extension) {
    throw new InvalidPhotoError(
      `Unsupported photo type ${file.type || 'unknown'}. Use JPEG, PNG, WebP, or HEIC.`,
    );
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new InvalidPhotoError('Photo is larger than 8 MB.');
  }
  return extension;
}

/**
 * Stores a meal photo in Vercel Blob and returns its public URL. The path is
 * namespaced by user so a later delete or export can find every file.
 */
export async function uploadMealPhoto(
  userId: string,
  file: File,
): Promise<string> {
  const extension = assertValidPhoto(file);

  requireEnv('BLOB_READ_WRITE_TOKEN');

  const blob = await put(
    `meals/${userId}/${crypto.randomUUID()}.${extension}`,
    file,
    {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    },
  );

  return blob.url;
}

export async function deleteMealPhoto(url: string): Promise<void> {
  requireEnv('BLOB_READ_WRITE_TOKEN');
  await del(url);
}
