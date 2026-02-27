/**
 * Firebase Storage Helpers — Upload and manage files.
 *
 * Used primarily for uploading reference images in commission requests.
 * Files are stored at: commission-images/{userId}/{timestamp}_{filename}
 *
 * Firebase Storage free tier: 5 GB storage, 1 GB/day download.
 */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./client";

/**
 * Upload a file to Firebase Storage and return its public download URL.
 *
 * @param file    - The File object from an <input type="file">
 * @param path    - Storage path, e.g., "commission-images/user123"
 * @returns       - The public download URL for the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  // Create a unique filename with timestamp to prevent collisions
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `${path}/${timestamp}_${safeName}`);

  // Upload the file (raw bytes)
  await uploadBytes(storageRef, file);

  // Get and return the public download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

/**
 * Delete a file from Firebase Storage by its full URL.
 * Useful if a commission request is cancelled.
 */
export async function deleteImage(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}
