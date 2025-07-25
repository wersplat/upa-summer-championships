'use client';

import * as React from 'react';
import { TournamentSchedule } from '@/utils/supabase';
import { cn } from '@/lib/utils';

interface ScheduleFiltersProps {
  matches: TournamentSchedule[];
  className?: string;
}

export function ScheduleFilters({ matches, className }: ScheduleFiltersProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold">Tournament Schedule</h2>
        <p className="text-muted-foreground">
          Showing all {matches.length} matches
        </p>
      </div>
    </div>
  );
}
