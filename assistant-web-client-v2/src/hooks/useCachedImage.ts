import { useEffect, useState } from 'react';

/**
 * Caches an image from a remote URL into localStorage as a base64 data URI.
 * Ensures the image is fetched only once per key.
 *
 * @param url The remote image URL to cache
 * @param cacheKey A unique key (e.g., user ID or user email) for localStorage
 * @returns A base64 data URL of the image
 */
export function useCachedImage(url: string | null, cacheKey: string) {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url || !cacheKey) return;

    const localCache = localStorage.getItem(cacheKey);
    if (localCache) {
      setCachedUrl(localCache);
      return;
    }

    const controller = new AbortController(); // for safety in async cleanup

    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          try {
            localStorage.setItem(cacheKey, base64);
          } catch (e) {
            console.warn('Could not store image in localStorage', e);
          }
          setCachedUrl(base64);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to cache profile image:', err);
      }
    })();

    return () => controller.abort(); // cleanup
  }, [url, cacheKey]);

  return cachedUrl;
}