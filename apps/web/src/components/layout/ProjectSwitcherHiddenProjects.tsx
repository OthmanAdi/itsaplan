import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Project } from '@/lib/api/endpoints/projects';
import { CommandGroup } from '@/components/ui/command';
import ProjectSwitcherProjectRow from './ProjectSwitcherProjectRow';

export default function ProjectSwitcherHiddenProjects({
  projects,
  currentProjectKey,
  onSelectProject,
}: {
  projects: Project[];
  currentProjectKey: string | null;
  onSelectProject: (key: string) => void;
}) {
  const t = useTranslations('nav.projectPicker');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  return (
    <CommandGroup
      ref={sectionRef}
      heading={t('hiddenProjects', { count: projects.length })}
      className="mt-2 border-t pt-2"
    >
      {projects.length === 0 && (
        <p role="status" className="px-2 py-4 text-xs text-muted-foreground">
          {t('noHiddenResults')}
        </p>
      )}
      {projects.map((project) => (
        <ProjectSwitcherProjectRow
          key={project.id}
          project={project}
          currentProjectKey={currentProjectKey}
          onSelectProject={onSelectProject}
        />
      ))}
    </CommandGroup>
  );
}
