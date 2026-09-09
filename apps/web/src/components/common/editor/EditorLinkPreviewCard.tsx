import { ArrowUpRight, Globe, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LinkPreview } from '@/lib/api/endpoints/link-previews';
import EditorLinkPreviewImage from './EditorLinkPreviewImage';

export default function EditorLinkPreviewCard({
  url,
  preview,
  loading,
}: {
  url: string;
  preview: LinkPreview | undefined;
  loading: boolean;
}) {
  const t = useTranslations('common.editor');
  const host = new URL(url).hostname.replace(/^www\./, '');
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={t('openPreviewLink', { name: preview?.title || host })}
    >
      {preview?.image && <EditorLinkPreviewImage key={preview.image} src={preview.image} />}
      <div className="space-y-2 p-3 text-start">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate" dir="auto">
            {preview?.siteName || host}
          </span>
          <ArrowUpRight className="ms-auto size-3.5 shrink-0" aria-hidden="true" />
        </div>
        {loading ? (
          <div className="space-y-2 py-1" role="status">
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LoaderCircle
                className="size-3 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              {t('loadingPreview')}
            </span>
          </div>
        ) : (
          <>
            <p className="line-clamp-2 text-sm font-medium text-pretty" dir="auto">
              {preview?.title || host}
            </p>
            <p className="line-clamp-3 text-xs text-pretty text-muted-foreground" dir="auto">
              {preview?.description || t('previewUnavailable')}
            </p>
          </>
        )}
        <p className="truncate pt-1 text-xs text-muted-foreground" dir="ltr" title={url}>
          {url}
        </p>
      </div>
    </a>
  );
}
