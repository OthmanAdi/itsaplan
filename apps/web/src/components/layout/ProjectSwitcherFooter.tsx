import Link from 'next/link';
import { Archive, ChevronDown, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { manageTeamsPath } from '@/utils/paths';
import { Button } from '@/components/ui/button';

export default function ProjectSwitcherFooter({
  onNewTeam,
  onClose,
  hiddenCount,
  showHidden,
  onShowHiddenChange,
}: {
  onNewTeam: () => void;
  onClose: () => void;
  hiddenCount: number;
  showHidden: boolean;
  onShowHiddenChange: (show: boolean) => void;
}) {
  const t = useTranslations('nav');

  return (
    <div className="shrink-0 border-t p-1">
      {(hiddenCount > 0 || showHidden) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          aria-expanded={showHidden}
          onClick={() => onShowHiddenChange(!showHidden)}
        >
          <Archive />
          {t('projectPicker.hiddenProjects', { count: hiddenCount })}
          <ChevronDown className={showHidden ? 'ms-auto rotate-180' : 'ms-auto'} />
        </Button>
      )}
      <div className="flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" onClick={onNewTeam} className="flex-1 justify-start">
          <UserPlus />
          {t('newTeam')}
        </Button>
        <Button asChild variant="ghost" size="sm" className="flex-1 justify-start">
          <Link href={manageTeamsPath()} onClick={onClose}>
            <Users />
            {t('manageTeams')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
