import { useQuery } from '@tanstack/react-query';
import { getLinkPreview } from '@/lib/api/endpoints/link-previews';

async function preloadImage(src: string, signal: AbortSignal) {
  await new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      image.onload = null;
      image.onerror = null;
      if (signal.aborted) image.removeAttribute('src');
      resolve();
    };
    const timer = setTimeout(finish, 800);
    image.referrerPolicy = 'no-referrer';
    image.onload = finish;
    image.onerror = finish;
    signal.addEventListener('abort', finish, { once: true });
    image.src = src;
  });
}

export function useLinkPreviewQuery(url: string | undefined) {
  return useQuery({
    queryKey: ['link-preview', url],
    enabled: !!url,
    queryFn: async ({ signal }) => {
      const preview = await getLinkPreview(url!, signal);
      if (preview.image && !signal.aborted) {
        await preloadImage(preview.image, signal);
      }
      signal.throwIfAborted();
      return preview;
    },
    staleTime: 5 * 60_000,
    gcTime: 2 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
