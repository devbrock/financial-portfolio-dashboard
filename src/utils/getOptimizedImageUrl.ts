type OptimizedImageOptions = {
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  format?: 'webp' | 'png' | 'jpg';
};

const DEFAULT_OPTIONS: OptimizedImageOptions = {
  width: 80,
  height: 80,
  fit: 'cover',
  format: 'webp',
};

/**
 * Returns a small, optimized image URL using a public image proxy.
 * Falls back to the original URL if parsing fails or protocol is unsupported.
 */
export function getOptimizedImageUrl(
  sourceUrl: string | undefined,
  options: OptimizedImageOptions = DEFAULT_OPTIONS
): string | undefined {
  if (!sourceUrl) return sourceUrl;

  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return sourceUrl;
    }

    const sanitizedUrl = sourceUrl.replace(/^https?:\/\//, '');
    const params = new URLSearchParams({
      url: sanitizedUrl,
      w: String(options.width),
      h: String(options.height),
      fit: options.fit ?? DEFAULT_OPTIONS.fit ?? 'cover',
      output: options.format ?? DEFAULT_OPTIONS.format ?? 'webp',
    });

    return `https://images.weserv.nl/?${params.toString()}`;
  } catch {
    return sourceUrl;
  }
}

