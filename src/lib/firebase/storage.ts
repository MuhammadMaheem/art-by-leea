/**
 * Vercel Blob Storage Helpers — Upload and manage files.
 */
import { del } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '@/lib/env';

/**
 * Delete a file from Vercel Blob by its URL.
 */
export async function deleteImage(url: string): Promise<void> {
  await del(url, { token: BLOB_READ_WRITE_TOKEN });
}
