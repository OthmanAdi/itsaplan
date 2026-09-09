import { Check, Clock3, Eye, EyeOff, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/api/endpoints/projects';
import { useUpdateProjectPreferences } from '@/services/projects.service';
import { formatDateTime } from '@/utils/dates';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommandItem } from '@/components/ui/command';

export default function ProjectSwitcherProjectRow({
  project,
  currentProjectKey,
  onSelectProject,
}: {
  project: Project;
  currentProjectKey: string | null;
  onSelectProject: (key: string) => void;
}) {
  const t = useTranslations('nav.projectPicker');
  const update = useUpdateProjectPreferences();
  const starLabel = t(project.isFavorite ? 'unstarProject' : 'starProject', { name: project.name });
  const visibilityLabel = t(project.isHidden ? 'showProject' : 'hideProject', {
    name: project.name,
  });

  return (
    <div className="flex items-center gap-0.5">
      <CommandItem
        value={`project-${project.id}`}
        onSelect={() => onSelectProject(project.key)}
        className="min-w-0 flex-1 gap-2 p-2"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <span className="block text-sm wrap-anywhere whitespace-normal" dir="auto">
            {project.name}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="max-w-full rounded px-1 py-0 font-mono text-[10px] wrap-anywhere whitespace-normal"
            >
              {project.key}
            </Badge>
            {project.lastActivityAt && (
              <span className="inline-flex items-center gap-1" title={t('activityHint')}>
                <Clock3 className="size-3!" />
                <time dateTime={project.lastActivityAt}>
                  {formatDateTime(project.lastActivityAt)}
                </time>
              </span>
            )}
          </span>
        </div>
        {project.key === currentProjectKey && <Check className="size-4 shrink-0" />}
      </CommandItem>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground"
        aria-label={starLabel}
        title={starLabel}
        aria-pressed={Boolean(project.isFavorite)}
        disabled={update.isPending}
        onKeyDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          update.mutate({ projectKey: project.key, patch: { isFavorite: !project.isFavorite } });
        }}
      >
        <Star className={cn('size-4', project.isFavorite && 'fill-current text-foreground')} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground"
        aria-label={visibilityLabel}
        title={visibilityLabel}
        disabled={update.isPending}
        onKeyDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          update.mutate({ projectKey: project.key, patch: { isHidden: !project.isHidden } });
        }}
      >
        {project.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
    </div>
  );
}
