import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PROJECT_PICKER_WIDTH,
  type useProjectSwitcherPreferences,
} from './hooks/useProjectSwitcherPreferences';
import type { ProjectSort } from './utils/projectSwitcher';

export default function ProjectSwitcherToolbar({
  preferences,
  isMobile,
}: {
  preferences: ReturnType<typeof useProjectSwitcherPreferences>;
  isMobile: boolean;
}) {
  const t = useTranslations('nav');

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 border-b p-2">
      <span className="me-auto px-1 text-xs font-medium text-muted-foreground">
        {t('projects')}
      </span>
      <Select
        value={preferences.sort}
        onValueChange={(value) => preferences.setSort(value as ProjectSort)}
      >
        <SelectTrigger
          size="sm"
          className="max-w-full gap-2 text-xs"
          aria-label={t('projectPicker.sort')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="key">{t('projectPicker.sortKey')}</SelectItem>
          <SelectItem value="name">{t('projectPicker.sortName')}</SelectItem>
          <SelectItem value="created">{t('projectPicker.sortCreated')}</SelectItem>
          <SelectItem value="activity" title={t('projectPicker.activityHint')}>
            {t('projectPicker.sortActivity')}
          </SelectItem>
        </SelectContent>
      </Select>
      {!isMobile && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-xs"
            title={t('projectPicker.narrower')}
            aria-label={t('projectPicker.narrower')}
            disabled={preferences.width <= PROJECT_PICKER_WIDTH.min}
            onClick={() => preferences.setWidth(preferences.width - 80)}
          >
            <Minimize2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title={t('projectPicker.wider')}
            aria-label={t('projectPicker.wider')}
            disabled={preferences.width >= PROJECT_PICKER_WIDTH.max}
            onClick={() => preferences.setWidth(preferences.width + 80)}
          >
            <Maximize2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title={t('projectPicker.resetWidth')}
            aria-label={t('projectPicker.resetWidth')}
            onClick={() => preferences.setWidth(PROJECT_PICKER_WIDTH.initial)}
          >
            <RotateCcw />
          </Button>
        </div>
      )}
    </div>
  );
}
