import imageCompression from 'browser-image-compression';
import type { MediaRecord } from '../domain/model';
export async function uploadMedia(
  id: string,
  file: File,
  alt: string,
  onProgress: (value: number) => void,
): Promise<MediaRecord> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20_000_000)
    throw new Error('Choose a JPEG, PNG, or WebP under 20 MB.');
  const optimized = await imageCompression(file, {
    maxSizeMB: 1.8,
    maxWidthOrHeight: 2400,
    useWebWorker: false,
    fileType: 'image/webp',
    initialQuality: 0.86,
    onProgress: (p) => onProgress(Math.round(p * 0.6)),
  });
  if (optimized.size > 2_000_000)
    throw new Error('This image could not be reduced below 2 MB. Try a smaller image.');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(),
      data = new FormData();
    data.append('file', optimized, `${file.name.replace(/\.[^.]+$/, '')}.webp`);
    data.append('alt', alt);
    xhr.open('POST', `${import.meta.env.BASE_URL}api/studio/writing/${id}/media`);
    xhr.setRequestHeader('X-Writing-Request', '1');
    xhr.timeout = 60_000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(60 + Math.round((e.loaded / e.total) * 39));
    };
    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText) as MediaRecord & { error?: string };
        if (xhr.status < 200 || xhr.status >= 300)
          reject(new Error(result.error ?? 'The image could not be stored.'));
        else {
          onProgress(100);
          resolve(result);
        }
      } catch {
        reject(new Error('The upload response was interrupted. Try again.'));
      }
    };
    xhr.onerror = () =>
      reject(new Error('The image could not reach the desk. Check your connection and retry.'));
    xhr.ontimeout = () =>
      reject(new Error('The upload timed out. Your selected file is still here.'));
    xhr.send(data);
  });
}
